import { Box, Card, FormHelperText, IconButton, styled, Table, TableBody, TableCell, TableContainer, TableRow, Tooltip } from "@mui/material"
import { idPattern, Question, VariableBinding, QuestionVariable, varPattern } from "DISK/interfaces"
import { DISKAPI } from "DISK/API";
import React from "react";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { setErrorAll, setLoadingAll, setQuestions } from "redux/questions";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface QuestionPreviewProps {
    selected: string,
    bindings: VariableBinding[],
    label?: string
}

const TextPart = styled(Box)(({ theme }) => ({
    display: 'inline-block',
    borderBottom: "1px solid #c9c9c9",
    padding: "4px",
    whiteSpace: "nowrap"
}));

export const QuestionPreview = ({selected:selectedId, bindings, label} : QuestionPreviewProps) => {
    const dispatch = useAppDispatch();
    const error = useAppSelector((state:RootState) => state.question.errorAll);
    const loading = useAppSelector((state:RootState) => state.question.loadingAll);
    const questions = useAppSelector((state:RootState) => state.question.questions);
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question|null>(null);
    const [formalView, setFormalView] = React.useState<boolean>(false);

    const [nameToValue, setNameToValue] = React.useState<{[id:string]:string}>({});
    const [questionParts, setQuestionParts] = React.useState<string[]>([]);
    const [triplePattern, setTriplePattern] = React.useState<string[][]>([]);

    React.useEffect(() => {
        if (questions.length === 0 && !loading && !error) {
            dispatch(setLoadingAll());
            DISKAPI.getQuestions()
                .then((questions:Question[]) => {
                    dispatch(setQuestions(questions))
                    setFromQuestionList(questions, selectedId)
                })
                .catch(() => {
                    dispatch(setErrorAll())
                })
        } else {
            setFromQuestionList(questions, selectedId);
        }
    })

    const setFromQuestionList = (list:Question[], id:string) => {
        if (list.length > 0 && !!id) {
            let cur : Question = list.filter((q) => q.id === id)?.[0];
            if (cur !== selectedQuestion) {
                updateQuestionFiller(cur);
                setSelectedQuestion(cur);
            }
        }
    }

    React.useEffect(() => {
        setFromQuestionList(questions, selectedId);
    }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
        if (selectedQuestion && bindings.length > 0) {
            //Create map id -> name
            let map : {[id:string] : string} = {};
            selectedQuestion.variables.forEach((qv:QuestionVariable) => {
                map[qv.id] = qv.varName;
            });
            //Create map name -> value
            let map2 : {[id:string] : string} = {};
            bindings.forEach((vb:VariableBinding) => {
                map2[map[vb.variable]] = vb.binding.replace(idPattern, "");
            })
            setNameToValue(map2);

            let noOptionalsPattern : string = selectedQuestion.pattern.replace(/optional\s*\{.+\}/g, '').trim();

            let pattern:string[] = noOptionalsPattern.split(/\s/);
            let triples:string[][] = [];
            let curArr:string[] = [];
            let newBindings: VariableBinding[] = [];
            for (let i:number=0; i<pattern.length; i++){
                let part : string = pattern[i];
                if (map2[part]) {
                    newBindings.push({variable: map[part], binding:map2[part], collection: false});
                    part = map2[part];
                }

                curArr.push(part);
                if (curArr.length === 3) {
                    triples.push(curArr);
                    curArr = [];
                }
            }
            if (curArr.length !== 0)
                console.warn("Something when wrong creating the triple representation")
            setTriplePattern(triples);
        } else if (selectedQuestion && bindings.length === 0) {
            let pattern:string[] = selectedQuestion.pattern.split(/\s/);
            let triples : string[][] = [];
            let cur : string[] = [];
            pattern.forEach((part:string, i:number) => {
                cur.push(part);
                if (cur.length === 3) {
                    triples.push(cur);
                    cur = [];
                }
            });
            if (cur.length !== 0) 
                console.warn("Something when wrong creating the triple representation")
            setTriplePattern(triples);
        }
    }, [bindings, selectedQuestion])
  
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

    const displayURI = (uri:string) => {
        if (uri.startsWith("http") || uri.startsWith("www")) 
            uri = uri.replace(idPattern, "");
        
        //WIKI Specific 
        if (uri.startsWith("Property-3A"))
            uri = uri.replace("Property-3A","").replace("-28E-29","");

        uri = uri.replaceAll("_","");
        return uri;
    }

    const displayValue = (text:string) => {
        return text.replaceAll('-28','(').replaceAll('-29',')').replaceAll('-3A',': ').replaceAll('_',' ');
    }

    return <Box>
        <Card variant="outlined" sx={{mt: "8px", p: "0px 10px 10px;", visibility: (questionParts.length > 0 ? "visible" : "collapse"), position: "relative", overflow:"visible"}}>
            <FormHelperText sx={{position: 'absolute', background: 'white', padding: '0 4px', margin: '-9px 0 0 0'}}>
                {label ? label : "The hypothesis or question to be tested:"}
            </FormHelperText>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Box sx={{display:'inline-flex', flexWrap: "wrap", alignItems: "end", mt: "6px"}}>
                {questionParts.length > 0 ? questionParts.map((part:string, i:number, parts: string[]) => 
                    part.charAt(0) !== '?' ? 
                        <TextPart key={`qPart${i}`}> {part} </TextPart>
                    :
                        <TextPart key={`qPart${i}`} sx={{fontWeight: "500", color: 'darkgreen'}}>
                            {nameToValue[part] ? displayValue(nameToValue[part]) : "any" }
                            {i === (parts.length - 1) && "?"}
                        </TextPart>
                    )
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
        <Card variant="outlined" sx={{mt: "8px", p: "0px 10px 10px;", visibility: (questionParts.length > 0 ? "visible" : "collapse"), position:"relative", overflow:"visible"}}>
            <FormHelperText sx={{position: 'absolute', background: 'white', padding: '0 4px', margin: '-9px 0 0 0'}}> Formal expression: </FormHelperText>
            <TableContainer sx={{mt:"6px", fontFamily:"monospace", display: "flex", justifyContent: "center"}}>
                <Table sx={{width:"unset"}}>
                    <TableBody>
                        {triplePattern.map((triple:string[], index:number) => <TableRow key={`row_${index}`}>
                            {triple.map((res:string) => <TableCell key={`cell${index}${res}`} sx={{padding: "2px 10px"}}> {displayURI(res)} </TableCell>)}
                        </TableRow>)}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
        : null }
    </Box>;
}
