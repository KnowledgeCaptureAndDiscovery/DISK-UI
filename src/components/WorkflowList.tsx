import { Box, Button, Skeleton, FormHelperText, Card, Typography, Divider, Grid } from "@mui/material"
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
    onWorkflowEditChange?: (state:boolean) => void;
}

export const WorkflowList = ({editable:editable, workflows: inputWorkflows, metaworkflows: inputMetaworkflows, options:options, onWorkflowEditChange:sendEditChange} : WorkflowListProps) => {
    const [addingWorkflow, setAddingWorkflow] = React.useState(false);
    const [workflows, setWorkflows] = React.useState<Workflow[]>([]);
    const [metaWorkflows, setMetaWorkflows] = React.useState<Workflow[]>([]);
    const [selectedWorkflow, setSelectedWorkflow] = React.useState<Workflow>();

    useEffect(() => {
        setWorkflows(inputWorkflows);
    }, [inputWorkflows]);

    useEffect(() => {
        setMetaWorkflows(inputMetaworkflows);
    }, [inputMetaworkflows]);

    const toggleEdition = () => {
        if (addingWorkflow && selectedWorkflow) {
            setSelectedWorkflow(undefined);
        }
        if (sendEditChange) sendEditChange(!addingWorkflow);
        setAddingWorkflow(!addingWorkflow)
    };

    const onEditButtonClicked = (wf:Workflow) => {
        setSelectedWorkflow(wf);
        setAddingWorkflow(true);
    }

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

        {addingWorkflow ?  <WorkflowEditor workflow={selectedWorkflow} options={options}></WorkflowEditor> : ""}
        {workflows.length > 0 ? 
            <Box>
                {workflows.filter((wf) => wf.workflow!==selectedWorkflow?.workflow).map((wf:Workflow) => 
                    <WorkflowPreview key={`wf_${wf.workflow}`} workflow={wf} button={editable && !addingWorkflow? 
                        <Button variant="text" sx={{padding: 0, margin: "0 4px"}} onClick={() => {onEditButtonClicked(wf)}}>
                            <EditIcon sx={{marginRight: "4px"}}></EditIcon> EDIT
                        </Button>
                    : undefined}/>
                )}
                {metaWorkflows.length > 0 ? <Box>
                    <FormHelperText sx={{fontSize: ".9rem"}}>
                        Meta-Workflows to run: 
                    </FormHelperText>
                    {workflows.filter((wf) => wf.workflow!==selectedWorkflow?.workflow).map((wf:Workflow) => 
                        <WorkflowPreview key={`mwf_${wf.workflow}`} workflow={wf} button={editable && !addingWorkflow ? 
                            <Button variant="text" sx={{padding: 0, margin: "0 4px"}} onClick={() => {onEditButtonClicked(wf)}}>
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