import { Box, Grid, Skeleton, styled } from "@mui/material";
import { Method, MethodVariables, SeedBindings, VariableBinding } from "DISK/interfaces";
import { useEffect, useState } from "react";
import { useGetWorkflowVariablesQuery } from "redux/apis/workflows";
import { MethodParameterSelector } from "./MethodParameterSelector";
import { MethodInputSelector } from "./MethodInputSelector";
import { MethodOutputSelector } from "./MethodOutputSelector";

interface QuestionVariableProps {
    method: Method,
    options: string[],
    bindings: SeedBindings,
    onChange?: (newBindings:SeedBindings) => void,
    meta?: boolean,
    storedOutputs?: string[]
}

const TableContainer = styled(Box)(({ theme }) => ({
    border: "1px solid #eee",
    padding: "5px 0px",
    marginTop: "5px"
}));

const byVariableName = (acc:Record<string, VariableBinding>, cur:VariableBinding) => {
    acc[cur.variable] = cur;
    return acc;
}

export const MethodVariableList = ({method, options, bindings, onChange, meta=false, storedOutputs=[]}: QuestionVariableProps) => {
    const [bindingsMap, setBindingsMap] = useState<Record<keyof SeedBindings, Record<string, VariableBinding>>>({inputs:{},outputs:{},parameters:{}});
    const {data:methodVariables, isLoading } = useGetWorkflowVariablesQuery(
        {id:method.name, source:method.source.name},
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
    }, [methodVariables]);

    useEffect(() => {
        setBindingsMap({
            parameters: bindings.parameters.reduce<Record<string, VariableBinding>>(byVariableName, {}),
            inputs: bindings.inputs.reduce<Record<string, VariableBinding>>(byVariableName, {}),
            outputs: bindings.outputs.reduce<Record<string, VariableBinding>>(byVariableName, {}),
        })
    }, [bindings]);

    const onBindingChange = (kind: keyof SeedBindings) => (newBinding:VariableBinding) => {
        if (newBinding) {
            if (onChange) {
                onChange({
                    ...bindings,
                    [kind]: Object.values({...bindingsMap[kind], [newBinding.variable]: newBinding})
                })
            } else {
                // If is not bind to anything, manage state here.TODO
            }
        }
    }

    if (isLoading)
        return <Skeleton height={"60px"}/>
    return <Box> 
        {inputParameters.length > 0 ? (
            <TableContainer>
                <Grid container spacing={1}  sx={{alignItems: "center", padding: "1px 0px", borderBottom: "1px solid #eee"}}>
                    <Grid item xs={2} md={2} sm={2} sx={{textAlign: "right", fontSize: "0.9rem", fontWeight: 500}}>
                        Parameters
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
                    <MethodParameterSelector 
                        variable={inp} 
                        options={options}
                        key={`ip_${inp.name}`}
                        value={bindingsMap.parameters[inp.name]}
                        meta={meta}
                        onChange={onBindingChange('parameters')}
                    />) }
            </TableContainer>
        ) : (
            <Grid container spacing={1} sx={{alignItems: "center"}}>
                <Grid item xs={12} md={12} sx={{textAlign: "center", color: "#444"}}> No parameters to choose </Grid>
            </Grid>
        )}
        {inputData.length > 0 ? (
            <TableContainer>
                <Grid container spacing={1}  sx={{alignItems: "center", padding: "1px 0px", borderBottom: "1px solid #eee"}}>
                    <Grid item xs={2} md={2} sm={2} sx={{textAlign: "right", fontSize: "0.9rem", fontWeight: 500}}>
                        Input data
                    </Grid>
                    <Grid item xs={4} md={4} sm={4} sx={{fontWeight: 500, fontSize: "0.9rem"}}>
                        Binding type
                    </Grid>
                    <Grid item xs={4} md={4} sm={4} sx={{fontWeight: 500, fontSize: "0.9rem"}}>
                        Binding value
                    </Grid>
                    <Grid item xs={2} md={2} sm={2} sx={{fontWeight: 500, fontSize: "0.9rem"}}>
                        Filetype
                    </Grid>
                </Grid>
                { inputData.map((inp:MethodVariables) => 
                    <MethodInputSelector 
                        variable={inp} 
                        options={options}
                        key={`id_${inp.name}`}
                        value={bindingsMap.inputs[inp.name]}
                        onChange={onBindingChange('inputs')}
                        meta={meta}
                    />) }
            </TableContainer>
        ) : (
            <Grid container spacing={1} sx={{alignItems: "center"}}>
                <Grid item xs={12} md={12} sx={{textAlign: "center", color: "#444"}}> No data inputs required </Grid>
            </Grid>
        )}

        {outputData.length > 0 ? (
            <TableContainer>
                <Grid container spacing={1}  sx={{alignItems: "center", padding: "1px 0px", borderBottom: "1px solid #eee"}}>
                    <Grid item xs={2} md={2} sm={2} sx={{textAlign: "right", fontSize: "0.9rem", fontWeight: 500}}>
                        Generated outputs
                    </Grid>
                    <Grid item xs={4} md={4} sm={4} sx={{fontWeight: 500, fontSize: "0.9rem"}}>
                        Usage
                    </Grid>
                    <Grid item xs={4} md={4} sm={4} sx={{fontWeight: 500, fontSize: "0.9rem"}}>
                        Binding value
                    </Grid>
                    <Grid item xs={2} md={2} sm={2} sx={{fontWeight: 500, fontSize: "0.9rem"}}>
                        Help
                    </Grid>
                </Grid>
                { outputData.map((out:MethodVariables) => 
                    <MethodOutputSelector 
                        variable={out} 
                        key={`od_${out.name}`}
                        value={bindingsMap.outputs[out.name]}
                        onChange={onBindingChange('outputs')}
                    />) }

            </TableContainer>
        ) : (
            <Grid container spacing={1} sx={{alignItems: "center"}}>
                <Grid item xs={12} md={12} sx={{textAlign: "center", color: "#444"}}> This method does not generate any output </Grid>
            </Grid>
        )}
    </Box>
}