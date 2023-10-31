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
    const [selectedOption, setSelectedOption] = useState<VariableOption|VariableOption[]|null>(null);
    const [selectedOptionLabel, setSelectedOptionLabel] = useState<string>("");

    // When max cardinality is 0 we interpert it as no upper bound.
    const allowsMultiple = variable.minCardinality >= 0 && (variable.maxCardinality === 0 || variable.maxCardinality > 1);

    const clearSelected = () => {
        setSelectedOption(null);
        setSelectedOptionLabel("");
    }

    // data is a map with the variables and they respective options.
    // Here we set all available options and check if the current value is among them.
    useEffect(() => {
        if (data && variable) {
            let optionList = data[variable.variableName];
            if (optionList && optionList.length > 0) {
                setOptions(optionList);
            } else {
                setOptions([]);
            }
        }
    }, [data, variable]);

    // bindings are the current selected values for this question template.
    // Here we set them in the form.
    useEffect(() => {
        if (options && bindings) {
            let curValues : string[] = bindings[variable.id];
            
            if (options.length === 0 || !curValues || curValues.length === 0) {
                clearSelected();
            } else {
                // Search for the selected value on the option list
                if (allowsMultiple) {
                    let opts = options.filter(o => curValues.some(v => v === o.value));
                    if (variable.maxCardinality != 0 && opts.length > variable.maxCardinality) {
                        console.warn("max cardinality rule broke");
                        //TODO: show some notification.
                        opts = opts.splice(0,variable.maxCardinality);
                    }
                    setSelectedOption(opts);
                    //setSelectedOptionLabel(opts.map(o => o.label).join(","));
                } else {
                    let opt = options.find(o => o.value === curValues[0]);
                    if (opt) {
                        setSelectedOption(opt);
                        setSelectedOptionLabel(opt.label);
                    } else {
                        console.warn("Selected option not in option list:\nOption:");
                        console.warn(opt);
                        console.warn("Option List:");
                        console.warn(options);
                    }
                }
            }
        }
    }, [bindings, options]);

    function onOptionChange(value: VariableOption|VariableOption[]|null): void {
        let newBindings = { ...bindings };
        if (value) {
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    newBindings[variable.id] = value.map(v => v.value);
                } else {
                    delete newBindings[variable.id];
                }
            } else {
                newBindings[variable.id] = [value.value];
            }
        } else if (bindings[variable.id]) {
            delete newBindings[variable.id];
        }
        dispatch(setQuestionBindings(newBindings));
        refetch();
    }

    function fixOptionLabel (opt:VariableOption) : string {
        if (opt.label === "SA") return "Surface Area";
        if (opt.label === "TH") return "Thickness";
        return opt.label;
    }

    return (
        <Autocomplete size="small" sx={{ display: 'inline-block', minWidth: "250px" }}
            multiple={allowsMultiple}
            options={options}
            value={selectedOption ? selectedOption : (allowsMultiple ? [] : null)}
            onChange={(_, value: VariableOption|VariableOption[]|null) => onOptionChange(value)}
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