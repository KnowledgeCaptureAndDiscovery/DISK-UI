import { Button, Dialog, DialogTitle, IconButton, DialogContent, Typography } from "@mui/material";
import { WorkflowInstantiation } from "DISK/interfaces"
import { WorkflowSeedList } from "components/methods/WorkflowSeedList";
import { useState, Fragment, useEffect } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { SimpleTable } from "components/SimpleTable";
import { TypographyLabel } from "components/Styles";

interface WorkflowInstantiationModalProps {
    workflow: WorkflowInstantiation,
    meta?: boolean
}

type TableDef = {[varName: string]: string[]};
type MultipleTables = {[index:number]: TableDef};

export const WorkflowInstantiationModal = ({workflow, meta=false} : WorkflowInstantiationModalProps) => {
    const [open, setOpen] = useState(false);
    const [paramters, setParameters] = useState<MultipleTables>({});

    useEffect(() => {
        let data : MultipleTables = {};
        (workflow.dataBindings||[]).forEach(db => {
            if (db.binding.length>0) {
                if (!data[db.binding.length]) {
                    data[db.binding.length] = {};
                }
                data[db.binding.length][db.variable] = db.binding;
            }
        })
        // replace all variables that start with _
        Object.keys(data).forEach((index:any) => {
            let map = data[index as number];
            let keys = Object.keys(map);
            for (const key of keys) {
                if (key.startsWith("_")) {
                    data[index as number][key.substring(1)] = map[key];
                    delete data[index as number][key];
                }
            }
        });

        setParameters(data);
    }, [workflow]);

    const onOpenDialog = () => {
        setOpen(true);
    }

    const onCloseDialog = () => {
        setOpen(false);
    }

    return <Fragment>
            <Button onClick={onOpenDialog}>
                See all parameters and inputs
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ m: 0, p: '8px 16px'}}>
                    {workflow.name}
                    <IconButton aria-label="close" onClick={onCloseDialog}
                            sx={{ position: 'absolute', right: 5, top: 5, color: 'grey'}} >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {workflow.description && <Typography>{workflow.description}</Typography>}
                    <TypographyLabel sx={{ padding: "20px", fontSize: "1em"}}>
                        {meta ? "Meta-workflow" : "Workflow"} parameters:
                    </TypographyLabel>
                    {Object.values(paramters).map((def,i) => <SimpleTable key={`pa_${i}`} data={def} perPage={20} showIndex={i!==0} />) }
                </DialogContent>
            </Dialog>
        </Fragment>
}