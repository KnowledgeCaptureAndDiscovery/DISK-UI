import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton} from "@mui/material"
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
    const [url, setUrl] = useState("");

    useEffect(() => {
        if (shinyUrl) {
            DISKAPI.getData(source, shinyUrl)
                    .then((text:string) => {
                        let j : any = JSON.parse(text);
                        if (j["url"])
                            setUrl(j["url"]);
                        else 
                            setUrl("");
                    })
        }
    }, [shinyUrl]);

    return (
        <Fragment>
            <IconButton onClick={() => setOpen(true)} sx={{p:0}} disabled={!url}>
                <QueryStatsIcon sx={{color: "gray", ml: "4px"}}/>
            </IconButton>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ m: 0, p: '8px 16px'}}>
                    Shiny Visualization
                    <IconButton aria-label="close" onClick={() => setOpen(false)}
                            sx={{ position: 'absolute', right: 5, top: 5, color: 'grey'}} >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {url && (<iframe style={{width: "100%", height: "100%", border: "0"}} src={url}/>)}
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => setOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}