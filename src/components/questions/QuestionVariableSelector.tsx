import { Autocomplete, Box, CircularProgress, TextField } from "@mui/material";
import { Question, QuestionVariable, VariableOption } from "DISK/interfaces";
import { useGetDynamicOptionsQuery } from "DISK/queries";
import React, { useEffect, useState } from "react";
import { OptionBinding } from "./BoundingBoxMap";

interface QuestionVariableProps {
    question: Question,
    variable: QuestionVariable,
    onChange?: (bindings:OptionBinding[]) => void
}

export const QuestionVariableSelector = ({question, variable, onChange}: QuestionVariableProps) => {
    const [bindings, setBindings] = useState<{[id:string]: string}>({});
    const { data, isLoading, isError } = useGetDynamicOptionsQuery({cfg: {id:question.id, bindings:bindings}});
    const [options, setOptions] = useState<VariableOption[]>([]);
    const [selectedOption, setSelectedOption] = useState<VariableOption|null>(null);
    const [selectedOptionLabel, setSelectedOptionLabel] = useState<string>("");

    useEffect(() => {
        if (data && variable && data[variable.variableName]) {
            setOptions(data[variable.variableName]);
            if (selectedOption && !data[variable.variableName].some(v => v.value === selectedOption.value)) {
                setSelectedOption(null);
                setSelectedOptionLabel("");
            }
        }
    }, [data, variable]);

    function onOptionChange(value: VariableOption|null): void {
        setSelectedOption(value);
    }

    return (
        <Autocomplete size="small" sx={{ display: 'inline-block', minWidth: "250px" }}
            options={options}
            value={selectedOption ? selectedOption : null}
            onChange={(_, value: VariableOption|null) => onOptionChange(value)}
            inputValue={selectedOptionLabel}
            onInputChange={(_, newIn) => setSelectedOptionLabel(newIn)}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            getOptionLabel={(option) => option.label}
            loading={isLoading}
            renderInput={(params) => (
                <TextField {...params} label={variable.variableName} variant="standard" InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                        <React.Fragment>
                            {isLoading && (<CircularProgress color="inherit" size={20} />)}
                            {params.InputProps.endAdornment}
                        </React.Fragment>
                    ),
                }}/>
            )}
        />
    );
}