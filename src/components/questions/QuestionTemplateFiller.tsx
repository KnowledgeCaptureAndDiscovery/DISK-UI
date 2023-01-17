import { Box } from "@mui/material"
import { Question, QuestionVariable } from "DISK/interfaces"
import React from "react"
import { BoundingBoxMap } from "./BoundingBoxMap"
import { createTemplateFragments, TemplateFragment, TextPart } from "./QuestionHelpers"
import { isBoundingBoxVariable, isTimeIntervalVariable } from "./QuestionHelpers"
import { QuestionVariableSelector } from "./QuestionVariableSelector"
import { TimeIntervalVariable } from "./TimeIntervalVariable"

interface QuestionTemplateSelectorProps {
    question: Question|null,
}

export const QuestionTemplateFiller = ({ question }: QuestionTemplateSelectorProps) => {
    const [templateFragments, setTemplateFragments] = React.useState<TemplateFragment[]>([]);

    React.useEffect(()=>{
        if (!question)
            return;

        setTemplateFragments(createTemplateFragments(question));
    },[question]);

    if (!templateFragments || templateFragments.length === 0 || !question)
        return null;

    return <Box sx={{ display: 'inline-flex', flexWrap: "wrap", alignItems: "end" }}>
        {templateFragments.map((frag: TemplateFragment, i: number) => {
            if (frag.type === 'variable') { //Is a variable
                let curVariable : QuestionVariable = frag.value;
                if (!curVariable) {
                    console.warn("Question not found!", frag);
                    return null;
                }
                if (isBoundingBoxVariable(curVariable)) {
                    return <BoundingBoxMap key={`qVars${i}`} variable={curVariable}/>
                } else if (isTimeIntervalVariable(curVariable)) {
                    return <TimeIntervalVariable key={`qVars${i}`} variable={curVariable} />
                } else {
                    return <QuestionVariableSelector key={`qVars${i}`} questionId={question.id} variable={curVariable}/>
                }
            } else {
                return <TextPart key={`qPart${i}`}> {frag.value} </TextPart>;
            }
        })}
    </Box>
}