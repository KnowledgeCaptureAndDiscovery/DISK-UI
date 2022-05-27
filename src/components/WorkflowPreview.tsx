import { Box, Button, Skeleton, FormHelperText, Card, Typography, Divider, Grid } from "@mui/material"
import { Workflow, VariableBinding } from "DISK/interfaces"
import { WorkflowEditor } from "./WorkflowEditor"
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import React from "react";

interface WorkflowPreviewProps {
    workflow: Workflow,
    button?: JSX.Element,
}

export const WorkflowPreview = ({workflow:wf, button:externalButton} : WorkflowPreviewProps) => {
    return <Box>
        <Card key={`wf_${wf.workflow}`} variant="outlined">
            <Box sx={{display: "flex", justifyContent: "space-between"}}>
                <a target="_blank" rel="noreferrer" href={wf.workflowLink} style={{display: "inline-flex", alignItems: "center", textDecoration: "none", color: "black"}}>
                    <DisplaySettingsIcon sx={{ marginLeft: "10px" , color: "darkgreen"}} />
                    <Typography sx={{padding:"0 10px", fontWeight: 500}}>{wf.workflow}</Typography>
                    <OpenInNewIcon sx={{fontSize: "1rem"}}/>
                </a>
                {externalButton ? externalButton : ""}
            </Box>
            <Divider/>
            <Box sx={{fontSize:".85rem"}}>
                { wf.bindings.map((binding:VariableBinding) =>
                    <Grid key={`var_${binding.variable}`} container spacing={1}>
                        <Grid item xs={3} md={2} sx={{textAlign: "right"}}>
                            <b>{binding.variable}: </b>
                        </Grid>
                        <Grid item xs={9} md={10}>
                            {binding.binding}
                        </Grid>
                    </Grid>
                )}
            </Box>
        </Card>
    </Box>
}