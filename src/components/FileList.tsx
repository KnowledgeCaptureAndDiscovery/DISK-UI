import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material"
import { Fragment, useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { LineOfInquiry, RunBinding, TriggeredLineOfInquiry, Workflow, WorkflowRun } from "DISK/interfaces";
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { PrivateLink } from "./PrivateLink";

interface FileListProps {
    type: 'input' | 'output',
    tloi: TriggeredLineOfInquiry | null,
    loi?: LineOfInquiry,
    label: string,
    renderFiles?: boolean,
}

interface RunStatus extends WorkflowRun {
    source: string,
}

export const FileList = ({type:displayType, tloi, loi, label: title, renderFiles} : FileListProps) => {
    const [open, setOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [runs, setRuns] = useState<RunStatus[]>([]);
    
    const getFileMap : (run:RunStatus|WorkflowRun) => {[name:string]: RunBinding} = (run) => {
        if (displayType === 'input') {
            let newInputs : {[name:string]: RunBinding} = {};
            Object.keys(run.inputs || {}).forEach((inName) => {
                let data = run.inputs[inName];
                if (data.datatype == null || !data.datatype.startsWith("http://www.w3.org/2001/XMLSchema#s")) {
                    newInputs[inName] = run.inputs[inName];
                }
            });
            return newInputs;
        }

        if (!loi)
            return (run.outputs ? run.outputs : {})

        let doNoStore : string[] = [];
        [...loi.workflows, ...loi.metaWorkflows].forEach((wf) => {
            wf.bindings.forEach((b) => {
                if (b.binding === '_DO_NO_STORE_')
                    doNoStore.push(b.variable);
            })
        });
        let newOutputs : {[name:string]: RunBinding} = {};
        Object.keys(run.outputs || {}).forEach((outName) => {
            doNoStore.forEach((removeName) => {
                if (!outName.startsWith(removeName)) {
                    newOutputs[outName] = run.outputs[outName];
                }
            });
        });
        return newOutputs;
    }

    // Adds source and all runs
    useEffect(() => {
        if (tloi) {
            let allWfs = [ ...(tloi.workflows ? tloi.workflows : []) , ...(tloi.metaWorkflows ? tloi.metaWorkflows : []) ];
            let allRuns : RunStatus[] = [];
            let i = 0;
            allWfs.forEach((wf:Workflow) => {
                if (wf.runs !== undefined) {
                    Object.values(wf.runs).forEach((run:WorkflowRun) => {
                        let list = getFileMap(run);
                        let length = Object.keys(list).length;
                        if (length > 0) {
                            allRuns.push({
                                ...run,
                                source: wf.source
                            });
                            i += length;
                        }
                    });
                }
            });
            setTotal(i);
            setRuns(allRuns);
        }
    }, [tloi])

    const renderRunTitle = (run:RunStatus) => {
        return run.id.replace(/.*#/,'').replace(/--.*/,'');
    }

    return (
        <Fragment>
            <Button onClick={() => setOpen(true)} sx={{p:0}} disabled={total === 0}>
                {total}
                <FileCopyIcon sx={{color: "gray", ml: "4px"}}/>
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ m: 0, p: '8px 16px'}}>
                    {title}
                    <IconButton aria-label="close" onClick={() => setOpen(false)}
                            sx={{ position: 'absolute', right: 5, top: 5, color: 'grey'}} >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {runs.map((run:RunStatus, i:number) =>
                    <Box key={`table_${i}`} sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <Box sx={{p: '0 10px'}}> <b>Workflow run:</b> {renderRunTitle(run)}</Box>
                        <TableContainer sx={{display: "flex", justifyContent: "center"}}>
                            <Table sx={{width:"unset", border: "1px solid rgb(223 223 223)", borderRadius: "5px", mt:"4px"}}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{padding: "0 10px", textAlign: "end"}}>#</TableCell>
                                        <TableCell sx={{padding: "0 10px"}}>File</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.keys(getFileMap(run)).map((id:string, i:number) => {
                                        let fileMap = getFileMap(run);
                                        let value: RunBinding = fileMap[id];
                                        if (value.id == null)
                                            return null
                                        let filename: string = value.id.replace(/.*#/, '').replace(/SHA[\d\w]{6}_/, '').replace(/-\w{24,25}$/, '');
                                        return <TableRow key={`row_${i}`}>
                                            <TableCell key={`x_${i}`} sx={{padding: "0 10px", textAlign:"end", verticalAlign:"top"}}>
                                                {i+1}
                                            </TableCell>
                                            <TableCell key={`y_${i}`} sx={{padding: "0 10px"}}>
                                                <PrivateLink source={run.source} filename={filename} url={value.id} preview={renderFiles}/>
                                                {/*renderFile(run, id)*/}
                                            </TableCell>
                                        </TableRow>
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => setOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}