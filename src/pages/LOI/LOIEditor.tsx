import React from "react";
import { Box, Button, Card, Divider, FormHelperText, Grid, IconButton, MenuItem, Select, SelectChangeEvent, Skeleton, TextField, Typography } from "@mui/material";
import { DISKAPI } from "DISK/API";
import { LineOfInquiry, VariableBinding, Workflow } from "DISK/interfaces";
import { useEffect } from "react";
import { Link, useLocation } from 'react-router-dom'
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { styled } from '@mui/material/styles';
import { PATH_LOIS, PATH_LOI_ID_EDIT_RE, PATH_LOI_NEW } from "constants/routes";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { setErrorSelected, setLoadingSelected, setSelectedLOI } from "redux/lois";
import { setEndpoint, setErrorEndpoint, setLoadingEndpoints } from "redux/server";
import { QuestionLinker } from "components/QuestionLinker";
import CodeMirror from '@uiw/react-codemirror';
import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import { StreamLanguage } from '@codemirror/language';
import { WorkflowEditor } from "components/WorkflowEditor";

const TextFieldBlock = styled(TextField)(({ theme }) => ({
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
    const dispatch = useAppDispatch();

    const LOI = useAppSelector((state:RootState) => state.lois.selectedLOI);
    const selectedId = useAppSelector((state:RootState) => state.lois.selectedId);
    const loading = useAppSelector((state:RootState) => state.lois.loadingSelected);
    const error = useAppSelector((state:RootState) => state.lois.errorSelected);

    const endpoints = useAppSelector((state:RootState) => state.server.endpoints);
    const loadingEndpoints = useAppSelector((state:RootState) => state.server.loadingEndpoints);
    const errorEndpoints = useAppSelector((state:RootState) => state.server.errorEndpoints);

    const [fakeLoading, setFakeLoading] = React.useState(false);
    const [addingWorkflow, setAddingWorkflow] = React.useState(false);
    const [selectedDataSource, setSelectedDataSource] = React.useState("");
    const [selectedWorkflow, setSelectedWorkflow] = React.useState("");

    useEffect(() => {
        let match = PATH_LOI_ID_EDIT_RE.exec(location.pathname);
        if (match != null && match.length === 2) {
            let id : string = match[1];
            if (!loading && !error && selectedId !== id) {
                dispatch(setLoadingSelected(id));
                DISKAPI.getLOI(id)
                    .then((LOI:LineOfInquiry) => {
                        console.log(LOI);
                        dispatch(setSelectedLOI(LOI));
                        if (LOI.dataSource) setSelectedDataSource(LOI.dataSource);
                    })
                    .catch(() => dispatch(setErrorSelected())); 
            } else if (LOI && LOI.dataSource) {
                setSelectedDataSource(LOI.dataSource);
            }
        } else if (location.pathname === PATH_LOI_NEW) {
            dispatch(setSelectedLOI(null));
        }
        if (endpoints == null && !loadingEndpoints && !errorEndpoints) {
            dispatch(setLoadingEndpoints());
            DISKAPI.getEndpoints()
                .then((endpointMap:{[name:string]: string}) => {
                    dispatch(setEndpoint(endpointMap))
                })
                .catch(() => dispatch(setErrorEndpoint()));
        }
    }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!selectedId && !fakeLoading) {
            setFakeLoading(true);
            setTimeout(() => {
                setFakeLoading(false);
            }, 100);
        }
    }, [selectedId])  // eslint-disable-line react-hooks/exhaustive-deps

    const onDataSourceChange = (event:SelectChangeEvent<string>) => {
        if (event && event.target.value) {
            setSelectedDataSource(event.target.value);
        }
    }

    const onWorkflowChange = (event:SelectChangeEvent<string>) => {
        if (event && event.target.value) {
            setSelectedWorkflow(event.target.value);
        }
    }

    const toggleAddWorkflow = () => {
        setAddingWorkflow(!addingWorkflow);
    }

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)", overflowY: 'auto'}}>
        <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor: "whitesmoke"}}>
            {!loading && !fakeLoading? 
                <TextField fullWidth size="small" id="LOIName" label="LOI Name" required sx={{backgroundColor: "white"}}
                    defaultValue={!!LOI ? LOI.name : ''}/>
            : <Skeleton/> }

            <IconButton component={Link} to={PATH_LOIS + (LOI && LOI.id ? "/" + LOI.id : "")}>
                <CancelIcon /> 
            </IconButton>
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Description:</TypographySubtitle>
            {!loading && !fakeLoading?
                <TextFieldBlock multiline fullWidth required size="small" id="LOIDescription" label="LOI Description"
                    defaultValue={!!LOI ? LOI.description : ""}/>
            : <Skeleton/> }
            {!loading && !fakeLoading ?
                <TextFieldBlock multiline fullWidth required size="small" id="LOINotes" label="LOI Notes"
                    defaultValue={!!LOI ? LOI.notes : ""}/>
            : <Skeleton/> }
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Hypothesis linking:</TypographySubtitle>
            <QuestionLinker selected={LOI? LOI.question : ""} />
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Data extraction:</TypographySubtitle>
            <Box sx={{display: "inline-flex", alignItems: "center"}}>
                <Typography sx={{display: "inline-block", marginRight: "5px"}}> Data source: </Typography>
                <Select size="small" sx={{display: 'inline-block', minWidth: "150px"}} variant="standard" value={selectedDataSource} label={"Data source:"} onChange={onDataSourceChange}>
                    {loadingEndpoints ? 
                        <MenuItem value={selectedDataSource}> Loading ... </MenuItem> 
                    : (
                        endpoints ? 
                            Object.keys(endpoints).map((name:string) => <MenuItem key={`endpoint_${name}`} value={endpoints[name]}>{name}</MenuItem>)
                        :
                            <MenuItem value={selectedDataSource}>{selectedDataSource}</MenuItem>
                    )}
                </Select>
            </Box>
            <Box sx={{fontSize: "0.94rem"}} >
                <CodeMirror value={!!LOI? LOI.dataQuery : ""}
                    extensions={[StreamLanguage.define(sparql)]}
                    onChange={(value, viewUpdate) => {
                    console.log('value:', value);
                    }}
                />
            </Box>
            <Box>
                <FormHelperText sx={{fontSize: ".9rem"}}>
                    We can generate a table with the metadata obtained, please add variables of interest and a small description:
                </FormHelperText>
                <TextFieldBlock fullWidth size="small" id="LOITableDesc" label="Metadata table description" defaultValue={!!LOI ? LOI.explanation : ''}/>
                <TextFieldBlock fullWidth size="small" id="LOITableVars" label="Table variables" placeholder="?var1 ?var2 ..." defaultValue={!!LOI ? LOI.relevantVariables : ''}/>
            </Box>
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <Box sx={{display: "flex", justifyContent: "space-between", marginBottom: "4px"}}>
                <TypographySubtitle sx={{display: "inline-block"}}>Method configuration:</TypographySubtitle>
                <Box>
                    <Button sx={{padding: "3px 6px"}} variant="outlined" onClick={toggleAddWorkflow} color={addingWorkflow? "error" : "primary"}>
                        {addingWorkflow ? <CancelIcon sx={{marginRight: "4px"}}/> : <AddIcon/>}
                        {addingWorkflow ? <Box>Cancel</Box> : <Box>Add Workflow</Box>}
                    </Button>
                    {LOI && LOI.workflows && LOI.workflows.length > 0 && false ? 
                        <Button sx={{padding: "3px 6px", marginLeft: "6px"}} variant="outlined">
                            <AddIcon></AddIcon>
                            Add Meta-workflow
                        </Button>
                    : ""}
                </Box>
            </Box> 
            {addingWorkflow ?  <WorkflowEditor></WorkflowEditor> : ""}
            <Box>
                {loading ? <Skeleton/> : (LOI && LOI.workflows && LOI.workflows.length > 0 ? 
                    <Box>
                        <FormHelperText sx={{fontSize: ".9rem"}}>
                            Workflows to run: 
                        </FormHelperText>
                        { LOI.workflows.map((wf:Workflow) => <Card key={`wf_${wf.workflow}`} variant="outlined">
                            <Box sx={{display: "flex", justifyContent: "space-between"}}>
                                <a target="_blank" href={wf.workflowLink} style={{display: "inline-flex", alignItems: "center", textDecoration: "none", color: "black"}}>
                                    <DisplaySettingsIcon sx={{ marginLeft: "10px" , color: "darkgreen"}} />
                                    <Typography sx={{padding:"0 10px", fontWeight: 500}}>{wf.workflow}</Typography>
                                    <OpenInNewIcon sx={{fontSize: "1rem"}}/>
                                </a>
                            </Box>
                            <Divider/>
                            <Grid container spacing={2} sx={{padding: "0 10px", fontSize: "0.85rem"}}>
                                <Grid item xs={3} md={2} sx={{textAlign: "right", color: "#444"}}>
                                    <b>DATA BINDINGS:</b>
                                </Grid>
                                <Grid item xs={9} md={10}>
                                    { wf.bindings.map((binding:VariableBinding) =>
                                        <Grid key={`var_${binding.variable}`} container spacing={1}>
                                            <Grid item xs={3} md={2}>
                                                <b>{binding.variable}: </b>
                                            </Grid>
                                            <Grid item xs={9} md={10}>
                                                {binding.binding}
                                            </Grid>
                                        </Grid>
                                    )}
                                </Grid>
                            </Grid>
                        </Card>)}
                    </Box>
                : 
                    <Card variant="outlined" sx={{display: "flex", alignItems: "center", justifyContent: "center", padding: "10px"}}>
                        <Typography>
                            No workflows to run
                        </Typography>
                    </Card>
                )}

            </Box>
        </Box>
    </Card>
}