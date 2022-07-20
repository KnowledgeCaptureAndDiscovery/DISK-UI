import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Link as MuiLink, MenuItem, Select, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip} from "@mui/material"
import { Fragment, useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import CodeMirror from '@uiw/react-codemirror';
import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import { StreamLanguage } from '@codemirror/language';
import { DISKAPI } from "DISK/API";
import { useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { DataEndpoint, TriggeredLineOfInquiry, VariableBinding, Workflow, WorkflowRun } from "DISK/interfaces";
import EditIcon from '@mui/icons-material/Edit';
import PlayIcon from '@mui/icons-material/PlayArrow';
import { downloadFile, getBindingAsArray } from "DISK/util";

interface FileListProps {
    tloi: TriggeredLineOfInquiry | null,
    label: string,
    onSave?: (tloi:TriggeredLineOfInquiry) => void,
}

export const TLOIEdit = ({tloi, label: title, onSave} : FileListProps) => {
    const [open, setOpen] = useState(false);
    const [selectedBindings, setSelectedBindings] = useState<{[id:string]: boolean}>({});
    const [editableWfs, setEditableWfs] = useState<Workflow[]>([]);
    const [arraySizes, setArraySizes] = useState<number[]>([]);
    const [meta, setMeta] = useState<boolean>(false);

    const runAnalysis = () => {
        if (tloi) {
            let newTLOI : TriggeredLineOfInquiry = { 
                ...tloi,
                id: "",
                confidenceValue: 0,
                dateCreated: "",
                inputFiles: [],
                outputFiles: [],
                workflows: meta ? cleanWorkflows(tloi.workflows) : getEditedWorkflows(),
                metaWorkflows: meta ? getEditedWorkflows() : cleanWorkflows(tloi.metaWorkflows),
            };

            if (onSave)
                onSave(newTLOI);
            setOpen(false);
        }
    }

    const getEditedWorkflows = () => {
        let wfs : Workflow[] = [];
        editableWfs.forEach((wf:Workflow) => {
            wfs.push({
                ...wf,
                bindings: wf.bindings
                    .map((vb:VariableBinding) => {
                        return !vb.collection ? vb : {
                            ...vb,
                            binding: getSelectedBindings(vb.binding, wf.source),
                        }
                    }),
                meta: undefined,
                run: undefined,
            } as Workflow);
        });
        return wfs;
    }

    const cleanWorkflows = (wfs:Workflow[]) => {
        return wfs.map((wf:Workflow) => {
            return {
                ...wf,
                meta: undefined,
                run: undefined,
            };
        })
    }

    const getSelectedBindings = (bindings:string, source:string) => {
        let arr : string [] = getBindingAsArray(bindings);
        return "[" + arr.filter((_,i) => selectedBindings[source + "+" + i]).join(", ") + "]";
    }

    useEffect(() => {
        if (tloi) {
            let meta:boolean = (tloi.workflows && tloi.workflows.length === 0 && tloi.metaWorkflows && tloi.metaWorkflows.length > 0);
            if (!meta && (!tloi.workflows || tloi.workflows.length === 0)) {
                // No workflows to edit.
                return;
            }
            let wfs = meta ? tloi.metaWorkflows : tloi.workflows;
            let newSizes : number[] = [];
            setMeta(meta);
            setEditableWfs(wfs);

            wfs.forEach((wf:Workflow) => {
                let size : number = 0;
                wf.bindings.forEach((vb:VariableBinding) => {
                    let c : number = vb.collection ? vb.binding.split(', ').length : 1;
                    if (size < c) size = c;
                });
                newSizes.push(size);

                setSelectedBindings((curBindings:{[id:string]: boolean}) => {
                    for (let i = 0; i < size; i++)
                        curBindings[wf.source+"+"+i] = true;
                    return { ...curBindings};
                });
            });
            setArraySizes(newSizes);
        }
    }, [tloi])

    const renderName = (text:string) => {
        return text.replace(/.*#/, '').replace(/SHA[\d\w]{6}_/,'').replace(/-\w{24,25}/,'');
    }

    const renderRunTitle = (id:string) => {
        return id.replace(/.*#/,'').replace(/--.*/,'');
    }

    const getValueFromBinding = (binding: string, j: number) => {
        let arr = getBindingAsArray(binding);
        return (arr.length > j) ? arr[j] : arr[0];
    }

    return (
        <Fragment>
            <Tooltip arrow placement="top" title="Create new run editing this one">
                <IconButton onClick={() => setOpen(true)} sx={{p:0}} disabled={editableWfs.length === 0}>
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
                    {editableWfs.map((wf:Workflow, i:number) =>
                    <Box key={`table_${i}`} sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <Box sx={{p: '0 10px'}}> <b>Editing workflow:</b> {renderRunTitle(wf.run ? wf.run.id : wf.workflow)}</Box>
                        <TableContainer sx={{display: "flex", justifyContent: "center"}}>
                            <Table sx={{width:"unset", border: "1px solid rgb(223 223 223)", borderRadius: "5px", mt:"4px"}}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{padding: "0 10px", textAlign: "end"}}>#</TableCell>
                                        {wf.bindings.map((b:VariableBinding) => 
                                        <TableCell sx={{padding: "0 10px"}} key={`title${b.variable}`}>
                                            {b.variable}
                                        </TableCell>)}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Array(arraySizes[i]).fill(0).map((_,j) => 
                                        <TableRow key={`row_${j}`}>
                                            <TableCell sx={{padding: "0 10px", textAlign:"end"}}>
                                                <FormControlLabel label={j+1} labelPlacement="start" control={
                                                    <Checkbox size="small" sx={{p:0, pr: '5px'}} checked={selectedBindings[wf.source + "+" + j]} onChange={(ev) =>  
                                                        setSelectedBindings((curBinding:{[id:string]: boolean}) => {
                                                            curBinding[wf.source + "+" + j] = ev.target.checked;
                                                            return { ...curBinding };
                                                        })
                                                    }/>
                                                }/>
                                            </TableCell>
                                            {wf.bindings.map((b:VariableBinding) =>
                                            <TableCell sx={{padding: "0 10px"}} key={`cell_${b.variable}_${j}`}>
                                                {renderName(b.collection ? getValueFromBinding(b.binding, j) : b.binding)}
                                            </TableCell>)}
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
                    <Button onClick={runAnalysis} color="success" disabled={!Object.values(selectedBindings).some(b => !b)}>
                        <PlayIcon sx={{mr:'5px'}}/>
                        Run analysis
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}