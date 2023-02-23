import { Box, Card, FormHelperText, IconButton, styled, Table, TableBody, TableCell, TableContainer, TableRow, Tooltip } from "@mui/material"
import { idPattern, Question, VariableBinding, QuestionVariable, varPattern, Triple } from "DISK/interfaces"
import React from "react";
import { useAppDispatch } from "redux/hooks";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { normalizeTextValue, normalizeURI } from "./QuestionList";
import { useGetQuestionsQuery } from "redux/apis/questions";
import { FormalExpressionView } from "./FormalExpressionView";
import { isBoundingBoxVariable } from "./QuestionHelpers";

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
    const { data: questions, isLoading, isError } = useGetQuestionsQuery();
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question|null>(null);
    const [formalView, setFormalView] = React.useState<boolean>(false);

    const [nameToValue, setNameToValue] = React.useState<{[id:string]:string}>({});
    const [questionParts, setQuestionParts] = React.useState<string[]>([]);
    const [triplePattern, setTriplePattern] = React.useState<Triple[]>([]);

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
        if (questions && questions.length > 0 && selectedId) {
            setFromQuestionList(questions, selectedId);
        }
    }, [selectedId, questions]);

    React.useEffect(() => {
        let emptyTriple: Triple = {subject:'', predicate: '', object: {value:'', type:'URI'}};
        if (selectedQuestion && bindings.length > 0) {
            //Create map id -> name
            let map : {[id:string] : string} = {};
            selectedQuestion.variables.forEach((qv:QuestionVariable) => {
                map[qv.id] = qv.variableName;
                if (isBoundingBoxVariable(qv)) {
                    [qv.minLat, qv.minLng, qv.maxLat, qv.maxLng].forEach((bbqv:QuestionVariable)=>{
                        map[bbqv.id] = bbqv.variableName;
                    });
                }
            });
            //Create map name -> value
            let map2 : {[id:string] : string} = {};
            bindings.forEach((vb:VariableBinding) => {
                map2[map[vb.variable]] = vb.binding.replace(idPattern, "");
            })
            selectedQuestion.variables.forEach((qv:QuestionVariable) => {
                // Add sub variables
                if (isBoundingBoxVariable(qv)) {
                    if (qv.representation != null) {
                        let explanationParts : string[] = qv.representation.split(/(\?[a-zA-Z0-9]*)/g);
                        let values : string = explanationParts.map((p:string) => p.startsWith('?') && map2[p] ? Number(map2[p]).toFixed(2) : p).join('');
                        map2[qv.variableName] = values;
                    }
                }
            });
            setNameToValue(map2);

            let noOptionalsPattern : string = selectedQuestion.pattern.replace(/optional\s*\{.+\}/g, '').trim();

            let pattern:string[] = noOptionalsPattern.split(/\s/);
            let triples:Triple[] = [];
            let curTriple: Triple = { ...emptyTriple };
            let newBindings: VariableBinding[] = [];
            for (let i:number=0; i<pattern.length; i++){
                let part : string = pattern[i];
                if (map2[part]) {
                    newBindings.push({variable: map[part], binding:map2[part], collection: false, type: null});
                    part = map2[part];
                }

                if (!curTriple.subject) curTriple.subject = part;
                else if (!curTriple.predicate) curTriple.predicate = part;
                else if (!curTriple.object.value) {
                    curTriple.object = {
                        value: part,
                        type: part.startsWith("http") || part.startsWith("www") ? 'URI' : 'LITERAL'
                    }
                    triples.push(curTriple);
                    curTriple = {...emptyTriple};
                } else {
                    console.warn("Something when wrong on triple creation.");
                }
            }
            setTriplePattern(triples);
        } else if (selectedQuestion && bindings.length === 0) {
            let pattern:string[] = selectedQuestion.pattern.split(/\s/);
            let triples : Triple[] = [];
            let curTriple : Triple = { ...emptyTriple };
            pattern.forEach((part:string, i:number) => {
                if (!curTriple.subject) curTriple.subject = part;
                else if (!curTriple.predicate) curTriple.predicate = part;
                else if (!curTriple.object.value) {
                    curTriple.object = {
                        value: part,
                        type: part.startsWith("http") || part.startsWith("www") ? 'URI' : 'LITERAL'
                    }
                    triples.push(curTriple);
                    curTriple = {...emptyTriple};
                } else {
                    console.warn("Something when wrong on triple creation.");
                }
            });
            setTriplePattern(triples);
        }
    }, [bindings, selectedQuestion])
  
    const updateQuestionFiller = (q:Question) => {
        if (!q) return;
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
        <Card variant="outlined" sx={{mt: "8px", p: "0px 10px 10px;", visibility: (questionParts.length > 0 ? "visible" : "collapse"), position: "relative", overflow:"visible"}}>
            <FormHelperText sx={{position: 'absolute', background: 'white', padding: '0 4px', margin: '-9px 0 0 0'}}>
                {label ? label : "The hypothesis or question to be tested:"}
            </FormHelperText>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Box sx={{display:'inline-flex', flexWrap: "wrap", alignItems: "end", mt: "6px"}}>
                {questionParts.length > 0 && (questionParts.map((part:string, i:number) => 
                    part.charAt(0) !== '?' ? 
                        <TextPart key={`qPart${i}`}> {part} </TextPart>
                    :
                        <TextPart key={`qPart${i}`} sx={{fontWeight: "500", color: 'darkgreen'}}>
                            {nameToValue[part] ? normalizeTextValue(nameToValue[part]) : "any" }
                            {i === (questionParts.length - 1) && "?"}
                        </TextPart>
                    )
                )}
                </Box>
                <Tooltip arrow title={(formalView? "Hide" : "Show") + " formal expression"}>
                    <IconButton onClick={() => setFormalView(!formalView)}>
                        {formalView? <VisibilityIcon/> : <VisibilityOffIcon/>}
                    </IconButton>
                </Tooltip>
            </Box>
        </Card>
        {formalView && <FormalExpressionView triplePattern={triplePattern} />}
    </Box>;
}
