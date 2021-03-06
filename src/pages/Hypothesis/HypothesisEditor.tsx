import { Alert, Backdrop, Box, Button, Card, CircularProgress, Divider, IconButton, Skeleton, Snackbar, TextField, Tooltip, Typography } from "@mui/material";
import { DISKAPI } from "DISK/API";
import { Hypothesis, idPattern, Triple, VariableBinding } from "DISK/interfaces";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import CopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';
import { PATH_HYPOTHESES, PATH_HYPOTHESIS_ID_EDIT_RE, PATH_HYPOTHESIS_NEW } from "constants/routes";
import { QuestionSelector } from "components/QuestionSelector";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { setErrorSelected, setLoadingSelected, setSelectedHypothesis, add as addHypothesis } from "redux/hypothesis";
import React from "react";
import { HypothesisRequest } from "DISK/requests";

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
    const location = useLocation();
    let navigate = useNavigate();

    // Redux data
    const hypothesis = useAppSelector((state:RootState) => state.hypotheses.selectedHypothesis);
    const selectedId = useAppSelector((state:RootState) => state.hypotheses.selectedId);
    const loading = useAppSelector((state:RootState) => state.hypotheses.loadingSelected);
    const error = useAppSelector((state:RootState) => state.hypotheses.errorSelected);
    const dispatch = useAppDispatch();

    // Form values:
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [notes, setNotes] = React.useState("");
    const [questionId, setQuestionId] = React.useState("");
    const [questionBindings, setQuestionBindings] = React.useState<VariableBinding[]>([]);
    const [editedQuestionId, setEditedQuestionId] = React.useState("");
    const [editedQuestionBindings, setEditedQuestionBindings] = React.useState<VariableBinding[]>([]);
    const [editedGraph, setEditedGraph] = React.useState<Triple[]>([]);

    // State errors...
    const [waiting, setWaiting] = React.useState<boolean>(false);
    const [saveNotification, setSaveNotification] = React.useState<boolean>(false);;
    const [errorSaveNotification, setErrorSaveNotification] = React.useState<boolean>(false);;
    const [errorName, setErrorName] = React.useState<boolean>(false);
    const [errorDesc, setErrorDesc] = React.useState<boolean>(false);
    const [errorQuestion, setErrorQuestion] = React.useState<boolean>(false);

    const onNameChange = (name:string) => { setName(name); setErrorName(name.length === 0); }
    const onDescChange = (desc:string) => { setDescription(desc); setErrorDesc(desc.length === 0); }

    useEffect(() => {
        let match = PATH_HYPOTHESIS_ID_EDIT_RE.exec(location.pathname);
        if (match != null && match.length === 2) {
            let id : string = match[1];
            if (!loading && !error && selectedId !== id) {
                dispatch(setLoadingSelected(id));
                DISKAPI.getHypothesis(id)
                    .then((hypothesis:Hypothesis) => {
                        dispatch(setSelectedHypothesis(hypothesis));
                        loadForm(hypothesis);
                    })
                    .catch(() => {
                        dispatch(setErrorSelected());
                    }); 
            } else if (selectedId === id && hypothesis) {
                loadForm(hypothesis);
            }
        } else if (location.pathname === PATH_HYPOTHESIS_NEW) {
            dispatch(setSelectedHypothesis(null));
            clearForm();
        }
    }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadForm = (hypothesis:Hypothesis) => {
        setName(hypothesis.name);
        setDescription(hypothesis.description);
        setNotes(hypothesis.notes ? hypothesis.notes : "");
        setQuestionBindings(hypothesis.questionBindings);
        setQuestionId(hypothesis.question ? hypothesis.question : "");
    }

    const clearForm = () => {
        setName("");
        setDescription("");
        setNotes("");
        setQuestionBindings([]);
        setQuestionId("");
    }

    const onSaveButtonClicked = () => {
        // Check required fields;
        if (!name || !description || !editedQuestionId) {
            if (!name) setErrorName(true);
            if (!description) setErrorDesc(true);
            if (!editedQuestionId) setErrorQuestion(true);
            return;
        }

        let newHypothesis : Hypothesis | HypothesisRequest;
        let previous : any = {};
        let editing : boolean = false;
        //TODO: fix dates and author!! (server side)
        if (hypothesis) {
            previous = {...hypothesis};
            editing = true;
        }
        // Add form data
        newHypothesis = {
            ...previous,
            name: name,
            description: description,
            notes: notes,
            question: editedQuestionId,
            questionBindings: editedQuestionBindings,
            graph: { triples: editedGraph }
        };

        setWaiting(true);
        console.log("SEND:", newHypothesis);
        (editing?DISKAPI.updateHypothesis:DISKAPI.createHypothesis)(newHypothesis)
            .then((savedHypothesis) => {
                console.log("RETURNED:", savedHypothesis);
                setSaveNotification(true);
                setWaiting(false);
                dispatch(addHypothesis(savedHypothesis));
                navigate(PATH_HYPOTHESES + "/" + savedHypothesis.id.replace(idPattern, "")); 
            })
            .catch((e) => {
                setErrorSaveNotification(true)
                console.warn(e);
                setWaiting(false);
            });
    }

    const onQuestionChange = (selectedQuestionId: string, bindings: VariableBinding[], pattern: Triple[]) => {
        setEditedQuestionId(selectedQuestionId);
        setEditedQuestionBindings(bindings);
        setEditedGraph(pattern);
    };

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

        setWaiting(true);
        console.log("SEND:", newHypothesis);
        DISKAPI.createHypothesis(newHypothesis)
            .then((savedHypothesis) => {
                setSaveNotification(true);
                setWaiting(false);
                dispatch(addHypothesis(savedHypothesis));
                navigate(PATH_HYPOTHESES + "/" + savedHypothesis.id.replace(idPattern, "")); 
            })
            .catch((e) => {
                setErrorSaveNotification(true);
                console.warn(e);
                setWaiting(false);
            });
    };

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)", overflowY: 'auto'}}>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={waiting}>
            <CircularProgress color="inherit" />
        </Backdrop>
        <Snackbar open={saveNotification} autoHideDuration={2000} onClose={(_,r) => r!=='clickaway' && setSaveNotification(false)} anchorOrigin={{vertical:'bottom', horizontal: 'right'}}>
            <Alert severity="success" sx={{ width: '100%' }} onClose={() => setSaveNotification(false)}>
                Successfully saved
            </Alert>
        </Snackbar>
        <Snackbar open={errorSaveNotification} autoHideDuration={2000} onClose={(_,r) => r!=='clickaway' && setErrorSaveNotification(false)} anchorOrigin={{vertical:'bottom', horizontal: 'right'}}>
            <Alert severity="error" sx={{ width: '100%' }} onClose={() => setErrorSaveNotification(false)}>
                Error saving hypothesis. Please try again
            </Alert>
        </Snackbar>

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
                <QuestionSelector questionId={questionId} bindings={questionBindings} onQuestionChange={onQuestionChange} error={errorQuestion}/>
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