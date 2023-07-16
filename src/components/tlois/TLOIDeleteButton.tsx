import { Box, IconButton, Tooltip } from "@mui/material"
import { ConfirmDialog } from "components/ConfirmDialog"
import { useDeleteTLOIMutation } from "redux/apis/tlois";
import { useAppDispatch, useAuthenticated } from "redux/hooks"
import { openBackdrop, closeBackdrop } from "redux/slices/backdrop";
import { openNotification } from "redux/slices/notifications";
import DeleteIcon from '@mui/icons-material/Delete';
import { TriggeredLineOfInquiry } from "DISK/interfaces";

interface TLOIDeleteButtonProps {
    tloi:TriggeredLineOfInquiry
}

export const TLOIDeleteButton = ({tloi}:TLOIDeleteButtonProps) => {
    const dispatch = useAppDispatch();
    const authenticated = useAuthenticated();
    const [deleteTLOI, {}] = useDeleteTLOIMutation();

    const deleteTLOIById = (id:string) => {
        console.log("Deleting TLOI: ", id);
        dispatch(openBackdrop());
        deleteTLOI({id:id})
            .then(() => {
                dispatch(openNotification({
                    severity: 'info',
                    text: "Triggered Line of Inquiry was deleted"
                }));
            })
            .catch((e) => {
                dispatch(openNotification({
                    severity: 'error',
                    text: "Error trying to delete Triggered Line of Inquiry"
                }));
                console.warn(e);
            })
            .finally(() => {
                dispatch(closeBackdrop());
            });
    }
    
    return <Tooltip arrow placement="top" title={authenticated ? "Delete" : "You must log in to delete"}>
        <Box sx={{ display: "inline-block" }}>
            <ConfirmDialog title="Delete this Triggered Line of Inquiry"
                disabled={!authenticated}
                msg={"Are you sure you want to delete this triggered line of inquiry?"}
                onConfirm={() => deleteTLOIById(tloi.id)}>
                <IconButton sx={{ padding: "0" }} disabled={!authenticated}>
                    <DeleteIcon />
                </IconButton>
            </ConfirmDialog>
        </Box>
    </Tooltip>
}