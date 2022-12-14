import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { Question, QuestionVariable, VariableOption } from "DISK/interfaces";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { setQuestionBindings } from "redux/slices/forms";
import { OptionBinding } from "./BoundingBoxMap";
import { useGetDynamicOptionsQuery } from "redux/apis/questions";

interface QuestionVariableProps {
    variable: QuestionVariable,
    onChange?: (bindings:OptionBinding[]) => void
}

export const QuestionVariableSelector = ({variable, onChange}: QuestionVariableProps) => {
    const dispatch = useAppDispatch();
    const bindings = useAppSelector((state:RootState) => state.forms.questionBindings);
    const questionId = useAppSelector((state:RootState) => state.forms.selectedQuestionId);

    const { data, isLoading, isError, refetch } = useGetDynamicOptionsQuery({cfg: {id:questionId, bindings:bindings}});
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
            let curValue : string = bindings[variable.variableName];
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
            newBindings[variable.variableName] = value.value;
        } else if (bindings[variable.variableName]) {
            delete newBindings[variable.variableName];
        }
        dispatch(setQuestionBindings({
            id: questionId,
            map: newBindings
        }));
        if (onChange) onChange([
            {
                variable: variable,
                value: value != null ? {
                    id: value.value,
                    name: value.label,
                } : null
            } as OptionBinding,
        ]);
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