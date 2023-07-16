import { LineOfInquiry, TriggeredLineOfInquiry, Workflow, RunBinding, WorkflowRun } from "./interfaces";

const RE_LINKS = /\[(.*?)\]\((.*?)\)/g;

export const renderDescription = (text:string) => {
    if (text !== null) {
        let htmlText : string = text.replaceAll(RE_LINKS, '<a target="_blank" href="$2">$1</a>');
        return <i dangerouslySetInnerHTML={{__html: htmlText}} style={{display: 'inline', fontSize: '.9em'}}/>
    } else {
        return <div> No description provided </div>    
    }
}

export const cleanLOI : (loi:LineOfInquiry) => LineOfInquiry = (loi:LineOfInquiry) => {
    return { 
        ...loi,
        workflows: loi.workflows.map(cleanWorkflow),
        metaWorkflows: loi.metaWorkflows.map(cleanWorkflow)
    };
}

export const cleanTLOI : (tloi:TriggeredLineOfInquiry) => TriggeredLineOfInquiry = (tloi) => {
    return { 
        ...tloi,
        workflows: tloi.workflows.map(cleanWorkflow),
        metaWorkflows: tloi.metaWorkflows.map(cleanWorkflow)
    };
}

export const cleanWorkflow : (wf:Workflow) => Workflow = (wf) => {
    return {
        ...wf,
        bindings: wf.bindings.map(b => {return {
            ...b,
            collection: undefined,
            bindingAsArray: undefined,
        }}),
    }
}

export const getBindingAsArray : (binding:string) => string[] = (binding) => {
    return binding.replaceAll(/[\[\]]/g, '').split(', ');
}

export const getFileName = (text:string) => {
    return text.replace('FILE-','').replaceAll(/[-_]/g, ' ');
}

export const isInternalOutput : (name:string) => boolean = (name) => {
    return name === "p_value" || name === "brain_visualization";
}

export const findOutputInRuns : (tloi:TriggeredLineOfInquiry|LineOfInquiry, name:string) => [string, RunBinding|null]= (tloi,name) => {
    let wfs = [...tloi.workflows, ...tloi.metaWorkflows];
    for (let i = 0; i < wfs.length; i++) {
        let runs = Object.values(wfs[i].runs || {});
        for (let j = 0; j < runs.length; j++) {
            let run = runs[j];
            if (run.outputs[name])
                return [wfs[i].source, run.outputs[name]];
        }
    }

    return ["", null];
};