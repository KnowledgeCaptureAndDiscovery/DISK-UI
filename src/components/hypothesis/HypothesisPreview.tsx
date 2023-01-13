import { Hypothesis } from "DISK/interfaces"
import ScienceIcon from '@mui/icons-material/Science';
import { PATH_HYPOTHESES } from "constants/routes";
import { Card, Box, Typography, Tooltip, IconButton, Divider, styled } from "@mui/material";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ConfirmDialog } from "../ConfirmDialog";
import { closeBackdrop, openBackdrop } from "redux/slices/backdrop";
import { openNotification } from "redux/slices/notifications";
import { useDeleteHypothesisMutation } from "redux/apis/hypotheses";

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

interface HypothesisPreviewProps {
    hypothesis : Hypothesis,
    displayEditButton?: boolean, 
    displayDeleteButton?: boolean
}

                    

export const HypothesisPreview = ({hypothesis, displayDeleteButton=true, displayEditButton=true} : HypothesisPreviewProps) => {
    const dispatch = useAppDispatch();
    const authenticated = useAppSelector((state:RootState) => state.keycloak.authenticated);
    const [
        deleteHypothesis, // This is the mutation trigger
        { isLoading: isDeleting }, // This is the destructured mutation result
      ] = useDeleteHypothesisMutation();

    const onDeleteHypothesis = () => {
        console.log("DELETING: ", hypothesis.id);
        dispatch(openBackdrop());
        const name = hypothesis.name;
        deleteHypothesis({id: hypothesis.id})
        //DISKAPI.deleteHypothesis(hypothesis.id)
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
            <Box component={Link} to={PATH_HYPOTHESES + "/" + hypothesis.id}
                 sx={{display:"inline-flex", alignItems:"center", textDecoration: "none"}}>
                <ScienceIcon sx={{color: "orange"}}/>
                <Typography variant="h6" sx={{marginLeft: "6px", display: "inline-block", color:"black"}}>{hypothesis.name}</Typography>
            </Box>
            <Box sx={{display:'flex'}}>
                {displayEditButton && (
                <Tooltip arrow title={authenticated? "Edit" : "You need to log in to edit"}>
                    <Box sx={{display:"inline-block"}}>
                        <IconButton component={Link} to={PATH_HYPOTHESES + "/" + hypothesis.id + "/edit"} sx={{padding: "4px"}} disabled={!authenticated}>
                            <EditIcon/>
                        </IconButton>
                    </Box>
                </Tooltip>)}
                {displayDeleteButton && (
                <Tooltip arrow title={authenticated? "Delete" : "You need to log in to delete"}>
                    <Box sx={{display:"inline-block"}}>
                        <ConfirmDialog title="Delete this Hypothesis?" msg={`Are you sure you want to delete the hypothesis "${hypothesis.name}"?`} disabled={!authenticated}
                            onConfirm={onDeleteHypothesis}>
                            <IconButton sx={{padding: "4px"}} disabled={!authenticated}>
                                <DeleteIcon/>
                            </IconButton>
                        </ConfirmDialog>
                    </Box>
                </Tooltip>)}
            </Box>
        </Box>
        <Divider/>
        <Box sx={{padding: "5px 10px 0"}}>
            <TwoLines> {hypothesis.description} </TwoLines>
        </Box>
        <Box sx={{display: "inline-flex", width: "100%", alignItems: "center", justifyContent: "space-between", padding: "0 10px", fontSize: "0.85rem"}}>
            <Box>
                <b>Date {hypothesis.dateModified ? "modified: " : "created: "}</b>
                {hypothesis.dateModified ? hypothesis.dateModified : hypothesis.dateCreated}
            </Box>
            <Box>
                <b>Author: </b>
                {hypothesis.author}
            </Box>
        </Box>
    </Card>
    );
}