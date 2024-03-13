import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton} from "@mui/material"
import { Fragment, useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { useGetPrivateFileAsTextQuery } from "redux/apis/server";

interface ShinyModalProps {
    shinyLog: string,
}

export const ShinyModal = ({shinyLog} : ShinyModalProps) => {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState("");

    useEffect(() => {
        if (shinyLog) {
            let m = shinyLog.match("Application successfully deployed to (.*)");
            if (m && m.length === 2) {
                setUrl(m[1]);
            } else {
                console.warn("Could not decode:", shinyLog);
                setUrl("");
            }
        } else {
            setUrl("");
        }
    }, [shinyLog]);

    const onOpenDialog = () => {
        setOpen(true);
    }

    const onCloseDialog = () => {
        setOpen(false);
    }

    return (
        <Fragment>
            <IconButton onClick={onOpenDialog} sx={{p:0}}>
                <QueryStatsIcon sx={{color: "gray", ml: "4px"}}/>
            </IconButton>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xl" fullWidth>
                <DialogTitle sx={{ m: 0, p: '8px 16px'}}>
                    Shiny Visualization
                    <IconButton aria-label="close" onClick={onCloseDialog}
                            sx={{ position: 'absolute', right: 5, top: 5, color: 'grey'}} >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{p:0}}>
                    <Box sx={{height: "80vh", p: 0}}>
                        {false ? <Box sx={{display:'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                            <CircularProgress/> 
                        </Box>
                        : (url && 
                            (<iframe style={{width: "100%", height: "100%", border: "0"}} src={url}/>)
                        )}
                    </Box>
                </DialogContent>
                {
                //<DialogActions>
                //    <Button autoFocus onClick={onCloseDialog}>
                //        Close
                //    </Button>
                //</DialogActions>
                }
            </Dialog>
        </Fragment>
    );
}