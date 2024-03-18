import { Box, Typography, FormHelperText, IconButton, Card } from "@mui/material"
import { WorkflowInstantiation, WorkflowSeed } from "DISK/interfaces"
import { Tooltip } from "leaflet"
import { WorkflowSeedPreview } from "./WorkflowSeedPreview"
import { WorkflowInstantiationPreview } from "./WorkflowInstantiationPreview"

interface WorkflowInstantiationListProps {
    workflows: WorkflowInstantiation[],
    metaWorkflows: WorkflowInstantiation[]
}

export const WorkflowInstantiationList = ({workflows, metaWorkflows}:WorkflowInstantiationListProps) => {
    return <Box>
        <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"start", mb:"5px"}}>
            <Box>
                <Typography sx={{fontWeight: "500"}}>Workflows:</Typography>
                <FormHelperText sx={{fontSize: ".9rem"}}>
                    The data analysis methods are represented in the following workflows:
                </FormHelperText>
            </Box>
        </Box> 

        {workflows.length > 0 ?
            <Box>
                {workflows.map((wf, i) =>
                    <WorkflowInstantiationPreview key={`wf_${wf.link}-${i}`} workflow={wf} />
                )}
            </Box>
            :
            <Card variant="outlined" sx={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px" }}>
                <Typography> No workflows specified. </Typography>
            </Card>
        }

        <Box>
            <Typography sx={{ fontWeight: "500" }}>Meta workflows:</Typography>
            <FormHelperText sx={{ fontSize: ".9rem" }}>
                The results of all the data analysis methods are aggregated by these meta-methods, represented in the following meta-workflows:
            </FormHelperText>
        </Box>

        {metaWorkflows.length > 0 ?
            <Box>
                {metaWorkflows.map((wf, i) => 
                    <WorkflowInstantiationPreview meta key={`mwf_${wf.link}${i}`} workflow={wf}/>
                )}
            </Box> 
        :   
            <Card variant="outlined" sx={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px" }}>
                <Typography>
                    No meta-workflows specified
                </Typography>
            </Card>
        }
    </Box>
}