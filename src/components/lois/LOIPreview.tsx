import { LineOfInquiry } from "DISK/interfaces"
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import { PATH_LOIS } from "constants/routes";
import { Card, Box, Typography, Tooltip, IconButton, Divider, styled } from "@mui/material";
import { Link } from "react-router-dom";
import { useAppDispatch, useAuthenticated } from "redux/hooks";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ConfirmDialog } from "../ConfirmDialog";
import { closeBackdrop, openBackdrop } from "redux/slices/backdrop";
import { openNotification } from "redux/slices/notifications";
import { useDeleteLOIMutation } from "redux/apis/lois";
import { getId } from "DISK/util";

const TwoLines = styled(Typography)(({ theme }) => ({
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    fontSize: "0.9rem",
    lineHeight: "1rem",
    color:"#444",
    height: "2rem"
}));

interface LOIPreviewProps {
    loi : LineOfInquiry,
    displayEditButton?: boolean, 
    displayDeleteButton?: boolean
}


export const LOIPreview = ({loi, displayDeleteButton=true, displayEditButton=true} : LOIPreviewProps) => {
    const dispatch = useAppDispatch();
    const authenticated = useAuthenticated();
    const [
        deleteLOI, // This is the mutation trigger
        { isLoading: isDeleting }, // This is the destructured mutation result
      ] = useDeleteLOIMutation();

    //DUPLICATED
    const download = () => {
        let str = JSON.stringify(loi);
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(str);
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", getId(loi) + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    const onDeleteLOI = () => {
        console.log("DELETING: ", loi.id);
        dispatch(openBackdrop());
        const name = loi.name;
        deleteLOI({id: loi.id})
            .then(() => {
                dispatch(openNotification({
                    severity: 'info',
                    text: 'Hypothesis ' + name + ' was deleted'
                }));
            })
            .catch((e) => {
                dispatch(openNotification({
                    severity: 'error',
                    text: 'Error trying to delete ' + name + '. The hypothesis was not deleted'
                }));
                console.warn(e);
            })
            .finally(() => {
                dispatch(closeBackdrop());
            });
    }

    return (
    <Card variant="outlined" sx={{margin: "10px", minHeight: "96px"}}>
        <Box sx={{padding: "0 10px", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <Box component={Link} to={PATH_LOIS + "/" + getId(loi)}
                 sx={{display:"inline-flex", alignItems:"center", textDecoration: "none"}}>
                <SettingsIcon sx={{color: "green"}}/>
                <Typography variant="h6" sx={{marginLeft: "6px", display: "inline-block", color:"black"}}>{loi.name}</Typography>
            </Box>
            <Box sx={{display:'flex'}}>
                {displayEditButton && (
                <Tooltip arrow title={authenticated? "Edit" : "You need to log in to edit"}>
                    <Box sx={{display:"inline-block"}}>
                        <IconButton component={Link} to={PATH_LOIS + "/" + getId(loi) + "/edit"} sx={{padding: "4px"}} disabled={!authenticated}>
                            <EditIcon/>
                        </IconButton>
                    </Box>
                </Tooltip>)}
                {displayDeleteButton && (
                <Tooltip arrow title={authenticated? "Delete" : "You need to log in to delete"}>
                    <Box sx={{display:"inline-block"}}>
                        <ConfirmDialog title="Delete this Hypothesis?" msg={`Are you sure you want to delete the hypothesis "${loi.name}"?`} disabled={!authenticated}
                            onConfirm={onDeleteLOI}>
                            <IconButton sx={{padding: "4px"}} disabled={!authenticated}>
                                <DeleteIcon/>
                            </IconButton>
                        </ConfirmDialog>
                    </Box>
                </Tooltip>)}
                <IconButton sx={{ padding: "4px" }} onClick={download}>
                    <DownloadIcon />
                </IconButton>
            </Box>
        </Box>
        <Divider/>
        <Box sx={{padding: "5px 10px 0"}}>
            <TwoLines> {loi.description} </TwoLines>
        </Box>
        <Box sx={{display: "inline-flex", width: "100%", alignItems: "center", justifyContent: "space-between", padding: "0 10px", fontSize: "0.85rem"}}>
            <Box>
                <b>Date {loi.dateModified ? "modified: " : "created: "}</b>
                {loi.dateModified ? loi.dateModified : loi.dateCreated}
            </Box>
            <Box>
                <b>Author: </b>
                {loi.author?.email}
            </Box>
        </Box>
    </Card>
    );
}