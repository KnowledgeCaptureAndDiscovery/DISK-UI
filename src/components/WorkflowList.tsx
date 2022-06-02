import { Box, Button, Skeleton, FormHelperText, Card, Typography, Divider, Grid, IconButton } from "@mui/material"
import { Workflow, VariableBinding } from "DISK/interfaces"
import { WorkflowEditor } from "./WorkflowEditor"
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
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

export const WorkflowList = ({editable:editable, workflows: inputWorkflows, metaworkflows: inputMetaworkflows, options:options, onEditStateChange:sendEditChange, onChange:notifyChange} : WorkflowListProps) => {
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

    const toggleEdition = () => {
        if (addingWorkflow && selectedWorkflow) {
            setSelectedWorkflow(undefined);
            setEditingIndex(-1);
            setEditingMeta(false);
        }
        if (sendEditChange) sendEditChange(!addingWorkflow);
        setAddingWorkflow(!addingWorkflow)
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
        //TODO: Add an alert here to confirm.
        setWorkflows((wfs:Workflow[]) => {
            let newWfs : Workflow[] = [ ...wfs ];
            newWfs.splice(index, 1);
            return newWfs;
        });
    };

    return <Box>
        <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:"5px"}}>
            <FormHelperText sx={{fontSize: ".9rem"}}>
                Workflows to run: 
            </FormHelperText>
            {addingWorkflow ? 
                <Button sx={{padding: "3px 6px"}} variant="outlined" onClick={toggleEdition} color="error">
                    <CancelIcon sx={{marginRight: "4px"}}/> Cancel workflow {selectedWorkflow ? "edition" : "creation"}
                </Button>
            :
                <Box>
                    <Button sx={{padding: "3px 6px"}} variant="outlined" onClick={toggleEdition} color="primary">
                        <AddIcon sx={{marginRight: "4px"}}/> Add Workflow
                    </Button>
                    {workflows.length > 0 && false ?
                    <Button sx={{padding: "3px 6px", marginLeft: "6px"}} variant="outlined">
                        <AddIcon sx={{marginRight: "4px"}}/> Add Meta-workflow
                    </Button>
                    : ""}
                </Box>
            }
        </Box> 

        {addingWorkflow ?  <WorkflowEditor workflow={selectedWorkflow} options={options} onSave={onWorkflowSave}></WorkflowEditor> : ""}
        {workflows.length > 0 ? 
            <Box>
                {workflows.filter((wf) => wf.workflow!==selectedWorkflow?.workflow).map((wf:Workflow, i) => 
                    <WorkflowPreview key={`wf_${wf.workflow}-${i}`} workflow={wf} onDelete={editable && !addingWorkflow ? onRemoveWorkflow : undefined}
                        button={editable && !addingWorkflow? 
                        <IconButton sx={{padding: "0 3px"}} onClick={() => {onEditButtonClicked(wf,i)}}>
                            <EditIcon></EditIcon>
                        </IconButton>
                    : undefined}/>
                )}
                {metaWorkflows.length > 0 ? <Box>
                    <FormHelperText sx={{fontSize: ".9rem"}}>
                        Meta-Workflows to run: 
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