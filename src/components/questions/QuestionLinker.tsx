import { Box, Card, FormHelperText } from "@mui/material"
import { Question, QuestionVariable } from "DISK/interfaces"
import React from "react";
import { QuestionTemplateSelector } from "./QuestionTemplateSelector";
import { QuestionTemplateView } from "./QuestionTemplateView";

interface QuestionLinkerProps {
    selected: string,
    disabled?: boolean,
    onQuestionChange?: (question:Question|null, variables:string[]) => void,
    error?: boolean
}

export const QuestionLinker = ({selected:selectedId, disabled, onQuestionChange:notifyChange, error:exError=false} : QuestionLinkerProps) => {
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question|null>(null);

    const onQuestionChange = (value: Question | null) => {
        setSelectedQuestion(value);
        if (notifyChange)
            if (value) notifyChange(value, value.variables.map((v:QuestionVariable) => v.variableName));
            else notifyChange(null, []);
    }

    return <Box>
        {!disabled && (<Box>
            <QuestionTemplateSelector required title="Select a pattern that this line of inquiry will investigate:" onChange={onQuestionChange} questionId={selectedId}/>
        </Box>)}

        <Card variant="outlined" sx={{mt: "8px", p: "0px 10px 10px;", display: (selectedQuestion ? "block" : "none"), position: "relative", overflow:"visible"}}>
            <FormHelperText sx={{position: 'absolute', background: 'white', padding: '0 4px', margin: '-9px 0 0 0'}}>
                This line of inquiry can be used to investigate the following hypothesis or question:
            </FormHelperText>
            <QuestionTemplateView question={selectedQuestion}/>
        </Card>
    </Box>;
}