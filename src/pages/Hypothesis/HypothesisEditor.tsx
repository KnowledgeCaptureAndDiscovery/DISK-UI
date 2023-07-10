import { Box, Button, Card, Divider, IconButton, Skeleton, TextField, Tooltip, Typography } from "@mui/material";
import { Hypothesis, idPattern, Question, Triple, VariableBinding } from "DISK/interfaces";
import { useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import CopyIcon from '@mui/icons-material/ContentCopy';
import { PATH_HYPOTHESES } from "constants/routes";
import { QuestionSelector } from "components/questions/QuestionSelector";
import { useAppDispatch, useQuestionBindings, useSelectedQuestion } from "redux/hooks";
import React from "react";
import { closeBackdrop, openBackdrop } from "redux/slices/backdrop";
import { usePostHypothesisMutation, usePutHypothesisMutation, useGetHypothesisByIdQuery } from "redux/apis/hypotheses";
import { openNotification } from "redux/slices/notifications";
import { addBindingsToQuestionGraph } from "components/questions/QuestionHelpers";
import { EditableHeader } from "components/Fields";
import { TextFieldBlock, TypographySubtitle } from "components/Styles";

export const HypothesisEditor = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { hypothesisId } = useParams();
    const selectedId = hypothesisId as string;
    const [searchParams, _]= useSearchParams();
    let initialQuestionId = searchParams.get("q");

    // Redux data
    const {data :hypothesis, isLoading:loading } = useGetHypothesisByIdQuery(selectedId, {skip:!selectedId});
    const [postHypothesis] = usePostHypothesisMutation();
    const [putHypothesis] = usePutHypothesisMutation();

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
    //const [errorQuestion, setErrorQuestion] = React.useState<boolean>(false);

    const onNameChange = (name:string) => { setName(name); setErrorName(name.length === 0); }
    const onDescChange = (desc:string) => { setDescription(desc); setErrorDesc(desc.length === 0); }

    useEffect(() => {
        if (initialQuestionId)
            setQuestionId(initialQuestionId);
    }, [initialQuestionId])

    useEffect(() => {
        if (hypothesis) {
            loadForm(hypothesis);
        } else {
            clearForm();
            if (initialQuestionId) setQuestionId(initialQuestionId);
        }
    }, [hypothesis])

    const loadForm = (hypothesis:Hypothesis) => {
        setName(hypothesis.name);
        setDescription(hypothesis.description);
        setNotes(hypothesis.notes ? hypothesis.notes : "");
        setQuestionId(hypothesis.questionId ? hypothesis.questionId : "");
        setQuestionBindings(hypothesis.questionBindings);
    }

    const clearForm = () => {
        setName("");
        setDescription("");
        setNotes("");
        setQuestionBindings([]);
        setQuestionId("");
    }

    const onSaveButtonClicked = () => {
        if (!name || !description || !editedQuestionId || !formSelectedQuestion) {
            if (!name) setErrorName(true);
            if (!description) setErrorDesc(true);
            //if (!editedQuestionId) setErrorQuestion(true); this should be solved by required.
            return;
        }

        let previous : any = {};
        let editing : boolean = false;
        if (hypothesis) {
            previous = {...hypothesis};
            editing = true;
        }
        // Add form data
        let newHypothesis : Hypothesis = {
            ...previous,
            name: name,
            description: description,
            notes: notes,
            questionId: editedQuestionId,
            questionBindings: Object.keys(formQuestionBindings).map((varId:string) => {
                return {
                    variable: varId,
                    binding: formQuestionBindings[varId],
                    type: null
                } as VariableBinding;
            }),
            graph: { triples: addBindingsToQuestionGraph(formSelectedQuestion, formQuestionBindings)}
        };

        dispatch(openBackdrop());
        (editing?putHypothesis:postHypothesis)({data:newHypothesis})
            .then((data : {data:Hypothesis} | {error: any}) => {
                let savedHypothesis = (data as {data:Hypothesis}).data;
                if (savedHypothesis) {
                    dispatch(openNotification({severity:'success', text:'Successfully saved'}))
                    navigate(PATH_HYPOTHESES + "/" + savedHypothesis.id.replace(idPattern, "")); 
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
        if (!hypothesis) {
            return;
        }
        let newHypothesis : Hypothesis = { 
            ...hypothesis,
            id: '',
            name: hypothesis.name + " (copy)",
            questionBindings: hypothesis.questionBindings.map((qv) => {return {
                ...qv,
                collection: undefined,
                bindingAsArray: undefined,
            }})
        };

        dispatch(openBackdrop());
        postHypothesis({data:newHypothesis})
            .then((data : {data:Hypothesis} | {error: any}) => {
                let savedHypothesis = (data as {data:Hypothesis}).data;
                if (savedHypothesis) {
                    dispatch(openNotification({severity:'success', text:'Successfully saved'}))
                    navigate(PATH_HYPOTHESES + "/" + savedHypothesis.id.replace(idPattern, "")); 
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
        <EditableHeader loading={loading} value={name} error={errorName} onChange={onNameChange} redirect={PATH_HYPOTHESES + (hypothesis && hypothesis.id ? "/" + hypothesis.id : "")}/>
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
                <QuestionSelector questionId={questionId} bindings={questionBindings} onChange={onQuestionChange} required/>
            : <Skeleton/>}
        </Box>

        <Box sx={{display: 'flex', justifyContent: 'space-between', padding: "10px"}}>
            {hypothesis?
                <Button color="info" sx={{mr:"10px"}} onClick={onDuplicateClicked}>
                    <CopyIcon/> Duplicate
                </Button> : <Box/>
            }
            <Box>
                <Button color="error" sx={{mr:"10px"}} component={Link} to={PATH_HYPOTHESES + (hypothesis ? "/" + hypothesis.id : "")}>
                    <CancelIcon/> Cancel
                </Button>
                <Button variant="contained" color="success" onClick={onSaveButtonClicked}>
                    <SaveIcon/> Save
                </Button>
            </Box>
        </Box>
    </Card>
}