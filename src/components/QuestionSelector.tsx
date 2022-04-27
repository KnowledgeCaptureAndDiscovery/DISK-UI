import { Autocomplete, AutocompleteChangeReason, Box, CircularProgress, FormHelperText, styled, TextField } from "@mui/material"
import { idPattern, Question, QuestionVariable, varPattern } from "DISK/interfaces"
import { SyntheticEvent } from "react";
import { DISKAPI } from "DISK/API";
import React from "react";

interface QuestionProps {
    selected? : string
}

export const QuestionSelector = ({selected:selectedQuestionId} : QuestionProps) => {
    const [open, setOpen] = React.useState(false);
    const [options, setOptions] = React.useState<readonly Question[]>([]);
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question>();
    const [questionParts, setQuestionParts] = React.useState<string[]>([]);
    const loading = open && options.length === 0;


    const [openVars, setOpenVars] = React.useState<{[id:string]: boolean}>({});
    const [loadingVars, setLoadingVars] = React.useState<{[id:string]: boolean}>({});
    const [varOptions, setVarOptions] = React.useState<{[id:string]: string[][]}>({});
  
    React.useEffect(() => {
        let active = true;
        if (!loading) return undefined;
  
        (async () => {
            let questions : Question[] = await DISKAPI.getQuestions();
            if (active) setOptions([...questions]);
        })();
  
        return () => { active = false; };
    }, [loading]);
  
    /*React.useEffect(() => {
        if (!open) setOptions([]);
    }, [open]);*/

    const onQuestionChange = (event: SyntheticEvent<Element, Event>, value: Question | null, reason: AutocompleteChangeReason) => {
        if (value) {
            loadQuestionOptions(value);
            updateQuestionFiller(value);
            setSelectedQuestion(value);
        }
    }

    const updateQuestionFiller = (q:Question) => {
        let textParts : string[] = q.template.split(varPattern);
        let varParts : string [] = [];
        let varIterator : RegExpMatchArray | null = q.template.match(varPattern);
        if (varIterator) varIterator.forEach((cur:string) => varParts.push(cur));
        let startWithText : boolean = q.template.charAt(0) !== '?';

        let ordered : string[] = [];
        textParts = textParts.reverse();
        varParts = varParts.reverse();

        let cur : string | undefined = startWithText ? textParts.pop() : undefined;
        do {
            if (cur) ordered.push(cur);
            cur = varParts.pop();
            if (cur) ordered.push(cur);
            cur = textParts.pop();

        } while (cur);

        console.log(ordered);
        setQuestionParts(ordered);
    }

    const loadQuestionOptions = (question:Question) => {
        if (question.variables && question.variables.length > 0) {
            let loading : {[id:string]: boolean} = { ...loadingVars };
            let options : {[id:string]: string[][]} = { ...varOptions };
            question.variables.forEach((qv:QuestionVariable) => {
                loading[qv.varName] = true;
                options[qv.varName] = [];
            });
            setLoadingVars(loading);
            setVarOptions(options);

            question.variables.forEach((qv:QuestionVariable) => {
                DISKAPI.getVariableOptions(qv.id.replace(idPattern,""))
                    .then((options:string[][]) => {
                        console.log(qv.varName + ":", options);
                        setVarOptions((prev) => {
                            let newOptions = { ...prev };
                            newOptions[qv.varName] = options;
                            return newOptions;
                        });
                        setLoadingVars((prev) => {
                            let newLoading = { ...prev };
                            newLoading[qv.varName] = false;
                            return newLoading;
                        });
                    })
                    .catch(() => {
                        //Handle error
                    });
            });
        }
    }

    const onQuestionVariableChange = (varname:string, value:string[] | null) => {
        console.log(value);
        console.log(varOptions);
        console.log(loadingVars);
    }

    return <Box>
        <Box>
            <FormHelperText sx={{margin: "2px"}}> Select the type of question your hypothesis will address: </FormHelperText>
            <Autocomplete id="select-question" size="small" fullWidth sx={{marginTop: "5px"}} 
                onChange={onQuestionChange}
                open={open}
                onOpen={() => { setOpen(true); }}
                onClose={() => { setOpen(false); }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) => option.name}
                options={options}
                loading={loading}
                renderInput={(params) => (
                    <TextField {...params} label="Hypothesis Question"
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                        }}
                    />
                )}
            />
        </Box>
        <Box sx={{display:'inline-flex', flexWrap: "wrap", alignItems: "end"}}>
            {questionParts.length > 0 ? questionParts.map((part:string, i:number) => 
                part.charAt(0) !== '?' ? 
                    <Box key={`qPart${i}`} sx={{display: 'inline-block', borderBottom: "1px solid #c9c9c9", padding: "4px", whiteSpace: "nowrap"}}>
                        {part} 
                    </Box>
                :
                    <Autocomplete key={`qVars${i}`} size="small" sx={{display: 'inline-block', minWidth: "250px"}}
                        onChange={(event: SyntheticEvent<Element, Event>, value: string[] | null) => {
                            onQuestionVariableChange(part, value)
                        }}
                        isOptionEqualToValue={(option, value) => option[0] === value[0]}
                        getOptionLabel={(option) => option[1]}
                        options={varOptions[part]}
                        loading={loadingVars[part]}
                        renderInput={(params) => (
                            <TextField {...params} label={part} variant="standard" InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <React.Fragment>
                                        {loadingVars[part] ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </React.Fragment>
                                ),
                            }}/>
                        )}
                    />
                )
            : ""}
        </Box>
    </Box>;
}