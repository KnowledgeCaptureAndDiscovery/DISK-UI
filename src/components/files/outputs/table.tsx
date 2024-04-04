import { Box } from "@mui/material";
import { GoalResult, TriggeredLineOfInquiry, VariableBinding, WorkflowInstantiation } from "DISK/interfaces";
import { getId } from "DISK/util";
import { NarrativeModal } from "components/modal/NarrativeModal";
import { TLOIDeleteButton } from "components/tlois/TLOIDeleteButton";
import { TLOIEditButton } from "components/tlois/TLOIEdit";
import { PATH_TLOIS } from "constants/routes";
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { FileList } from "components/files/FileList";
import ErrorIcon from '@mui/icons-material/ErrorOutline';
import WaitIcon from '@mui/icons-material/HourglassBottom';
import CheckIcon from '@mui/icons-material/Check';
import { displayConfidenceValue } from "constants/general";
import { BrainModal } from "components/modal/BrainModal";
import { ShinyModal } from "components/modal/ShinyModal";

export type TLOICell = (tloi: TriggeredLineOfInquiry, i: number) => JSX.Element;
export type ColumnName = '#' | "Date" | "Run Status" | "Input Files" | "Output Files" | "Confidence Value" | "Extras";

export const getIconStatus = (status: TriggeredLineOfInquiry["status"]) => {
    if (status === 'FAILED')
        return <ErrorIcon />;
    if (status === 'SUCCESSFUL')
        return <CheckIcon />;
    if (status === 'QUEUED' || status === 'RUNNING')
        return <WaitIcon />;
}

const renderConfidenceValue = (tloi: TriggeredLineOfInquiry, i: number) => {
    let all = [...(tloi.workflows||[]), ...(tloi.metaWorkflows||[])];
    //We show the bigger p-value from the executions.
    let result : GoalResult | undefined = undefined;
    let min = 0;
    for (const wf of all) {
        for (const e of (wf.executions||[])) {
            if (!!e.result && e.result.confidenceValue > min) {
                result = e.result;
                min = e.result.confidenceValue;
            }
        }
    }
    if (!result)
        return <>-</>;
    return <Fragment>
                {displayConfidenceValue(result.confidenceValue)}
                {result.confidenceType ? ` (${result.confidenceType})` : " (P-value)"}
            </Fragment>
}

type RenderableOutput = '_SHINY_LOG_' | '_BRAIN_VISUALIZATION_';
const renderOptionalButtons = (cur: TriggeredLineOfInquiry) => {
    const renderable : RenderableOutput[] = ['_SHINY_LOG_', '_BRAIN_VISUALIZATION_'];
    let variables : Partial<Record<string, RenderableOutput>> = {};
    let values : Partial<Record<RenderableOutput,string>> = {};
    
    [ ...cur.workflows, ...cur.metaWorkflows ].forEach((wf:WorkflowInstantiation) => {
        (wf.outputs||[])
            .filter(b => b.binding && b.binding.length > 0 && renderable.some(r=>r===b.binding[0]))
            .forEach(b => variables[b.variable] = b.binding[0] as RenderableOutput);
        (wf.executions || [])
            .filter(e => e.result && e.result.extras)
            .map(e => e.result!.extras).flat()
            .forEach(b => {
                let key = variables[b.variable];
                if (key && b.binding && b.binding.length >0) {
                    values[key] = b.binding[0];
                }
            });
    });

    return (<Fragment>
        {!!values['_SHINY_LOG_'] && (<ShinyModal shinyLog={values['_SHINY_LOG_']}/>)}
        {!!values['_BRAIN_VISUALIZATION_'] && values['_BRAIN_VISUALIZATION_'] !== "[]\n" && (<BrainModal brainCfg={values['_BRAIN_VISUALIZATION_']}/>)}
    </Fragment>);
}

export const ALL_COLUMNS: Record<ColumnName, TLOICell> = {
    '#': (tloi: TriggeredLineOfInquiry, i: number) =>
        <Box component={Link} to={PATH_TLOIS + "/" + getId(tloi)} sx={{ textDecoration: "none", color: "black" }}>
            {i + 1}
        </Box>,
    'Date': (tloi: TriggeredLineOfInquiry, i: number) =>
        <Box component={Link} to={PATH_TLOIS + "/" + getId(tloi)} sx={{ textDecoration: "none", color: "black" }}>
            {tloi.dateCreated ? tloi.dateCreated.replace("T"," ") : ""}
        </Box>,
    'Run Status': (tloi: TriggeredLineOfInquiry, i: number) =>
        <Box component={Link} to={PATH_TLOIS + "/" + getId(tloi)} sx={{ textDecoration: "none", color: "black", display: 'flex', alignItems: 'center' }}>
            {getIconStatus(tloi.status)}
            <Box sx={{ marginLeft: '6px' }}>
                {tloi.status === 'SUCCESSFUL' ? 'DONE' : tloi.status}
            </Box>
        </Box>,
    'Input Files': (tloi: TriggeredLineOfInquiry, i: number) =>
        <FileList type="input" tloi={tloi} label="Input files" />,
    'Output Files': (tloi: TriggeredLineOfInquiry, i: number) =>
        <Fragment>{
            (tloi.status === 'SUCCESSFUL' && <FileList type="output" tloi={tloi} label="Output files" renderFiles />)
        }</Fragment>,
    'Confidence Value': renderConfidenceValue,
    'Extras': (tloi: TriggeredLineOfInquiry, i: number) =>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "end" }}>
            <NarrativeModal tloi={tloi} />
            {renderOptionalButtons(tloi)}
            <TLOIEditButton tloi={tloi} label={"Editing " + tloi.name} />
            <TLOIDeleteButton tloi={tloi} />
        </Box>
}