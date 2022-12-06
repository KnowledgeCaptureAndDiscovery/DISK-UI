import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { Question, QuestionVariable, VariableOption } from "DISK/interfaces";
import { useGetDynamicOptionsQuery } from "DISK/queries";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { setQuestionBindings } from "redux/stores/forms";
import { OptionBinding } from "./BoundingBoxMap";

interface QuestionVariableProps {
    question: Question,
    variable: QuestionVariable,
    onChange?: (bindings:OptionBinding[]) => void
}

export const QuestionVariableSelector = ({question, variable, onChange}: QuestionVariableProps) => {
    const dispatch = useAppDispatch();
    const bindings = useAppSelector((state:RootState) => state.forms.questionBindings);
    const { data, isLoading, isError, refetch } = useGetDynamicOptionsQuery({cfg: {id:question.id, bindings:bindings}});
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
        let newBindings = { ...bindings };
        if (value) {
            newBindings[variable.variableName] = value.value;
        } else if (bindings[variable.variableName]) {
            delete newBindings[variable.variableName];
        }
        dispatch(setQuestionBindings(newBindings));
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