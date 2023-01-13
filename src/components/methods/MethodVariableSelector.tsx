import { Grid, Select, MenuItem, Typography } from "@mui/material";
import { MethodInput, VariableBinding } from "DISK/interfaces";
import { useEffect, useState } from "react";


interface MethodVariableProps {
    variable: MethodInput,
    options: string[],
    value?: VariableBinding,
    onChange?: (newBinding:VariableBinding) => void,
}

export const MethodVariableSelector = ({variable, options, value, onChange}:MethodVariableProps) => {
    const [selected, setSelected] = useState<string>("");
    const [selectedType, setSelectedType] = useState<string>("");

    useEffect(() => {
        if (value) {
            let strValue : string = value.collection ? value.binding.substring(1, value.binding.length-1) : value.binding;
            setSelected(strValue);
            setSelectedType(value.type ? value.type : '');
        }
    }, [value])

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

    return <Grid container spacing={1} sx={{ alignItems: "center" }}>
        <Grid item xs={2} md={3} sm={4} sx={{ textAlign: "right", color: "#444", fontSize: "0.85rem" }}>{variable.name}:</Grid>
        <Grid item xs={6} md={5} sm={4}>
            <Select size="small" sx={{ display: 'inline-block', minWidth: "200px" }} variant="standard" label="Set binding"
                value={selected} onChange={(e) => onValueChange(e.target.value)}>
                <MenuItem value=""> None </MenuItem>
                {options.map((name: string, i: number) => <MenuItem key={`varopt_${i}`} value={name}>{name}</MenuItem>)}
            </Select>
        </Grid>
        <Grid item xs={2} md={2} sm={2}>
            {variable.type.length <= 1 ?
                <Typography>{variable === null || variable.type.length === 0 ? "" : variable.type[0].replaceAll(/.*#/g, '')}</Typography>
                :
                <Select size="small" sx={{ display: 'inline-block', minWidth: "120px" }} variant="standard" label="Set type"
                    value={selectedType || variable.type[0]} onChange={(e) => onTypeChange(e.target.value)}>
                    <MenuItem value=""> None </MenuItem>
                    {variable.type.map((url: string) => <MenuItem key={url} value={url}>{url.replaceAll(/.*#/g, '')}</MenuItem>)}
                </Select>
            }
        </Grid>
        <Grid item xs={2} md={2} sm={2}>
            {variable.dimensionality > 0 && (<Typography>Multiple</Typography>)}
        </Grid>
    </Grid>
}