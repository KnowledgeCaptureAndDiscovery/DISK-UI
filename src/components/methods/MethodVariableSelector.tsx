import { Grid, Select, MenuItem, Typography, Box, Tooltip, TextField } from "@mui/material";
import { MethodVariables, VariableBinding } from "DISK/interfaces";
import { Fragment, useEffect, useState } from "react";
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import zIndex from "@mui/material/styles/zIndex";
import { FieldBox } from "components/Styles";

interface MethodVariableProps {
    variable: MethodVariables,
    options: string[],
    value?: VariableBinding,
    onChange?: (newBinding:VariableBinding) => void,
}

type InputSelectorIds = 'VARIABLE_SELECTOR' | 'DEFAULT_VALUE' | 'FULL_QUERY' | 'USER_INPUT' ;
export type OutputSelectorIds = '_DO_NO_STORE_' | '_DOWNLOAD_ONLY_' | '_IMAGE_' | '_VISUALIZE_' | '_CONFIDENCE_VALUE_';
interface SelectorField {
    label:string,
    tooltip:string,
}

type InputFieldMap = {
    [key in InputSelectorIds]: SelectorField
}

type OutputFieldMap = {
    [key in OutputSelectorIds]: SelectorField
}

const INPUT_SELECTORS : InputFieldMap = {
    VARIABLE_SELECTOR: {
        label: "Use a DISK variable",
        tooltip: "Use a variable defined on the question template or data query template. Values will be send after the query execution."
    },
    DEFAULT_VALUE: {
        label: "Use workflow default value",
        tooltip: "No value will be send. The workflow will run with default values."
    },
    FULL_QUERY: {
        label: "Send full query",
        tooltip: "Send all results of the query execution as a CSV file."
    },
    USER_INPUT: {
        label: "Write a value",
        tooltip: "Sends the value written here."
    }
}

const OUTPUT_SELECTORS : OutputFieldMap = {
    _DO_NO_STORE_: {
        label: "Do not save",
        tooltip: "Do not store the file on DISK. The file will still be available on WINGS."
    },
    _DOWNLOAD_ONLY_: {
        label: "Save file - Provide download link.",
        tooltip: "The file will be stored on the DISK server and make available for download to any DISK user."
    },
    _IMAGE_: {
        label: "Save file - Store as image to be displayed",
        tooltip: "The file will be stored on the DISK server and make available for visualization and download."
    },
    _VISUALIZE_: {
        label: "Save file - Store as main visualization",
        tooltip: "The file will be stored on the DISK server and make available for visualization and download." +
            "The latest version of this file will be show in the hypothesis page.",
    },
    _CONFIDENCE_VALUE_: {
        label: "Process file - Process as confidence value file",
        tooltip: "The file will be read by DISK. The first line of the file should be a point floating number."
    }
}

export const MethodVariableSelector = ({variable, options, value, onChange}:MethodVariableProps) => {
    const [selected, setSelected] = useState<string>("");
    const [selectedType, setSelectedType] = useState<string>("");
    const [selectorKind, setSelectorKind] = useState<InputSelectorIds>("DEFAULT_VALUE");
    const [outputValue, setOutputValue] = useState<OutputSelectorIds>("_DO_NO_STORE_");
    const [userInput, setUserInput] = useState<string>("");

    //const [lastValue, setLastValue] = useState<string>("-1");
    useEffect(() => {
        if (variable.input) {
            if (value) {
                if (value.binding !== selected) {
                    let strValue : string = value.collection ? value.binding.substring(1, value.binding.length-1) : value.binding;
                    setSelected(strValue);
                    setSelectedType(value.type ? value.type : '');
                    if (strValue.startsWith('?'))
                        setSelectorKind('VARIABLE_SELECTOR');
                    else if (strValue === "_CSV_")
                        setSelectorKind('FULL_QUERY');
                    else
                        setSelectorKind('USER_INPUT');
                }
            } else {
                setSelectorKind('DEFAULT_VALUE');
            }
        } else {
            if (value) {
                if (value.binding !== outputValue) {
                    let strValue: string = value.collection ? value.binding.substring(1, value.binding.length - 1) : value.binding;
                    setOutputValue(strValue as OutputSelectorIds);
                }
            } else {
                setOutputValue('_DO_NO_STORE_');
            }
        }
    }, [value])

    const onSelectorChange = (newSelector:InputSelectorIds) => {
        setSelectorKind(newSelector);
        if (onChange) {
            let selectedValue = variable.dimensionality > 0 ? (
                selected.startsWith("[") && selected.endsWith("]") ? ( //Is already a list
                    selected
                ) : (
                    "[" + selected + "]"
                )
            ) : (
                selected.startsWith("[") && selected.endsWith("]") ? ( //Is a list
                    selected.substring(1,selected.length-1)
                ) : (
                    selected
                )

            );

            onChange({
                variable: variable.name,
                collection: variable.dimensionality>0,
                type: selectedType ? selectedType : null,
                binding: newSelector === 'DEFAULT_VALUE' ? "" : 
                        (newSelector === 'FULL_QUERY' ? "_CSV_" :
                                (newSelector === "VARIABLE_SELECTOR" ? selectedValue : userInput)
                        )
            });
        }
    }

    const onUserInputChange = (newInput:string) => {
        setUserInput(newInput);
        if (onChange && selectorKind === 'USER_INPUT') {
            //TODO: check if the new input is a collection if dimensionality > 0
            onChange({
                variable: variable.name,
                collection: variable.dimensionality>0,
                type: selectedType ? selectedType : null,
                binding: newInput
            });
        }
    }

    const onValueChange = (newValue:string) => {
        setSelected(newValue);
        if (onChange) {
            onChange({
                variable: variable.name,
                collection: variable.dimensionality>0,
                type: selectedType ? selectedType : null,
                binding: newValue && variable.dimensionality > 0 ? "[" + newValue + "]" : newValue
            });
        }
    }

    const onTypeChange = (newType:string) => {
        setSelectedType(newType);
        if (onChange) {
            onChange({
                variable: variable.name,
                collection: variable.dimensionality>0,
                type: newType ? newType : null,
                binding: selected && variable.dimensionality > 0 ? "[" + selected + "]" : selected
            });
        }
    }

    const onOutputChange = (newValue:OutputSelectorIds) => {
        setOutputValue(newValue);
        if (onChange) {
            onChange({
                variable: variable.name,
                collection: false,
                type: null,
                binding: newValue
            });
        }
    }

    const renderBindingSelector = () => {
        switch (selectorKind) {
            case 'FULL_QUERY':
                return <Box>Query results will be send as CSV</Box>
            case 'USER_INPUT':
                return <TextField size="small" style={{width:"100%"}} value={userInput} onChange={(e) => onUserInputChange(e.target.value)}></TextField>
            case 'VARIABLE_SELECTOR':
                return <Select size="small" sx={{ display: 'inline-block', width: "100%"}} variant="standard" label="Set binding"
                    value={selected} onChange={(e) => onValueChange(e.target.value)}>
                    <MenuItem value=""> None </MenuItem>
                    {options.map((name: string, i: number) => <MenuItem key={`varopt_${i}`} value={name}>{name}</MenuItem>)}
                </Select>
            case 'DEFAULT_VALUE':
            default:
                return <Box>0</Box>
        }
    }

    if (variable.input)
        return <Grid container spacing={1} sx={{ alignItems: "center" }}>
            <Grid item xs={2} md={2} sm={2} sx={{ textAlign: "right", color: "#444", fontSize: "0.85rem" }}>{variable.name}:</Grid>
            <Grid item xs={4} md={4} sm={4}>
                <Box style={{ display: "flex" }}>
                    <Select size="small" sx={{ display: 'inline-block', width: "100%"}} variant="standard" label="Type of binding"
                        value={selectorKind} onChange={(e) => onSelectorChange(e.target.value as InputSelectorIds)}>
                        {Object.keys(INPUT_SELECTORS).map((id: string, i: number) => <MenuItem key={id} value={id}>{INPUT_SELECTORS[id as InputSelectorIds].label}</MenuItem>)}
                    </Select>
                    <Box style={{ zIndex: 10 }}>
                        <Tooltip arrow title={INPUT_SELECTORS[selectorKind as InputSelectorIds].tooltip}>
                            <HelpOutlineIcon/>
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
                    <Box style={{display: "flex"}}>
                        {variable.dimensionality > 0 && (<span style={{whiteSpace:"nowrap", marginRight: "5px"}}>A list of </span>)}
                        <Select size="small" sx={{display: 'inline-block', width: "100%" }} variant="standard" label="Set datatype"
                            value={selectedType || variable.type[0]} onChange={(e) => onTypeChange(e.target.value)}>
                            <MenuItem value=""> None </MenuItem>
                            {variable.type.map((url: string) => <MenuItem key={url} value={url}>{url.replaceAll(/.*#/g, '')}</MenuItem>)}
                        </Select>
                    </Box>
                }
            </Grid>
        </Grid>
    else
        return <Grid container spacing={1} sx={{ alignItems: "center" }}>
            <Grid item xs={2} md={2} sm={2} sx={{ textAlign: "right", color: "#444", fontSize: "0.85rem" }}>{variable.name}:</Grid>
            <Grid item xs={7} md={7} sm={7}>
                <Select size="small" sx={{ display: 'inline-block', width: "calc(100% - 10px)" }} variant="standard" label="Usage"
                    value={outputValue} onChange={(e) => onOutputChange(e.target.value as OutputSelectorIds)}>
                    {Object.keys(OUTPUT_SELECTORS).map((id: string, i: number) => <MenuItem key={id} value={id}>{OUTPUT_SELECTORS[id as OutputSelectorIds].label}</MenuItem>)}
                </Select>
            </Grid>
            <Grid item xs={2} md={2} sm={2}>
                <Box style={{ zIndex: 10 }}>
                    <Tooltip arrow title={OUTPUT_SELECTORS[outputValue as OutputSelectorIds]?.tooltip || ""}>
                        <HelpOutlineIcon />
                    </Tooltip>
                </Box>
            </Grid>
        </Grid>
}