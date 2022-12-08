import { Box, Grid, Skeleton } from "@mui/material";
import { Method, MethodInput, VariableBinding } from "DISK/interfaces";
import { useGetWorkflowVariablesQuery } from "DISK/queries";
import { Fragment, useEffect, useState } from "react";
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
    const {data:methodVariables, isLoading, isError} = useGetWorkflowVariablesQuery(
        {id:method.name, source:method.source},
        {skip:!method}
    );

    useEffect(() => {
        if (bindings && methodVariables) {
            let bindingMap : {[id:string]:VariableBinding} = {}
            methodVariables.forEach((mv:MethodInput) => {
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

    return <Box> 
    {isLoading ?
        <Skeleton height={"60px"}/>
    :
        (!methodVariables || !methodVariables.some(i => i.input) ?
            <Grid container spacing={1} sx={{alignItems: "center"}}>
                <Grid item xs={12} md={12} sx={{textAlign: "center", color: "#444"}}> No data inputs </Grid>
            </Grid>
        :
            <Fragment>
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
                { methodVariables.filter(i => i.input).map((inp:MethodInput) => 
                    <MethodVariableSelector 
                        variable={inp} 
                        options={options}
                        key={`inp_${inp.name}`}
                        value={bindingsMap[inp.name]}
                        onChange={onBindingChange}
                    />) }
            </Fragment>
        )
    }
    </Box>
}