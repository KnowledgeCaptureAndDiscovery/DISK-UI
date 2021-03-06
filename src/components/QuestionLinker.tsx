import { Autocomplete, Box, Card, CircularProgress, FormHelperText, MenuItem, Select, styled, TextField } from "@mui/material"
import { Question, QuestionVariable, varPattern } from "DISK/interfaces"
import { DISKAPI } from "DISK/API";
import React from "react";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { setErrorAll, setLoadingAll, setQuestions } from "redux/questions";

interface QuestionLinkerProps {
    selected: string,
    disabled?: boolean,
    onQuestionChange?: (question:Question|null, variables:string[]) => void,
    error?: boolean
}

const TextPart = styled(Box)(({ theme }) => ({
    display: 'inline-block',
    borderBottom: "1px solid #c9c9c9",
    padding: "4px",
    whiteSpace: "nowrap"
}));

export const QuestionLinker = ({selected:selectedId, disabled, onQuestionChange:notifyChange, error:exError=false} : QuestionLinkerProps) => {

    const dispatch = useAppDispatch();
    const error = useAppSelector((state:RootState) => state.question.errorAll);
    const loading = useAppSelector((state:RootState) => state.question.loadingAll);
    const options = useAppSelector((state:RootState) => state.question.questions);

    const [questionParts, setQuestionParts] = React.useState<string[]>([]);
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question|null>(null);
    const [selectedQuestionLabel, setSelectedQuestionLabel] = React.useState<string>("");

    React.useEffect(() => {
        if (options.length === 0 && !loading && !error) {
            dispatch(setLoadingAll());
            DISKAPI.getQuestions()
                .then((questions:Question[]) => {
                    dispatch(setQuestions(questions))
                    if (selectedId) {
                        let selectedQuestion : Question = questions.filter((q) => q.id === selectedId)?.[0];
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
        if (selectedId && options.length > 0) {
            let selectedQuestion : Question = options.filter((q) => q.id === selectedId)?.[0];
            if (selectedQuestion)
                onQuestionChange(selectedQuestion);
            else
                console.warn("Selected question not found on question catalog")
        }
    }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps
  
    const onQuestionChange = (value: Question | null) => {
        if (value) {
            setSelectedQuestion(value);
            updateQuestionFiller(value);
        }
        if (notifyChange)
            if (value) notifyChange(value, value.variables.map((v:QuestionVariable) => v.varName));
            else notifyChange(null, []);
    }

    const updateQuestionFiller = (q:Question) => {
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

    return <Box>
        {disabled? "" :
        <Box>
            <FormHelperText sx={{margin: "2px", fontSize: "0.9rem"}}>Select a pattern that this line of inquiry will investigate:</FormHelperText>
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
                    <TextField {...params} error={exError} label="Templates"
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
        }
        <Card variant="outlined" sx={{mt: "8px", p: "0px 10px 10px;", display: (questionParts.length > 0 ? "block" : "none"), position: "relative", overflow:"visible"}}>
            <FormHelperText sx={{position: 'absolute', background: 'white', padding: '0 4px', margin: '-9px 0 0 0'}}>This line of inquiry can be used to investigate the following hypothesis or question:</FormHelperText>
            <Box sx={{display:'inline-flex', flexWrap: "wrap", alignItems: "end", mt: (disabled ? "6px": 0)}}>
                {questionParts.length > 0 ? questionParts.map((part:string, i:number) => 
                    part.charAt(0) !== '?' ? 
                        <TextPart key={`qPart${i}`}> {part} </TextPart>
                    :
                        <Select key={`qVars${i}`} size="small" sx={{display: 'inline-block', minWidth: "150px"}} 
                            variant="standard" value={part} id={`var-${i}`} label={part} disabled>
                            <MenuItem value={part}>{part}</MenuItem>
                        </Select>
                    )
                : ""}
            </Box>
        </Card>
    </Box>;
}