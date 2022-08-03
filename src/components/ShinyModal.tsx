import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton} from "@mui/material"
import { Fragment, useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { DISKAPI } from "DISK/API";

interface ShinyModalProps {
    source: string,
    shinyUrl: string,
}

export const ShinyModal = ({source, shinyUrl} : ShinyModalProps) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [url, setUrl] = useState("");

    useEffect(() => {
        if (shinyUrl)
            setUrl("");
    }, [shinyUrl]);

    const onOpenDialog = () => {
        setOpen(true);
        setLoading(true);
        if (shinyUrl && !url) {
            DISKAPI.getData(source, shinyUrl)
                    .then((text:string) => {
                        let j : any = JSON.parse(text);
                        if (j["url"])
                            setUrl(j["url"]);
                        else 
                            setUrl("");
                    })
                    .finally(() => {
                        // Give it two extra seconds
                        setTimeout(() => {
                            setLoading(false);
                        }, 2000)
                    })
        }
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
                        {loading ? <Box sx={{display:'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
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