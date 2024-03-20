import { Grid, Select, MenuItem, Box, Tooltip } from "@mui/material";
import { MethodVariables, OutputType, VariableBinding } from "DISK/interfaces";
import { useEffect, useState } from "react";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { SECOND_SELECTORS, OUTPUT_SELECTORS, OutputBindingValue } from "components/files/outputs";

interface MethodInputSelectorProps {
    variable: MethodVariables,  // This variable represents a parameter
    value?: VariableBinding,    // Initial value
    onChange?: (newBinding:VariableBinding) => void,
}

export const MethodOutputSelector = ({variable, value, onChange}:MethodInputSelectorProps) => {
    const [paramType, setParamType] = useState<OutputType>('DROP');
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
                value && value.type ?  value.type as OutputType : "DROP"
            )
        }
    }, [variable, value]);

    const createCurrentBinding = () => {
        let newBinding: VariableBinding = {
            variable: variable.name,
            isArray: variable.dimensionality > 0,
            type: paramType,
            binding: [bindValue]
        }
        if (dataType) newBinding.datatype = dataType;
        return newBinding;
    }

    const onSelectorChange = (newParamType:OutputType) => {
        let newValue = newParamType === 'PROCESS' ? "_CONFIDENCE_VALUE_" : (newParamType === 'SAVE' ? "_DOWNLOAD_ONLY_" : null);
        if (onChange) {
            onChange({
                ...createCurrentBinding(),
                type: newParamType,
                binding: newValue ? [newValue] : []
            })
        } else {
            setBindValue(newValue || "");
            setParamType(newParamType);
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
            case 'SAVE':
            case 'PROCESS':
                return <Select size="small" sx={{ display: 'inline-block', width: "100%"}} variant="standard" label="Set binding"
                    value={bindValue} onChange={(e) => onBindValueChange(e.target.value)} required>
                    {Object.keys(SECOND_SELECTORS[paramType]).map((value: string, i: number) => 
                        <MenuItem key={`varopt_${i}`} value={value}>{SECOND_SELECTORS[paramType][value as OutputBindingValue]!.label}</MenuItem>)}
                </Select>
            case 'DROP':
            default:
                return <Box>This output will be ignore</Box>
        }
    }

    return <Grid container spacing={1} sx={{ alignItems: "center" }}>
        <Grid item xs={2} md={2} sm={2} sx={{ textAlign: "right", color: "#444", fontSize: "0.85rem" }}>{variable.name}:</Grid>
        <Grid item xs={4} md={4} sm={4}>
            <Box style={{ display: "flex", alignContent: "center" }}>
                <Select size="small" sx={{ display: 'inline-block', width: "100%" }} variant="standard" label="Type of binding"
                    value={paramType} onChange={(e) => onSelectorChange(e.target.value as OutputType)}>
                    {Object.keys(OUTPUT_SELECTORS).map((id: string, i: number) => <MenuItem key={id} value={id}>{OUTPUT_SELECTORS[id as OutputType].label}</MenuItem>)}
                </Select>
                <Box style={{ zIndex: 10 }}>
                    <Tooltip arrow title={OUTPUT_SELECTORS[paramType].tooltip}>
                        <HelpOutlineIcon />
                    </Tooltip>
                </Box>
            </Box>
        </Grid>
        <Grid item xs={4} md={4} sm={4}>
            {renderBindingSelector()}
        </Grid>
        <Grid item xs={2} md={2} sm={2}>
            {SECOND_SELECTORS[paramType] && SECOND_SELECTORS[paramType][bindValue as OutputBindingValue] && (
                <Box style={{ zIndex: 10 }}>
                    <Tooltip arrow title={SECOND_SELECTORS[paramType][bindValue as OutputBindingValue]!.tooltip}>
                        <HelpOutlineIcon />
                    </Tooltip>
                </Box>
            )}
        </Grid>
    </Grid>
}