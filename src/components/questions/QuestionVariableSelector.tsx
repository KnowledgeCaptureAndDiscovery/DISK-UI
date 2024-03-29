import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { QuestionVariable, VariableOption } from "DISK/interfaces";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useQuestionBindings } from "redux/hooks";
import { setQuestionBindings } from "redux/slices/forms";
import { useGetDynamicOptionsQuery } from "redux/apis/questions";

interface QuestionVariableProps {
    questionId: string,
    variable: QuestionVariable,
}

export const QuestionVariableSelector = ({questionId, variable}: QuestionVariableProps) => {
    const dispatch = useAppDispatch();
    const bindings = useQuestionBindings();
    const { data, isLoading, refetch } = useGetDynamicOptionsQuery({cfg: {id:questionId, bindings:bindings}});
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

    useEffect(() => {
        if (options && bindings) {
            let curValue : string = bindings[variable.id];
            if (options.length === 0 || !curValue || !options.some(o => o.value === curValue)) {
                setSelectedOption(null);
                setSelectedOptionLabel("");
            } else {
                let selectedOption : VariableOption = options.filter(o => o.value === curValue)[0];
                setSelectedOption(selectedOption);
                setSelectedOptionLabel(selectedOption.label);
            }
        }
    }, [bindings, options]);

    function onOptionChange(value: VariableOption|null): void {
        let newBindings = { ...bindings };
        if (value) {
            newBindings[variable.id] = value.value;
        } else if (bindings[variable.id]) {
            delete newBindings[variable.id];
        }
        dispatch(setQuestionBindings( newBindings));
        refetch();
    }

    function fixOptionLabel (opt:VariableOption) : string {
        if (opt.label === "SA") return "Surface Area";
        if (opt.label === "TH") return "Thickness";
        return opt.label;
    }

    return (
        <Autocomplete size="small" sx={{ display: 'inline-block', minWidth: "250px" }}
            options={options}
            value={selectedOption ? selectedOption : null}
            onChange={(_, value: VariableOption|null) => onOptionChange(value)}
            inputValue={selectedOptionLabel}
            onInputChange={(_, newIn) => setSelectedOptionLabel(newIn)}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            getOptionLabel={fixOptionLabel}
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