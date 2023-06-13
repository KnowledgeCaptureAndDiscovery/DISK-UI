import { LineOfInquiry, RunBinding, TriggeredLineOfInquiry, Workflow, WorkflowRun } from "./interfaces";

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