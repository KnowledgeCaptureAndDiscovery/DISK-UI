import { Box, Backdrop, CircularProgress, Snackbar, Alert } from "@mui/material";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { closeNotification } from "redux/stores/notifications";

export const Notification = () => {
    const dispatch = useAppDispatch();
    const open : boolean = useAppSelector((state:RootState) => state.notification.open);
    const severity : 'error' | 'info' | 'success' | 'warning' = useAppSelector((state:RootState) => state.notification.severity);
    const text : string = useAppSelector((state:RootState) => state.notification.text);

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