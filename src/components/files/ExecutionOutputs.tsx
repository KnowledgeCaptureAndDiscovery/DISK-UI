import { Box, Card, Divider, Grid, Link, Skeleton, Typography } from "@mui/material"
import { Endpoint, Execution, VariableBinding } from "DISK/interfaces"
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useEffect, useState } from "react";
import { displayConfidenceValue } from "constants/general";
import { BrainModal } from "components/modal/BrainModal";
import { ShinyModal } from "components/modal/ShinyModal";
import { ImagePreview } from "./ImagePreview";

interface ExecutionOutputProps {
    execution: Execution
    outputs: VariableBinding[]
    source: Endpoint
    noModals?: boolean
}

interface OutputVariableAndValue {
    def: VariableBinding,
    value: VariableBinding | null,
};

export const ExecutionOutput = ({execution, outputs, source, noModals=false}:ExecutionOutputProps) => {
    const [outputTable, setOutputTable] = useState<OutputVariableAndValue[]>([]);

    useEffect(() => {
        // Map outputs by variable name, except confidence value.
        let mappedOutputs = (outputs || [])
            .reduce<Record<string,OutputVariableAndValue>>((acc, item) => {
                let value : string = item.binding && item.binding.length > 0 ? item.binding[0] : "";
                if (value !== "" && value !== '_CONFIDENCE_VALUE_') {
                    if (!(noModals && (value === '_SHINY_LOG_' || value === '_BRAIN_VISUALIZATION_'))) {
                        acc[item.variable] = {
                            def: item,
                            value: null // Value will be set next
                        }
                    }
                }
                return acc;
            },{});
        
        // Search for values on extras
        if (execution && execution.result && execution.result.extras) {
            execution.result.extras.forEach(b => {
                let cur = mappedOutputs[b.variable];
                if (cur && b.binding && b.binding.length > 0) {
                    cur.value = b;
                } else {
                    // Output not found!
                    delete mappedOutputs[b.variable]; 
                }
            });
        }
        setOutputTable(Object.values(mappedOutputs));
        return;
    }, [execution, outputs, noModals]);

    const renderLiteral = (binding:VariableBinding, value:string) => {
        let isLiteral = binding.datatype?.endsWith("string") || !value.startsWith("http");
        let isURL = value.startsWith("http") || value.startsWith("www") || value.startsWith("ftp");
        return <span style={{color:isLiteral?"green":"orange"}}>
            {isLiteral ? 
                '"' + value + '"' 
                : (isURL ? <Link href={value} target="_blank">{value.replaceAll(/.*\//g,'')}</Link> : value)}
        </span>
    }

    const getExecutionLink = () => {
        if (source && execution && execution.externalId.includes("localhost")) {
            let sp1 = source.url.split('wings-portal');
            let sp2 = execution.externalId.split('wings-portal');
            if (sp1.length == 2 && sp2.length == 2)
                return sp1[0] + "wings-portal" + sp2[1];
        }
        return execution.externalId;
    }

    const renderBindings = ({def, value} : OutputVariableAndValue) => {
        if (value == null)
            return <></>;
        let cfg = def.binding[0];
        if (def.type === 'PROCESS') {
            if (cfg === '_SHINY_LOG_') {
                return <ShinyModal shinyLog={value.binding[0]} iconOnly={false}/>
            } else if (cfg === '_BRAIN_VISUALIZATION_') {
                return <BrainModal brainCfg={value.binding[0]} iconOnly={false}/>
            }
        } else if (def.type === 'SAVE') {
            if (cfg === '_IMAGE_' || cfg === "_VISUALIZE_") {
                return value.binding.map((b,i) => <a href={b} target="_blank" key={`${def.variable}_${i}`}>
                    <img src={b} style={{maxWidth:"300px", maxHeight:"300px"}}/>
                </a>);
            }
        }
        return value.binding.map(str => renderLiteral(def, str));
    }

    return <Card style={{padding: "5px"}} variant="outlined">
            <Box sx={{display: "flex", justifyContent: "space-between", fontSize: ".9em"}}>
                <a target="_blank" rel="noreferrer" href={getExecutionLink()} style={{display: "inline-flex", alignItems: "center", textDecoration: "none", color: "black"}}>
                    <PlayArrowIcon sx={{ marginLeft: "10px" , color: "darkgreen"}} />
                    <Typography sx={{padding:"0 10px", fontWeight: 500}}>
                        Run: {execution.externalId.replaceAll(/.*#/g, '')}
                    </Typography>
                    <OpenInNewIcon sx={{fontSize: "1rem"}}/>
                </a>
                {execution.result && execution.result.confidenceValue > 0 && <span>
                    <b>{(execution.result && execution.result.confidenceType) || "confidence"}: </b>
                        { displayConfidenceValue(execution.result.confidenceValue)}
                </span>}
            </Box>
        <Divider/>
        {execution.result === null ? <Skeleton/> : 
        <>
            <Box sx={{ fontSize: ".85rem", mt:"10px" }}>
                {outputTable.map(({def, value}) =>
                    <Box key={`var_${def.variable}`} style={{marginBottom: "5px"}}>
                        <Grid  container spacing={2}>
                            <Grid item xs={3} md={2} sx={{ textAlign: "right",  width: "50%", margin: "auto" }}>
                                <b>{def.variable}: </b>
                            </Grid>
                            <Grid item xs={9} md={10}>
                                {renderBindings({def, value})}
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Box>
        </>
        }
    </Card>
}