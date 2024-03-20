import { Box, Card, Typography, Divider, Grid, IconButton, Tooltip, TableHead, Button, Table, TableBody, TableCell, TableContainer, TableRow,
    styled } from "@mui/material"
import { WorkflowSeed, VariableBinding, WorkflowRun, RunBinding } from "DISK/interfaces"
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteIcon from '@mui/icons-material/Delete';
import { Fragment, useEffect, useState } from "react";
import { getBindingAsArray, getFileName } from "DISK/util";
import { PrivateLink } from "components/files/PrivateLink";

const TypographyLabel = styled(Typography)(({ theme }) => ({
    color: 'gray',
    display: "inline",
    fontWeight: "bold",
    fontSize: '0.9em',
}));

interface WorkflowPreviewProps {
    workflow: WorkflowSeed,
    button?: JSX.Element,
    onDelete?: (wf:WorkflowSeed) => void,
    meta?: boolean
}

const MAX_PER_PAGE = 10;

export const WorkflowSeedPreview = ({workflow:wf, button:externalButton, onDelete, meta=false} : WorkflowPreviewProps) => {
    const [total, setTotal] = useState(0);
    const [curPage, setCurPage] = useState(0);
    //const [allRuns, setAllRuns] = useState<WorkflowRun[]>([]);
    //const [allInputs, setAllInputs] = useState<{[name:string]: RunBinding}>({});
    //const [allOutputs, setAllOutputs] = useState<{[name:string]: RunBinding}>({});
    //const [visibleBindings, setVisibleBindings] = useState<VariableBinding[]>([]);

    //useEffect(() => {
    //    if (!!wf) {
    //        let simpleBindings : VariableBinding[] = [];
    //        let collectionBindings : VariableBinding[] = [];
    //        let max : number = 0;
    //        //wf.bindings.forEach((vb:VariableBinding) => {
    //        //    if (vb.isArray) {
    //        //        let l : number = vb.binding.length;
    //        //        if (l > max) max = l;
    //        //        collectionBindings.push(vb);
    //        //    } else {
    //        //        if (!(vb.binding[0].startsWith("_") && vb.binding[0].endsWith("_"))) {
    //        //            simpleBindings.push(vb);
    //        //        }
    //        //    }
    //        //})
    //        setTotal(max);
    //        // Get all runs
    //        let newRuns : WorkflowRun[] = [];
    //        let newInputs : {[name:string]: RunBinding} = {};
    //        let newOutputs : {[name:string]: RunBinding} = {};
    //        //Object.values(wf.runs||{}).forEach(run => {
    //        //    newRuns.push(run);
    //        //    //if (run.inputs) newInputs = { ...newInputs, ...run.inputs };
    //        //    if (run.inputs) {
    //        //        Object.values(run.inputs).forEach(input => {
    //        //            if (input.type === 'URI' && input.id) {
    //        //                newInputs[ input.id.replaceAll(/.*#/g,'') ] = input;
    //        //            }
    //        //        });
    //        //    }
    //        //    if (run.outputs) newOutputs = { ...newOutputs, ...run.outputs };
    //        //});
    //        //setAllRuns(newRuns);
    //        setAllInputs(newInputs);
    //        setAllOutputs(newOutputs);
    //        setVisibleBindings([...simpleBindings, ...collectionBindings]);
    //    }
    //}, [wf]);

    //const renderBinding = (binding:VariableBinding, index:number) => {
    //    let value : string = binding.isArray ?
    //        binding.binding[index]
    //        : binding.binding[0];

    //    console.log(binding,allInputs);
    //    if (value.startsWith('SHA') && allInputs[value]) {
    //        return renderDownloadLink(allInputs[value].id || "");
    //    }

    //    return (<span>{value}</span>);
    //}

    const renderDownloadLink = (url:string) => {
        let filename : string = url.replaceAll(/.*#/g,'').replace(/SHA[\d\w]{6}_/,'');
        return <PrivateLink filename={filename} source={wf.source.url}  url={url}/>;
    }

    const renderWorkflowVariableBinding = (binding:VariableBinding) => {
        //This is a hack, we should read the vocabulary and use the prefixes 
        //e.g: http://localhost:8080/wings-portal/export/users/admin/Enigma/data/library.owl#SHA4fe5c4_
        let value = binding.isArray ? binding.binding.map(v => v.replace(/http.*#SHA[a-zA-Z0-9]{6}_/,"")).join(", ") : (binding.binding[0])

        let color = "rgba(0, 0, 0, 0.87)";
        let editedValue = binding.isArray ? value : '"' + value + '"';
        let fontS = "normal"
        if (value.startsWith("?")) {
            color = "green";
            editedValue = value;
        } else if (value.startsWith("!")) {
            color = "blue";
            editedValue = value.substring(1);
        } else if (value === "_CSV_") {
            editedValue = "CSV with data query results"
            fontS = "italic"
        } else if (value === "_DO_NO_STORE_") {
            editedValue = "This file will not be stored"
            fontS = "italic"
        } else if (value === "_DOWNLOAD_ONLY_") {
            editedValue = "This file will be make available to download"
            fontS = "italic"
        } else if (value === "_IMAGE_") {
            editedValue = "This file will be used to generate visualizations";
            fontS = "italic"
        } else if (value === "_VISUALIZE_") {
            editedValue = "The latest version of this file will be show on TLOI preview"
            fontS = "italic"
        } else if (value === "_BRAIN_VISUALIZATION_") {
            editedValue = "This file will be used to generate a brain visualization"
            fontS = "italic"
        } else if (value === "_SHINY_LOG_") {
            editedValue = "This file will be used to generate Shiny visualizations"
            fontS = "italic"
        } else if (value === "_CONFIDENCE_VALUE_") {
            editedValue = "This file contains the confidence value"
            fontS = "italic"
        } else if (value === "_RUN_DATE_") {
            editedValue = "Date of execution for this and previous runs of this LOI"
            fontS = "italic"
        }

        if (binding.isArray) return <Fragment>
            <span style={{color:color, fontStyle:fontS}}>{editedValue}</span>
            {value.startsWith("!") && <span> from defined workflows</span>}
            <span style={{marginLeft: '5px', color: 'darkgray', fontWeight: 'bold'}} >(List)</span>
        </Fragment>

        return <span style={{color:color, fontStyle:fontS}}>{editedValue}</span>
    }

    return (
        <Card key={`wf_${wf.link}`} variant="outlined" sx={{mb: "5px"}}>
            <Box sx={{display: "flex", justifyContent: "space-between"}}>
                <a target="_blank" rel="noreferrer" href={wf.link} style={{display: "inline-flex", alignItems: "center", textDecoration: "none", color: "black"}}>
                    <DisplaySettingsIcon sx={{ marginLeft: "10px" , color: "darkgreen"}} />
                    <Typography sx={{padding:"0 10px", fontWeight: 500}}>{wf.name}</Typography>
                    <OpenInNewIcon sx={{fontSize: "1rem"}}/>
                </a>
                <Box>
                    {externalButton ? externalButton : ""}
                    {onDelete ? 
                    <Tooltip arrow title="Delete">
                        <IconButton onClick={() => onDelete(wf)} sx={{padding: "0 3px"}}><DeleteIcon/></IconButton>
                    </Tooltip> : ""}
                </Box>
            </Box>
            <Divider/>
            {wf.description && (<Typography sx={{p:"0 10px", fontSize:"0.95em", color:"#333"}}>{wf.description}</Typography>)}
            {wf.parameters.length > 0 && <Box>
                <TypographyLabel sx={{ padding: "20px", fontSize: "1em"}}>
                    {meta ? "Meta-workflow" : "Workflow"} parameters:
                </TypographyLabel>
                <Box sx={{fontSize:".85rem"}}>
                    { wf.parameters.map((binding:VariableBinding) =>
                        <Grid key={`var_${binding.variable}`} container spacing={1}>
                            <Grid item xs={3} md={2} sx={{textAlign: "right"}}>
                                <b>{binding.variable}: </b>
                            </Grid>
                            <Grid item xs={9} md={10}>
                                {renderWorkflowVariableBinding(binding)}
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </Box>}
            {wf.inputs.length > 0 && <Box>
                <TypographyLabel sx={{ padding: "20px", fontSize: "1em"}}>
                    {meta ? "Meta-workflow" : "Workflow"} inputs:
                </TypographyLabel>
                <Box sx={{fontSize:".85rem"}}>
                    { wf.inputs.map((binding:VariableBinding) =>
                        <Grid key={`var_${binding.variable}`} container spacing={1}>
                            <Grid item xs={3} md={2} sx={{textAlign: "right"}}>
                                <b>{binding.variable}: </b>
                            </Grid>
                            <Grid item xs={9} md={10}>
                                {renderWorkflowVariableBinding(binding)}
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </Box>}
            {wf.outputs.length > 0 && <Box>
                <TypographyLabel sx={{ padding: "20px", fontSize: "1em"}}>
                    {meta ? "Meta-workflow" : "Workflow"} outputs:
                </TypographyLabel>
                <Box sx={{fontSize:".85rem"}}>
                    { wf.outputs.map((binding:VariableBinding) =>
                        <Grid key={`var_${binding.variable}`} container spacing={1}>
                            <Grid item xs={3} md={2} sx={{textAlign: "right"}}>
                                <b>{binding.variable}: </b>
                            </Grid>
                            <Grid item xs={9} md={10}>
                                {renderWorkflowVariableBinding(binding)}
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </Box>}


        </Card>
    );
}