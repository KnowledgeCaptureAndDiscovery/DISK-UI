
import { Box, Card, Divider, Typography } from "@mui/material"
import EditIcon from '@mui/icons-material/Edit';
import { Link } from "react-router-dom";

export interface PreviewInfo {
    path: string,
    id: string,
    name: string,
    description: string,
    author: string,
    dateCreated: string,
    dateModified?: string
}

interface PreviewItemProps {
    item: PreviewInfo,
    icon: JSX.Element
}

export const PreviewItem = ({item:item, icon:icon} : PreviewItemProps) => {
    return <Card variant="outlined" sx={{margin: "10px", height: "96px"}}>
        <Box sx={{padding: "0 10px", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <Box component={Link} to={item.path + "/" + item.id}
                 sx={{display:"inline-flex", alignItems:"center", textDecoration: "none"}}>
                {icon}
                <Typography variant="h6" sx={{marginLeft: "6px", display: "inline-block", color:"black"}}>{item.name}</Typography>
            </Box>
            <Box component={Link} to={item.path + "/" + item.id + "/edit"}
                 sx={{display:"inline-flex", alignItems:"center", textDecoration: "none"}}>
                <EditIcon/>
            </Box>
        </Box>
        <Divider/>
        <Box sx={{padding: "5px 10px 0"}}>
            <Typography sx={{display: "-webkit-box","-webkit-line-clamp": "2", "-webkit-box-orient": "vertical", overflow: "hidden", fontSize: "0.9rem", lineHeight: "1rem", color:"#444", height: "2rem"}}>
                {item.description} 
            </Typography>
        </Box>
        <Box sx={{display: "inline-flex", width: "100%", alignItems: "center", justifyContent: "space-between", padding: "0 10px", fontSize: "0.85rem"}}>
            <Box>
                <b>Date {item.dateModified ? "modified:" : "created:"}</b>
                {item.dateModified ? item.dateModified : item.dateCreated}
            </Box>
            <Box>
                <b>Author:</b>
                {item.author}
            </Box>
        </Box>
    </Card>
}