import { Autocomplete, TextField, CircularProgress, Box, Card, FormHelperText, Typography, Grid, Button } from "@mui/material"
import { Method, VariableBinding, Workflow } from "DISK/interfaces";
import React, { Fragment, useEffect } from "react"
import AddIcon from '@mui/icons-material/Add';
import { MethodVariableList } from "./MethodVariableList";
import { useGetWorkflowsQuery } from "redux/apis/workflows";

interface WorkflowEditorProps {
    options:    string[],
    workflow?:  Workflow,
    onSave?:    (workflow:Workflow) => void,
    meta?:      boolean,
    storedOutputs?: string[]
}

export const WorkflowEditor = ({options, workflow, onSave:notifyParent, meta=false, storedOutputs=[]} : WorkflowEditorProps) => {
    const [selected, setSelected] = React.useState<Method|null>(null);
    const [selectedLabel, setSelectedLabel] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [variableBindings, setVariableBindings] = React.useState<VariableBinding[]>([]);

    const {data:methods, isLoading:loading} = useGetWorkflowsQuery();

    useEffect(() => {
        if (methods && workflow) {
            let selectedMethod: Method = methods.filter(m => m.name === workflow.workflow)![0];
            if (selectedMethod) {
                onWorkflowChange(selectedMethod);
            }
        }
    }, [methods]);

    const onWorkflowChange = (method:Method|null) => {
        setSelected(method);
    }

    const loadForm = (wf:Workflow) => {
        if (!loading && methods && methods.length > 0) {
            let m = methods.filter(m => m.name === wf.workflow)![0];
            if (m) onWorkflowChange(m);
        }
        setVariableBindings(wf.bindings);
        if (wf.description) {
            setDescription(wf.description);
        }
    };

    const clearForm = () => {
        onWorkflowChange(null);
    }

    const onBindingsChange = (newBindings:VariableBinding[]) => {
        setVariableBindings(newBindings);
    }

    const onWorkflowSave = () => {
        //SAVE
        if (selected) {
            let newWorkflow : Workflow = {
                source: selected.source,
                description: description,
                workflow: selected.name,
                workflowLink: selected.link,
                bindings: variableBindings
            };

            loadForm(newWorkflow);
            if (notifyParent) notifyParent(newWorkflow);
        }
    }

    useEffect(() => {
        if (workflow)
            loadForm(workflow)
        else
            clearForm();
    }, [workflow]);

    return <Card variant="outlined" sx={{padding: "5px 10px", position: "relative", overflow: "visible", mb: "5px"}}>
        <FormHelperText sx={{position: 'absolute', background: 'white', padding: '0 4px', margin: '-14px 0 0 0'}}> Configure a new workflow: </FormHelperText>
        <Grid container spacing={1} sx={{alignItems: "center", height: "68px"}}>
            <Grid item xs={3} md={4} sm={5} sx={{textAlign: "right", color: "#444", fontSize: "0.85rem"}}>
                <Typography>Specify a workflow to be used in this LOI:</Typography>
            </Grid>
            <Grid item xs={9} md={8} sm={7}>
                <Autocomplete id="select-workflow" size="small" fullWidth
                    value={selected}
                    onChange={(_,newQ) => onWorkflowChange(newQ)}
                    inputValue={selectedLabel}
                    onInputChange={(_,newIn) => setSelectedLabel(newIn)}
                    isOptionEqualToValue={(option, value) => option.name === value.name}
                    getOptionLabel={(option) => option.name}
                    options={methods ? methods : []}
                    loading={loading}
                    groupBy={(option) => option.source.replace("_", " ")}
                    renderInput={(params) => (
                        <TextField {...params} label="Selected workflow"
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <React.Fragment>
                                        {loading ? <CircularProgress color="inherit" size={20} style={{marginRight: "30px"}} /> : null}
                                        {params.InputProps.endAdornment}
                                    </React.Fragment>
                                ),
                            }}
                        />
                    )}
                />
            </Grid>
        </Grid>
        {!!selected && <MethodVariableList options={options} method={selected} bindings={variableBindings} onChange={onBindingsChange} meta={meta} storedOutputs={storedOutputs}/>}
        <TextField label="Workflow description" placeholder="You can add a description of what this workflow does here" 
                sx={{width:"100%", mb:"5px"}} size='small'
                value={description} onChange={(e) => setDescription(e.target.value)} />
        <Box sx={{display:"flex", justifyContent:"end", alignItems: "center"}}>
            <Button variant="contained" color="success" onClick={onWorkflowSave} disabled={!selected}>
                <AddIcon sx={{mr: "5px"}}/> Save workflow
            </Button>
        </Box>
    </Card>;
}