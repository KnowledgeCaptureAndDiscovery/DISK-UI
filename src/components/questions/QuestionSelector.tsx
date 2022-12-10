import { Autocomplete, Box, Card, CircularProgress, FormHelperText, IconButton, styled, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Tooltip } from "@mui/material"
import { idPattern, Question, VariableBinding, QuestionVariable, varPattern, Triple, VariableOption } from "DISK/interfaces"
import { DISKAPI } from "DISK/API";
import React, { useEffect } from "react";
import { useAppDispatch } from "redux/hooks";
import { setLoadingOptions, setOptions, Option } from "redux/questions";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { BoundingBoxMap, OptionBinding } from "./BoundingBoxMap";
import { StartTimeURI, StopTimeURI, TimeIntervalVariable, TimeTypeURI } from "./TimeIntervalVariable";
import { QuestionVariableSelector } from "./QuestionVariableSelector";
import { useGetQuestionsQuery } from "redux/apis/questions";
import { setQuestionBindings, SimpleMap } from "redux/slices/forms";

export const isBoundingBoxVariable = (v:QuestionVariable) => v.subType != null && v.subType.endsWith("BoundingBoxQuestionVariable");
export const isTimeIntervalVariable = (v:QuestionVariable) => v.subType != null && v.subType.endsWith("TimeIntervalQuestionVariable");

interface QuestionProps {
    questionId: string,
    bindings: VariableBinding[],
    onQuestionChange: (selectedId:string, bindings:VariableBinding[], updatedPattern:Triple[]) => void,
    error?: boolean
}

const TextPart = styled(Box)(({ theme }) => ({
    display: 'inline-block',
    borderBottom: "1px solid #c9c9c9",
    padding: "4px",
    whiteSpace: "nowrap"
}));

export const QuestionSelector = ({questionId:selectedQuestionId, bindings:questionBindings, onQuestionChange:sendQuestionChange, error:exError=false} : QuestionProps) => {
    const dispatch = useAppDispatch();
    const { data: questions, isLoading, isError } = useGetQuestionsQuery();

    const [formalView, setFormalView] = React.useState<boolean>(false);
    const [nameToId, setNameToId] = React.useState<{[id:string]:string}>({});
    const [questionParts, setQuestionParts] = React.useState<string[]>([]);
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question|null>(null);
    const [selectedQuestionLabel, setSelectedQuestionLabel] = React.useState<string>("");

    const [selectedOptionValues, setSelectedOptionValues] = React.useState<{[id:string] : Option|null}>({});
    const [lastQuery, setLastQuery] = React.useState<string>("-1");
    const [initialBoundingBox, setInitialBoundingBox] = React.useState<{minLat:number,minLng:number,maxLat:number,maxLng:number}|null>(null);

    //MAPS varname -> variable
    const [boundingBoxVariable, setBoundingBoxVariable] = React.useState<{[name:string] : QuestionVariable}>({});
    const [timeIntervalVariable, setTimeIntervalVariable] = React.useState<{[name:string] : QuestionVariable}>({});
    const [questionVariable, setQuestionVariable] = React.useState<{[name:string] : QuestionVariable}>({});

    const [triplePattern, setTriplePattern] = React.useState<Triple[]>([]);

    React.useEffect(() => {
        if (selectedQuestionId && questions && questions.length > 0) {
            let selectedQuestion : Question = questions.filter((q) => q.id === selectedQuestionId)?.[0];
            if (selectedQuestion)
                onQuestionChange(selectedQuestion);
            else
                console.warn("Selected question not found on question catalog")
        }
    }, [selectedQuestionId, questions]);

    /*React.useEffect(() => {
        if (pristine && questionBindings.length > 0) {
            let newValues : {[id:string] : Option|null} = {};
            let initBB : {minLat:number,minLng:number,maxLat:number,maxLng:number} = {minLat:0,minLng:0,maxLat:0,maxLng:0};

            questionBindings.forEach((qb:VariableBinding) => {
                let curOpt: Option = varOptions[qb.variable]?.values.filter((opt) => opt.id === qb.binding)?.[0];
                if (curOpt)
                    newValues[qb.variable] = curOpt;
                else
                    newValues[qb.variable] = {id:qb.binding, name:qb.binding} as Option;

                // TODO: this is for bounding box variables
                if (qb.variable.endsWith("MinLatVariable")) initBB.minLat = parseFloat(qb.binding);
                if (qb.variable.endsWith("MinLngVariable")) initBB.minLng = parseFloat(qb.binding);
                if (qb.variable.endsWith("MaxLatVariable")) initBB.maxLat = parseFloat(qb.binding);
                if (qb.variable.endsWith("MaxLngVariable")) initBB.maxLng = parseFloat(qb.binding);
            });

            if (Object.keys(newValues).length === questionBindings.length) {
                setPristine(false);
                //Set bounding box:
                //console.log(initBB, questionBindings);
                if (initBB.minLat !== 0 && initBB.minLng !== 0 && initBB.maxLat !== 0 && initBB.maxLng !== 0){
                    setInitialBoundingBox(initBB);
                }
                setSelectedOptionValues((values) => {
                    return { ...values, ...newValues }
                })
            }
        }
    }, [questionBindings, varOptions, pristine]); // eslint-disable-line react-hooks/exhaustive-deps
    */

    React.useEffect(() => {
        let newBindings : SimpleMap = {};
        (questionBindings||[]).forEach((qb:VariableBinding) => {
            newBindings[qb.variable] = qb.binding;
        });
        dispatch( setQuestionBindings(newBindings) );
        console.log(newBindings);
    }, [questionBindings]);
  
    const onQuestionChange = (value: Question | null) => {
        if (value && (!selectedQuestion || value.id !== selectedQuestion.id)) {
            // Check question variable types and add it.
            let simpleVars : {[name:string] : QuestionVariable} = {};
            let bbVars : {[name:string] : QuestionVariable} = {};
            let tiVars : {[name:string] : QuestionVariable} = {};

            value.variables.forEach((v:QuestionVariable) => {
                if (isBoundingBoxVariable(v)) {
                    bbVars[v.variableName] = v;
                } else if (isTimeIntervalVariable(v)) {
                    tiVars[v.variableName] = v;
                } else {
                    simpleVars[v.variableName] = v;
                }
            });
            setBoundingBoxVariable(bbVars);
            setTimeIntervalVariable(tiVars);
            setQuestionVariable(simpleVars);

            setSelectedQuestion(value);
            loadQuestionDynamicOptions(value);
            updateQuestionFiller(value);
        }
    }

    const updateQuestionFiller = (q:Question) => {
        //Create map varname -> id;
        let map : {[id:string] : string} = {};
        q.variables.forEach((qv:QuestionVariable) => {
            map[qv.variableName] = qv.id;
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

    const loadQuestionDynamicOptions = (question:Question) => {
        if (question.variables && question.variables.length > 0) {
            let bindings : {[name:string] :string} = {};
            question.variables.forEach((qv:QuestionVariable) => {
                let val = selectedOptionValues[qv.id];
                if (val) {
                    bindings[qv.variableName] = val.id;
                } else {
                    //Can be an extended variable:
                    if (boundingBoxVariable[qv.variableName]) {
                        [qv.minLat, qv.maxLat, qv.minLng, qv.maxLng].forEach((bbVar) => {
                            let val = selectedOptionValues[bbVar.id];
                            if (val) bindings[bbVar.variableName] = val.id;
                        });
                    }
                }
            });
            let queryId : string = Object.keys(bindings).map((key) => key + ":" + bindings[key] + "|").join("");
            if (queryId === lastQuery) {
                return;
            }
            if (queryId)
                setLastQuery(queryId);

            question.variables.forEach((qv:QuestionVariable) => {
                dispatch(setLoadingOptions(qv.id))
            });

            //useGetDynamicOptionsQuery({cfg: {id:question.id, bindings:bindings}});
            DISKAPI.getDynamicOptions({id:question.id, bindings:bindings})
                    .then((options:{[name:string] : VariableOption[]}) => {
                        question.variables.forEach((qv:QuestionVariable) => {
                            let curOpts = options[qv.variableName];
                            if (curOpts) {
                                dispatch(setOptions({id:qv.id, options:curOpts}));
                            }
                        });
                    });
        }
    }

    useEffect(() => {
        // Update pattern and send bindings
        if (selectedQuestion) {
            let noOptionalsPattern : string = selectedQuestion.pattern.replace(/optional\s*\{.+\}/g, '').trim();
            let pattern:string[] = noOptionalsPattern.split(/\s/);
            let updatedGraph: Triple[] = [];

            let newBindings: VariableBinding[] = [];
            let values : {[varName:string]:string} = {};
            selectedQuestion.variables.forEach((qv:QuestionVariable) => {
                if (boundingBoxVariable[qv.variableName]) {
                    [qv.minLat, qv.minLng, qv.maxLat, qv.maxLng].forEach((bbVar) => {
                        let val = selectedOptionValues[bbVar.id];
                        if (val) {
                            values[bbVar.variableName] = val.id;
                            newBindings.push({
                                variable: bbVar.id,
                                binding: val.id,
                                type: null
                            });
                        }
                    });
                    values[qv.variableName] = qv.variableName.replace('?', ':');
                } else if (timeIntervalVariable[qv.variableName]) {
                    [[StartTimeURI,'?MinTime'], [StopTimeURI, '?MaxTime'], [TimeTypeURI, '?TimeType']].forEach(([id,name]) => {
                        let val = selectedOptionValues[id];
                        if (val) {
                            values[name] = val.id;
                            newBindings.push({
                                variable: id,
                                binding: val.id,
                                type: null
                            });
                        }
                    })
                    values[qv.variableName] = qv.variableName.replace('?', ':');
                } else {
                    let val = selectedOptionValues[qv.id];
                    if (val) {
                        values[qv.variableName] = val.id;
                        newBindings.push({
                            variable: qv.id,
                            binding: val.id,
                            type: null
                        })
                    }
                }
            })

            let emptyTriple: Triple = {
                subject: "",
                predicate: "",
                object: {
                    type: 'LITERAL',
                    value: '',
                    datatype: ''
                }
            };
            let curTriple: Triple = emptyTriple;

            for (let i:number=0; i<pattern.length; i++){
                let part : string = pattern[i];
                let value : string = values[part] ? values[part] : part;
                let c : number = i%3;
                switch (c) {
                    case 0:
                        curTriple = { ...emptyTriple };
                        curTriple.subject = value;
                        break;
                    case 1:
                        curTriple.predicate = value;
                        break;
                    case 2:
                        let isURI:boolean = value.startsWith("http") || value.startsWith("www");
                        curTriple.object = {
                            type: isURI ? 'URI' : 'LITERAL',
                            value: value,
                            datatype: isURI ? undefined : "http://www.w3.org/2001/XMLSchema#string"
                        }
                        updatedGraph.push(curTriple);
                        break;
                }
            }
            setTriplePattern(updatedGraph);
            sendQuestionChange(selectedQuestion.id, newBindings, updatedGraph);
        }
    }, [selectedQuestion, selectedOptionValues]); // eslint-disable-line react-hooks/exhaustive-deps

    const displayURI = (uri:string) => {
        if (uri.startsWith("http") || uri.startsWith("www")) 
            uri = uri.replace(idPattern, "");
        
        //WIKI Specific 
        if (uri.startsWith("Property-3A"))
            uri = uri.replace("Property-3A","").replace("-28E-29","");

        uri = uri.replaceAll("_","");
        return uri;
    }

    const displayObj = (obj:Triple["object"]) => {
        return obj.type === 'URI' ? displayURI(obj.value) : obj.value;
    }

    const onOptionChange = (bindings:OptionBinding[]) => {
        setSelectedOptionValues((values) => {
            let newValues = { ...values };
            bindings.forEach((optBin:OptionBinding) => {
                newValues[optBin.variable.id] = optBin.value;
            });
            return newValues;
        })
    }

    React.useEffect(() => {
        if (selectedQuestion) {
            loadQuestionDynamicOptions(selectedQuestion);
        }
    }, [selectedOptionValues]);

    return <Box>
        <Box>
            <FormHelperText sx={{margin: "2px"}}>Select a template that can express your hypothesis or question:</FormHelperText>
            <Autocomplete id="select-question" size="small" fullWidth sx={{marginTop: "5px"}} 
                value={selectedQuestion}
                onChange={(_,newQ) => onQuestionChange(newQ)}
                inputValue={selectedQuestionLabel}
                onInputChange={(_,newIn) => setSelectedQuestionLabel(newIn)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) => option.name}
                options={questions ? questions : []}
                loading={isLoading}
                renderInput={(params) => (
                    <TextField {...params} error={exError} label="Templates"
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {isLoading && (<CircularProgress color="inherit" size={20} />)}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                        }}
                    />
                )}
            />
        </Box>
        <Card variant="outlined" sx={{mt: "8px", p: "0px 10px 10px;", display: (questionParts.length > 0 ? "block" : "none"), position:"relative", overflow:"visible"}}>
            <FormHelperText sx={{position: 'absolute', background: 'white', padding: '0 4px', margin: '-9px 0 0 0'}}>
                Fill in the template:
            </FormHelperText>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Box sx={{display:'inline-flex', flexWrap: "wrap", alignItems: "end"}}>
                    {questionParts.length > 0 ? questionParts.map((part:string, i:number, parts: string[]) => 
                        part.charAt(0) !== '?' ? 
                            <TextPart key={`qPart${i}`}> {part} </TextPart>
                        : (boundingBoxVariable[part] ? 
                            <BoundingBoxMap key={`qVars${i}`} 
                                    onChange={onOptionChange}
                                    variable={boundingBoxVariable[part]}
                                    bindings={initialBoundingBox}/>
                            : (timeIntervalVariable[part] ? 
                                <TimeIntervalVariable key={`qVars${i}`} variable={timeIntervalVariable[part]} onChange={onOptionChange}/>
                                : (selectedQuestion &&
                                    <QuestionVariableSelector key={`qVars${i}`} question={selectedQuestion} variable={questionVariable[part]} onChange={onOptionChange}/>)
                            )
                        ))
                    : ""}
                </Box>
                <Tooltip arrow title={(formalView? "Hide" : "Show") + " formal expression"}>
                    <IconButton onClick={() => setFormalView(!formalView)}>
                        {formalView? <VisibilityIcon/> : <VisibilityOffIcon/>}
                    </IconButton>
                </Tooltip>
            </Box>
        </Card>
        {formalView ? 
        <Card variant="outlined" sx={{mt: "8px", p: "0px 10px 10px;", display: (questionParts.length > 0 ? "block" : "none"), position:"relative", overflow:"visible"}}>
            <FormHelperText sx={{position: 'absolute', background: 'white', padding: '0 4px', margin: '-9px 0 0 0'}}> Formal expression: </FormHelperText>
            <TableContainer sx={{mt:"6px", fontFamily:"monospace", display: "flex", justifyContent: "center"}}>
                <Table aria-label="Hypothesis graph" sx={{width: "auto"}}>
                    <TableBody>
                        {triplePattern.map((triple:Triple, index:number) => <TableRow key={`row_${index}`}>
                            <TableCell sx={{padding: "2px 10px"}}> {displayURI(triple.subject)} </TableCell>
                            <TableCell sx={{padding: "2px 10px"}}> {displayURI(triple.predicate)} </TableCell>
                            <TableCell sx={{padding: "2px 10px"}}> {displayObj(triple.object)} </TableCell>
                        </TableRow>)}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
        : null}
    </Box>;
}