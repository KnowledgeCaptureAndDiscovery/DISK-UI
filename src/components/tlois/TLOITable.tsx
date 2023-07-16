import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Box } from "@mui/material";
import { NarrativeModal } from "components/modal/NarrativeModal";
import { PATH_TLOIS } from "constants/routes";
import { Link } from "react-router-dom";
import { TLOIEditButton } from "./TLOIEdit";
import { Fragment, useState, useEffect } from "react";
import { LineOfInquiry, TriggeredLineOfInquiry, Workflow } from "DISK/interfaces";
import ErrorIcon from '@mui/icons-material/ErrorOutline';
import WaitIcon from '@mui/icons-material/HourglassBottom';
import CheckIcon from '@mui/icons-material/Check';
import { FileList } from "components/FileList";
import { BrainModal } from "components/modal/BrainModal";
import { ShinyModal } from "components/modal/ShinyModal";
import { BRAIN_FILENAME, SHINY_FILENAME, displayConfidenceValue } from "constants/general";
import { TLOIDeleteButton } from "./TLOIDeleteButton";

const getIconStatus = (status: TriggeredLineOfInquiry["status"]) => {
    if (status === 'FAILED')
        return <ErrorIcon />;
    if (status === 'SUCCESSFUL')
        return <CheckIcon />;
    if (status === 'QUEUED' || status === 'RUNNING')
        return <WaitIcon />;
}

type TLOICell = (tloi: TriggeredLineOfInquiry, i: number) => JSX.Element;

interface TLOITableProps {
    list: TriggeredLineOfInquiry[]
    loi: LineOfInquiry,
    showConfidence: boolean
}

export const TLOITable = ({list, loi, showConfidence} : TLOITableProps) => {
    const COLUMNS: { [name: string]: TLOICell } = {
        '#': (tloi: TriggeredLineOfInquiry, i: number) =>
            <Box component={Link} to={PATH_TLOIS + "/" + tloi.id} sx={{ textDecoration: "none", color: "black" }}>
                {i + 1}
            </Box>,
        'Date': (tloi: TriggeredLineOfInquiry, i: number) =>
            <Box component={Link} to={PATH_TLOIS + "/" + tloi.id} sx={{ textDecoration: "none", color: "black" }}>
                {tloi.dateCreated}
            </Box>,
        'Run Status': (tloi: TriggeredLineOfInquiry, i: number) =>
            <Box component={Link} to={PATH_TLOIS + "/" + tloi.id} sx={{ textDecoration: "none", color: "black", display: 'flex', alignItems: 'center' }}>
                {getIconStatus(tloi.status)}
                <Box sx={{ marginLeft: '6px' }}>
                    {tloi.status === 'SUCCESSFUL' ? 'DONE' : tloi.status}
                </Box>
            </Box>,
        'Input Files': (tloi: TriggeredLineOfInquiry, i: number) =>
            <FileList type="input" tloi={tloi} loi={loi}  label="Input files" />,
        'Output Files': (tloi: TriggeredLineOfInquiry, i: number) =>
            <Fragment>{
                (tloi.status === 'SUCCESSFUL' && <FileList type="output" tloi={tloi} loi={loi} label="Output files" renderFiles/>)
            }</Fragment>,
        'Confidence Value': (tloi: TriggeredLineOfInquiry, i: number) =>
            <Fragment>
                {tloi.status === 'SUCCESSFUL' && displayConfidenceValue(tloi.confidenceValue)}
                {tloi.confidenceType ? ` (${tloi.confidenceType})` : " (P-value)"}
            </Fragment>,
        'Extras': (tloi: TriggeredLineOfInquiry, i: number) =>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "end" }}>
                <NarrativeModal tloi={tloi} />
                <TLOIEditButton tloi={tloi} label={"Editing " + tloi.name} />
                {renderOptionalButtons(tloi)}
                <TLOIDeleteButton tloi={tloi}/>
            </Box>
    }
    const [visibleColumns, setVisibleColumns] = useState(['#', "Date", "Run Status", "Input Files", "Output Files", "Confidence Value", "Extras"]);

    useEffect(() => {
        if (!showConfidence) 
            setVisibleColumns(['#', "Date", "Run Status", "Input Files", "Output Files", "Extras"]);
        else 
            setVisibleColumns(['#', "Date", "Run Status", "Input Files", "Output Files", "Confidence Value", "Extras"]);
    }, [showConfidence])

    const renderOptionalButtons = (cur:TriggeredLineOfInquiry) => {
        let shinyUrl : string = "";
        let shinySource : string = "";
        let brainUrl : string = "";
        let brainSource : string = "";
        [ ...cur.workflows, ...cur.metaWorkflows ].forEach((wf:Workflow) => {
            Object.values(wf.runs||{}).forEach((run) => {
                if (run.outputs) {
                    Object.keys(run.outputs).forEach(((name:string) => {
                        if (name === SHINY_FILENAME) {
                            shinyUrl = run ? run.outputs[name].id || "" : "";
                            shinySource = wf.source;
                        } else if (name === BRAIN_FILENAME) {
                            brainUrl = run ? run.outputs[name].id || "" : "";
                            brainSource = wf.source;
                        }
                    }));
                }
            })
        });

        return (<Fragment>
            {!!shinyUrl && (<ShinyModal shinyUrl={shinyUrl} source={shinySource}/>)}
            {!!brainUrl && (<BrainModal brainUrl={brainUrl} source={brainSource}/>)}
        </Fragment>);
    }

    return <TableContainer sx={{ display: "flex", justifyContent: "center" }}>
        <Table sx={{ width: "unset" }}>
            <TableHead>
                <TableRow>
                    {visibleColumns.map((name:string) => <TableCell key={name} sx={{ padding: "0 10px" }}>{name}</TableCell>)}
                </TableRow>
            </TableHead>
            <TableBody>
                {list.map((tloi:TriggeredLineOfInquiry, i:number) => 
                    <TableRow key={tloi.id}>{
                        visibleColumns.map((name:string, j:number) => 
                            <TableCell sx={{ padding: "0 10px"}} key={`cell_${i}_${j}`}>
                                { COLUMNS[name](tloi, i) }
                            </TableCell>
                        )
                    }</TableRow>
                )}
            </TableBody>
        </Table>
    </TableContainer>
}