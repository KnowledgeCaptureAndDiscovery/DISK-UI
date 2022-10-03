import { Autocomplete, TextField, CircularProgress, Box, Card, FormHelperText, Select, Typography, Skeleton, Grid, MenuItem, Button } from "@mui/material"
import { DISKAPI } from "DISK/API";
import { Method, MethodInput, VariableBinding, Workflow } from "DISK/interfaces";
import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { setErrorAll, setErrorInput, setInputs, setLoadingAll, setLoadingInput, setWorkflow } from "redux/workflows";
import AddIcon from '@mui/icons-material/Add';

interface WorkflowEditorProps {
    options:    string[],
    workflow?:  Workflow,
    onSave?:    (workflow:Workflow) => void,
}

export const WorkflowEditor = ({options, workflow, onSave:notifyParent} : WorkflowEditorProps) => {
    const dispatch = useAppDispatch();
    const [selected, setSelected] = React.useState<Method|null>(null);
    const [selectedLabel, setSelectedLabel] = React.useState("");
    const [description, setDescription] = React.useState("");

    const methods = useAppSelector((state:RootState) => state.workflows.workflows);
    const loading = useAppSelector((state:RootState) => state.workflows.loadingAll);
    const error = useAppSelector((state:RootState) => state.workflows.errorAll);

    const inputMap = useAppSelector((state:RootState) => state.workflows.inputs);
    const varLoadingMap = useAppSelector((state:RootState) => state.workflows.loading);
    const varErrorMap = useAppSelector((state:RootState) => state.workflows.errored);

    //form
    const [selectedVariableValues, setSelectedVariableValues] = React.useState<{[id:string]: string}>({});
    //const [selectedCollectionValues, setSelectedCollectionValues] = React.useState<{[id:string]: boolean}>({});
    const [selectedTypeValues, setSelectedTypeValues] = React.useState<{[id:string]: string}>({});

    const loadWorkflows = () => {
        if (methods.length === 0 && !loading && !error) {
            dispatch(setLoadingAll());
            DISKAPI.getWorkflows()
                .then((methods:Method[]) => {
                    dispatch(setWorkflow(methods));
                    if (workflow) {
                        let selectedMethod : Method = methods.filter(m => m.name === workflow.workflow)![0];
                        if (selectedMethod) {
                            onWorkflowChange(selectedMethod);
                        }
                    }
                })
                .catch(() => dispatch(setErrorAll()))
        }
    }

    useEffect(loadWorkflows)

    const onWorkflowChange = (method:Method|null) => {
        setSelected(method);
        if (!!method) loadMethodInputs(method);
    }

    const loadMethodInputs = (method:Method) => {
        let inputs = inputMap[method.name];
        let loading = varLoadingMap[method.name];
        let error = varErrorMap[method.name];
        if (!loading && !error && (!inputs || inputs.length === 0)) {
            dispatch(setLoadingInput(method.name));
            DISKAPI.getWorkflowVariables(method.source, method.name) //The name could be the same on two diff sources... FIXME
                .then((inputs:MethodInput[]) => {
                    registerInputs(inputs);
                    dispatch(setInputs({id: method.name, values: inputs}));
                })
                .catch(() => dispatch(setErrorInput(method.name)));
        }
    }

    const registerInputs = (inputs:MethodInput[]) => {
        // Adds all not registered inputs.
        let newInputs : string[] = inputs.map(i => i.name);
        setSelectedVariableValues((values) => {
            let newValues = { ...values };
            newInputs.forEach(i => newValues[i] = newValues[i] ? newValues[i] : "");
            return newValues;
        });
        /*setSelectedCollectionValues((values) => {
            let newValues = { ...values };
            newInputs.forEach(i => newValues[i] = newValues[i] ? newValues[i] : false);
            return newValues;
        });*/
    }
    
    const onValueChange = (inputId:string, value:string) => {
        setSelectedVariableValues((values) => {
            let newValues = { ...values };
            newValues[inputId] = value;
            return newValues;
        });
    };

    /*const onCollectionChange = (inputId:string, value:any) => {
        setSelectedCollectionValues((values) => {
            let newValues = { ...values };
            newValues[inputId] = value;
            return newValues;
        });
    };*/

    const onTypeChange = (inputId:string, value:string) => {
        setSelectedTypeValues((values) => {
            let newValues = { ...values };
            newValues[inputId] = value;
            return newValues;
        });
    };

    const loadForm = (wf:Workflow) => {
        if (!loading && methods.length > 0) {
            let m = methods.filter(m => m.name === wf.workflow)![0];
            if (m) onWorkflowChange(m);
        }
        let allBindings = [ ...wf.bindings ];
        if (allBindings.length > 0) {
            setSelectedVariableValues((values) => {
                let newValues = { ...values };
                allBindings.forEach(vb => {
                    newValues[vb.variable] = vb.collection ? vb.binding.substring(1).slice(0, -1) : vb.binding;
                });
                return newValues;
            });
            /*setSelectedCollectionValues((values) => {
                let newValues = { ...values };
                allBindings.forEach(vb => {
                    newValues[vb.variable] = vb.collection ? true:false;
                });
                return newValues;
            });*/
            setSelectedTypeValues((values) => {
                let newValues = { ...values };
                allBindings.forEach(vb => {
                    let methods = inputMap[wf.workflow];
                    if (methods) methods.forEach((m:MethodInput) => {
                        if (m.name === vb.variable)
                            newValues[vb.variable] = m.type[0]; // TODO: search a way to store the option
                    })
                });
                return newValues;
            })
        }
        if (wf.description) {
            setDescription(wf.description);
        }
    };

    useEffect(() => {
        if (workflow)
            loadForm(workflow)
        else
            clearForm();
    }, [workflow]); // eslint-disable-line react-hooks/exhaustive-deps

    const clearForm = () => {
        onWorkflowChange(null);
    }

    const onWorkflowSave = () => {
        //SAVE
        if (selected) {
            let newWorkflow : Workflow = {
                source: selected.source,
                description: description,
                workflow: selected.name,
                workflowLink: selected.link,
                bindings: 
                    inputMap[selected.name]
                            .filter((i) => i.input && selectedVariableValues[i.name])
                            .map((i:MethodInput) => {
                        return {
                            variable: i.name,
                            binding: i.dimensionality > 0 ? "[" + selectedVariableValues[i.name] + "]" : selectedVariableValues[i.name],
                            collection: i.dimensionality > 0
                        } as VariableBinding;
                    }),
            };

            loadForm(newWorkflow);
            if (notifyParent) notifyParent(newWorkflow);
        }
    }

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
                    options={methods}
                    loading={loading}
                    groupBy={(option) => option.source.replace("_", " ")}
                    renderInput={(params) => (
                        <TextField {...params} label="Selected workflow"
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <React.Fragment>
                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </React.Fragment>
                                ),
                            }}
                        />
                    )}
                />
            </Grid>
        </Grid>
        { selected ? 
            (!varLoadingMap[selected.name] && inputMap[selected.name] ?
                (inputMap[selected.name].filter((i) =>i.input).length > 0 ? 
                <Box>
                    <Grid container spacing={1}  sx={{alignItems: "center"}}>
                        <Grid item xs={2} md={3} sm={4} sx={{textAlign: "right", fontSize: "0.9rem", fontWeight: 500}}>
                            Workflow input
                        </Grid>
                        <Grid item xs={6} md={5} sm={4} sx={{fontWeight: 500, fontSize: "0.9rem"}}>
                            Dataset information
                        </Grid>
                        <Grid item xs={2} md={2} sm={2} sx={{fontWeight: 500, fontSize: "0.9rem"}}>
                            Type
                        </Grid>
                    </Grid>
                    { inputMap[selected.name].filter((i) => i.input).map((inp:MethodInput) =>
                        <Grid container spacing={1}  sx={{alignItems: "center"}} key={`inp_${inp.name}`}>
                            <Grid item xs={2} md={3} sm={4} sx={{textAlign: "right", color: "#444", fontSize: "0.85rem"}}>{inp.name}:</Grid>
                            <Grid item xs={6} md={5} sm={4}>
                                <Select size="small" sx={{display: 'inline-block', minWidth: "200px"}} variant="standard"  label="Set binding"
                                        value={selectedVariableValues[inp.name]} onChange={(e) => onValueChange(inp.name, e.target.value)}>
                                    <MenuItem value=""> None </MenuItem>
                                    { options.map((name:string,i:number) => <MenuItem key={`varopt_${i}`} value={name}>{name}</MenuItem>) }
                                </Select>
                            </Grid>
                            <Grid item xs={2} md={2} sm={2}>
                                {inp.type.length <= 1 ?
                                    <Typography>{inp === null || inp.type.length === 0 ? "" : inp.type[0].replaceAll(/.*#/g,'') }</Typography>
                                :
                                    <Select size="small" sx={{display: 'inline-block', minWidth: "120px"}} variant="standard"  label="Set type"
                                            value={selectedTypeValues[inp.name] || inp.type[0] } onChange={(e) => onTypeChange(inp.name, e.target.value)}>
                                        <MenuItem value=""> None </MenuItem>
                                        { inp.type.map((url:string) => <MenuItem key={url} value={url}>{url.replaceAll(/.*#/g,'')}</MenuItem>) }
                                    </Select>
                                }
                            </Grid>
                            <Grid item xs={2} md={2} sm={2}>
                                {inp.dimensionality > 0 && (<Typography>Multiple</Typography>)}
                            </Grid>
                        </Grid>)}
                </Box>
                :
                <Grid container spacing={1} sx={{alignItems: "center"}}>
                    <Grid item xs={12} md={12} sx={{textAlign: "center", color: "#444"}}> No data inputs </Grid>
                </Grid>)
            : <Skeleton height={"60px"}/>)
        : <Box/>}
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