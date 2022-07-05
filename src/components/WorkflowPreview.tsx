import { Box, Card, Typography, Divider, Grid, IconButton, Tooltip } from "@mui/material"
import { Workflow, VariableBinding } from "DISK/interfaces"
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteIcon from '@mui/icons-material/Delete';


interface WorkflowPreviewProps {
    workflow: Workflow,
    button?: JSX.Element,
    onDelete?: (wf:Workflow) => void
}

export const WorkflowPreview = ({workflow:wf, button:externalButton, onDelete} : WorkflowPreviewProps) => {
    return (
        <Card key={`wf_${wf.workflow}`} variant="outlined" sx={{mb: "5px"}}>
            <Box sx={{display: "flex", justifyContent: "space-between"}}>
                <a target="_blank" rel="noreferrer" href={wf.workflowLink} style={{display: "inline-flex", alignItems: "center", textDecoration: "none", color: "black"}}>
                    <DisplaySettingsIcon sx={{ marginLeft: "10px" , color: "darkgreen"}} />
                    <Typography sx={{padding:"0 10px", fontWeight: 500}}>{wf.workflow}</Typography>
                    <OpenInNewIcon sx={{fontSize: "1rem"}}/>
                </a>
                <Box>
                    {externalButton ? externalButton : ""}
                    {onDelete ? 
                    <Tooltip arrow title="Delete">
                        <IconButton onClick={() => onDelete(wf)} sx={{padding: "0 3px"}}><DeleteIcon/></IconButton>
                    </Tooltip> : ""}
                </Box>
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
    );
}