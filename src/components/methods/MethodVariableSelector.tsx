import { Grid, Select, MenuItem, Typography, Box, Tooltip, TextField } from "@mui/material";
import { MethodInput, VariableBinding } from "DISK/interfaces";
import { Fragment, useEffect, useState } from "react";
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import zIndex from "@mui/material/styles/zIndex";
import { FieldBox } from "components/Styles";

interface MethodVariableProps {
    variable: MethodInput,
    options: string[],
    value?: VariableBinding,
    onChange?: (newBinding:VariableBinding) => void,
}

type SelectorIds = 'VARIABLE_SELECTOR' | 'DEFAULT_VALUE' | 'FULL_QUERY' | 'USER_INPUT' ;
interface SelectorField {
    label:string,
    tooltip:string,
}

type FieldMap = {
    [key in SelectorIds]: SelectorField
}

const SELECTORS : FieldMap = {
    VARIABLE_SELECTOR: {
        label: "Use a DISK variable",
        tooltip: "Use a variable defined on the question template or data query. Values will be send after the query execution."
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

export const MethodVariableSelector = ({variable, options, value, onChange}:MethodVariableProps) => {
    const [selected, setSelected] = useState<string>("");
    const [selectedType, setSelectedType] = useState<string>("");
    const [selectorKind, setSelectorKind] = useState<SelectorIds>("DEFAULT_VALUE");
    const [userInput, setUserInput] = useState<string>("");

    useEffect(() => {
        if (value) {
            let strValue : string = value.collection ? value.binding.substring(1, value.binding.length-1) : value.binding;
            setSelected(strValue);
            setSelectedType(value.type ? value.type : '');
            if (strValue.startsWith('?') || strValue.length > 2 && strValue.startsWith('[') && strValue.charAt(1) === '?') {
                setSelectorKind('VARIABLE_SELECTOR');
            }
        }
    }, [value])

    const onSelectorChange = (newSelector:SelectorIds) => {
        setSelectorKind(newSelector);
        if (onChange) {
            onChange({
                variable: variable.name,
                collection: variable.dimensionality>0,
                type: selectedType ? selectedType : null,
                binding: newSelector === 'DEFAULT_VALUE' ? "" : 
                        (newSelector === 'FULL_QUERY' ? "_CSV_" :
                                (newSelector === "VARIABLE_SELECTOR" ? (variable.dimensionality > 0 ? "[" + selected + "]" : selected) :
                                userInput)
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

    return <Grid container spacing={1} sx={{ alignItems: "center" }}>
        <Grid item xs={2} md={2} sm={2} sx={{ textAlign: "right", color: "#444", fontSize: "0.85rem" }}>{variable.name}:</Grid>
        <Grid item xs={4} md={4} sm={4}>
            <Box style={{ display: "flex" }}>
                <Select size="small" sx={{ display: 'inline-block', width: "100%"}} variant="standard" label="Type of binding"
                    value={selectorKind} onChange={(e) => onSelectorChange(e.target.value as SelectorIds)}>
                    {Object.keys(SELECTORS).map((id: string, i: number) => <MenuItem key={id} value={id}>{SELECTORS[id as SelectorIds].label}</MenuItem>)}
                </Select>
                <Box style={{ zIndex: 10 }}>
                    <Tooltip arrow title={SELECTORS[selectorKind].tooltip}>
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
}