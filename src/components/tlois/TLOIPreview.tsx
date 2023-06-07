import { Card } from "@mui/material";
import { TriggeredLineOfInquiry } from "DISK/interfaces";
import { GREEN_BLUE, GREEN_YELLOW, LIGHT_GREEN, RED } from "constants/colors";
import { BRAIN_FILENAME, SHINY_FILENAME, displayConfidenceValue } from "constants/general";
import { PATH_TLOIS } from "constants/routes";
import { Link } from "react-router-dom";


interface TLOIPreviewProps {
    tloi: TriggeredLineOfInquiry
}

export const TLOIPreview = ({tloi} : TLOIPreviewProps) => {
    const color = tloi.status === "SUCCESSFUL" ?
        LIGHT_GREEN
        : (tloi.status === "RUNNING" ?
            GREEN_BLUE
            : (tloi.status === "FAILED") ? 
                RED : GREEN_YELLOW);

    let nViz = 0;
    [ ...tloi.workflows, ...tloi.metaWorkflows ].forEach((wf) => {
        Object.values(wf.runs||{}).forEach((run) => {
            if (run.outputs) {
                Object.keys(run.outputs).forEach(((name:string) => {
                    if (name === SHINY_FILENAME || name === BRAIN_FILENAME) {
                        nViz += 1;
                    }
                }));
            }
        });
    });


    return (
        <Card key={`k_${tloi.id}`} component={Link} to={PATH_TLOIS + "/" + tloi.id}
                style={{padding: "0px 10px", marginBottom: '5px', display:"flex", justifyContent:"space-between", fontSize:".8em", backgroundColor: color, textDecoration: 'none'}}>
            <span><span style={{fontWeight: 'bold', color: '#333'}}>{tloi.name}</span> - <span style={{color:'#666'}}>{tloi.dateCreated}</span></span>
            <span>
                {nViz > 0 && <span style={{marginRight: '10px'}}>This run has {nViz} visualization{nViz > 1 && 's'}</span>}
                <span style={{width:"96px", display: "inline-block"}}>
                    <b>P-value:</b> {displayConfidenceValue(tloi.confidenceValue)}
                </span>
            </span>
        </Card>
    );
}
