import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Link as MuiLink, MenuItem, Select, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip} from "@mui/material"
import { Fragment, useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import CodeMirror from '@uiw/react-codemirror';
import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import { StreamLanguage } from '@codemirror/language';
import { DISKAPI } from "DISK/API";
import { useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { DataEndpoint, TriggeredLineOfInquiry, Workflow, WorkflowRun } from "DISK/interfaces";
import EditIcon from '@mui/icons-material/Edit';
import { downloadFile } from "DISK/util";

interface FileListProps {
    tloi: TriggeredLineOfInquiry | null,
    label: string,
}

interface RunStatus extends WorkflowRun {
    source: string,
}

export const TLOIEdit = ({tloi, label: title} : FileListProps) => {
    const [open, setOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [runs, setRuns] = useState<RunStatus[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<{[id:string]: boolean}>({});

    const runAnalysis = () => {
        if (tloi) {
            let wfs : Workflow[] = [];
            let mtWfs : Workflow[] = []

            let newTLOI : TriggeredLineOfInquiry = { 
                ...tloi,
                id: "",
                confidenceValue: 0,
                dateCreated: "",
                inputFiles: [],
                outputFiles: [],
            };

            console.log("run ", newTLOI);
        }
    }

    useEffect(() => {
        if (tloi) {
            let allWfs = tloi.workflows && tloi.workflows.length > 0 ? tloi.workflows : tloi.metaWorkflows;
            let allRuns : RunStatus[] = [];
            let i = 0;
            allWfs.forEach((wf:Workflow) => {
                if (wf && wf.run && wf.run.id) {
                    let ids : string[] = Object.keys(wf.run.files);
                    let length = ids.length;
                    if (length > 0) {
                        allRuns.push({
                            ...wf.run,
                            source: wf.source
                        });
                        i += length;

                        setSelectedFiles((curFiles:{[id:string]: boolean}) => {
                            ids.forEach((id:string) => curFiles[wf.source+"+"+id] = true)
                            return { ...curFiles};
                        });
                    }
                }
            });
            setTotal(i);
            setRuns(allRuns);
        }
    }, [tloi])

    const renderFile = (run:RunStatus, id:string) => {
        let url : string = run.files[id];
        return url.replace(/.*#/, '').replace(/SHA[\d\w]{6}_/,'').replace(/-\w{24,25}/,'');
    }

    const renderRunTitle = (id:string) => {
        return id.replace(/.*#/,'').replace(/--.*/,'');
    }

    return (
        <Fragment>
            <Tooltip arrow placement="top" title="Create new run editing this one">
                <IconButton onClick={() => setOpen(true)} sx={{p:0}} disabled={total === 0}>
                    <EditIcon sx={{color: "gray"}}/>
                </IconButton>
            </Tooltip>
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
                        <Box sx={{p: '0 10px'}}> <b>Workflow run:</b> {renderRunTitle(run.id)}</Box>
                        <TableContainer sx={{display: "flex", justifyContent: "center"}}>
                            <Table sx={{width:"unset", border: "1px solid rgb(223 223 223)", borderRadius: "5px", mt:"4px"}}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{padding: "0 10px", textAlign: "end"}}>#</TableCell>
                                        <TableCell sx={{padding: "0 10px"}}>File</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.keys(run.files).map((id:string, i:number) => 
                                        <TableRow key={i}>
                                            <TableCell key={`x_${i}`} sx={{padding: "0 10px", textAlign:"end"}}>
                                                {i+1}
                                            </TableCell>
                                            <TableCell key={`y_${i}`} sx={{padding: "0 10px"}}>
                                                <FormControlLabel label={renderFile(run, id)} control={
                                                    <Checkbox size="small" sx={{p:0, pr: '5px'}} checked={selectedFiles[run.source + "+" + id]} onChange={(ev) =>  
                                                        setSelectedFiles((curFiles:{[id:string]: boolean}) => {
                                                            curFiles[run.source + "+" + id] = ev.target.checked;
                                                            return { ...curFiles };
                                                        })
                                                    }/>
                                                }/>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => setOpen(false)} color="error">
                        Cancel
                    </Button>
                    <Button onClick={runAnalysis} color="success">
                        Run analysis
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}