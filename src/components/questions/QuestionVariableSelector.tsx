import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { QuestionVariable, VariableOption, toMultiValueAssignation } from "DISK/interfaces";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useQuestionBindings } from "redux/hooks";
import { setQuestionBindings } from "redux/slices/forms";
import { useGetDynamicOptionsQuery } from "redux/apis/questions";

interface QuestionVariableProps {
    questionId: string,
    variable: QuestionVariable,
    showErrors: boolean;
}

export const QuestionVariableSelector = ({questionId, variable, showErrors}: QuestionVariableProps) => {
    const dispatch = useAppDispatch();
    const bindings = useQuestionBindings();
    const { data, isLoading, refetch, isFetching } = useGetDynamicOptionsQuery({cfg: {id:questionId, bindings:toMultiValueAssignation(bindings)}});
    const [options, setOptions] = useState<VariableOption[]>([]);
    const [error, setError] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<VariableOption|null>(null);
    const [selectedOptionLabel, setSelectedOptionLabel] = useState<string>("");

    useEffect(() => {
        if (data && variable && data[variable.variableName]) {
            let options = data[variable.variableName];
            setOptions(options);
            // See what to do when opt.len = 0
            //let selected = options.find(opt => selectedOption && opt.value === selectedOption.value);
            //if (selectedOption && !selected) {
            //    console.warn(`Value ${selectedOption} not found on ${options}`)
            //    //setSelectedOption(null);
            //    //setSelectedOptionLabel("");
            //}
        }
    }, [data, variable]);

    useEffect(() => {
        if (!isLoading && options && bindings) {
            let curValues = bindings[variable.id]?.values || [];
            if (curValues.length === 0) {
                setSelectedOption(null);
                setSelectedOptionLabel("");
                setError(false);
            } else {
                // Theres something selected.
                let value = curValues[0];
                let curOption = options.find(opt => opt.value === value);
                if (curOption) {
                    setSelectedOption(curOption);
                    setSelectedOptionLabel(curOption.label);
                    setError(false);
                } else {
                    // Option was selected but is NOT on the available options.
                    setError(true);
                    setSelectedOption(null); 
                    setSelectedOptionLabel(value);
                }
            }
        }
    }, [options, bindings, isLoading]);

    function onOptionChange(value: VariableOption|null): void {
        let newBindings = { ...bindings };
        if (value) {
            newBindings[variable.id] = {
                values: [value.value],
                type: value.value === value.label || ["TH","SA"].some(s=>s===value.value) ? "http://www.w3.org/2001/XMLSchema#string" : "http://www.w3.org/2001/XMLSchema#anyURI"
            }
        } else if (bindings[variable.id]) {
            delete newBindings[variable.id];
        }
        dispatch(setQuestionBindings( newBindings));
        refetch();
    }

    function fixOptionLabel (opt:VariableOption) : string {
        if (opt.label.startsWith("Has") && opt.label.endsWith(" (E)")) return opt.label.substring(3,opt.label.length-4);
        if (opt.label === "PrecentralCortex") return "Precentral Cortex";
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
                <TextField {...params} label={variable.variableName} variant="standard" 
                    error={error || showErrors && !selectedOption}
                    InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                        <React.Fragment>
                            {isLoading || isFetching && (<CircularProgress color="inherit" size={20} style={{marginRight: "30px"}} />)}
                            {params.InputProps.endAdornment}
                        </React.Fragment>
                    ),
                }}/>
            )}
        />
    );
}