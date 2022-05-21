import { Autocomplete, TextField, CircularProgress, Box, Card, FormHelperText, Select, Typography, Skeleton, Grid } from "@mui/material"
import { DISKAPI } from "DISK/API";
import { Method, MethodInput, Workflow } from "DISK/interfaces";
import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { setErrorAll, setErrorInput, setInputs, setLoadingAll, setLoadingInput, setWorkflow } from "redux/workflows";


export const WorkflowEditor = () => {
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
        <Box sx={{display: "flex", alignItems: "center", height: "64px"}}>
            <Typography sx={{display: "inline-block", marginRight: "5px", fontSize: "0.85rem", width: "215px"}}> Select a workflow template: </Typography>
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
        </Box>
        { selected ? 
            (!varLoadingMap[selected.name] && inputMap[selected.name] ? 
            <Grid container spacing={1}>
                {inputMap[selected.name].length > 0 ? inputMap[selected.name].map((inp:MethodInput) =>
                <Grid container spacing={1}>
                    <Grid item xs={3} md={2} sx={{textAlign: "right", color: "#444"}}>{inp.name}</Grid>
                    <Grid item xs={9} md={10}>
                        <TextField size="small" label={"Set binding"}></TextField>
                    </Grid>
                </Grid>
                )
                : <Grid item xs={12} md={12} sx={{textAlign: "center", color: "#444"}}> No data inputs </Grid> }
            </Grid>
            : <Skeleton height={"60px"}/>)
        : <Box/>}
    </Card>;
}