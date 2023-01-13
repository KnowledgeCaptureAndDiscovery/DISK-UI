import { Dialog, DialogContent, DialogTitle, IconButton, Link, Tooltip} from "@mui/material"
import { Fragment, useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { Hypothesis, TriggeredLineOfInquiry } from "DISK/interfaces";
import { WorkflowList } from "../methods/WorkflowList";

interface NarrativeModalProps {
    hypothesis : Hypothesis,
    tloi: TriggeredLineOfInquiry,
}

export const NarrativeModal = ({hypothesis, tloi} : NarrativeModalProps) => {
    const [open, setOpen] = useState(false);

    const onOpenDialog = () => {
        setOpen(true);
    }

    const onCloseDialog = () => {
        setOpen(false);
    }

    const getColor = (status: 'QUEUED' | 'RUNNING' | 'FAILED' | 'SUCCESSFUL') => {
        if (status === 'SUCCESSFUL') return "green";
        if (status === 'FAILED') return "red";
        if (status === 'QUEUED') return "yellow";
        if (status === 'RUNNING') return "gray";
    }

    return (
        <Fragment>
            <Tooltip arrow placement="top" title="Provenance">
                <IconButton onClick={onOpenDialog} sx={{p:0}}>
                    <TextSnippetIcon sx={{color: "gray", ml: "4px"}}/>
                </IconButton>
            </Tooltip>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ m: 0, p: '8px 16px'}}>
                    Provenance and Explanation
                    <IconButton aria-label="close" onClick={onCloseDialog}
                            sx={{ position: 'absolute', right: 5, top: 5, color: 'grey'}} >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    The Hypothesis "<span style={{fontWeight:"bold"}}>{hypothesis.name}</span>" was tested with the line of inquiry
                    "<span style={{fontWeight:"bold"}}>{tloi.name.replace("Triggered: ", "")}</span>".

                    The analysis was <span style={{color: getColor(tloi.status) }}>{tloi.status}</span>run on {tloi.dateCreated} with the following datasets:
                    <WorkflowList editable={false} workflows={tloi.workflows} metaworkflows={tloi.metaWorkflows} options={[]} minimal/>
                    {tloi.status === 'SUCCESSFUL' && tloi.confidenceValue > 0 && (
                        <span>
                            The resulting p-value
                            is {tloi.confidenceValue < 0.0001 ?  tloi.confidenceValue.toExponential(3) : tloi.confidenceValue.toFixed(4)}
                        </span>
                    )}
                </DialogContent>
            </Dialog>
        </Fragment>
    );
}