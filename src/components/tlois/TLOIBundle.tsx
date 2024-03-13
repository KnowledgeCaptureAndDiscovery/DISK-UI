import { Box, Card, Divider, Skeleton, breadcrumbsClasses } from "@mui/material"
import { TypographyLabel } from "components/Styles"
import { ConfidencePlot } from "./ConfidencePlot"
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useGetTLOIsQuery } from "redux/apis/tlois";
import { useEffect, useState } from "react";
import { Goal, TriggeredLineOfInquiry } from "DISK/interfaces";
import { TLOITable } from "./TLOITable";
import { useGetLOIByIdQuery } from "redux/apis/lois";
import { ImagePreview } from "components/files/ImagePreview";
import { OutputBindingValue } from "components/outputs";

interface TLOIBundleProps {
    loiId: string,
    goal: Goal
}

export const TLOIBundle = ({loiId, goal}:TLOIBundleProps) => {
    const { data:TLOIs, isLoading:TLOILoading} = useGetTLOIsQuery();
    const { data:loi, isLoading:LOILoading} = useGetLOIByIdQuery(loiId);
    const [list, setList] = useState<TriggeredLineOfInquiry[]>([]);
    const [name, setName] = useState<string>("");

    const [showConfidencePlot, setShowConfidencePlot] = useState<boolean>(false);
    const [mainVisualizations, setMainVisualizations] = useState<{[name:string]: [string, string]}>({});

    useEffect(() => {
        //Create list for this hypothesis and line of inquiry
        if (!TLOILoading && !!TLOIs && TLOIs.length > 0) {
            let curList = [ ...TLOIs ];
            if (loiId) curList = curList.filter((tloi) => tloi.parentLoi.id === loiId);
            if (goal && goal.id) curList = curList.filter((tloi) => tloi.parentGoal.id === goal.id);
            setList(curList);
        } else {
            setList([]);
        }
    }, [TLOIs, loiId, goal, TLOILoading])

    useEffect(() => {
        setName(loi && loi.name ? loi.name : "");
    }, [loi])

    useEffect(() => {
        let plots = new Set<string>();
        let viz = new Set<string>();
        let ignore = new Set<string>();
        let vizMap : {[name:string] : [string, string]} = {};
        if (loi) {
             [...loi.workflowSeeds, ...loi.metaWorkflowSeeds ].map(wf => wf.outputs).flat().forEach((binding) => {
                if (binding.type === 'DROP') {
                    ignore.add(binding.variable);
                } else if (!binding.isArray && binding.binding && binding.binding.length > 0)  {
                    let value = binding.binding[0] as OutputBindingValue;
                    if (value.startsWith("_") && value.endsWith("_")) {
                        switch (value) {
                            case "_CONFIDENCE_VALUE_":
                                plots.add(binding.variable);
                                break;
                            case "_VISUALIZE_":
                                viz.add(binding.variable);
                                break;
                            default:
                                break;
                        }
                    }
                }
            });
        }
        if (list.length > 0) {
            let last = list[list.length - 1];
            let vizArr = Array.from(viz);
            let ignoreArr = Array.from(ignore);
            [...last.workflows, ...last.metaWorkflows].forEach((wf) => {
                (wf.executions || []).map(run => run.result.extras).flat().forEach(output => {
                    if (vizArr.some(v => output.variable === v) && !ignoreArr.some(i => output.variable === i) && output.binding.length > 0) {
                        let url = output.binding[output.binding.length-1]; //If is a list, maybe is better to show them all.
                        if (url != null) {
                            vizMap[output.variable] = [wf.source.url, url]; //FIXME: not sure if is url
                        }
                    }
                })
            })
        }

        setMainVisualizations(vizMap);
        setShowConfidencePlot(plots.size > 0);
    }, [loi, list])

    if (TLOILoading || LOILoading)
        return <Skeleton/>;
    
    if (!TLOIs || !loi) {
        console.warn("TLOI or LOI not found!")
        return <></>;
    }

    return <Card variant="outlined" key={loiId} sx={{ marginBottom: "5px", padding: "2px 10px" }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between" }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SettingsIcon sx={{ color: "darkgray", mr: "5px" }} />
                <PlayArrowIcon sx={{ color: "green", ml: "-23px", mb: "-10px" }} />
                <span style={{ marginRight: ".5em" }}> Triggered line of inquiry: </span>
                <b> {name}</b>
            </Box>
            <Box>{list.length} runs</Box>
        </Box>
        <Divider />
        <TypographyLabel>Overview of results:</TypographyLabel>
        <TLOITable list={list} loi={loi} showConfidence={showConfidencePlot}/>
        <Box style={{display:"flex", alignItems:"center", width: "100%", flexDirection: "column"}}>
            {Object.keys(mainVisualizations).map((name) =>
                <ImagePreview key={name} name={name} source={mainVisualizations[name][0]} url={mainVisualizations[name][1]}/>)}
        </Box>
        {showConfidencePlot && list.length > 2 && <ConfidencePlot goal={goal} loiId={loiId} />}
    </Card>

}