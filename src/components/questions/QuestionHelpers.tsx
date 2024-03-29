import styled from "@emotion/styled";
import { Box } from "@mui/material";
import { AnyQuestionVariable, Question, QuestionVariable, Triple, VariableBinding, Workflow } from "DISK/interfaces";
import { StrStrMap } from "redux/slices/forms";

export type TemplateFragment = {
    type: 'string',
    value: string
} | {
    type: 'variable',
    value: AnyQuestionVariable
};

export const TextPart = styled(Box)(({ theme }) => ({
    display: 'inline-block',
    borderBottom: "1px solid #c9c9c9",
    padding: "4px",
    whiteSpace: "nowrap"
}));

export const createTemplateFragments : (question:Question)  => TemplateFragment[] = (question) => {
    let fragments : TemplateFragment[] = [];
    if (question) {
        let nameToVariable : {[name:string] : AnyQuestionVariable} = {};
        question.variables.forEach((qv:AnyQuestionVariable) => nameToVariable[qv.variableName] = qv);
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

export const bindingsToIdValueMap : (bindings:VariableBinding[])  => StrStrMap = (bindings) => {
    let r : StrStrMap = {};
    (bindings||[]).forEach((vb: VariableBinding) => {
        r[vb.variable] = vb.binding
    });
    return r;
}

export const simpleMapToVariableBindings : (bindings:StrStrMap) => VariableBinding[] = (bindings) => {
    return Object.keys(bindings).map((varId: string) => {
        return {
            variable: varId,
            binding: bindings[varId],
            type: null //FIXME?
        } as VariableBinding;
    });
}

export const getCompleteQuestionGraph : (question:Question) => Triple[] = (question) => {
    return [
        ...question.pattern,
        ...getAllQuestionVariables(question).filter(q => q.patternFragment).map(q => [...q.patternFragment]).flat(2),
    ];
}

export const validURL = (str:string) => {
    let url;
    try {
        url = new URL(str);
    } catch (_) {
        return false;  
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }


export const addBindingsToQuestionGraph : (question:Question, bindings:StrStrMap)  => Triple[] = (question, bindings) => {
        let graph = getCompleteQuestionGraph(question);
        // Add binding values
        let updatedGraph : Triple[] = []
        graph.forEach((t:Triple) => {
            let obj = t.object;
            let objVal : string = bindings[t.object.value];
            if (objVal) {
                obj = {
                    type: validURL(objVal) ? 'URI' : 'LITERAL',
                    value: objVal,
                }
            }

            updatedGraph.push({
                subject: bindings[t.subject] || t.subject,
                predicate: bindings[t.predicate] || t.predicate,
                object: obj
            });
        });
        return updatedGraph;
}

export const getAllQuestionVariables : (question:Question)  => AnyQuestionVariable[] = (question) => {
    let allVariables : AnyQuestionVariable[] = []
    question.variables.forEach((v:AnyQuestionVariable) => {
        allVariables.push(v);
        if (v.subType === 'BOUNDING_BOX' ){
            allVariables = allVariables.concat([v.maxLat, v.minLat, v.maxLng, v.minLng]);
        } else if (v.subType === 'TIME_INTERVAL') {
            allVariables = allVariables.concat([v.startTime, v.endTime, v.timeType]);
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
        runs: wf.runs,
        meta: wf.meta,       
    }
}

export const createQueryForGraph : (triples: Triple[], varMap:{[uri:string]:QuestionVariable}) => string = (triples, varMap) => {
    let query : string = "";
    const toVariable = (uri:string) =>
        uri ? (varMap[uri]? varMap[uri].variableName : '<' + uri + '>') : "?goal";

    triples.forEach((t:Triple) => {
        query += 
            toVariable(t.subject) + " " + toVariable(t.predicate) + " " 
            + (t.object.type === "URI" ? toVariable(t.object.value) : '"' + t.object.value + '"' //TODO: should add xsd:datatype
        ) + ".\n"
    });
    return query;
}