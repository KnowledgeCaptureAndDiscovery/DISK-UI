import { Box } from "@mui/material"
import { Question, QuestionVariable, varPattern } from "DISK/interfaces"
import React from "react"
import { useAppSelector } from "redux/hooks"
import { RootState } from "redux/store"
import { BoundingBoxMap } from "./BoundingBoxMap"
import { TextPart } from "./QuestionHelpers"
import { isBoundingBoxVariable, isTimeIntervalVariable } from "./QuestionHelpers"
import { QuestionVariableSelector } from "./QuestionVariableSelector"
import { TimeIntervalVariable } from "./TimeIntervalVariable"

interface QuestionTemplateSelectorProps {
    question?: Question,
    required?: boolean,
}

export const QuestionTemplateFiller = ({ required, question }: QuestionTemplateSelectorProps) => {
    const [questionParts, setQuestionParts] = React.useState<string[]>([]);
    const [variables, setVariables] = React.useState<{[name:string]:QuestionVariable}>({});

    React.useEffect(()=>{
        if (!question)
            return;

        let nameToVariable : {[id:string] : QuestionVariable} = {};
        question.variables.forEach((qv:QuestionVariable) => nameToVariable[qv.variableName] = qv);
        setVariables(nameToVariable);
        
        //Split question template in text and inputs
        let textParts : string[] = question.template.split(varPattern);
        let varParts : string [] = [];
        let varIterator : RegExpMatchArray | null = question.template.match(varPattern);
        if (varIterator) varIterator.forEach((cur:string) => varParts.push(cur));
        let startWithText : boolean = question.template.charAt(0) !== '?';

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
    },[question]);

    if (!questionParts || questionParts.length === 0)
        return null;

    return <Box sx={{ display: 'inline-flex', flexWrap: "wrap", alignItems: "end" }}>
        {questionParts.map((part: string, i: number) => {
            if (part.startsWith('?')) { //Is a variable
                let curVariable : QuestionVariable = variables[part];
                if (!curVariable) {
                    console.warn("Question not found!", part);
                    return null;
                }
                if (isBoundingBoxVariable(curVariable)) {
                    return <BoundingBoxMap key={`qVars${i}`} variable={curVariable} bindings={null} />
                } else if (isTimeIntervalVariable(curVariable)) {
                    return <TimeIntervalVariable key={`qVars${i}`} variable={curVariable} />
                } else {
                    return <QuestionVariableSelector key={`qVars${i}`} variable={curVariable}/>
                }
            } else {
                return <TextPart key={`qPart${i}`}> {part} </TextPart>;
            }
        })}
    </Box>
}