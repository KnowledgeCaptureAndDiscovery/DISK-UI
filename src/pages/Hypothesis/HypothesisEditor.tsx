import { Alert, Backdrop, Box, Button, Card, CircularProgress, Divider, IconButton, Skeleton, Snackbar, TextField, Typography } from "@mui/material";
import { DISKAPI } from "DISK/API";
import { Hypothesis, idPattern, Triple, VariableBinding } from "DISK/interfaces";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import { styled } from '@mui/material/styles';
import { PATH_HYPOTHESES, PATH_HYPOTHESIS_ID_EDIT_RE, PATH_HYPOTHESIS_NEW, PATH_LOIS } from "constants/routes";
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

    const [waiting, setWaiting] = React.useState<boolean>(false);;
    const [saveNotification, setSaveNotification] = React.useState<boolean>(false);;

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
        console.log("save clicked");
        // Check required fields;
        if (!name || !description || !editedQuestionId) {
            //TODO: show errors
            return;
        }

        let newHypothesis : Hypothesis | HypothesisRequest;
        let previous : any = {};
        let editing : boolean = false;
        //TODO: fix dates and author!! (server side)
        if (hypothesis) {
            previous = {...hypothesis};
            editing = true;
            // Edit existing hypothesis:
            //newHypothesis = {
            //    ... hypothesis,
            //    name: name,
            //    description: description,
            //    notes: notes,
            //    question: editedQuestionId,
            //    questionBindings: editedQuestionBindings,
            //    graph: { triples: editedGraph }
            //};
        }
        // Add form data
        newHypothesis = {
            ...previous ,
            name: name,
            description: description,
            notes: notes,
            question: editedQuestionId,
            questionBindings: editedQuestionBindings,
            graph: { triples: editedGraph }
        };

        setWaiting(true);
        console.log("SEND:", newHypothesis);
        (editing&&false?DISKAPI.updateHypothesis:DISKAPI.createHypothesis)(newHypothesis) //FIXME
            .then((savedHypothesis) => {
                setSaveNotification(true);
                dispatch(addHypothesis(savedHypothesis));
                setWaiting(false);
                navigate(PATH_HYPOTHESES + "/" + savedHypothesis.id.replace(idPattern, "")); 
            })
            .catch((e) => {
                //TODO: show some kind of error.
                console.warn(e);
                setWaiting(false);
            });
    }

    const onQuestionChange = (selectedQuestionId: string, bindings: VariableBinding[], pattern: Triple[]) => {
        setEditedQuestionId(selectedQuestionId);
        setEditedQuestionBindings(bindings);
        setEditedGraph(pattern);
    };

    const handleSaveNotificationClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway')
            return;
        setWaiting(false);
    };

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)", overflowY: 'auto'}}>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={waiting}>
            <CircularProgress color="inherit" />
        </Backdrop>
        <Snackbar open={saveNotification} autoHideDuration={2000} onClose={handleSaveNotificationClose} anchorOrigin={{vertical:'bottom', horizontal: 'right'}}>
            <Alert severity="success" sx={{ width: '100%' }} onClose={handleSaveNotificationClose}>
                Saved!
            </Alert>
        </Snackbar>


        <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor: "whitesmoke"}}>
            {!loading ? 
                <TextField fullWidth size="small" label="Hypothesis Name" required sx={{backgroundColor: "white"}}
                    value={name}
                    onChange={(ev) => setName(ev.target.value)}/>
            : <Skeleton/> }

            <IconButton component={Link} to={PATH_HYPOTHESES + (hypothesis && hypothesis.id ? "/" + hypothesis.id : "")}>
                <CancelIcon /> 
            </IconButton>
        </Box>
        <Divider/>
        <Box sx={{padding:"10px"}}>
            {!loading ?
                <TextFieldBlock multiline fullWidth required size="small" label="Hypothesis Description" sx={{marginTop: "5px"}}
                    value={description}
                    onChange={(ev) => setDescription(ev.target.value)}/>
            : <Skeleton/> }
            {!loading ?
                <TextFieldBlock multiline fullWidth required size="small" label="Hypothesis Notes" sx={{marginTop: "10px"}}
                    value={notes}
                    onChange={(ev) => setNotes(ev.target.value)}/>
            : <Skeleton/> }
            <Divider/>
            <TypographySubtitle>
                Hypothesis question:
            </TypographySubtitle>
            {!loading ?
                <QuestionSelector questionId={questionId} bindings={questionBindings} onQuestionChange={onQuestionChange}/>
            : <Skeleton/>}
        </Box>

        <Box sx={{display: 'flex', justifyContent: 'flex-end', padding: "10px"}}>
            <Button color="error" sx={{mr:"10px"}} component={Link} to={PATH_HYPOTHESES + (hypothesis ? "/" + hypothesis.id : "")}>
                <CancelIcon/> Cancel
            </Button>
            <Button variant="contained" color="success" onClick={onSaveButtonClicked}>
                <SaveIcon/> Save
            </Button>
        </Box>
    </Card>
}