import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Link as MuiLink, MenuItem, Select, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip} from "@mui/material"
import { Fragment, useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch, useAuthenticated } from "redux/hooks";
import { TriggeredLineOfInquiry, VariableBinding, Workflow } from "DISK/interfaces";
import EditIcon from '@mui/icons-material/Edit';
import PlayIcon from '@mui/icons-material/PlayArrow';
import { cleanTLOI, getBindingAsArray } from "DISK/util";
import { openBackdrop, closeBackdrop } from "redux/slices/backdrop";
import { openNotification } from "redux/slices/notifications";
import { usePostTLOIMutation } from "redux/apis/tlois";

interface FileListProps {
    tloi: TriggeredLineOfInquiry | null,
    label: string,
}

export const TLOIEditButton = ({tloi, label: title} : FileListProps) => {
    const dispatch = useAppDispatch();
    const authenticated = useAuthenticated();
    const [open, setOpen] = useState(false);
    const [selectedBindings, setSelectedBindings] = useState<{[id:string]: boolean}>({});
    const [editableWfs, setEditableWfs] = useState<Workflow[]>([]);
    const [arraySizes, setArraySizes] = useState<number[]>([]);
    const [meta, setMeta] = useState<boolean>(false);
    const [postTLOI, {}] = usePostTLOIMutation();

    const runAnalysis = () => {
        if (tloi) {
            let newTLOI : TriggeredLineOfInquiry = { 
                ...tloi,
                id: "",
                confidenceValue: 0,
                dateCreated: "",
                workflows: meta ? cleanWorkflows(tloi.workflows) : getEditedWorkflows(),
                metaWorkflows: meta ? getEditedWorkflows() : cleanWorkflows(tloi.metaWorkflows),
            };

            dispatch(openBackdrop());
            dispatch(openNotification({
                severity: 'info',
                text: "Sending new execution..."
            }));
            postTLOI({ data: cleanTLOI(newTLOI) })
                .then((data: { data: TriggeredLineOfInquiry } | { error: any }) => {
                    let savedTLOI = (data as { data: TriggeredLineOfInquiry }).data;
                    if (savedTLOI) {
                        console.log("TLOI Created:", savedTLOI);
                        dispatch(openNotification({
                            severity: 'success',
                            text: "1 new execution found"
                        }));
                    }
                })
                .finally(() => {
                    dispatch(closeBackdrop());
                });
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
                runs: undefined,
            });
        });
        return wfs;
    }

    const cleanWorkflows : (wfs:Workflow[]) => Workflow[] = (wfs:Workflow[]) => {
        return wfs.map((wf:Workflow) => {
            let newWf : Workflow = { ...wf };
            newWf.meta = undefined;
            newWf.runs = undefined;
            return newWf;
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
            <Tooltip arrow placement="top" title={authenticated ?
                "Create new run editing this one" : "You must be log in to edit this run"}>
                <span>
                    <IconButton onClick={() => setOpen(true)} sx={{ p: 0 }} disabled={editableWfs.length === 0 || !authenticated}>
                        <EditIcon />
                    </IconButton>
                </span>
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
                        <Box sx={{p: '0 10px'}}> <b>Editing workflow:</b> {renderRunTitle(wf.runs && Object.keys(wf.runs)[0] ? Object.keys(wf.runs)[0] : wf.workflow)}</Box>
                        <TableContainer sx={{display: "flex", justifyContent: "center"}}>
                            <Table sx={{width:"unset", border: "1px solid rgb(223 223 223)", borderRadius: "5px", mt:"4px"}}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{padding: "0 10px", textAlign: "end"}}>#</TableCell>
                                        {wf.bindings.filter(b => !b.binding.startsWith("_")).map((b:VariableBinding) => 
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
                                            {wf.bindings.filter(b => !b.binding.startsWith("_")).map((b:VariableBinding) =>
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