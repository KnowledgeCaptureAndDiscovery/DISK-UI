import { Autocomplete, Box, CircularProgress, FormHelperText, styled, TextField } from "@mui/material"
import { Hypothesis, idPattern, Question, QuestionBinding, QuestionVariable, varPattern } from "DISK/interfaces"
import { DISKAPI } from "DISK/API";
import React from "react";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { setErrorAll, setErrorOptions, setLoadingAll, setLoadingOptions, setOptions, setQuestions, Option } from "redux/questions";

interface QuestionProps {
    hypothesis? : Hypothesis | null
}

const TextPart = styled(Box)(({ theme }) => ({
    display: 'inline-block',
    borderBottom: "1px solid #c9c9c9",
    padding: "4px",
    whiteSpace: "nowrap"
}));

export const QuestionSelector = ({hypothesis:selectedHypothesis} : QuestionProps) => {
    const dispatch = useAppDispatch();
    const error = useAppSelector((state:RootState) => state.question.errorAll);
    const loading = useAppSelector((state:RootState) => state.question.loadingAll);
    const options = useAppSelector((state:RootState) => state.question.questions);
    const varOptions = useAppSelector((state:RootState) => state.question.options);

    const [nameToId, setNameToId] = React.useState<{[id:string]:string}>({});
    const [questionParts, setQuestionParts] = React.useState<string[]>([]);
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question|null>(null);
    const [selectedQuestionLabel, setSelectedQuestionLabel] = React.useState<string>("");

    const [selectedOptionValues, setSelectedOptionValues] = React.useState<{[id:string] : Option|null}>({});
    const [selectedOptionLabels, setSelectedOptionLabels] = React.useState<{[id:string] : string}>({});
  
    React.useEffect(() => {
        if (options.length === 0 && !loading && !error) {
            dispatch(setLoadingAll());
            DISKAPI.getQuestions()
                .then((questions:Question[]) => {
                    dispatch(setQuestions(questions))
                    if (selectedHypothesis && selectedHypothesis.question) {
                        let selectedQuestion : Question = questions.filter((q) => q.id === selectedHypothesis.question)?.[0];
                        if (selectedQuestion)
                            onQuestionChange(selectedQuestion);
                        else
                            console.warn("Selected question not found on question catalog")
                    }
                })
                .catch(() => {
                    dispatch(setErrorAll())
                })
        }
    })

    React.useEffect(() => {
        if (selectedHypothesis && selectedHypothesis.question && options.length > 0) {
            let selectedQuestion : Question = options.filter((q) => q.id === selectedHypothesis.question)?.[0];
            if (selectedQuestion)
                onQuestionChange(selectedQuestion);
            else
                console.warn("Selected question not found on question catalog")

            if (selectedHypothesis.questionBindings) {
                selectedHypothesis.questionBindings.forEach((qb) => {
                    let curOpt: Option = options.filter((opt) => opt.id === qb.binding)?.[0];
                    if (curOpt) {
                        setSelectedOptionValues((values) => {
                            let newValues = { ...values };
                            newValues[qb.variable] = curOpt;
                            return newValues;
                        })
                    }
                });
            }
        }
    }, [selectedHypothesis])
  
    const onQuestionChange = (value: Question | null) => {
        if (value) {
            setSelectedQuestion(value);
            loadQuestionOptions(value);
            updateQuestionFiller(value);
        }
    }

    const updateQuestionFiller = (q:Question) => {
        //Create map varname -> id;
        let map : {[id:string] : string} = {};
        q.variables.forEach((qv:QuestionVariable) => {
            map[qv.varName] = qv.id;
        });
        setNameToId(map);
        
        //Split question template in text and inputs
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

        setQuestionParts(ordered);
    }

    const loadQuestionOptions = (question:Question) => {
        if (question.variables && question.variables.length > 0) {
            question.variables.forEach((qv:QuestionVariable) => dispatch(setLoadingOptions(qv.id)));
            question.variables.forEach((qv:QuestionVariable) => 
                DISKAPI.getVariableOptions(qv.id.replace(idPattern,""))
                    .then((varOptions:string[][]) => {
                        dispatch(setOptions({id:qv.id, options:varOptions}))
                        if (selectedHypothesis && selectedHypothesis.questionBindings) {
                            let curVarBind : QuestionBinding = selectedHypothesis.questionBindings.filter((qb) => qb.variable === qv.id)?.[0];
                            let curOpt : Option = varOptions
                                    .filter((opt) => opt[0] === curVarBind.binding)
                                    .map((opt) => { 
                                        return {id: opt[0], name: opt[1]} as Option 
                                    })?.[0];
                            if (curOpt) {
                                setSelectedOptionValues((values) => {
                                    let newValues = { ...values };
                                    newValues[qv.id] = curOpt;
                                    return newValues;
                                })
                            }
                        }
                    })
                    .catch(() => dispatch(setErrorOptions(qv.id)))
            );
        }
    }

    return <Box>
        <Box>
            <FormHelperText sx={{margin: "2px"}}> Select the type of question your hypothesis will address: </FormHelperText>
            <Autocomplete id="select-question" size="small" fullWidth sx={{marginTop: "5px"}} 
                value={selectedQuestion}
                onChange={(_,newQ) => onQuestionChange(newQ)}
                inputValue={selectedQuestionLabel}
                onInputChange={(_,newIn) => setSelectedQuestionLabel(newIn)}
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
                    <TextPart key={`qPart${i}`}> {part} </TextPart>
                :
                    <Autocomplete key={`qVars${i}`} size="small" sx={{display: 'inline-block', minWidth: "250px"}}
                        value={selectedOptionValues[nameToId[part]] ? selectedOptionValues[nameToId[part]] : null}
                        onChange={(_, value: Option | null) => setSelectedOptionValues((values) => {
                            let newValues = { ...values };
                            newValues[nameToId[part]] = value;
                            return newValues;
                        })}
                        inputValue={selectedOptionLabels[nameToId[part]] ? selectedOptionLabels[nameToId[part]] : ""}
                        onInputChange={(_,newIn) => setSelectedOptionLabels((map) => {
                            let newMap = { ...map };
                            newMap[nameToId[part]] = newIn;
                            return newMap;
                        })}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        getOptionLabel={(option) => option.name}
                        options={varOptions[nameToId[part]].values}
                        loading={varOptions[nameToId[part]].loading}
                        renderInput={(params) => (
                            <TextField {...params} label={part} variant="standard" InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <React.Fragment>
                                        {varOptions[nameToId[part]].loading ? <CircularProgress color="inherit" size={20} /> : null}
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