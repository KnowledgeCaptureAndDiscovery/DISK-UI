import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material"
import { Fragment, useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { Endpoint, Execution, TriggeredLineOfInquiry, VariableBinding, WorkflowInstantiation } from "DISK/interfaces";
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { PrivateLink } from "./PrivateLink";

interface FileListProps {
    type: 'input' | 'output',
    tloi: TriggeredLineOfInquiry | null,
    label: string,
    renderFiles?: boolean,
}

export interface DefinitionAndFile {
    def: VariableBinding | undefined,
    file: VariableBinding
}

export const FileList = ({type:displayType, tloi, label: title, renderFiles} : FileListProps) => {
    const [open, setOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [runs, setRuns] = useState<Execution[]>([]);
    const [files, setFiles] = useState<Record<string, DefinitionAndFile[]>>({});

    useEffect(() => {
        let allRuns : Execution[] = [];
        let map : Record<string, DefinitionAndFile[]> = {};
        let count = 0;
        if (tloi) {
            let allWfs : WorkflowInstantiation[] = [ ...(tloi.workflows ? tloi.workflows : []) , ...(tloi.metaWorkflows ? tloi.metaWorkflows : []) ];
            allWfs.forEach(wf => {
                let varDefinitions = displayType === 'input' ? wf.dataBindings : wf.outputs;
                let doNotStore : string[] = [];
                varDefinitions.forEach((b) => {
                    if (b.type === 'DROP')
                        doNotStore.push(b.variable);
                });

                (wf.executions || []).forEach(run => {
                    let list = displayType === 'input' ?
                            (run.inputs || []).filter(input => input.type === 'DISK_DATA')
                            : (run.outputs || []).filter(binding => !doNotStore.some(n => n === binding.variable));

                    let list2 = list.map<DefinitionAndFile>((file) => {
                        let definition = displayType == 'input' ?
                            wf.dataBindings.find(d => file.variable.startsWith(d.variable.substring(1)))
                            : (run.result && run.result.extras ? run.result.extras : wf.outputs).find(d => file.variable.startsWith(d.variable));
                        
                        return {
                            def: definition,
                            file: file
                        }
                    });

                    if (list.length >0) {
                        allRuns.push(run);
                        map[run.externalId] = list2;
                        list.forEach(vb => count+=vb.binding.length);
                    }
                });
            });
        }
        setTotal(count);
        setFiles(map);
        setRuns(allRuns);
    }, [displayType, tloi])


    const renderRunTitle = (run:Execution) => {
        return run.externalId.replace(/.*#/,'').replace(/--.*/,'');
    }

    const getFilename = (val:string) => {
        return val.replace(/.*#/, '').replace(/SHA[\d\w]{6}_/, '').replace(/-\w{24,25}$/, '');
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
                    {runs.map((run:Execution, i:number) =>
                    <Box key={`table_${i}`} sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <TableContainer sx={{display: "flex", justifyContent: "center"}}>
                            <Table sx={{width:"unset", border: "1px solid rgb(223 223 223)", borderRadius: "5px", mt:"4px"}}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{padding: "0 10px"}} colSpan={2}>
                                                <b>Workflow run:</b> {renderRunTitle(run)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{padding: "0 10px", textAlign: "end"}}>{displayType==='input' ? 'Input' : 'Output'}</TableCell>
                                        <TableCell sx={{padding: "0 10px"}}>File</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {files[run.externalId].map(({def, file}) => 
                                        (file.binding||[]).map((v,i) => 
                                        <TableRow key={`row_${i}`}>
                                            <TableCell key={`x_${i}`} sx={{padding: "0 10px", textAlign:"end", verticalAlign:"top"}}>
                                                {file.variable} {file.isArray ? i+1 : ""}
                                            </TableCell>
                                            <TableCell key={`y_${i}`} sx={{padding: "0 10px"}}>
                                                <PrivateLink filename={getFilename(v)} url={file.binding[i]} preview={renderFiles} value={def?.binding[i]}/>
                                                {/*renderFile(run, id)*/}
                                            </TableCell>
                                        </TableRow>)
                                    )}
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