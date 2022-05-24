import { Autocomplete, TextField, CircularProgress, Box, Card, FormHelperText, Select, Typography, Skeleton, Grid, Checkbox, FormControlLabel, FormGroup } from "@mui/material"
import { DISKAPI } from "DISK/API";
import { Method, MethodInput, Workflow } from "DISK/interfaces";
import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { setErrorAll, setErrorInput, setInputs, setLoadingAll, setLoadingInput, setWorkflow } from "redux/workflows";

interface WorkflowEditorProps {
    workflow?: Workflow;
}


export const WorkflowEditor = ({workflow:workflow} : WorkflowEditorProps) => {
    const dispatch = useAppDispatch();
    const [selected, setSelected] = React.useState<Method>();
    const [selectedLabel, setSelectedLabel] = React.useState("");

    const methods = useAppSelector((state:RootState) => state.workflows.workflows);
    const loading = useAppSelector((state:RootState) => state.workflows.loadingAll);
    const error = useAppSelector((state:RootState) => state.workflows.errorAll);

    const inputMap = useAppSelector((state:RootState) => state.workflows.inputs);
    const varLoadingMap = useAppSelector((state:RootState) => state.workflows.loading);
    const varErrorMap = useAppSelector((state:RootState) => state.workflows.errored);

    const loadWorkflows = () => {
        if (methods.length === 0 && !loading && !error) {
            dispatch(setLoadingAll());
            DISKAPI.getWorkflows()
                .then((wfs:Method[]) => dispatch(setWorkflow(wfs)))
                .catch(() => dispatch(setErrorAll()))
        }
    }

    useEffect(loadWorkflows)

    useEffect(() => {
        console.log("1>", workflow)
    }, [workflow]);

    const onWorkflowIdChange = (method:Method|null) => {
        if (!!method) {
            setSelected(method);
            loadMethodInputs(method);
        }
    }

    const loadMethodInputs = (method:Method) => {
        let inputs = inputMap[method.name];
        let loading = varLoadingMap[method.name];
        let error = varErrorMap[method.name];
        if (!loading && !error && (!inputs || inputs.length === 0)) {
            dispatch(setLoadingInput(method.name));
            DISKAPI.getWorkflowVariables(method.name)
                .then((inputs:MethodInput[]) => dispatch(setInputs({id: method.name, values: inputs})))
                .catch(() => dispatch(setErrorInput(method.name)));
        }
    }

    return <Card variant="outlined" sx={{padding: "5px 10px", position: "relative", overflow: "visible"}}>
        <FormHelperText sx={{position: 'absolute', background: 'white', padding: '0 4px', margin: '-14px 0 0 0'}}> Configure a new workflow: </FormHelperText>
        <Grid container spacing={1} sx={{alignItems: "center", height: "68px"}}>
            <Grid item xs={2} md={3} sm={4} sx={{textAlign: "right", color: "#444", fontSize: "0.85rem"}}>
                <Typography> Select a workflow template: </Typography>
            </Grid>
            <Grid item xs={10} md={9} sm={8}>
                <Autocomplete id="select-workflow" size="small" fullWidth
                    value={selected}
                    onChange={(_,newQ) => onWorkflowIdChange(newQ)}
                    inputValue={selectedLabel}
                    onInputChange={(_,newIn) => setSelectedLabel(newIn)}
                    isOptionEqualToValue={(option, value) => option.name === value.name}
                    getOptionLabel={(option) => option.name}
                    options={methods}
                    loading={loading}
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
                (inputMap[selected.name].filter((i) =>i.type === 'input').length > 0 ? 
                <Box>
                    <Grid container spacing={1}  sx={{alignItems: "center"}}>
                        <Grid item xs={2} md={3} sm={4} sx={{textAlign: "right", fontSize: "0.9rem", fontWeight: 500}}>
                            Input name
                        </Grid>
                        <Grid item xs={10} md={9} sm={8} sx={{fontWeight: 500, fontSize: "0.9rem"}}>
                            Variable binding
                        </Grid>
                    </Grid>
                    { inputMap[selected.name].filter((i) => i.type === 'input').map((inp:MethodInput) =>
                        <Grid container spacing={1}  sx={{alignItems: "center"}}>
                            <Grid item xs={2} md={3} sm={4} sx={{textAlign: "right", color: "#444", fontSize: "0.85rem"}}>{inp.name}:</Grid>
                            <Grid item xs={8} md={7} sm={6}>
                                <TextField size="small" label={"Set binding"}></TextField>
                            </Grid>
                            <Grid item xs={2} md={2} sm={2}>
                                <FormGroup>
                                    <FormControlLabel sx={{fontSize: "0.85rem"}} control={<Checkbox />} label="Use as array" />
                                </FormGroup>
                            </Grid>
                        </Grid>)}
                </Box>
                :
                <Grid container spacing={1} sx={{alignItems: "center"}}>
                    <Grid item xs={12} md={12} sx={{textAlign: "center", color: "#444"}}> No data inputs </Grid>
                </Grid>)
            : <Skeleton height={"60px"}/>)
        : <Box/>}
    </Card>;
}