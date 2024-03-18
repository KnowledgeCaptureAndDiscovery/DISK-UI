import { Box, Card, Divider, Grid, Link, Typography } from "@mui/material"
import { Endpoint, Execution, VariableBinding } from "DISK/interfaces"
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useEffect, useState } from "react";
import { displayConfidenceValue } from "constants/general";
import { BrainModal } from "components/modal/BrainModal";
import { ShinyModal } from "components/modal/ShinyModal";

interface ExecutionOutputProps {
    execution: Execution
    outputs: VariableBinding[]
    source: Endpoint
}

export const ExecutionOutput = ({execution, outputs, source}:ExecutionOutputProps) => {
    const [shinyLog, setShinyLog] = useState<string>("");
    const [brainCfg, setBrainCfg] = useState<string>("");
    const [visibleOutputs, setVisibleOutputs] = useState<VariableBinding[]>([]);

    type RenderableOutput = '_SHINY_LOG_' | '_BRAIN_VISUALIZATION_' | '_CONFIDENCE_VALUE_';
    useEffect(() => {
        let renderable : RenderableOutput[] = ['_SHINY_LOG_', '_BRAIN_VISUALIZATION_'];
        let variables: Partial<Record<string, RenderableOutput>> = {};
        let values: Partial<Record<RenderableOutput, string>> = {};
        let map: Partial<Record<string, VariableBinding>> = {};

        (outputs || [])
            .filter(b => b.binding && b.binding.length > 0 && renderable.some(r => r === b.binding[0]))
            .forEach(b => variables[b.variable] = b.binding[0] as RenderableOutput);
        if (execution && execution.result && execution.result.extras) {
            execution.result.extras.forEach(b => {
                let key = variables[b.variable];
                if (key && b.binding && b.binding.length > 0) {
                    values[key] = b.binding[0];
                }
                map[b.variable] = b;
            });
        }
        setShinyLog(values['_SHINY_LOG_'] ?  values['_SHINY_LOG_'] : "");
        setBrainCfg(values['_BRAIN_VISUALIZATION_'] ?  values['_BRAIN_VISUALIZATION_'] : "");
        // Now remove processed outputs and bind to execution outputs.
        renderable.push("_CONFIDENCE_VALUE_");

        setVisibleOutputs(outputs
            .filter(o => !(!o.binding || o.binding.length === 0 || renderable.some(r => r === o.binding[0])))
            .map(o => map[o.variable] ? map[o.variable] as VariableBinding : o)
        );
    }, [execution, outputs]);

    const renderOneBinding = (binding:VariableBinding, value:string) => {
        let isLiteral = binding.datatype?.endsWith("string") || !value.startsWith("http");
        let isURL = value.startsWith("http") || value.startsWith("www") || value.startsWith("ftp");
        return <span style={{color:isLiteral?"green":"orange"}}>
            {isLiteral ? 
                '"' + value + '"' 
                : (isURL ? <Link href={value} target="_blank">{value.replaceAll(/.*\//g,'')}</Link> : value)}
        </span>
    }

    const renderBindings = (binding: VariableBinding) => {
        if (!binding.isArray || binding.binding.length === 1) {
            return renderOneBinding(binding, binding.binding[0]);
        } else {
            return binding.binding.map(str => renderOneBinding(binding, str));
        }
    }

    const getExecutionLink = () => {
        if (source && execution.externalId.includes("localhost")) {
            let sp1 = source.url.split('wings-portal');
            let sp2 = execution.externalId.split('wings-portal');
            if (sp1.length == 2 && sp2.length == 2)
                return sp1[0] + "wings-portal" + sp2[1];
        }
        return execution.externalId;
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
                {execution.result.confidenceValue > 0 && <span>
                    <b>{execution.result.confidenceType || "confidence"}: </b>
                        { displayConfidenceValue(execution.result.confidenceValue)}
                </span>}
            </Box>
        <Divider/>
        <Box sx={{ fontSize: ".85rem", mt:"10px" }}>
            {visibleOutputs.map((binding: VariableBinding) =>
                <Grid key={`var_${binding.variable}`} container spacing={1}>
                    <Grid item xs={3} md={2} sx={{ textAlign: "right" }}>
                        <b>{binding.variable}: </b>
                    </Grid>
                    <Grid item xs={9} md={10}>
                        {renderBindings(binding)}
                    </Grid>
                </Grid>
            )}
        </Box>
        <Box style={{display:"flex", justifyContent:"space-around", padding: "10px"}}>
            {shinyLog !== "" && <ShinyModal shinyLog={shinyLog} iconOnly={false}/>}
            {brainCfg !== "" && <BrainModal brainCfg={brainCfg} iconOnly={false}/>}
        </Box>
    </Card>
}