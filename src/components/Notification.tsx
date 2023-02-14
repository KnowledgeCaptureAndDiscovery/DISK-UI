import { Box, Snackbar, Alert } from "@mui/material";
import { useAppDispatch, useNotification } from "redux/hooks";
import { closeNotification } from "redux/slices/notifications";

export const Notification = () => {
    const dispatch = useAppDispatch();
    const [open, severity, text] = useNotification();

    const handleOnClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        dispatch(closeNotification());
    }

    return (
        <Box>
            <Snackbar open={open} autoHideDuration={3000} onClose={handleOnClose} anchorOrigin={{vertical:'bottom', horizontal: 'right'}}>
                <Alert severity={severity} sx={{ width: '100%' }} onClose={handleOnClose}>
                    {text}
                </Alert>
            </Snackbar>
        </Box>
    );
}