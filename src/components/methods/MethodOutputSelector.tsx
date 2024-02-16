import { Grid, Select, MenuItem, Typography, Box, Tooltip, TextField } from "@mui/material";
import { MethodVariables, OutputType, VariableBinding } from "DISK/interfaces";
import { useEffect, useState } from "react";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface MethodInputSelectorProps {
    variable: MethodVariables,  // This variable represents a parameter
    value?: VariableBinding,    // Initial value
    onChange?: (newBinding:VariableBinding) => void,
}

interface SelectorField {
    label:string,
    tooltip:string,
}

interface SelectorExtraValue extends SelectorField {
    value: string,
}

const OUTPUT_SELECTORS : Record<OutputType, SelectorField> = {
    DROP: {
        label: "Ignore output",
        tooltip: "Do not store the file on DISK. The file will still be available on WINGS."
    },
    SAVE: {
        label: "Save file",
        tooltip: "The file will be stored on the DISK server."
    },
    PROCESS: {
        label: "Process file",
        tooltip: "The file will be read by DISK."
    }
}

const SECOND_SELECTORS : Record<OutputType, Record<string, SelectorField>> = {
    DROP: {},
    PROCESS: {
        _CONFIDENCE_VALUE_: {
            label: "Process as confidence value file",
            tooltip: "The first line of the file should be a point floating number.",
        }
    },
    SAVE: {
        _DOWNLOAD_ONLY_: {
            label: "Provide download link",
            tooltip: "The file will be available for download to any DISK user.",
        }, _IMAGE_: {
            label: "Store as image to be displayed",
            tooltip: "The file will be available for visualization and download.",
        }, _VISUALIZE_: {
            label: "Store as main visualization",
            tooltip: "The file will be available for visualization and download." +
                "The latest version of this file will be show in the hypothesis page.",
        }
    }
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
            isArray: variable.dimensionality > 1,
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
                        <MenuItem key={`varopt_${i}`} value={value}>{SECOND_SELECTORS[paramType][value].label}</MenuItem>)}
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
            {SECOND_SELECTORS[paramType] && SECOND_SELECTORS[paramType][bindValue] && (
                <Box style={{ zIndex: 10 }}>
                    <Tooltip arrow title={SECOND_SELECTORS[paramType][bindValue].tooltip}>
                        <HelpOutlineIcon />
                    </Tooltip>
                </Box>
            )}
        </Grid>
    </Grid>
}