import { Grid, Select, MenuItem, Typography, Box, Tooltip, TextField } from "@mui/material";
import { MethodVariables, ParameterMetaType, ParameterType, VariableBinding } from "DISK/interfaces";
import { useEffect, useState } from "react";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface MethodParamSelectorProps {
    variable: MethodVariables,  // This variable represents a parameter
    options: string[],          // Variable names of dataquery and question.
    value?: VariableBinding,    // Initial value
    onChange?: (newBinding:VariableBinding) => void,
    meta?: boolean
}

interface SelectorField {
    label:string,
    tooltip:string,
}

const PARAM_SELECTORS : Record<ParameterType, SelectorField> = {
    DEFAULT: {
        label: "Use workflow default value",
        tooltip: "No value will be send. The workflow will run with default values."
    },
    FREEFORM: {
        label: "Write a value",
        tooltip: "Sends the value written here."
    },
    QUERY_VARIABLE: {
        label: "Use a DISK variable",
        tooltip: "Use a variable defined on the question template or data query template. Values will be send after the query execution."
    }
}

const META_PARAM_SELECTORS : Record<ParameterMetaType, SelectorField> = {
    ...PARAM_SELECTORS,
    DISK_DATA: {
        label: "Use metadata generated on previous runs",
        tooltip: "Send one or multiple metadata records this and previous executions of this LOI."
    }
}
export const MethodParameterSelector = ({variable, options, value, onChange, meta=false}:MethodParamSelectorProps) => {
    const [paramType, setParamType] = useState<ParameterMetaType>('DEFAULT');
    const [dataType, setDatatype] = useState<string>('');
    const [bindValue, setBindValue] = useState<string>('');

    useEffect(() => {
        if (variable) {
            setDatatype(
                value && value.datatype ?
                    value.datatype
                    : (variable.type && variable.type.length > 0 ? variable.type[0] : "")
            )
            setBindValue(value && value.binding && value.binding[0] || ""); //This assumes only one binding for param assignation.
            setParamType(
                value && value.type ?  value.type as ParameterMetaType : "DEFAULT"
            )
        }
    }, [variable, value]);

    const createCurrentBinding = () => {
        //FIXME: This is a hack, there are no way to send multiple parameters as a list for the moment
        // so we transform demographic_value into a list here.
        let newBinding: VariableBinding = {
            variable: variable.name,
            isArray: variable.dimensionality > 0 || variable.name === 'demographic_value',
            type: paramType,
            binding: [bindValue]
        }
        if (dataType) newBinding.datatype = dataType;
        return newBinding;
    }

    const onSelectorChange = (newParamType:ParameterMetaType) => {
        if (onChange) {
            onChange({
                ...createCurrentBinding(),
                type: newParamType,
                binding: []
            })
        } else {
            setBindValue("");
            setParamType(newParamType);
        }
    };

    const onDatatypeChange = (newDatatype:string) => {
        if (onChange) {
            onChange({
                ...createCurrentBinding(),
                datatype: newDatatype
            })
        } else {
            setDatatype(newDatatype);
        }
    };

    const onBindValueChange = (value:string) => {
        if (onChange) {
            onChange({
                ...createCurrentBinding(),
                binding: [value]
            })
        } else {
            setBindValue(value)
        }
    };

    const renderBindingSelector = () => {
        switch (paramType) {
            case 'FREEFORM':
                return <TextField size="small" style={{width:"100%"}} value={bindValue} onChange={(e) => onBindValueChange(e.target.value)}></TextField>
            case 'QUERY_VARIABLE':
                return <Select size="small" sx={{ display: 'inline-block', width: "100%"}} variant="standard" label="Set binding"
                    value={bindValue} onChange={(e) => onBindValueChange(e.target.value)}>
                    <MenuItem value=""> None </MenuItem>
                    {options.map((name: string, i: number) => <MenuItem key={`varopt_${i}`} value={name}>{name}</MenuItem>)}
                </Select>
            //case 'DISK_DATA':
            //    return <Select size="small" sx={{ display: 'inline-block', width: "100%"}} variant="standard" label="Select workflow output"
            //        value={selected} onChange={(e) => onValueChange(e.target.value)}>
            //        <MenuItem value=""> None </MenuItem>
            //        {storedOutputs.map((name: string, i: number) => <MenuItem key={`varopt_${i}`} value={"!"+name}>{name}</MenuItem>)}
            //    </Select>
            case 'DEFAULT':
            default:
                return <Box>0</Box>
        }
    }

    const SELECTED_INPUT_SELECTORS = meta ? META_PARAM_SELECTORS : PARAM_SELECTORS;

    return <Grid container spacing={1} sx={{ alignItems: "center" }}>
        <Grid item xs={2} md={2} sm={2} sx={{ textAlign: "right", color: "#444", fontSize: "0.85rem" }}>{variable.name}:</Grid>
        <Grid item xs={4} md={4} sm={4}>
            <Box style={{ display: "flex" }}>
                <Select size="small" sx={{ display: 'inline-block', width: "100%" }} variant="standard" label="Type of binding"
                    value={paramType} onChange={(e) => onSelectorChange(e.target.value as ParameterType)}>
                    {Object.keys(SELECTED_INPUT_SELECTORS).map((id: string, i: number) => <MenuItem key={id} value={id}>{SELECTED_INPUT_SELECTORS[id as ParameterType].label}</MenuItem>)}
                </Select>
                <Box style={{ zIndex: 10 }}>
                    <Tooltip arrow title={SELECTED_INPUT_SELECTORS[paramType as ParameterType].tooltip}>
                        <HelpOutlineIcon />
                    </Tooltip>
                </Box>
            </Box>
        </Grid>
        <Grid item xs={4} md={4} sm={4}>
            {renderBindingSelector()}
        </Grid>
        <Grid item xs={2} md={2} sm={2}>
            {variable.type.length <= 1 ?
                <Typography>{variable === null || variable.type.length === 0 ? "" : variable.type[0].replaceAll(/.*#/g, '')}</Typography>
                :
                <Box style={{ display: "flex" }}>
                    {variable.dimensionality > 0 && (<span style={{ whiteSpace: "nowrap", marginRight: "5px" }}>A list of </span>)}
                    <Select size="small" sx={{ display: 'inline-block', width: "100%" }} variant="standard" label="Set datatype"
                        value={dataType || variable.type[0]} onChange={(e) => onDatatypeChange(e.target.value)}>
                        <MenuItem value=""> None </MenuItem>
                        {variable.type.map((url: string) => <MenuItem key={url} value={url}>{url.replaceAll(/.*#/g, '')}</MenuItem>)}
                    </Select>
                </Box>
            }
        </Grid>
    </Grid>
}