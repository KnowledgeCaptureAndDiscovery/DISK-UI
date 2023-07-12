import { Box, Grid, Skeleton } from "@mui/material";
import { Method, MethodVariables, VariableBinding } from "DISK/interfaces";
import { Fragment, useEffect, useState } from "react";
import { useGetWorkflowVariablesQuery } from "redux/apis/workflows";
import { MethodVariableSelector } from "./MethodVariableSelector";

interface QuestionVariableProps {
    method: Method,
    options: string[],
    bindings: VariableBinding[],
    onChange?: (newBindings:VariableBinding[]) => void,
}

//TODO: Continue adding bindings here!
export const MethodVariableList = ({method, options, bindings, onChange}: QuestionVariableProps) => {
    const [bindingsMap, setBindingsMap] = useState<{[id:string]:VariableBinding}>({});
    const {data:methodVariables, isLoading } = useGetWorkflowVariablesQuery(
        {id:method.name, source:method.source},
        {skip:!method}
    );
    const [inputData, setInputData] = useState<MethodVariables[]>([]);
    const [inputParameters, setInputParameters] = useState<MethodVariables[]>([]);
    const [outputData, setOutputData] = useState<MethodVariables[]>([]);

    //After loading the method variables we categorize them
    useEffect(() => {
        let inputD : MethodVariables[]  = [],
            inputP : MethodVariables[]  = [],
            outputD : MethodVariables[] = [];
        (methodVariables||[]).forEach((methodVar:MethodVariables) => {
            if (methodVar.input && !methodVar.param) inputD.push(methodVar);
            else if (methodVar.output || (!methodVar.input && !methodVar.param)) outputD.push(methodVar);
            else if (methodVar.param) inputP.push(methodVar);
        });
        setInputData(inputD);
        setInputParameters(inputP);
        setOutputData(outputD);
    }, [methodVariables])

    useEffect(() => {
        if (bindings && methodVariables) {
            let bindingMap : {[id:string]:VariableBinding} = {}
            methodVariables.forEach((mv:MethodVariables) => {
                let value : VariableBinding = bindings.filter(b => b.variable === mv.name)[0];
                if (value) {
                    bindingMap[mv.name] = value;
                }
            });
            setBindingsMap(bindingMap);
        }
    }, [bindings, methodVariables]);

    const onBindingChange = (newBinding:VariableBinding) => {
        let newBindings = {...bindingsMap};
        newBindings[newBinding.variable] = newBinding;
        setBindingsMap(newBindings);
        if (onChange) onChange(Object.values(newBindings));
    }

    if (isLoading)
        return <Skeleton height={"60px"}/>
    return <Box> 
        {inputParameters.length > 0 || inputData.length > 0 ? (
            <Fragment>
                <Grid container spacing={1}  sx={{alignItems: "center"}}>
                    <Grid item xs={2} md={2} sm={2} sx={{textAlign: "right", fontSize: "0.9rem", fontWeight: 500}}>
                        Workflow input
                    </Grid>
                    <Grid item xs={4} md={4} sm={4} sx={{fontWeight: 500, fontSize: "0.9rem"}}>
                        Binding type
                    </Grid>
                    <Grid item xs={4} md={4} sm={4} sx={{fontWeight: 500, fontSize: "0.9rem"}}>
                        Binding value
                    </Grid>
                    <Grid item xs={2} md={2} sm={2} sx={{fontWeight: 500, fontSize: "0.9rem"}}>
                        Datatype
                    </Grid>
                </Grid>
                { inputParameters.map((inp:MethodVariables) => 
                    <MethodVariableSelector 
                        variable={inp} 
                        options={options}
                        key={`ip_${inp.name}`}
                        value={bindingsMap[inp.name]}
                        onChange={onBindingChange}
                    />) }
                { inputData.map((inp:MethodVariables) => 
                    <MethodVariableSelector 
                        variable={inp} 
                        options={options}
                        key={`id_${inp.name}`}
                        value={bindingsMap[inp.name]}
                        onChange={onBindingChange}
                    />) }
            </Fragment>
        ) : (
            <Grid container spacing={1} sx={{alignItems: "center"}}>
                <Grid item xs={12} md={12} sx={{textAlign: "center", color: "#444"}}> No data inputs </Grid>
            </Grid>
        )}

        {outputData.length > 0 ? (
            <Fragment>
                <Grid container spacing={1}  sx={{alignItems: "center"}}>
                    <Grid item xs={2} md={2} sm={2} sx={{textAlign: "right", fontSize: "0.9rem", fontWeight: 500}}>
                        Workflow output
                    </Grid>
                    <Grid item xs={7} md={7} sm={7} sx={{fontWeight: 500, fontSize: "0.9rem"}}>
                        Usage
                    </Grid>
                    <Grid item xs={2} md={2} sm={2} sx={{fontWeight: 500, fontSize: "0.9rem"}}>
                        Help
                    </Grid>
                </Grid>
                { outputData.map((out:MethodVariables) => 
                    <MethodVariableSelector 
                        variable={out} 
                        options={options}
                        key={`od_${out.name}`}
                        value={bindingsMap[out.name]}
                        onChange={onBindingChange}
                    />) }

            </Fragment>
        ) : (
            <Grid container spacing={1} sx={{alignItems: "center"}}>
                <Grid item xs={12} md={12} sx={{textAlign: "center", color: "#444"}}> This method does not generate any output </Grid>
            </Grid>
        )}
    </Box>
}