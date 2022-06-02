import React from "react";
import { Alert, Backdrop, Box, Button, Card, CircularProgress, Divider, FormHelperText, IconButton, MenuItem, Select, Skeleton, Snackbar, TextField, Typography } from "@mui/material";
import { DISKAPI } from "DISK/API";
import { idPattern, LineOfInquiry, Question, Workflow } from "DISK/interfaces";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import { styled } from '@mui/material/styles';
import { PATH_LOIS, PATH_LOI_ID_EDIT_RE, PATH_LOI_NEW } from "constants/routes";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { setErrorSelected, setLoadingSelected, setSelectedLOI, add as addLOI } from "redux/lois";
import { setEndpoint, setErrorEndpoint, setLoadingEndpoints } from "redux/server";
import { QuestionLinker } from "components/QuestionLinker";
import CodeMirror from '@uiw/react-codemirror';
import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import { StreamLanguage } from '@codemirror/language';
import { WorkflowList } from "components/WorkflowList";
import { LineOfInquiryRequest } from "DISK/requests";

export const TextFieldBlock = styled(TextField)(({ theme }) => ({
    display: "block",
    margin: "6px 0",
}));

const TypographySubtitle = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: "1.2em",
    padding: "5px 5px 0px 5px",
}));

export const LOIEditor = () => {
    const location = useLocation();
    let navigate = useNavigate();
    const dispatch = useAppDispatch();

    const LOI = useAppSelector((state:RootState) => state.lois.selectedLOI);
    const selectedId = useAppSelector((state:RootState) => state.lois.selectedId);
    const loading = useAppSelector((state:RootState) => state.lois.loadingSelected);
    const error = useAppSelector((state:RootState) => state.lois.errorSelected);

    const endpoints = useAppSelector((state:RootState) => state.server.endpoints);
    const loadingEndpoints = useAppSelector((state:RootState) => state.server.loadingEndpoints);
    const errorEndpoints = useAppSelector((state:RootState) => state.server.errorEndpoints);

    const [sparqlVariableNames, setSparqlVariableNames] = React.useState<string[]>([]);
    const [sparqlVariableOptions, setSparqlVariableOptions] = React.useState<string[]>([]);
    const [editingWorkflows, setEditingWorkflows] = React.useState<boolean>(false);

    //FORM
    const [selectedDataSource, setSelectedDataSource] = React.useState("");
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [notes, setNotes] = React.useState("");
    const [dataQuery, setDataQuery] = React.useState("");
    const [explanation, setExplanation] = React.useState("");
    const [relevantVariables, setRelevantVariables] = React.useState("");
    const [workflows, setWorkflows] = React.useState<Workflow[]>([]);
    const [metaWorkflows, setMetaWorkflows] = React.useState<Workflow[]>([]);
    const [questionId, setQuestionId] = React.useState<string>("");
    const [hypothesisQuery, setHypothesisQuery] = React.useState<string>("");

    // State errors...
    const [waiting, setWaiting] = React.useState<boolean>(false);
    const [saveNotification, setSaveNotification] = React.useState<boolean>(false);;
    const [errorSaveNotification, setErrorSaveNotification] = React.useState<boolean>(false);;
    const [errorName, setErrorName] = React.useState<boolean>(false);
    const [errorDesc, setErrorDesc] = React.useState<boolean>(false);
    const [errorDataSource, setErrorDataSource] = React.useState<boolean>(false);
    const [errorQuery, setErrorQuery] = React.useState<boolean>(false);
    const [errorQuestion, setErrorQuestion] = React.useState<boolean>(false);

    const onNameChange = (name:string) => { setName(name); setErrorName(name.length === 0); }
    const onDescChange = (desc:string) => { setDescription(desc); setErrorDesc(desc.length === 0); }
    const onDataSourceChange = (ds:string) => { setSelectedDataSource(ds); setErrorDataSource(ds.length === 0); }

    useEffect(() => {
        let candidates : Set<string> = new Set<string>();
        sparqlVariableNames.forEach((varName:string) => candidates.add(varName));
        let dataVars : RegExpMatchArray | null = dataQuery.match(/\?[\w\d]+/g);
        if (dataVars) {
            dataVars.forEach((varName:string) => candidates.add(varName));
        }
        setSparqlVariableOptions(Array.from(candidates));
    }, [sparqlVariableNames, dataQuery]);
    
    const loadEndpoints = () => {
        if (endpoints == null && !loadingEndpoints && !errorEndpoints) {
            dispatch(setLoadingEndpoints());
            DISKAPI.getEndpoints()
                .then((endpointMap:{[name:string]: string}) => {
                    dispatch(setEndpoint(endpointMap))
                })
                .catch(() => dispatch(setErrorEndpoint()));
        }
    };

    useEffect(loadEndpoints);

    useEffect(() => {
        let match = PATH_LOI_ID_EDIT_RE.exec(location.pathname);
        if (match != null && match.length === 2) {
            let id : string = match[1];
            if (!loading && !error && selectedId !== id) {
                dispatch(setLoadingSelected(id));
                DISKAPI.getLOI(id)
                    .then((LOI:LineOfInquiry) => {
                        dispatch(setSelectedLOI(LOI));
                        loadForm(LOI);
                    })
                    .catch(() => dispatch(setErrorSelected())); 
            } else if (LOI && selectedId === id) {
                loadForm(LOI);
            }
        } else if (location.pathname === PATH_LOI_NEW) {
            dispatch(setSelectedLOI(null));
            clearForm();
        }
    }, [location]);

    const loadForm = (loi:LineOfInquiry) => {
        setName(loi.name);
        setDescription(loi.description);
        setNotes(loi.notes ? loi.notes : "");
        setSelectedDataSource(loi.dataSource);
        setDataQuery(loi.dataQuery);
        setExplanation(loi.explanation? loi.description : "");
        setRelevantVariables(loi.relevantVariables ? loi.relevantVariables : "");
        setWorkflows(loi.workflows);
        setMetaWorkflows(loi.metaWorkflows ? loi.metaWorkflows : []);
    };

    const clearForm = () => {
        setName("");
        setDescription("");
        setNotes("");
        setSelectedDataSource("");
        setDataQuery("");
        setExplanation("");
        setRelevantVariables("");
        setWorkflows([]);
        setMetaWorkflows([]);
    };

    const onSaveButtonClicked = () => {
        if (!name || !description || !selectedDataSource || !dataQuery || !questionId) {
            if (!name) setErrorName(true);
            if (!description) setErrorDesc(true);
            if (!selectedDataSource) setErrorDataSource(true);
            if (!dataQuery) setErrorQuery(true);
            if (!questionId) setErrorQuestion(true);
            return;
        }

        let newLOI : LineOfInquiry | LineOfInquiryRequest;
        let previous : any = {};
        let editing : boolean = false;
        //TODO: fix dates and author!! server-side
        if (LOI) {
            // Edit existing hypothesis:
            previous  = { ...LOI };
            editing = true;
        }
        newLOI = {
            ...previous,
            name: name,
            description: description,
            notes: notes,
            question: questionId,
            dataQuery: dataQuery,
            hypothesisQuery: hypothesisQuery,
            dataSource: selectedDataSource,
            workflows: workflows.map(w => {return {
                ...w,
                bindings: w.bindings.map(b => {return {
                    ...b,
                    collection: undefined,
                    bindingAsArray: undefined,
                }}),
            }}),
            metaWorkflows: metaWorkflows,
        };

        setWaiting(true);
        console.log("SEND:", newLOI);
        (editing?DISKAPI.updateLOI:DISKAPI.createLOI)(newLOI)
            .then((savedLOI) => {
                setSaveNotification(true);
                setWaiting(false);
                dispatch(addLOI(savedLOI));
                navigate(PATH_LOIS + "/" + savedLOI.id.replace(idPattern, "")); 
            })
            .catch((e) => {
                setErrorSaveNotification(true);
                console.warn(e);
                setWaiting(false);
            });
    };

    const handleSaveNotificationClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway')
            return;
        setWaiting(false);
    };

    const onWorkflowListChange = (wfs:Workflow[], metaWfs:Workflow[]) => {
        setWorkflows(wfs);
        setMetaWorkflows(metaWfs);
    };

    const onQuestionChange = (q:Question|null, vars:string[]) => {
        setSparqlVariableNames(vars);
        setQuestionId(q ? q.id : "");
        setErrorQuestion(q === null || q.id.length ===0);
        if (q!=null) {
            // Replace all sub-resources (:example) for variables (?example) for hypothesis matching.
            setHypothesisQuery( q.pattern.replaceAll(/([\s]|^):([\w\d]+)/g, "?$2") );
        } else {
            setHypothesisQuery("");
        }
    }

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
                Error saving Line of Inquiry. Please try again
            </Alert>
        </Snackbar>

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
                <TextField fullWidth size="small" id="LOIName" label="LOI Name" required sx={{backgroundColor: "white"}}
                    value={name} error={errorName} onChange={(e) => onNameChange(e.target.value)}/>
            : <Skeleton/> }

            <IconButton component={Link} to={PATH_LOIS + (LOI ? "/" + LOI.id : "")}>
                <CancelIcon /> 
            </IconButton>
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Description:</TypographySubtitle>
            {!loading ?
                <TextFieldBlock multiline fullWidth required size="small" id="LOIDescription" label="LOI Description"
                    value={description} error={errorDesc} onChange={(e) => onDescChange(e.target.value)}/>
            : <Skeleton/> }
            {!loading ?
                <TextFieldBlock multiline fullWidth size="small" id="LOINotes" label="LOI Notes"
                    value={notes} onChange={(e) => setNotes(e.target.value)}/>
            : <Skeleton/> }
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Hypothesis linking:</TypographySubtitle>
            <QuestionLinker selected={LOI? LOI.question : ""} onQuestionChange={onQuestionChange} error={errorQuestion}/>
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Data extraction:</TypographySubtitle>
            <Box sx={{display: "inline-flex", alignItems: "center"}}>
                <Typography sx={{display: "inline-block", marginRight: "5px"}}> Data source: </Typography>
                {loadingEndpoints ?  <Skeleton sx={{display:"inline-block"}}/>
                    :
                    <Select size="small" sx={{display: 'inline-block', minWidth: "150px"}} variant="standard"  label={"Data source:"} required
                            error={errorDataSource} value={selectedDataSource} onChange={(e) => onDataSourceChange(e.target.value)}>
                        <MenuItem value="" disabled> None </MenuItem>
                        { Object.keys(endpoints || []).map((name:string) => <MenuItem key={`endpoint_${name}`} value={endpoints![name]}>{name}</MenuItem>) }
                    </Select>
                }
            </Box>
            <Box sx={{fontSize: "0.94rem"}} >
                <Card variant="outlined" sx={{
                        ...{mt: "8px", p: "0px", position: "relative", overflow:"visible", pt:"10px"},
                        ...(errorQuery ? {borderColor:"#d32f2f", } : {})
                    }}>
                    <FormHelperText sx={{position: 'absolute', background: 'white', padding: '0 4px', margin: '-19px 0 0 10px', color:(errorQuery?"#d32f2f":'rgba(0, 0, 0, 0.6);')}}>
                        Data query *
                    </FormHelperText>
                    <CodeMirror value={dataQuery}
                        extensions={[StreamLanguage.define(sparql)]}
                        onChange={(value, viewUpdate) => {
                            setDataQuery(value);
                            setErrorQuery(value.length === 0);
                            console.log('value:', value);
                        }}
                        onBlur={console.log}
                    />
                </Card>
            </Box>
            <Box>
                <FormHelperText sx={{fontSize: ".9rem"}}>
                    We can generate a table with the metadata obtained, please add variables of interest and a small description:
                </FormHelperText>
                <TextFieldBlock fullWidth size="small" id="LOITableDesc" label="Metadata table description" value={explanation} onChange={(e) => setExplanation(e.target.value)}/>
                <TextFieldBlock fullWidth size="small" id="LOITableVars" label="Table variables" placeholder="?var1 ?var2 ..." value={relevantVariables} onChange={(e) => setRelevantVariables(e.target.value)}/>
            </Box>
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle sx={{display: "inline-block"}}>Method configuration:</TypographySubtitle>
            <WorkflowList editable={true} workflows={workflows} metaworkflows={metaWorkflows} options={sparqlVariableOptions}
                    onEditStateChange={setEditingWorkflows} onChange={onWorkflowListChange}></WorkflowList>
        </Box>
        <Box sx={{display: 'flex', justifyContent: 'flex-end', padding: "10px"}}>
            <Button color="error" sx={{mr:"10px"}} component={Link} to={PATH_LOIS + (LOI ? "/" + LOI.id : "")}>
                <CancelIcon/> Cancel
            </Button>
            <Button variant="contained" color="success" onClick={onSaveButtonClicked} disabled={editingWorkflows}>
                <SaveIcon/> Save
            </Button>
        </Box>
    </Card>
}