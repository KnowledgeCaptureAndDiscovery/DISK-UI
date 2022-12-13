import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Link as MuiLink, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material"
import { Fragment, useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { TriggeredLineOfInquiry, Workflow, WorkflowRun } from "DISK/interfaces";
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { PrivateLink } from "./PrivateLink";

interface FileListProps {
    type: 'input' | 'output',
    tloi: TriggeredLineOfInquiry | null,
    label: string,
}

interface RunStatus extends WorkflowRun {
    source: string,
}

export const FileList = ({type:displayType, tloi, label: title} : FileListProps) => {
    const [open, setOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [runs, setRuns] = useState<RunStatus[]>([]);

    const getFileMap : (run:RunStatus|WorkflowRun) => {[name:string]: string} = (run) => {
        return (displayType === 'input') ? (run.files ? run.files : {}) : (run.outputs ? run.outputs : {})
    }

    useEffect(() => {
        if (tloi) {
            let allWfs = [ ...(tloi.workflows ? tloi.workflows : []) , ...(tloi.metaWorkflows ? tloi.metaWorkflows : []) ];
            let allRuns : RunStatus[] = [];
            let i = 0;
            allWfs.forEach((wf:Workflow) => {
                if (wf && wf.run && wf.run.id) {
                    let list = getFileMap(wf.run);
                    let length = Object.keys(list).length;
                    if (length > 0) {
                        allRuns.push({
                            ...wf.run,
                            source: wf.source
                        });
                        i += length;
                    }
                }
            });
            setTotal(i);
            setRuns(allRuns);
        }
    }, [tloi])

    const renderRunTitle = (id:string) => {
        return id.replace(/.*#/,'').replace(/--.*/,'');
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
                                    {Object.keys(getFileMap(run)).map((id:string, i:number) => {
                                        let fileMap = getFileMap(run);
                                        let url: string = fileMap[id];
                                        let filename: string = url.replace(/.*#/, '').replace(/SHA[\d\w]{6}_/, '').replace(/-\w{24,25}$/, '');
                                        return <TableRow key={i}>
                                            <TableCell key={`x_${i}`} sx={{padding: "0 10px", textAlign:"end"}}>
                                                {i+1}
                                            </TableCell>
                                            <TableCell key={`y_${i}`} sx={{padding: "0 10px"}}>
                                                <PrivateLink source={run.source} filename={filename} url={url}/>
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