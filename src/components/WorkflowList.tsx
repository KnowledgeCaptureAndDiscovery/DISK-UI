import { Box, Button, FormHelperText, Card, Typography, IconButton, Tooltip } from "@mui/material"
import { Workflow } from "DISK/interfaces"
import { WorkflowEditor } from "./WorkflowEditor"
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import React, { useEffect } from "react";
import { WorkflowPreview } from "./WorkflowPreview";

interface WorkflowListProps {
    editable: boolean,
    workflows: Workflow[],
    metaworkflows: Workflow[],
    options: string[],
    onEditStateChange?: (state:boolean) => void;
    onChange?: (workflows:Workflow[], metaWorkflows:Workflow[]) => void;
}

export const WorkflowList = ({editable, workflows: inputWorkflows, metaworkflows: inputMetaworkflows, options, onEditStateChange:sendEditChange, onChange:notifyChange} : WorkflowListProps) => {
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
        <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:"5px"}}>
            <FormHelperText sx={{fontSize: ".9rem"}}>
                The data analysis methods are represented in the following workflows:
            </FormHelperText>
            {editable ? 
                (addingWorkflow ? 
                    <Button sx={{padding: "3px 6px"}} variant="outlined" onClick={() => toggleEdition()} color="error">
                        <CancelIcon sx={{marginRight: "4px"}}/> Cancel workflow {selectedWorkflow ? "edition" : "creation"}
                    </Button>
                :
                    <Box>
                        <Button sx={{padding: "3px 6px"}} variant="outlined" onClick={() => toggleEdition()} color="primary">
                            <AddIcon sx={{marginRight: "4px"}}/> Add Workflow
                        </Button>
                        {workflows.length > 0 ?
                        <Button sx={{padding: "3px 6px", marginLeft: "6px"}} variant="outlined" onClick={() => toggleEdition(true)} color="primary">
                            <AddIcon sx={{marginRight: "4px"}}/> Add Meta-workflow
                        </Button>
                        : null}
                    </Box>
                )
            :
                null
            }
        </Box> 

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
                {metaWorkflows.length > 0 ? <Box>
                    <FormHelperText sx={{fontSize: ".9rem"}}>
                        The results of all the data analysis methods are aggregated by these meta-methods, represented in the following meta-workflows:
                    </FormHelperText>
                    {metaWorkflows.filter((wf) => wf.workflow!==selectedWorkflow?.workflow).map((wf:Workflow, i) => 
                        <WorkflowPreview key={`mwf_${wf.workflow}${i}`} workflow={wf} button={editable && !addingWorkflow ? 
                            <Button variant="text" sx={{padding: 0, margin: "0 4px"}} onClick={() => {onEditButtonClicked(wf,i,true)}}>
                                <EditIcon sx={{marginRight: "4px"}}></EditIcon> EDIT
                            </Button>
                        : undefined}/>
                    )}
                </Box> : ""}
            </Box>
        :   (addingWorkflow ? 
                "" 
            :
                <Card variant="outlined" sx={{display: "flex", alignItems: "center", justifyContent: "center", padding: "10px"}}>
                    <Typography>
                        No workflows to run
                    </Typography>
                </Card>
            )
        }
    </Box>
}