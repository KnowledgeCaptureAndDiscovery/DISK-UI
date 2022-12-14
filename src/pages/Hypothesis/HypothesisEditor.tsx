import { Alert, Box, Button, Card, Divider, IconButton, Skeleton, Snackbar, TextField, Tooltip, Typography } from "@mui/material";
import { Hypothesis, idPattern, Triple, VariableBinding } from "DISK/interfaces";
import { useEffect } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import CopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';
import { PATH_HYPOTHESES } from "constants/routes";
import { QuestionSelector } from "components/questions/QuestionSelector";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import React from "react";
import { closeBackdrop, openBackdrop } from "redux/slices/backdrop";
import { usePostHypothesisMutation, usePutHypothesisMutation, useGetHypothesisByIdQuery } from "redux/apis/hypotheses";
import { openNotification } from "redux/slices/notifications";
import { RootState } from "redux/store";

const TextFieldBlock = styled(TextField)(({ theme }) => ({
    display: "block",
    marginBottom: "4px",
}));

const TypographySubtitle = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: "1.2em",
    padding: "5px 5px 0px 5px",
}));

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
    const [editedQuestionBindings, setEditedQuestionBindings] = React.useState<VariableBinding[]>([]);
    const [editedGraph, setEditedGraph] = React.useState<Triple[]>([]);

    const formQuestionBindings = useAppSelector((state:RootState) => state.forms.questionBindings);
    const formQuestionPattern = useAppSelector((state:RootState) => state.forms.selectedPattern);

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
        setQuestionId(hypothesis.question ? hypothesis.question : "");
        setQuestionBindings(hypothesis.questionBindings);
    }

    const clearForm = () => {
        setName("");
        setDescription("");
        setNotes("");
        setQuestionBindings([]);
        setQuestionId("");
    }


    const getCurrentGraph = () => {
        console.log(formQuestionBindings, formQuestionPattern);
        let noOptionalsPattern : string = formQuestionPattern.replace(/optional\s*\{.+\}/g, '').trim();
        let pattern:string[] = noOptionalsPattern.split(/\s/);
        let updatedGraph: Triple[] = [];
        let emptyTriple: Triple = {
            subject: "",
            predicate: "",
            object: {
                type: 'LITERAL',
                value: '',
                datatype: ''
            }
        };
        let curTriple: Triple = emptyTriple;
        for (let i: number = 0; i < pattern.length; i++) {
            let part: string = pattern[i];
            let value: string = formQuestionBindings[part] ? formQuestionBindings[part] : part;
            let c: number = i % 3;
            switch (c) {
                case 0:
                    curTriple = { ...emptyTriple };
                    curTriple.subject = value;
                    break;
                case 1:
                    curTriple.predicate = value;
                    break;
                case 2:
                    let isURI: boolean = value.startsWith("http") || value.startsWith("www");
                    curTriple.object = {
                        type: isURI ? 'URI' : 'LITERAL',
                        value: value,
                        datatype: isURI ? undefined : "http://www.w3.org/2001/XMLSchema#string"
                    }
                    updatedGraph.push(curTriple);
                    break;
            }
        }
        console.log(updatedGraph);
        return updatedGraph;
    }

    const onSaveButtonClicked = () => {
        if (!name || !description || !editedQuestionId) {
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
            question: editedQuestionId,
            questionBindings: Object.keys(formQuestionBindings).map((varId:string) => {
                return {
                    variable: varId,
                    binding: formQuestionBindings[varId],
                    type: null
                } as VariableBinding;
            }),
            //editedQuestionBindings,
            graph: { triples: getCurrentGraph() }
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
            //questionBindings: hypothesis.questionBindings.map((qv) => {return {
            //    ...qv,
            //    collection: undefined,
            //    bindingAsArray: undefined,
            //}})
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


    const onQuestionChange = (selectedQuestionId: string, bindings: VariableBinding[], pattern: Triple[]) => {
        setEditedQuestionId(selectedQuestionId);
        setEditedQuestionBindings(bindings);
        setEditedGraph(pattern);
    };

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)", overflowY: 'auto'}}>
        <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor: "whitesmoke"}}>
            {!loading ? 
                <TextField fullWidth size="small" label="Short name" required sx={{backgroundColor: "white"}}
                    value={name}
                    error={errorName}
                    onChange={(ev) => onNameChange(ev.target.value)}/>
            : <Skeleton/> }

            <Tooltip arrow title="Cancel">
                <IconButton component={Link} to={PATH_HYPOTHESES + (hypothesis && hypothesis.id ? "/" + hypothesis.id : "")}>
                    <CancelIcon /> 
                </IconButton>
            </Tooltip>
        </Box>
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
                <QuestionSelector initialQuestionId={questionId} initialBindings={questionBindings} onQuestionChange={onQuestionChange} required/>
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