import { Box, Card, FormHelperText, IconButton, styled, Tooltip } from "@mui/material"
import { idPattern, Question, VariableBinding, varPattern, Triple, AnyQuestionVariable } from "DISK/interfaces"
import React from "react";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { normalizeTextValue } from "./QuestionList";
import { useGetQuestionsQuery } from "redux/apis/questions";
import { FormalExpressionView } from "./FormalExpressionView";
import { createTemplateFragments, addBindingsToQuestionGraph, TemplateFragment, bindingsToIdValueMap, getAllQuestionVariables } from "./QuestionHelpers";

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
    const {data: questions} = useGetQuestionsQuery();
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question|null>(null);
    const [formalView, setFormalView] = React.useState<boolean>(false);
    const [idToRepresentation, setIdToRepresentation] = React.useState<{[id:string]:string}>({});
    const [triplePattern, setTriplePattern] = React.useState<Triple[]>([]);
    const [templateFragments, setTemplateFragments] = React.useState<TemplateFragment[]>([]);

    React.useEffect(() => {
        if (questions && questions.length > 0 && selectedId) {
            let cur : Question = questions.filter((q) => q.id === selectedId)?.[0];
            if (cur !== selectedQuestion) {
                setSelectedQuestion(cur);
                setTemplateFragments(createTemplateFragments(cur));
            }
        }
    }, [selectedId, questions]);

    React.useEffect(() => {
        let idValueMap = bindingsToIdValueMap(bindings);
        let newGraph : Triple[] = (selectedQuestion && bindings.length > 0) ? addBindingsToQuestionGraph(selectedQuestion, idValueMap) : [];
        setTriplePattern(newGraph);

        if (selectedQuestion) {
            let allQuestionVariables = getAllQuestionVariables(selectedQuestion);
            let nameToUri = allQuestionVariables.reduce((acc,cur) => {
                acc[cur.variableName] = cur.id;
                return acc;
            }, {} as {[id:string]:string});

            let representations : {[id:string]:string}= {};
            allQuestionVariables.forEach((qv) => {
                if (qv.representation) {
                    let rep = "";
                    qv.representation.split(varPattern).forEach((part) => {
                        rep += part.startsWith('?') ? (nameToUri[part] && idValueMap[nameToUri[part]] ? idValueMap[nameToUri[part]] : part) : part;
                    })
                    representations[qv.id] = rep;
                } else {
                    representations[qv.id] = idValueMap[qv.id].join(", ");
                }
            })

            setIdToRepresentation(selectedQuestion && bindings.length > 0 ? representations : {});
        }
    }, [bindings, selectedQuestion]);

    const  renderTemplateFragment = (frag:TemplateFragment, key:number) => {
        switch (frag.type) {
            case "string":
                return <TextPart key={`p_${key}`}> {frag.value}</TextPart>
            case "variable":
                return <TextPart key={`p_${key}`} sx={{fontWeight: "500", color: 'darkgreen'}}>
                        {idToRepresentation[frag.value.id] ? normalizeTextValue(idToRepresentation[frag.value.id]) : "any"}
                    </TextPart>
        }
    }

    return <Box>
        <Card variant="outlined" sx={{mt: "8px", p: "0px 10px 10px;", position: "relative", overflow:"visible"}}>
            <FormHelperText sx={{position: 'absolute', background: 'white', padding: '0 4px', margin: '-9px 0 0 0'}}>
                {label ? label : "The hypothesis or question to be tested:"}
            </FormHelperText>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Box sx={{display:'inline-flex', flexWrap: "wrap", alignItems: "end", mt: "6px"}}>
                    {templateFragments.map(renderTemplateFragment)}
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
