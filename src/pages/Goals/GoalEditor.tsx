import { Box, Button, Card, Divider, IconButton, Skeleton, TextField, Tooltip, Typography } from "@mui/material";
import { Goal, Question, Triple, VariableBinding } from "DISK/interfaces";
import { useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import CopyIcon from '@mui/icons-material/ContentCopy';
import { PATH_GOALS, UI_PARAMS } from "constants/routes";
import { QuestionSelector } from "components/questions/QuestionSelector";
import { useAppDispatch, useQuestionBindings, useSelectedQuestion } from "redux/hooks";
import React from "react";
import { closeBackdrop, openBackdrop } from "redux/slices/backdrop";
import { usePostGoalMutation, usePutGoalMutation, useGetGoalByIdQuery } from "redux/apis/goals";
import { openNotification } from "redux/slices/notifications";
import { addBindingsToQuestionGraph } from "components/questions/QuestionHelpers";
import { EditableHeader } from "components/Fields";
import { TextFieldBlock, TypographySubtitle } from "components/Styles";
import { getId } from "DISK/util";

export const HypothesisEditor = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { goalId } = useParams<UI_PARAMS>();
    const [searchParams, _]= useSearchParams();
    let initialQuestionId = searchParams.get("q");

    const {data :goal, isLoading:loading } = useGetGoalByIdQuery(goalId as string, {skip:!goalId});
    const [postHypothesis] = usePostGoalMutation();
    const [putHypothesis] = usePutGoalMutation();

    // Form values:
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [notes, setNotes] = React.useState("");
    const [questionId, setQuestionId] = React.useState("");
    const [questionBindings, setQuestionBindings] = React.useState<VariableBinding[]>([]);

    const [editedQuestionId, setEditedQuestionId] = React.useState("");

    const formQuestionBindings = useQuestionBindings();
    const formSelectedQuestion = useSelectedQuestion();

    // State errors...
    const [errorName, setErrorName] = React.useState<boolean>(false);
    const [errorDesc, setErrorDesc] = React.useState<boolean>(false);
    const [showErrors, setShowErrors] = React.useState<boolean>(false);

    const onNameChange = (name:string) => { setName(name); setErrorName(name.length === 0); }
    const onDescChange = (desc:string) => { setDescription(desc); setErrorDesc(desc.length === 0); }

    useEffect(() => {
        if (initialQuestionId)
            setQuestionId(initialQuestionId);
    }, [initialQuestionId])

    useEffect(() => {
        if (goal) {
            loadForm(goal);
        } else {
            clearForm();
            if (initialQuestionId) setQuestionId(initialQuestionId);
        }
    }, [goal])

    const loadForm = (hypothesis:Goal) => {
        setName(hypothesis.name);
        setDescription(hypothesis.description);
        setNotes(hypothesis.notes ? hypothesis.notes : "");
        setQuestionId(hypothesis.question.id ? hypothesis.question.id : "");
        setQuestionBindings(hypothesis.questionBindings);
    }

    const clearForm = () => {
        setName("");
        setDescription("");
        setNotes("");
        setQuestionBindings([]);
        setQuestionId("");
    }

    const getQuestionBindings : () => VariableBinding[] = () => {
        return Object.keys(formQuestionBindings).map<VariableBinding>((varId: string) => (
            {
                variable: varId,
                binding: formQuestionBindings[varId],
                type: "DEFAULT",
                isArray: false,
            }));
    }

    const onSaveButtonClicked = () => {
        if (!name || !description || !editedQuestionId || !formSelectedQuestion) {
            if (!name) setErrorName(true);
            if (!description) setErrorDesc(true);
            setShowErrors(true);
            return;
        }

        let previous : Partial<Goal> = {};
        let editing : boolean = false;
        if (goal) {
            previous = {...goal};
            editing = true;
        }
        // Add form data
        let newHypothesis : Goal = {
            ...previous,
            author: undefined,
            id: editing && previous.id ? previous.id : '',
            name: name,
            description: description,
            notes: notes,
            question: {
                id: editedQuestionId,
            },
            questionBindings: getQuestionBindings(),
            graph: { triples: addBindingsToQuestionGraph(formSelectedQuestion, formQuestionBindings)}
        };

        dispatch(openBackdrop());
        (editing?putHypothesis:postHypothesis)({data:newHypothesis})
            .then((response : {data?:Goal, error?:any}   ) => {
                let savedHypothesis = response.data;
                if (savedHypothesis && savedHypothesis.id) {
                    dispatch(openNotification({severity:'success', text:'Successfully saved'}))
                    navigate(PATH_GOALS + "/" + getId(savedHypothesis)); 
                } else if (response.error) {
                    dispatch(openNotification({severity:'error', text:'Error saving hypothesis. Please try again'}))
                    console.warn(response.error);
                }
            })
            .catch((e) => {
                dispatch(openNotification({severity:'error', text:'Error saving hypothesis. Please try again'}))
                console.warn(e);
            })
            .finally(() => {
                dispatch(closeBackdrop());
            });
    }

    const onDuplicateClicked = () => {
        if (!goal) {
            return;
        }
        let newHypothesis : Goal = { 
            ...goal,
            id: '',
            name: goal.name + " (copy)",
        };

        dispatch(openBackdrop());
        postHypothesis({data:newHypothesis})
            .then((data : {data:Goal} | {error: any}) => {
                let savedHypothesis = (data as {data:Goal}).data;
                if (savedHypothesis && savedHypothesis.id) {
                    dispatch(openNotification({severity:'success', text:'Successfully saved'}))
                    navigate(PATH_GOALS + "/" + getId(savedHypothesis));
                }
            })
            .catch((e) => {
                dispatch(openNotification({severity:'error', text:'Error saving hypothesis. Please try again'}))
                console.warn(e);
            })
            .finally(()=>{
                dispatch(closeBackdrop());
            });
    };

    const onQuestionChange = (selectedQuestion: Question|null, bindings: VariableBinding[], graph: Triple[]) => {
        setEditedQuestionId(selectedQuestion? selectedQuestion.id : '');
    };

    return <Card variant="outlined">
        <EditableHeader loading={loading} value={name} error={errorName} onChange={onNameChange} redirect={PATH_GOALS + (goal && goal.id ? "/" + getId(goal) : "")}/>
        <Divider/>

        <Box sx={{padding:"10px"}}>
            {!loading ?
                <TextFieldBlock multiline fullWidth required size="small" label="Brief description" sx={{marginTop: "5px"}}
                    value={description}
                    error={errorDesc}
                    onChange={(ev) => onDescChange(ev.target.value)}/>
            : <Skeleton/> }
            {!loading ?
                <TextFieldBlock multiline fullWidth size="small" label="Additional notes" sx={{marginTop: "10px"}}
                    value={notes}
                    onChange={(ev) => setNotes(ev.target.value)}/>
            : <Skeleton/> }
            <Divider/>
            <TypographySubtitle>
                Hypothesis or question:
            </TypographySubtitle>
            {!loading ?
                <QuestionSelector questionId={questionId} bindings={questionBindings} onChange={onQuestionChange} showErrors={showErrors} required/>
            : <Skeleton/>}
        </Box>

        <Box sx={{display: 'flex', justifyContent: 'space-between', padding: "10px"}}>
            {goal?
                <Button color="info" sx={{mr:"10px"}} onClick={onDuplicateClicked}>
                    <CopyIcon/> Duplicate
                </Button> : <Box/>
            }
            <Box>
                <Button color="error" sx={{mr:"10px"}} component={Link} to={PATH_GOALS + (goal ? "/" + getId(goal) : "")}>
                    <CancelIcon/> Cancel
                </Button>
                <Button variant="contained" color="success" onClick={onSaveButtonClicked}>
                    <SaveIcon/> Save
                </Button>
            </Box>
        </Box>
    </Card>
}