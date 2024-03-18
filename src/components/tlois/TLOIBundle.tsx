import { Box, Card, Divider, Skeleton } from "@mui/material"
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

interface TLOIBundleProps {
    loiId: string,
    goal: Goal
}

export const TLOIBundle = ({loiId, goal}:TLOIBundleProps) => {
    const { data:TLOIs, isLoading:TLOILoading} = useGetTLOIsQuery();
    const { data:loi, isLoading:LOILoading} = useGetLOIByIdQuery(loiId);
    const [list, setList] = useState<TriggeredLineOfInquiry[]>([]);
    const [name, setName] = useState<string>("");
    const [mainVisualizations, setMainVisualizations] = useState<{[name:string]: string}>({}); //only the last one of these are shown.

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
        let vizMap : {[name:string] : string} = {};
        if (loi && list.length > 0) {
            let allSeeds = [...loi.workflowSeeds, ...loi.metaWorkflowSeeds ];
            let varSet = new Set<string>();
             allSeeds.map(wf => wf.outputs).flat().forEach((binding) => {
                if (binding.binding.length === 1 && binding.binding[0] === "_VISUALIZE_" ) {
                    varSet.add(binding.variable);
                }
            });
            let visualizations = Array.from(varSet);

            let filtered = (list||[])
                .filter(tloi => [...tloi.workflows, ...tloi.metaWorkflows].every(wf => wf.executions.length > 0));

            let last = filtered[filtered.length-1];
            [...last.workflows, ...last.metaWorkflows]
                .filter(wf => wf.executions.length > 0 && wf.executions[0].result)
                .forEach((wf) => {
                    (wf.executions[0].result.extras || []).forEach(binding => {
                        visualizations.forEach(varName => {
                            if (binding.variable === varName && binding.binding.length > 0) {
                                vizMap[varName] = binding.binding[binding.binding.length-1];
                            }
                        });
                    });
                });
        }
        setMainVisualizations(vizMap);
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
        <TLOITable list={list}/>
        <Box style={{display:"flex", alignItems:"center", width: "100%", flexDirection: "column"}}>
            {Object.keys(mainVisualizations).map((name) =>
                <ImagePreview key={name} name={name} source={mainVisualizations[name][0]} url={mainVisualizations[name][1]}/>)}
        </Box>
        <ConfidencePlot goalId={goal.id} loiId={loiId} />
    </Card>

}