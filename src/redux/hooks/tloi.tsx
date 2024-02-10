import { TriggeredLineOfInquiry, VariableBinding, Workflow, WorkflowRun } from "DISK/interfaces";
import { useEffect, useState } from "react";
import { useGetTLOIsQuery } from "redux/apis/tlois";

interface DataPackage {
    isLoading: boolean,
    data: TriggeredLineOfInquiry[]
}

interface FilterProps {
    hypothesisId?: string,
    loiId?: string,
    sort?: (t1:TriggeredLineOfInquiry, t2:TriggeredLineOfInquiry) => number,
}

export const useFilteredTLOIs : ({hypothesisId, loiId, sort}:FilterProps) => DataPackage = ({hypothesisId, loiId, sort}) => {
    const { data: TLOIs, isLoading } = useGetTLOIsQuery();
    const [filteredTLOIs, setFilteredTLOIs] = useState<TriggeredLineOfInquiry[]>([]);

    useEffect(() => {
        let cur: TriggeredLineOfInquiry[] = [];
        if (TLOIs && TLOIs.length > 0 && hypothesisId && loiId) {
            cur = [...TLOIs];
            if (hypothesisId) cur = cur.filter((tloi) => tloi.parentGoal.id === hypothesisId);
            if (loiId) cur = cur.filter((tloi) => tloi.parentLoi.id === loiId);
            //cur = cur.filter((tloi) => tloi.confidenceValue > 0);
        }
        if (sort) cur = cur.sort(sort);
        setFilteredTLOIs(cur);
    }, [TLOIs]);

    return {
        isLoading: isLoading,
        data: filteredTLOIs,
    };
}

type FileMap = {[name:string]: string[]};

interface OutputFiles {
    ignore?: FileMap,
    download?: FileMap,
    image?: FileMap,
    visualize?: FileMap,
    other?: FileMap,
}

interface UseOutputProps {
    data: TriggeredLineOfInquiry[],
}

//export type OutputSelectorIds = '_DO_NO_STORE_' | '_DOWNLOAD_ONLY_' | '_IMAGE_' | '_VISUALIZE_' | '_CONFIDENCE_VALUE_';

export const useOutputs : ({data}: UseOutputProps) => OutputFiles = ({data}) => {
    const [outputFiles, setOutputFiles] = useState<{[FileType:string]:FileMap}>({});
    const SKIP_FILES = ["_CSV_", "_CONFIDENCE_VALUE_"];

    useEffect(() => {
        let outputTypes: { [FileType: string]: string[] } = {
            "_OTHER_": [],
        };
        let outputFiles: { [FileType: string]: { [FileName: string]: string[] } } = {
            "_OTHER_": {},
        };

        /*TODO:
        (data || []).forEach((tloi: TriggeredLineOfInquiry) => {
            [...tloi.workflows, ...tloi.metaWorkflows].forEach((wf: Workflow) => {
                (wf.bindings || []).forEach((binding:VariableBinding) => {
                    if (binding && binding.binding) {
                        if (binding.binding.startsWith("_") && !SKIP_FILES.some(str => str===binding.binding)) {
                            if (!outputTypes[binding.binding]) outputTypes[binding.binding] = [];
                            if (!outputFiles[binding.binding]) outputFiles[binding.binding] = {};
                            outputTypes[binding.binding].push(binding.variable);
                        } else if (!SKIP_FILES.some(str => str===binding.binding)) {
                            outputTypes["_OTHER_"].push(binding.variable);
                        }
                    }
                });

                Object.values(wf.runs || {}).forEach((run: WorkflowRun) => {
                    Object.keys(run.outputs).forEach((outName) => {
                        let binding = run.outputs[outName];
                        //Output files are type URI and the ID is needed to download.
                        if (binding.type === "URI" && binding.id != null) {
                            Object.keys(outputTypes).forEach((fileType) => {
                                outputTypes[fileType].forEach((fileName) => {
                                    if (outName.startsWith(fileName)) {
                                        if (!outputFiles[fileType][fileName]) outputFiles[fileType][fileName] = [];
                                        outputFiles[fileType][fileName].push(binding.id as string);
                                    }
                                });
                            });
                        }
                    });
                });
            });
        });*/

        setOutputFiles(outputFiles);
    }, [data]);
 
    return {
        download: outputFiles["_DOWNLOAD_ONLY_"] ,
        image: outputFiles["_IMAGE_"],
        visualize: outputFiles["_VISUALIZE_"],
        other: Object.keys(outputFiles["_OTHER_"] || {}).length === 0 ? undefined : outputFiles["_OTHER_"]
    };
}