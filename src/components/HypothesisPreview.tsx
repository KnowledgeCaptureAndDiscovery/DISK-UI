import { Box, Card, Divider, Typography } from "@mui/material"
import { Hypothesis } from "DISK/interfaces"
import ScienceIcon from '@mui/icons-material/Science';
import EditIcon from '@mui/icons-material/Edit';
import { Link } from "react-router-dom";
import { PATH_HYPOTHESES } from "constants/routes";


interface HypothesisPreviewProps {
    hypothesis : Hypothesis
}

export const HypothesisPreview = ({hypothesis:h} : HypothesisPreviewProps) => {
    return <Card variant="outlined" sx={{margin: "10px", height: "90px"}}>
        <Box sx={{padding: "0 10px", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <Box component={Link} to={PATH_HYPOTHESES + "/" + h.id}
                    sx={{display:"inline-flex", alignItems:"center", textDecoration: "none"}}>
                <ScienceIcon sx={{color: "orange"}} />
                <Typography variant="h6" sx={{display: "inline-block", color:"black"}}>{h.name} </Typography>
            </Box>
            <Box component={Link} to={PATH_HYPOTHESES + "/" + h.id + "/edit"}>
                <EditIcon/>
            </Box>
        </Box>
        <Divider/>
        <Typography sx={{padding: "0 10px"}}> {h.description} </Typography>
    </Card>
}