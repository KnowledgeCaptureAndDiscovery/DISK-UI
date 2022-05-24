import { Autocomplete, Box, Card, CircularProgress, FormHelperText, styled, TableBody, TableCell, TableContainer, TableRow, TextField } from "@mui/material"
import { idPattern, Question, VariableBinding, QuestionVariable, varPattern, Triple } from "DISK/interfaces"
import { DISKAPI } from "DISK/API";
import React, { useEffect } from "react";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { setErrorAll, setErrorOptions, setLoadingAll, setLoadingOptions, setOptions, setQuestions, Option } from "redux/questions";

interface QuestionProps {
    questionId: string,
    bindings: VariableBinding[],
    onQuestionChange: (selectedId:string, bindings:VariableBinding[], updatedPattern:Triple[]) => void,
}

const TextPart = styled(Box)(({ theme }) => ({
    display: 'inline-block',
    borderBottom: "1px solid #c9c9c9",
    padding: "4px",
    whiteSpace: "nowrap"
}));

export const QuestionSelector = ({questionId:selectedQuestionId, bindings:questionBindings, onQuestionChange:sendQuestionChange} : QuestionProps) => {
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

    const [triplePattern, setTriplePattern] = React.useState<string[][]>([]);
  
    React.useEffect(() => {
        if (options.length === 0 && !loading && !error) {
            dispatch(setLoadingAll());
            DISKAPI.getQuestions()
                .then((questions:Question[]) => {
                    dispatch(setQuestions(questions))
                    if (selectedQuestionId) {
                        let selectedQuestion : Question = questions.filter((q) => q.id === selectedQuestionId)?.[0];
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
        if (selectedQuestionId && options.length > 0) {
            let selectedQuestion : Question = options.filter((q) => q.id === selectedQuestionId)?.[0];
            if (selectedQuestion)
                onQuestionChange(selectedQuestion);
            else
                console.warn("Selected question not found on question catalog")
        }
    }, [selectedQuestionId]);

    React.useEffect(() => {
        if (questionBindings.length > 0) {
            questionBindings.forEach((qb) => {
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

    }, [questionBindings]);
  
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
                        if (questionBindings) {
                            let curVarBind : VariableBinding = questionBindings.filter((qb) => qb.variable === qv.id)?.[0];
                            let curOpt : Option = varOptions
                                    .filter((opt) => curVarBind && opt[0] === curVarBind.binding)
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
                    .catch((e) => {
                        console.warn("ERR:", e);
                        dispatch(setErrorOptions(qv.id))
                    })
            );
        }
    }

    useEffect(() => {
        // Update pattern
        if (selectedQuestion) {
            console.log(questionBindings);
            let pattern:string[] = selectedQuestion.pattern.split(/\s/);
            let triples:string[][] = [];
            let curArr:string[] = [];
            let newBindings: VariableBinding[] = [];
            let updatedGraph: Triple[] = [];
            //let curTriple: Triple = {}
            for (let i:number=0; i<pattern.length; i++){
                let part : string = pattern[i];
                // The map should exist already, but if not, we can generate it here.
                if (nameToId && nameToId[part] && selectedOptionValues[nameToId[part]] != null) {
                    newBindings.push({variable: nameToId[part], binding:selectedOptionValues[nameToId[part]]!.id, collection: false});
                    part = "(" + selectedOptionValues[nameToId[part]]!.name + ")";
                }

                curArr.push(part);
                if (curArr.length === 3) {
                    triples.push(curArr);
                    curArr = [];
                }
            }
            if (curArr.length != 0) {
                console.warn("Something when wrong creating the triple representation")
            }
            setTriplePattern(triples);

            sendQuestionChange(selectedQuestion.id, newBindings, updatedGraph);
        }
    }, [selectedQuestion, selectedOptionValues]);

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
        <Card variant="outlined" sx={{mt: "8px", p: "0px 10px 10px;", visibility: (questionParts.length > 0 ? "visible" : "collapse"), position:"relative", overflow:"visible"}}>
            <FormHelperText sx={{position: 'absolute', background: 'white', padding: '0 4px', margin: '-9px 0 0 0'}}> Fill the following question template: </FormHelperText>
            <Box sx={{display:'inline-flex', flexWrap: "wrap", alignItems: "end"}}>
                {questionParts.length > 0 ? questionParts.map((part:string, i:number) => 
                    part.charAt(0) !== '?' ? 
                        <TextPart key={`qPart${i}`}> {part} </TextPart>
                    :
                        <Autocomplete key={`qVars${i}`} size="small" sx={{display: 'inline-block', minWidth: "250px"}}
                            options={varOptions[nameToId[part]].values}
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
        </Card>
        <Card variant="outlined" sx={{mt: "8px", p: "0px 10px 10px;", visibility: (questionParts.length > 0 ? "visible" : "collapse"), position:"relative", overflow:"visible"}}>
            <FormHelperText sx={{position: 'absolute', background: 'white', padding: '0 4px', margin: '-9px 0 0 0'}}> Semantic question pattern: </FormHelperText>
            <TableContainer sx={{mt:"6px", fontFamily:"monospace", display: "flex", justifyContent: "center"}}>
                <TableBody>
                    {triplePattern.map((triple:string[], index:number) => <TableRow key={`row_${index}`}>
                        {triple.map((res:string) => <TableCell sx={{padding: "2px 10px"}}> {res} </TableCell>)}
                    </TableRow>)}

                </TableBody>
            </TableContainer>
        </Card>
    </Box>;
}