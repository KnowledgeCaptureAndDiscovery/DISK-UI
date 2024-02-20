import { Box, Card, FormHelperText, IconButton, Tooltip } from "@mui/material"
import { Question, VariableBinding, QuestionVariable, Triple, AnyQuestionVariable, MultiValueAssignation, toMultiValueAssignation, QuestionVariableAssignation } from "DISK/interfaces"
import React from "react";
import { useAppDispatch, useQuestionBindings } from "redux/hooks";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { setQuestionBindings, setSelectedQuestion as setQuestion } from "redux/slices/forms";
import { FormalExpressionView } from "./FormalExpressionView";
import { QuestionTemplateSelector } from "./QuestionTemplateSelector";
import { QuestionTemplateFiller } from "./QuestionTemplateFiller";
import { getAllQuestionVariables, addBindingsToQuestionGraph, simpleMapToVariableBindings } from "./QuestionHelpers";

interface QuestionProps {
    questionId: string,
    bindings: VariableBinding[],
    onChange?: (question:Question|null, bindings:VariableBinding[], graph:Triple[]) => void,
    required?: boolean,
    showErrors: boolean,
}

export const QuestionSelector = ({questionId, bindings, onChange, required=false, showErrors} : QuestionProps) => {
    const dispatch = useAppDispatch();
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question|null>(null);
    const [showGraph, setShowGraph] = React.useState<boolean>(false);
    const [graph, setGraph] = React.useState<Triple[]>([]);
    const questionBindings = useQuestionBindings();


    React.useEffect(() => {
        if (onChange) {
            let varBindings : VariableBinding[] = simpleMapToVariableBindings(questionBindings);
            let newGraph : Triple[] = selectedQuestion && varBindings ? addBindingsToQuestionGraph(selectedQuestion, toMultiValueAssignation(questionBindings)) : [];
            setGraph(newGraph);
            onChange(selectedQuestion, varBindings, newGraph);
        }
    }, [questionBindings, selectedQuestion]);

    React.useEffect(() => {
        if (!selectedQuestion)
            return;
        let idToValue : QuestionVariableAssignation = {};
        let allVariables = getAllQuestionVariables(selectedQuestion);
        (bindings||[]).forEach((varBindings:VariableBinding) => {
            let curVar = allVariables.filter((v:AnyQuestionVariable) => (v.id === varBindings.variable))[0];
            if (curVar)
                idToValue[curVar.id] = {
                    values: [varBindings.binding[0]]
                }
        });
        if (selectedQuestion) {
            dispatch(setQuestionBindings(idToValue));
            dispatch(setQuestion(selectedQuestion));
        }
    }, [bindings, selectedQuestion]);

    const onQuestionChange = (value: Question | null) => {
        if (value && (!selectedQuestion || value.id !== selectedQuestion.id)) {
            setSelectedQuestion(value);
        }
    }

    return <Box>
        <QuestionTemplateSelector questionId={questionId} onChange={onQuestionChange} showErrors={showErrors} required={required} title={"Select a template that can express your hypothesis or question:"}/>
        <Card variant="outlined" sx={{mt: "8px", p: "0px 10px 10px;", position:"relative", overflow:"visible", display: selectedQuestion ? 'block' : 'none' }}>
            <FormHelperText sx={{position: 'absolute', background: 'white', padding: '0 4px', margin: '-9px 0 0 0'}}>
                Fill in the template:
            </FormHelperText>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <QuestionTemplateFiller question={selectedQuestion} showErrors={showErrors}/>
                <Tooltip arrow title={(showGraph? "Hide" : "Show") + " formal expression"}>
                    <IconButton onClick={() => setShowGraph(!showGraph)}>
                        {showGraph? <VisibilityIcon/> : <VisibilityOffIcon/>}
                    </IconButton>
                </Tooltip>
            </Box>
        </Card>
        {showGraph && <FormalExpressionView triplePattern={graph}/>}
    </Box>;
}