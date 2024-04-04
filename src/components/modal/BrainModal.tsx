import { Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton} from "@mui/material"
import { Fragment, useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';
import { BrainCfgItem, BrainVisualization } from "./BrainVisualization";

interface BrainModalProps {
    brainCfg: string,
    iconOnly?: boolean
}

export const BrainModal = ({brainCfg: brainCfgTxt, iconOnly=true} : BrainModalProps) => {
    const [open, setOpen] = useState(false);
    const [brainCfg, setBrainCfg] = useState<BrainCfgItem[]|null>(null);

    useEffect(() => {
        if (brainCfgTxt && open) {
            if (brainCfgTxt !== "[]\n" && brainCfgTxt.startsWith('[')) {
                let cfg: BrainCfgItem[] = JSON.parse(brainCfgTxt.replaceAll('\n', ' ').replaceAll('\t', ''));
                setBrainCfg(cfg);
            } else {
                console.warn("Could not decode:", brainCfgTxt);
                setBrainCfg(null);
            }
        } else {
            setBrainCfg(null);
        }
    }, [brainCfgTxt, open]);

    const onOpenDialog = () => {
        setOpen(true);
    }

    const onCloseDialog = () => {
        setOpen(false);
    }

    return (
        <Fragment>
            {iconOnly ? 
                <IconButton onClick={onOpenDialog} sx={{p:0}}>
                    <ThreeDRotationIcon sx={{color: "gray", ml: "4px"}}/>
                </IconButton>
                : <Button onClick={onOpenDialog} variant="outlined">
                    <ThreeDRotationIcon sx={{color: "gray", ml: "5px", mr: "5px"}}/>
                    Open brain visualization
                </Button>
            }
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ m: 0, p: '8px 16px'}}>
                    Brain Visualization
                    <IconButton aria-label="close" onClick={onCloseDialog}
                            sx={{ position: 'absolute', right: 5, top: 5, color: 'grey'}} >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{p:0}}>
                    <Box sx={{p: 0, display: 'flex', minWidth: '600px', minHeight: '400px', justifyContent: (false? 'space-around' : 'unset')}}>
                        {false ?
                            <CircularProgress sx={{alignSelf:'center'}}/> : 
                            (brainCfg != null ? 
                                <Fragment>
                                    <BrainVisualization configuration={brainCfg}/>
                                    <Box sx={{width: '40px', margin: "50px 0px", display: 'flex', justifyContent: 'space-between', flexDirection: 'column', background: 'linear-gradient(#ff0000, #ffdddd)'}}>
                                        <Box sx={{position: 'relative', left: '-12px', top: '-12px'}}>1</Box>
                                        <Box sx={{position: 'relative', left: '-12px', bottom: '-12px'}}>0</Box>
                                    </Box>
                                </Fragment>
                            :
                                <Box sx={{width: "100%", margin: "0 auto", textAlign: "center", lineHeight: "400px", fontWeight: "bold", fontSize: "1.1em"}}>
                                    An error has occurred reading the brain visualization configuration.
                                </Box>
                            )
                        }
                    </Box>
                </DialogContent>
            </Dialog>
        </Fragment>
    );
}