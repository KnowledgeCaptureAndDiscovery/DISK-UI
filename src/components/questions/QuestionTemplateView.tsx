import { Box, MenuItem, Select } from "@mui/material"
import { Question } from "DISK/interfaces"
import React from "react"
import { createTemplateFragments, TemplateFragment, TextPart } from "./QuestionHelpers"

interface QuestionTemplateViewProps {
    question: Question|null,
}

export const QuestionTemplateView = ({ question }: QuestionTemplateViewProps) => {
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
                return <Select key={`qVars${i}`} size="small" sx={{ display: 'inline-block', minWidth: "150px" }}
                    variant="standard" value={frag.value.variableName} id={`var-${i}`} label={frag.value.variableName} disabled>
                    <MenuItem value={frag.value.variableName}>{frag.value.variableName}</MenuItem>
                </Select>
            } else {
                return <TextPart key={`qPart${i}`}> {frag.value} </TextPart>;
            }
        })}
    </Box>
}
