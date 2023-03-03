import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Box, IconButton, Skeleton, Tooltip } from "@mui/material";
import { ConfirmDialog } from "components/ConfirmDialog";
import { NarrativeModal } from "components/modal/NarrativeModal";
import { PATH_TLOIS } from "constants/routes";
import { Link } from "react-router-dom";
import { useDeleteTLOIMutation, useGetTLOIsQuery, usePostTLOIMutation } from "redux/apis/tlois";
import { TLOIEdit } from "./TLOIEdit";
import { Fragment, useEffect, useState } from "react";
import { Hypothesis, LineOfInquiry, TriggeredLineOfInquiry, Workflow } from "DISK/interfaces";
import ErrorIcon from '@mui/icons-material/ErrorOutline';
import WaitIcon from '@mui/icons-material/HourglassBottom';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import { FileList } from "components/FileList";
import { useAppDispatch, useAuthenticated } from "redux/hooks";
import { cleanTLOI } from "DISK/util";
import { BrainModal } from "components/modal/BrainModal";
import { ShinyModal } from "components/modal/ShinyModal";
import { openBackdrop, closeBackdrop } from "redux/slices/backdrop";
import { openNotification } from "redux/slices/notifications";

const getColorStatus = (status: TriggeredLineOfInquiry["status"]) => {
    return 'unset';
    /*if (status === 'FAILED')
        return 'red';
    if (status === 'SUCCESSFUL' || status === 'RUNNING')
        return 'green';
    if (status === 'QUEUED')
        return 'orange';
    return 'unset';*/
}

const getIconStatus = (status: TriggeredLineOfInquiry["status"]) => {
    if (status === 'FAILED')
        return <ErrorIcon />;
    if (status === 'SUCCESSFUL')
        return <CheckIcon />;
    if (status === 'QUEUED' || status === 'RUNNING')
        return <WaitIcon />;
}

type TLOICell = (tloi: TriggeredLineOfInquiry, i: number) => JSX.Element;

interface TLOIListProps {
    hypothesis? : Hypothesis,
    loiId? : string,
}

export const TLOIList = ({hypothesis, loiId} : TLOIListProps) => {
    const dispatch = useAppDispatch();
    const authenticated = useAuthenticated();
    const { data:TLOIs, isLoading} = useGetTLOIsQuery();
    const [visibleColumns, setVisibleColumns] = useState(['#', "Date", "Run Status", "Input Files", "Output Files", "Confidence Value", "Extras"]);
    const [visibleTLOIs, setVisibleTLOIs] = useState<TriggeredLineOfInquiry[]>([]);
    const [postTLOI, {}] = usePostTLOIMutation();
    const [deleteTLOI, {}] = useDeleteTLOIMutation();

    useEffect(() => {
        if (TLOIs && TLOIs.length > 0) {
            let cur = [...TLOIs];
            if (hypothesis) cur = cur.filter((tloi) => tloi.parentHypothesisId === hypothesis.id);
            if (loiId) cur = cur.filter((tloi) => tloi.parentLoiId === loiId);
            setVisibleTLOIs(cur);
        }
    }, [TLOIs, hypothesis]);

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
            <FileList type="input" tloi={tloi} label="Input files" />,
        'Output Files': (tloi: TriggeredLineOfInquiry, i: number) =>
            <Fragment>{
                (tloi.status === 'SUCCESSFUL' && <FileList type="output" tloi={tloi} label="Output files" />)
            }</Fragment>,
        'Confidence Value': (tloi: TriggeredLineOfInquiry, i: number) =>
            <Fragment>
                {
                    tloi.status === 'SUCCESSFUL' && (
                        tloi.confidenceValue > 0 ?
                            (tloi.confidenceValue < 0.0001 ?
                                tloi.confidenceValue.toExponential(3)
                                :
                                tloi.confidenceValue.toFixed(4))
                            :
                            0
                    )
                }
                {tloi.confidenceType ? ` (${tloi.confidenceType})` : " (P-value)"}
            </Fragment>,
        'Extras': (tloi: TriggeredLineOfInquiry, i: number) =>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "end" }}>
                {hypothesis != null && (
                    <NarrativeModal hypothesis={hypothesis} tloi={tloi} />
                )}
                {authenticated && tloi.status === 'SUCCESSFUL' && (
                    <TLOIEdit tloi={tloi} label={"Editing " + tloi.name} onSave={onSendEditedRun} />
                )}
                {authenticated && renderOptionalButtons(tloi)}
                {authenticated && (
                    <Tooltip arrow placement="top" title="Delete">
                        <Box sx={{ display: "inline-block" }}>
                            <ConfirmDialog title="Delete this Triggered Line of Inquiry"
                                msg={"Are you sure you want to delete this triggered line of inquiry?"}
                                onConfirm={() => deleteTLOIById(tloi.id)}>
                                <IconButton sx={{ padding: "0" }}>
                                    <DeleteIcon />
                                </IconButton>
                            </ConfirmDialog>
                        </Box>
                    </Tooltip>
                )}
            </Box>
    }

    const deleteTLOIById = (id:string) => {
        console.log("DELETING: ", id);
        dispatch(openBackdrop());

        deleteTLOI({id:id})
            .then(() => {
                dispatch(openNotification({
                    severity: 'info',
                    text: "Triggered Line of Inquiry was deleted"
                }));
            })
            .catch((e) => {
                dispatch(openNotification({
                    severity: 'error',
                    text: "Error trying to delete Triggered Line of Inquiry"
                }));
                console.warn(e);
            })
            .finally(() => {
                dispatch(closeBackdrop());
            })
    }

    const onSendEditedRun = (tloi:TriggeredLineOfInquiry) => {
        dispatch(openBackdrop());
        dispatch(openNotification({
            severity: 'info',
            text: "Sending new execution..."
        }));
        postTLOI({data:cleanTLOI(tloi)})
                .then((data : {data:TriggeredLineOfInquiry} | {error: any}) => {
                    let savedTLOI = (data as {data:TriggeredLineOfInquiry}).data;
                    if (savedTLOI) {
                        console.log("RETURNED:", savedTLOI);
                        //setNewTLOIs([tloi]);
                        dispatch(openNotification({
                            severity: 'success',
                            text: "1 new execution found"
                        }));
                    }
                })
                .finally(() => {
                    dispatch(closeBackdrop());
                });
    }

    const renderOptionalButtons = (cur:TriggeredLineOfInquiry) => {
        const SHINY_FILENAME = "log";
        const BRAIN_FILENAME = "brain_visualization";
        let shinyUrl : string = "";
        let shinySource : string = "";
        let brainUrl : string = "";
        let brainSource : string = "";
        [ ...cur.workflows, ...cur.metaWorkflows ].forEach((wf:Workflow) => {
            if (wf.run && wf.run.outputs) {
                Object.keys(wf.run.outputs).forEach(((name:string) => {
                    if (name === SHINY_FILENAME) {
                        shinyUrl = wf.run ? wf.run.outputs[name] : "";
                        shinySource = wf.source;
                    } else if (name === BRAIN_FILENAME) {
                        brainUrl = wf.run ? wf.run.outputs[name] : "";
                        brainSource = wf.source;
                    }
                }));
            }
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
                    {visibleColumns.map((name:string) => <TableCell sx={{ padding: "0 10px" }}>{name}</TableCell>)}
                </TableRow>
            </TableHead>
            <TableBody>
                {isLoading ? <Skeleton/> : visibleTLOIs.map((tloi:TriggeredLineOfInquiry, i:number) => 
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