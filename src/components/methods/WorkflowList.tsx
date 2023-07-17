import { Box, Button, FormHelperText, Card, Typography, IconButton, Tooltip } from "@mui/material"
import { VariableBinding, Workflow } from "DISK/interfaces"
import { WorkflowEditor } from "./WorkflowEditor"
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import React, { useEffect } from "react";
import { WorkflowPreview } from "./WorkflowPreview";

interface WorkflowListProps {
    editable: boolean,
    minimal?: boolean,
    workflows: Workflow[],
    metaworkflows: Workflow[],
    options: string[],
    onEditStateChange?: (state:boolean) => void;
    onChange?: (workflows:Workflow[], metaWorkflows:Workflow[]) => void;
}

export const WorkflowList = ({editable, workflows: inputWorkflows, metaworkflows: inputMetaworkflows, options, onEditStateChange:sendEditChange, onChange:notifyChange, minimal=false} : WorkflowListProps) => {
    const [addingWorkflow, setAddingWorkflow] = React.useState(false);
    const [workflows, setWorkflows] = React.useState<Workflow[]>([]);
    const [metaWorkflows, setMetaWorkflows] = React.useState<Workflow[]>([]);
    const [selectedWorkflow, setSelectedWorkflow] = React.useState<Workflow>();

    const [editingIndex, setEditingIndex] = React.useState<number>(-1);
    const [editingMeta, setEditingMeta] = React.useState<boolean>(false);

    useEffect(() => {
        setWorkflows(inputWorkflows);
    }, [inputWorkflows]);

    useEffect(() => {
        setMetaWorkflows(inputMetaworkflows);
    }, [inputMetaworkflows]);

    const toggleEdition = (meta:boolean=false) => {
        if (addingWorkflow && selectedWorkflow) {
            setSelectedWorkflow(undefined);
            setEditingIndex(-1);
            setEditingMeta(false);
        }
        if (sendEditChange) sendEditChange(!addingWorkflow);
        setAddingWorkflow(!addingWorkflow)
        setEditingMeta(meta);
    };

    const onEditButtonClicked = (wf:Workflow, index:number, isMeta:boolean=false) => {
        setSelectedWorkflow(wf);
        setAddingWorkflow(true);
        setEditingIndex(index);
        setEditingMeta(isMeta);
    }

    const onWorkflowSave = (wf:Workflow) => {
        //FIXME: This is a hack, there are no way to send multiple strings as a list
        // so we transform demographic_value into a list here.
        wf.bindings = wf.bindings.map((vb:VariableBinding) => {
            let curBinding = vb.binding;
            if (vb.variable === 'demographic_value') {
                if (!curBinding.startsWith("[")) curBinding = '[' + curBinding;
                if (!curBinding.endsWith("]")) curBinding += "]";
            }
            return {
                variable: vb.variable,
                binding: curBinding,
                collection: vb.collection,
                type: vb.type,
            } as VariableBinding;
        });
        //-----

        if (notifyChange) {
            let curWfs : Workflow[] = [ ...(editingMeta ? metaWorkflows : workflows) ];
            if (selectedWorkflow) curWfs[editingIndex] = wf; //Editing
            else curWfs.push(wf); //NEW
            notifyChange(editingMeta ? workflows : curWfs, editingMeta ? curWfs : metaWorkflows);
        } else {
            (editingMeta ? setMetaWorkflows : setWorkflows)((currentWorkflows) => {
                let newWfs = [ ...currentWorkflows ];
                if (selectedWorkflow) newWfs[editingIndex] = wf; //Editing
                else newWfs.push(wf); //New
                return newWfs;
            });
        }
        toggleEdition();
    }

    const onRemoveWorkflow = (wf:Workflow, meta:boolean=false) => {
        let index : number = (meta?metaWorkflows:workflows).indexOf(wf);
        //TODO: Add an alert here to confirm. ?
        if (notifyChange) {
            let curWfs : Workflow[] = [ ...(meta ? metaWorkflows : workflows) ];
            curWfs.splice(index, 1);
            notifyChange(meta ? workflows : curWfs, meta ? curWfs : metaWorkflows);
        } else {
            (meta ? setMetaWorkflows : setWorkflows)((currentWorkflows) => {
                let newWfs = [ ...currentWorkflows ];
                newWfs.splice(index, 1);
                return newWfs;
            });
        }
    };

    return <Box>
        {!minimal && (
        <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"start", mb:"5px"}}>
            <Box>
                <Typography sx={{fontWeight: "500"}}>Workflows:</Typography>
                <FormHelperText sx={{fontSize: ".9rem"}}>
                    {addingWorkflow ? 
                    "Creating " + (editingMeta ? "meta-" : "") + "workflow:"
                    :
                    "The data analysis methods are represented in the following workflows:"}
                </FormHelperText>
            </Box>
            {editable ? 
                (addingWorkflow ? 
                    <Button sx={{padding: "3px 6px"}} variant="outlined" onClick={() => toggleEdition()} color="error">
                        <CancelIcon sx={{marginRight: "4px"}}/> Cancel {editingMeta? "meta-":""}workflow {selectedWorkflow ? "edition" : "creation"}
                    </Button>
                :
                    <Box>
                        <Button sx={{padding: "3px 6px"}} variant="outlined" onClick={() => toggleEdition()} color="primary">
                            <AddIcon sx={{marginRight: "4px"}}/> Add Workflow
                        </Button>
                        <Button sx={{padding: "3px 6px", marginLeft: "6px"}} variant="outlined" onClick={() => toggleEdition(true)} color="primary">
                            <AddIcon sx={{marginRight: "4px"}}/> Add Meta-workflow
                        </Button>
                    </Box>
                )
            :
                null
            }
        </Box> 
        )}

        {addingWorkflow ?  <WorkflowEditor workflow={selectedWorkflow} options={options} onSave={onWorkflowSave}></WorkflowEditor> : ""}
        {workflows.length > 0 ? 
            <Box>
                {workflows.filter((wf) => wf.workflow!==selectedWorkflow?.workflow).map((wf:Workflow, i) => 
                    <WorkflowPreview key={`wf_${wf.workflow}-${i}`} workflow={wf} onDelete={editable && !addingWorkflow ? onRemoveWorkflow : undefined}
                         button={editable && !addingWorkflow? 
                        <Tooltip arrow title="Edit">
                            <IconButton sx={{padding: "0 3px"}} onClick={() => {onEditButtonClicked(wf,i)}}>
                                <EditIcon></EditIcon>
                            </IconButton>
                        </Tooltip>
                    : undefined}/>
                )}
            </Box>
        :   (!addingWorkflow && !minimal && (
                <Card variant="outlined" sx={{display: "flex", alignItems: "center", justifyContent: "center", padding: "10px"}}>
                    <Typography>
                        No workflows specified.
                        {metaWorkflows.length > 0 && ("The data retrieved will be used directly in the meta-workflows")}
                    </Typography>
                </Card>
            ))
        }
        {!addingWorkflow && !minimal && (
            <Box>
                <Typography sx={{fontWeight: "500"}}>Meta workflows:</Typography>
                <FormHelperText sx={{fontSize: ".9rem"}}>
                    The results of all the data analysis methods are aggregated by these meta-methods, represented in the following meta-workflows:
                </FormHelperText> 
            </Box>
        )}

        {metaWorkflows.length > 0 ? <Box>
            {metaWorkflows.filter((wf) => wf.workflow!==selectedWorkflow?.workflow).map((wf:Workflow, i) => 
                <WorkflowPreview key={`mwf_${wf.workflow}${i}`} workflow={wf} onDelete={editable && !addingWorkflow ? (wf) => onRemoveWorkflow(wf,true) : undefined}
                    button={editable && !addingWorkflow ? 
                    <Tooltip arrow title="Edit">
                        <IconButton sx={{padding: '0 3px'}} onClick={() => {onEditButtonClicked(wf,i,true)}}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                : undefined}/>
            )}
        </Box> 
        :   (!addingWorkflow && !minimal && (
                <Card variant="outlined" sx={{display: "flex", alignItems: "center", justifyContent: "center", padding: "10px"}}>
                    <Typography>
                        No meta-workflows specified
                    </Typography>
                </Card>
            ))
        }
    </Box>
}