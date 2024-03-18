import { Box, Card, Typography, Divider, Grid, Button, styled, Link} from "@mui/material"
import { WorkflowInstantiation, VariableBinding } from "DISK/interfaces"
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useEffect, useState } from "react";
import { ExecutionOutput } from "components/files/ExecutionOutputs";

const TypographyLabel = styled(Typography)(({ theme }) => ({
    color: 'gray',
    display: "inline",
    fontWeight: "bold",
    fontSize: '0.9em',
}));

interface WorkflowInstantiationPreviewProps {
    workflow: WorkflowInstantiation,
    meta?: boolean
}

export const WorkflowInstantiationPreview = ({workflow:wf, meta=false} : WorkflowInstantiationPreviewProps) => {
    const [valuesMap, setValuesMap] = useState<Record<string, VariableBinding>>({});
    const [hasArray, setHasArray] = useState<boolean>(false);

    useEffect(() => {
        if (wf && wf.dataBindings) {
            let map : Record<string, VariableBinding> = {};
            let arrayFound = false;
            for (let dataB of wf.dataBindings) {
                map[dataB.variable] = dataB;
                if (dataB.isArray && dataB.binding.length > 3)
                    arrayFound = true;
            }
            // This is for the outputs.
            if (wf.executions && wf.executions.length > 0) {
                for (let e of wf.executions) {
                    if (e.result.extras) for (let ex of e.result.extras) {
                        map[ex.variable] = ex;
                    }
                }
            }
            // Replace internal bindings for external ones.
            let toReplace = Object.keys(map).filter(name => name.startsWith("_"));
            for (let name of toReplace) {
                map[name.substring(1)] = map[name];
            }

            setValuesMap(map);
            setHasArray(arrayFound);
        } else {
            setValuesMap({});
            setHasArray(false);
        }
    }, [wf]);

    const renderSingleBinding = (binding:VariableBinding, value:string) => {
        let isLiteral = binding.datatype?.endsWith("string") || !value.startsWith("http");
        let isURL = value.startsWith("http") || value.startsWith("www") || value.startsWith("ftp");
        return <span style={{color:isLiteral?"green":"orange"}}>
            {isLiteral ? 
                '"' + value + '"' 
                : (isURL ? <Link href={value} target="_blank">{value.replaceAll(/.*\//g,'')}</Link> : value)}
        </span>
    }

    const renderWorkflowVariableBinding = (binding:VariableBinding) => {
        let values = valuesMap[binding.variable] ? valuesMap[binding.variable].binding : binding.binding;
        if (!values || values.length === 0)
            return;
        if (binding.isArray) {
            return <span style={{color:"rgba(0, 0, 0, 0.87)"}}>
                [&nbsp;
                    {values.filter((_,i) => i<3).map((v,i) => <span key={v+i}>
                        {renderSingleBinding(binding, v)}
                        { i !== values.length-1 && ", " }
                    </span>)}
                    {values.length>=3 &&
                    <i> and {values.length - 3} more</i> } 
                &nbsp;]
                <span style={{marginLeft: '5px', color: 'darkgray', fontWeight: 'bold'}} >(List)</span>
            </span>
        } else {
            return renderSingleBinding(binding, values[0]);
        }
    }

    return (
        <Card key={`wf_${wf.link}`} variant="outlined" sx={{mb: "5px"}}>
            <Box sx={{display: "flex", justifyContent: "space-between"}}>
                <a target="_blank" rel="noreferrer" href={wf.link} style={{display: "inline-flex", alignItems: "center", textDecoration: "none", color: "black"}}>
                    <DisplaySettingsIcon sx={{ marginLeft: "10px" , color: "darkgreen"}} />
                    <Typography sx={{padding:"0 10px", fontWeight: 500}}>{wf.name}</Typography>
                    <OpenInNewIcon sx={{fontSize: "1rem"}}/>
                </a>
            </Box>
            <Divider/>
            {wf.description && (<Typography sx={{p:"0 10px", fontSize:"0.95em", color:"#333"}}>{wf.description}</Typography>)}
            {wf.parameters.length > 0 && <Box>
                <TypographyLabel sx={{ padding: "20px", fontSize: "1em"}}>
                    {meta ? "Meta-workflow" : "Workflow"} parameters:
                </TypographyLabel>
                <Box sx={{fontSize:".85rem"}}>
                    { wf.parameters.map((binding:VariableBinding) =>
                        <Grid key={`var_${binding.variable}`} container spacing={1}>
                            <Grid item xs={3} md={2} sx={{textAlign: "right"}}>
                                <b>{binding.variable}: </b>
                            </Grid>
                            <Grid item xs={9} md={10}>
                                {renderWorkflowVariableBinding(binding)}
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </Box>}
            {wf.inputs.length > 0 && <Box>
                <TypographyLabel sx={{ padding: "20px", fontSize: "1em"}}>
                    {meta ? "Meta-workflow" : "Workflow"} inputs:
                </TypographyLabel>
                <Box sx={{fontSize:".85rem"}}>
                    { wf.inputs.map((binding:VariableBinding) =>
                        <Grid key={`var_${binding.variable}`} container spacing={1}>
                            <Grid item xs={3} md={2} sx={{textAlign: "right"}}>
                                <b>{binding.variable}: </b>
                            </Grid>
                            <Grid item xs={9} md={10}>
                                {renderWorkflowVariableBinding(binding)}
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </Box>}
            {hasArray && 
                <Box style={{display:"flex", width:"100%", justifyContent: "center", marginBottom:"5px"}}>
                    <Button>
                        See all parameters and inputs //TODO: this should open a modal
                    </Button>
                </Box>
            }

            {wf.outputs.length > 0 && <Box>
                <Divider/>
                <TypographyLabel sx={{ padding: "20px", fontSize: "1em"}}>
                    {meta ? "Meta-workflow" : "Workflow"} outputs:
                </TypographyLabel>
                {wf.executions && wf.executions.length > 0 ?
                    wf.executions.map(e => 
                        <Box style={{padding:"5px"}} key={e.externalId}>
                            <ExecutionOutput execution={e} outputs={wf.outputs} source={wf.source}/>
                        </Box>
                    )
                    : <Box sx={{fontSize:".85rem"}}>
                        { wf.outputs.map((binding:VariableBinding) =>
                            <Grid key={`var_${binding.variable}`} container spacing={1}>
                                <Grid item xs={3} md={2} sx={{textAlign: "right"}}>
                                    <b>{binding.variable}: </b>
                                </Grid>
                                <Grid item xs={9} md={10}>
                                    {renderWorkflowVariableBinding(binding)}
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                }
            </Box>}
        </Card>
    );
}