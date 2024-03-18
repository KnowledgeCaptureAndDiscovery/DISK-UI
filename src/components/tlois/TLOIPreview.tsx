import { Card } from "@mui/material";
import { GoalResult, TriggeredLineOfInquiry } from "DISK/interfaces";
import { getId } from "DISK/util";
import { GREEN_BLUE, GREEN_YELLOW, LIGHT_GREEN, RED } from "constants/colors";
import { BRAIN_FILENAME, SHINY_FILENAME, displayConfidenceValue } from "constants/general";
import { PATH_TLOIS } from "constants/routes";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


interface TLOIPreviewProps {
    tloi: TriggeredLineOfInquiry
}

export const TLOIPreview = ({tloi} : TLOIPreviewProps) => {
    const [result, setResult] = useState<GoalResult|null>(null);

    useEffect(() => {
        for (const wf of [...tloi.workflows, ...tloi.metaWorkflows]) {
            for (const exec of wf.executions) {
                if (exec.result) {
                    setResult(exec.result);
                    break;
                }
            }
        }
    }, [tloi])

    const color = tloi.status === "SUCCESSFUL" ?
        LIGHT_GREEN
        : (tloi.status === "RUNNING" ?
            GREEN_BLUE
            : (tloi.status === "FAILED") ? 
                RED : GREEN_YELLOW);

    let nViz = 0;
    // TODO:
    //[ ...tloi.workflows, ...tloi.metaWorkflows ].forEach((wf) => {
    //    Object.values(wf.runs||{}).forEach((run) => {
    //        if (run.outputs) {
    //            Object.keys(run.outputs).forEach(((name:string) => {
    //                if (name === SHINY_FILENAME || name === BRAIN_FILENAME) {
    //                    nViz += 1;
    //                }
    //            }));
    //        }
    //    });
    //});


    return (
        <Card key={`k_${tloi.id}`} component={Link} to={PATH_TLOIS + "/" + getId(tloi)}
                style={{padding: "0px 10px", marginBottom: '5px', display:"flex", justifyContent:"space-between", fontSize:".8em", backgroundColor: color, textDecoration: 'none'}}>
            <span><span style={{fontWeight: 'bold', color: '#333'}}>{tloi.name}</span> - <span style={{color:'#666'}}>{tloi.dateCreated}</span></span>
            <span>
                {nViz > 0 && <span style={{marginRight: '10px'}}>This run has {nViz} visualization{nViz > 1 && 's'}</span>}
                { result && 
                    <span style={{width:"120px", display: "inline-block"}}>
                        <b>{result.confidenceType || 'P-value'}:</b> {displayConfidenceValue(result.confidenceValue)}
                    </span>}
            </span>
        </Card>
    );
}
