import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Fragment, useState } from "react";

interface ConfirmDialogProps {
    onConfirm: () => void,
    onCancel?: () => void,
    title: string,
    msg: string,
    children: React.ReactNode,
    disabled: boolean,
}

export const ConfirmDialog = ({title, msg, onCancel, onConfirm, children, disabled}:ConfirmDialogProps) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleOnCancel = () => {
        if (onCancel) onCancel();
        setOpen(false);
    }

    const handleOnConfirm = () => {
        onConfirm();
        setOpen(false);
    }

    return (
        <Fragment>
            <Dialog open={open}>
                <DialogTitle id="alert-title">
                    {title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-description">
                        {msg}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleOnCancel}>
                        Cancel
                    </Button>
                    <Button color="error" onClick={handleOnConfirm}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Box onClick={() => !disabled && setOpen(true)} >
                {children}
            </Box>
        </Fragment>
    );
}