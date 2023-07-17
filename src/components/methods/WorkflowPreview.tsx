import { Box, Card, Typography, Divider, Grid, IconButton, Tooltip, TableHead, Button, Table, TableBody, TableCell, TableContainer, TableRow,
    styled } from "@mui/material"
import { Workflow, VariableBinding, WorkflowRun, RunBinding } from "DISK/interfaces"
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteIcon from '@mui/icons-material/Delete';
import { Fragment, useEffect, useState } from "react";
import { getBindingAsArray, getFileName } from "DISK/util";
import { PrivateLink } from "components/PrivateLink";

const TypographyLabel = styled(Typography)(({ theme }) => ({
    color: 'gray',
    display: "inline",
    fontWeight: "bold",
    fontSize: '0.9em',
}));

interface WorkflowPreviewProps {
    workflow: Workflow,
    button?: JSX.Element,
    onDelete?: (wf:Workflow) => void,
}

const MAX_PER_PAGE = 10;

export const WorkflowPreview = ({workflow:wf, button:externalButton, onDelete} : WorkflowPreviewProps) => {
    const [total, setTotal] = useState(0);
    const [curPage, setCurPage] = useState(0);
    //const [allRuns, setAllRuns] = useState<WorkflowRun[]>([]);
    const [allInputs, setAllInputs] = useState<{[name:string]: RunBinding}>({});
    const [allOutputs, setAllOutputs] = useState<{[name:string]: RunBinding}>({});

    useEffect(() => {
        if (!!wf) {
            let max : number = 0;
            wf.bindings.forEach((vb:VariableBinding) => {
                if (vb.collection) {
                    let l : number = vb.binding.split(", ").length;
                    if (l > max) max = l;
                }
            })
            setTotal(max);
            // Get all runs
            let newRuns : WorkflowRun[] = [];
            let newInputs : {[name:string]: RunBinding} = {};
            let newOutputs : {[name:string]: RunBinding} = {};
            Object.values(wf.runs||{}).forEach(run => {
                newRuns.push(run);
                if (run.inputs) newInputs = { ...newInputs, ...run.inputs };
                if (run.outputs) newOutputs = { ...newOutputs, ...run.outputs };
            });
            //setAllRuns(newRuns);
            setAllInputs(newInputs);
            setAllOutputs(newOutputs);
        }
    }, [wf]);

    const renderBinding = (binding:VariableBinding, index:number) => {
        let value : string = binding.collection ?
            getBindingAsArray(binding.binding)[index]
            : binding.binding;

        if (value.startsWith('SHA') && allInputs[value]) {
            return renderDownloadLink(allInputs[value].id || "");
        }

        return (<span>{value}</span>);
    }

    const renderDownloadLink = (url:string) => {
        let filename : string = url.replaceAll(/.*#/g,'').replace(/SHA[\d\w]{6}_/,'');
        return <PrivateLink filename={filename} source={wf.source}  url={url}/>;
    }

    const renderWorkflowVariableBinding = (rawValue:string) => {
        let isList = rawValue.startsWith("[") && rawValue.endsWith("]");
        let value = isList ? rawValue.substring(1, rawValue.length -1) : rawValue;
        let color = "rgba(0, 0, 0, 0.87)";
        let editedValue = '"' + value + '"';
        let fontS = "normal"
        if (value.startsWith("?")) {
            color = "green";
            editedValue = value;
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
            editedValue = "This file will be used on visualizations"
            fontS = "italic"
        } else if (value === "_VISUALIZE_") {
            editedValue = "The latest version of this file will be show on TLOI preview"
            fontS = "italic"
        } else if (value === "_BRAIN_VISUALIZATION_") {
            editedValue = "This file is a brain visualization configuration file"
            fontS = "italic"
        } else if (value === "_CONFIDENCE_VALUE_") {
            editedValue = "This file contains the confidence value"
            fontS = "italic"
        }

        if (isList) return <Fragment>
            <span style={{color:color, fontStyle:fontS}}>{editedValue}</span>
            <span style={{marginLeft: '5px', color: 'darkgray', fontWeight: 'bold'}} >(List)</span>
        </Fragment>

        return <span style={{color:color, fontStyle:fontS}}>{editedValue}</span>
    }

    return (
        <Card key={`wf_${wf.workflow}`} variant="outlined" sx={{mb: "5px"}}>
            <Box sx={{display: "flex", justifyContent: "space-between"}}>
                <a target="_blank" rel="noreferrer" href={wf.workflowLink} style={{display: "inline-flex", alignItems: "center", textDecoration: "none", color: "black"}}>
                    <DisplaySettingsIcon sx={{ marginLeft: "10px" , color: "darkgreen"}} />
                    <Typography sx={{padding:"0 10px", fontWeight: 500}}>{wf.workflow}</Typography>
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

            {!wf.runs || Object.keys(wf.runs).length === 0 ?  //If theres no run, we are looking at a workflow config
                <Box sx={{fontSize:".85rem"}}>
                    { wf.bindings.map((binding:VariableBinding) =>
                        <Grid key={`var_${binding.variable}`} container spacing={1}>
                            <Grid item xs={3} md={2} sx={{textAlign: "right"}}>
                                <b>{binding.variable}: </b>
                            </Grid>
                            <Grid item xs={9} md={10}>
                                {renderWorkflowVariableBinding(binding.binding)}
                            </Grid>
                        </Grid>
                    )}
                </Box>
            :
                <Box>
                    <TypographyLabel sx={{ml:"5px"}}>Inputs: </TypographyLabel>
                    <TableContainer sx={{mb:"10px"}}>
                        <Table sx={{width:"unset", ml: "20px"}}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{padding: "0 10px", textAlign: 'end'}}> # </TableCell>
                                    {wf.bindings.map((binding:VariableBinding, i:number, x) =>
                                        <TableCell key={`u_${binding.variable}`} sx={{padding: "0 10px"}}>
                                            {binding.variable}
                                        </TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>

                            {Array(MAX_PER_PAGE).fill(0)
                                .map((_, i) => curPage * MAX_PER_PAGE + i)
                                .map((i) => (
                                <TableRow key={`row_${i}`}>
                                    {i < total && (
                                    <Fragment>
                                        <TableCell sx={{padding: "0 10px", textAlign: 'end'}}>
                                            {i+1}
                                        </TableCell>
                                        {wf.bindings.map((binding:VariableBinding) =>
                                            <TableCell key={`c_${binding.variable}_${i}`} sx={{padding: "0 10px"}}>
                                                {renderBinding(binding, i)}
                                            </TableCell>
                                        )}
                                    </Fragment>)}
                                </TableRow>
                            ))}
                                <TableRow>
                                    <TableCell sx={{ padding: "0 10px" }} colSpan={wf.bindings.length + 1}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }}>
                                        <Button sx={{ padding: "0" }} disabled={curPage === 0} onClick={() => setCurPage(curPage - 1)}>
                                            Previous
                                        </Button>
                                        <Box sx={{ fontWeight: "bold", color: "darkgray", padding: "0 10px" }}>
                                            Showing {curPage * MAX_PER_PAGE} -{" "}
                                            {(curPage + 1) * MAX_PER_PAGE < total
                                            ? (curPage + 1) * MAX_PER_PAGE
                                            : total}{" "}
                                            of {total} bindings
                                        </Box>
                                        <Button sx={{ padding: "0" }} disabled={(1 + curPage) * MAX_PER_PAGE >= total} onClick={() => setCurPage(curPage + 1)}>
                                            Next
                                        </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {Object.keys(allOutputs).length > 0 && (
                    <Fragment>
                        <TypographyLabel sx={{ml:"5px"}}>Outputs: </TypographyLabel>
                        <TableContainer sx={{mb:"10px"}}>
                            <Table sx={{width:"unset", ml: "20px"}}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{padding: "0 10px", textAlign: 'end'}}>#</TableCell>
                                        <TableCell sx={{padding: "0 10px"}}>Name</TableCell>
                                        <TableCell sx={{padding: "0 10px"}}>File</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                {Object.keys(allOutputs).map((name:string, i:number) => (
                                    <TableRow key={`out_r_${i}`}>
                                        <TableCell sx={{padding: "0 10px", textAlign: 'end'}}>
                                            {i+1}
                                        </TableCell>
                                        <TableCell sx={{padding: "0 10px", whiteSpace: 'nowrap'}}>
                                            {getFileName(name)}
                                        </TableCell>
                                        <TableCell sx={{padding: "0 10px"}}>
                                            {renderDownloadLink(allOutputs[name].id || "")}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Fragment>
                    )}
                </Box>
            }
        </Card>
    );
}