import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material"
import { Fragment, useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { Endpoint, Execution, LineOfInquiry, RunBinding, TriggeredLineOfInquiry, VariableBinding, Workflow, WorkflowInstantiation, WorkflowRun } from "DISK/interfaces";
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { PrivateLink } from "./PrivateLink";

interface FileListProps {
    type: 'input' | 'output',
    tloi: TriggeredLineOfInquiry | null,
    label: string,
    renderFiles?: boolean,
}

interface RunStatus extends Execution {
    source: Endpoint,
}

export const FileList = ({type:displayType, tloi, label: title, renderFiles} : FileListProps) => {
    const [open, setOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [runs, setRuns] = useState<RunStatus[]>([]);
    
    const getFileMap : (run:RunStatus|Execution) => Record<string, VariableBinding> = (run) => {
        if (displayType === 'input') {
            return (run.inputs || []).reduce<Record<string, VariableBinding>>((acc, binding) => {
                acc[binding.variable] = binding;
                return acc;
            }, {});
        }

        let doNoStore : string[] = [];

        if (tloi) [...tloi.workflows, ...tloi.metaWorkflows].forEach((wf) => {
            wf.outputs.forEach((b) => {
                if (b.type === 'DROP')
                    doNoStore.push(b.variable);
            })
        });
        return (run.outputs || []).reduce<Record<string, VariableBinding>>((acc, binding) => {
            if (!doNoStore.some(n => n === binding.variable)) {
                acc[binding.variable] = binding;
            }
            return acc;
        }, {});
    }

    // Adds source and all runs
    useEffect(() => {
        if (tloi) {
            let allWfs : WorkflowInstantiation[] = [ ...(tloi.workflows ? tloi.workflows : []) , ...(tloi.metaWorkflows ? tloi.metaWorkflows : []) ];
            let allRuns : RunStatus[] = [];
            let i = 0;
            allWfs.forEach(wf => {
                (wf.executions || []).forEach(run => {
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
            });
            setTotal(i);
            setRuns(allRuns);
        }
    }, [tloi])

    const renderRunTitle = (run:RunStatus) => {
        return run.externalId.replace(/.*#/,'').replace(/--.*/,'');
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
                                        let value: VariableBinding = fileMap[id];
                                        if ((value.binding||[]).length === 0)
                                            return null
                                        let filename: string = value.binding[0].replace(/.*#/, '').replace(/SHA[\d\w]{6}_/, '').replace(/-\w{24,25}$/, '');
                                        return <TableRow key={`row_${i}`}>
                                            <TableCell key={`x_${i}`} sx={{padding: "0 10px", textAlign:"end", verticalAlign:"top"}}>
                                                {i+1}
                                            </TableCell>
                                            <TableCell key={`y_${i}`} sx={{padding: "0 10px"}}>
                                                <PrivateLink source={run.source.url} filename={filename} url={value.binding[0]} preview={renderFiles}/>
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