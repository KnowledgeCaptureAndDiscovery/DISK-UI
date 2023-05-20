import { Box } from "@mui/material"
import { AnyQuestionVariable, Question, QuestionVariable } from "DISK/interfaces"
import React from "react"
import { BoundingBoxMap } from "./BoundingBoxMap"
import { createTemplateFragments, TemplateFragment, TextPart } from "./QuestionHelpers"
import { QuestionVariableSelector } from "./QuestionVariableSelector"
import { TimeIntervalVariable } from "./TimeIntervalVariable"
import { useGetDynamicOptionsQuery } from "redux/apis/questions"
import { useQuestionBindings } from "redux/hooks"

interface QuestionTemplateSelectorProps {
    question: Question|null,
}

export const QuestionTemplateFiller = ({ question }: QuestionTemplateSelectorProps) => {
    const [templateFragments, setTemplateFragments] = React.useState<TemplateFragment[]>([]);

    const bindings = useQuestionBindings();
    const { refetch } = useGetDynamicOptionsQuery({cfg: {id: (question ? question.id : ''), bindings:bindings}}, {skip:!question});

    React.useEffect(()=>{
        if (!question)
            return;
        setTemplateFragments(createTemplateFragments(question));
    },[question]);

    React.useEffect(() => {
        refetch();
    }, [bindings]);

    if (!templateFragments || templateFragments.length === 0 || !question)
        return null;

    return <Box sx={{ display: 'inline-flex', flexWrap: "wrap", alignItems: "end" }}>
        {templateFragments.map((frag: TemplateFragment, i: number) => {
            if (frag.type === 'variable') { //Is a variable
                let curVariable : AnyQuestionVariable = frag.value;
                if (!curVariable) {
                    console.warn("Question not found!", frag);
                    return null;
                }
                if (curVariable.subType === 'BOUNDING_BOX') {
                    return <BoundingBoxMap key={`qVars${i}`} variable={curVariable}/>
                } else if (curVariable.subType === 'TIME_INTERVAL') {
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