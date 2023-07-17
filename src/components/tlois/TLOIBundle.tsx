import { Box, Card, Divider, Skeleton, breadcrumbsClasses } from "@mui/material"
import { TypographyLabel } from "components/Styles"
import { ConfidencePlot } from "./ConfidencePlot"
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useGetTLOIsQuery } from "redux/apis/tlois";
import { useEffect, useState } from "react";
import { Hypothesis, TriggeredLineOfInquiry } from "DISK/interfaces";
import { TLOITable } from "./TLOITable";
import { useGetLOIByIdQuery } from "redux/apis/lois";
import { OutputSelectorIds } from "components/methods/MethodVariableSelector";
import { ImagePreview } from "components/files/ImagePreview";

interface TLOIBundleProps {
    loiId: string,
    hypothesis: Hypothesis
}

export const TLOIBundle = ({loiId, hypothesis}:TLOIBundleProps) => {
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
            if (loiId) curList = curList.filter((tloi) => tloi.parentLoiId === loiId);
            if (hypothesis && hypothesis.id) curList = curList.filter((tloi) => tloi.parentHypothesisId === hypothesis.id);
            setList(curList);
        } else {
            setList([]);
        }
    }, [TLOIs, loiId, hypothesis, TLOILoading])

    useEffect(() => {
        // Sets name for this bundle
        if (list.length > 0) {
            setName(list[0].name.replace("Triggered: ",""));
        } else {
            setName("");
        }
    }, [list])

    useEffect(() => {
        let plots = new Set<string>();
        let viz = new Set<string>();
        let ignore = new Set<string>();
        let vizMap : {[name:string] : [string, string]} = {};
        if (loi) {
             [...loi.workflows, ...loi.metaWorkflows ].map(wf => wf.bindings).flat().forEach((binding) => {
                if (binding.binding.startsWith("_") && binding.binding.endsWith("_")) {
                    switch (binding.binding as OutputSelectorIds) {
                        case "_CONFIDENCE_VALUE_":
                            plots.add(binding.variable);
                            break;
                        case "_VISUALIZE_":
                            viz.add(binding.variable);
                            break;
                        case "_DO_NO_STORE_":
                            ignore.add(binding.variable);
                            break;
                        default:
                            break;
                    }
                }
            });
        }
        if (list.length > 0) {
            let last = list[list.length - 1];
            let vizArr = Array.from(viz);
            let ignoreArr = Array.from(ignore);
            [...last.workflows, ...last.metaWorkflows].forEach((wf) => {
                if (wf.runs) {
                    Object.values(wf.runs)
                        .flat().map(run =>
                            Object.keys(run.outputs)
                                .filter(key => vizArr.some(v => key.startsWith(v)) && !ignoreArr.some(i => key.startsWith(i)))
                                .map(key => {
                                    let vizName = vizArr.filter(v => key.startsWith(v))[0];
                                    let url = run.outputs[key].id;
                                    if (url != null) {
                                        vizMap[vizName] = [wf.source, url];
                                    }
                                })
                        )
                }
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
        {showConfidencePlot && list.length > 2 && <ConfidencePlot hypothesis={hypothesis} loiId={loiId} />}
    </Card>

}