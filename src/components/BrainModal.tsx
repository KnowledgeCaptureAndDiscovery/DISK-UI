import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton} from "@mui/material"
import { Fragment, useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';
import { DISKAPI } from "DISK/API";
import { BrainCfgItem, BrainVisualization } from "./BrainVisualization";

interface BrainModalProps {
    source: string,
    brainUrl: string,
}

export const BrainModal = ({source, brainUrl} : BrainModalProps) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [brainCfg, setBrainCfg] = useState<BrainCfgItem[]|null>(null);

    useEffect(() => {
        if (brainUrl)
            setBrainCfg(null);
    }, [brainUrl]);

    const onOpenDialog = () => {
        setOpen(true);
        setLoading(true);
        if (brainUrl && brainCfg == null) {
            DISKAPI.getData(source, brainUrl)
                    .then((text:string) => {
                        let ok : boolean = text.startsWith('[');
                        setError(ok)
                        if (ok) {
                            console.log("Brain config: " + text);
                            let cfg : BrainCfgItem[] = JSON.parse(text);
                            setBrainCfg(cfg);
                        } else {
                            console.log("Error response:", text);
                        }
                    })
                    .finally(() => {
                        setLoading(false);
                    })
        }
    }

    const onCloseDialog = () => {
        setOpen(false);
    }

    return (
        <Fragment>
            <IconButton onClick={onOpenDialog} sx={{p:0}}>
                <ThreeDRotationIcon sx={{color: "gray", ml: "4px"}}/>
            </IconButton>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ m: 0, p: '8px 16px'}}>
                    Brain Visualization
                    <IconButton aria-label="close" onClick={onCloseDialog}
                            sx={{ position: 'absolute', right: 5, top: 5, color: 'grey'}} >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{p:0}}>
                    <Box sx={{p: 0, display: 'flex', minWidth: '600px', minHeight: '400px', justifyContent: (loading? 'space-around' : 'unset')}}>
                        {loading ?
                            <CircularProgress sx={{alignSelf:'center'}}/> : 
                            <Fragment>
                                <BrainVisualization configuration={brainCfg ? brainCfg : undefined}/>
                                <Box sx={{width: '40px', margin: "50px 0px", display: 'flex', justifyContent: 'space-between', flexDirection: 'column', background: 'linear-gradient(#ff0000, #ffdddd)'}}>
                                    <Box sx={{position: 'relative', left: '-12px', top: '-12px'}}>1</Box>
                                    <Box sx={{position: 'relative', left: '-12px', bottom: '-12px'}}>0</Box>
                                </Box>
                            </Fragment>}
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