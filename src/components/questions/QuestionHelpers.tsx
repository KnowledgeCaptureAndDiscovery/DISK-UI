import styled from "@emotion/styled";
import { Box } from "@mui/material";
import { Question, QuestionVariable, Triple, VariableBinding, Workflow } from "DISK/interfaces";
import { SimpleMap } from "redux/slices/forms";

export type TemplateFragment = {
    type: 'string',
    value: string
} | {
    type: 'variable',
    value: QuestionVariable
};


export const TextPart = styled(Box)(({ theme }) => ({
    display: 'inline-block',
    borderBottom: "1px solid #c9c9c9",
    padding: "4px",
    whiteSpace: "nowrap"
}));

export const isBoundingBoxVariable = (v:QuestionVariable) => v.subType != null && v.subType.endsWith("BoundingBoxQuestionVariable");

export const isTimeIntervalVariable = (v:QuestionVariable) => v.subType != null && v.subType.endsWith("TimeIntervalQuestionVariable");

export const createTemplateFragments : (question:Question)  => TemplateFragment[] = (question) => {
    let fragments : TemplateFragment[] = [];
    if (question) {
        let nameToVariable : {[name:string] : QuestionVariable} = {};
        question.variables.forEach((qv:QuestionVariable) => nameToVariable[qv.variableName] = qv);
        let strFragments = question.template.split(/(\?[a-zA-Z0-9]*)/);
        fragments = strFragments.filter(s => !!s).map((strFrag:string) => {
            if (strFrag.startsWith('?')) {
                return {
                    type: 'variable',
                    value: nameToVariable[strFrag],
                }
            } else {
                return {
                    type: 'string',
                    value: strFrag,
                } 
            }
        });
    }
    return fragments;
}

export const simpleMapToVariableBindings : (bindings:SimpleMap)  => VariableBinding[] = (bindings) => {
    return Object.keys(bindings).map((varId: string) => {
        return {
            variable: varId,
            binding: bindings[varId],
            type: null //FIXME?
        } as VariableBinding;
    });
}

export const simpleMapToGraph : (question:Question, bindings:SimpleMap)  => Triple[] = (question, bindings) => {
        let noOptionalsPattern : string = question.pattern.replace(/optional\s*\{.+\}/g, '').trim();
        let pattern:string[] = noOptionalsPattern.split(/\s/);
        let nameToValue : SimpleMap = {};
        question.variables.forEach((qv) => nameToValue[qv.variableName] = bindings[qv.id]);
        let updatedGraph: Triple[] = [];
        let emptyTriple: Triple = {
            subject: "",
            predicate: "",
            object: {
                type: 'LITERAL',
                value: '',
                datatype: ''
            }
        };
        let curTriple: Triple = emptyTriple;
        for (let i: number = 0; i < pattern.length; i++) {
            let part: string = pattern[i];
            let value: string = nameToValue[part] ? nameToValue[part] : part;
            let c: number = i % 3;
            switch (c) {
                case 0:
                    curTriple = { ...emptyTriple };
                    curTriple.subject = value;
                    break;
                case 1:
                    curTriple.predicate = value;
                    break;
                case 2:
                    let isURI: boolean = value.startsWith("http") || value.startsWith("www");
                    curTriple.object = {
                        type: isURI ? 'URI' : 'LITERAL',
                        value: value,
                        datatype: isURI ? undefined : "http://www.w3.org/2001/XMLSchema#string"
                    }
                    updatedGraph.push(curTriple);
                    break;
            }
        }
        return updatedGraph;
}

export const getAllQuestionVariables : (question:Question)  => QuestionVariable[] = (question) => {
    let allVariables : QuestionVariable[] = []
    question.variables.forEach((v:QuestionVariable) => {
        allVariables.push(v);
        if (isBoundingBoxVariable(v)) {
            allVariables = allVariables.concat( [v.maxLat, v.minLat, v.maxLng, v.minLng] );
        } else if (isTimeIntervalVariable(v)) {
            //TODO
        }
    })
    return allVariables;
}

//This is to align data structures to the server
export const  alignVariableBinding : (binding:VariableBinding) => VariableBinding = (binding) => {
    return {
        variable:   binding.variable,
        binding:    binding.binding,
        type:       binding.type,
    };
}

export const  alignWorkflow : (wf:Workflow) => Workflow = (wf) => {
    return {
        source: wf.source,
        description: wf.description,
        workflow: wf.workflow,
        workflowLink: wf.workflowLink,
        bindings: wf.bindings.map(alignVariableBinding),
        run: wf.run,
        meta: wf.meta,       
    }
}