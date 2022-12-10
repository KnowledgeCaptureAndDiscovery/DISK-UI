import { Box, Button, Card, Divider, IconButton, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { TriggeredLineOfInquiry, Workflow } from "DISK/interfaces";
import { Fragment, useEffect, useState } from "react";
import { Link, useParams } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit';
import ErrorIcon from '@mui/icons-material/ErrorOutline';
import WaitIcon from '@mui/icons-material/HourglassBottom';
import CheckIcon from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import { PATH_HYPOTHESES, PATH_TLOIS } from "constants/routes";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { QuestionPreview } from "components/questions/QuestionPreview";
import { FileList } from "components/FileList";
import { DISKAPI } from "DISK/API";
import { TLOIEdit } from "components/tlois/TLOIEdit";
import CachedIcon from '@mui/icons-material/Cached';
import { ShinyModal } from "components/ShinyModal";
import { NarrativeModal } from "components/NarrativeModal";
import { BrainModal } from "components/BrainModal";

import { closeBackdrop, openBackdrop } from "redux/slices/backdrop";
import { openNotification } from "redux/slices/notifications";
import { ConfirmDialog } from "components/ConfirmDialog";
import { useGetHypothesisByIdQuery } from "redux/apis/hypotheses";
import { useDeleteTLOIMutation, useExecuteHypothesisByIdMutation, useGetTLOIsQuery, usePostTLOIMutation } from "redux/apis/tlois";

const TypographyLabel = styled(Typography)(({ theme }) => ({
    color: 'gray',
    display: "inline",
    fontWeight: "bold",
    fontSize: ".9em"
}));

const TypographyInline = styled(Typography)(({ theme }) => ({
    display: "inline",
}));

const InfoInline = styled(Typography)(({ theme }) => ({
    display: "inline",
    color: "darkgray"
}));

const TypographySubtitle = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: "1.2em"
}));

type TLOIMap = {[id:string]: {
    value: TriggeredLineOfInquiry[],
    name: string,
}};

export const HypothesisView = () => {
    const dispatch = useAppDispatch();
    const {hypothesisId} = useParams();
    const selectedId = hypothesisId as string; // Could be undefined?

    const authenticated = useAppSelector((state:RootState) => state.keycloak.authenticated);

    const { data:hypothesis, isError:error, isLoading:loading} = useGetHypothesisByIdQuery(selectedId);
    const { data:TLOIs, isLoading:TLOIloading} = useGetTLOIsQuery();
    const [postTLOI, { isLoading: isCreating }] = usePostTLOIMutation();
    const [deleteTLOI, { isLoading: isDeleting }] = useDeleteTLOIMutation();
    const [execHypothesis, { isLoading: isExecuting }] = useExecuteHypothesisByIdMutation();

    const [myTLOIs, setMyTLOIs] = useState<TLOIMap>({});
    const [newTlOIs, setNewTLOIs] = useState<TriggeredLineOfInquiry[]>([]);

    useEffect(() => {
        let map : TLOIMap = {};
        (TLOIs||[]).filter((tloi) => tloi.parentHypothesisId === selectedId).forEach((tloi:TriggeredLineOfInquiry) => {
            if (!map[tloi.parentLoiId]) {
                map[tloi.parentLoiId] = {
                    value: [],
                    name: tloi.name.replace("Triggered: ",""),
                }
            }
            let cur = map[tloi.parentLoiId].value;
            cur.push(tloi);
        });
        setMyTLOIs(map);
    }, [TLOIs, selectedId]);


    const getColorStatus = (status:TriggeredLineOfInquiry["status"]) => {
        return 'unset';
        /*if (status === 'FAILED')
            return 'red';
        if (status === 'SUCCESSFUL' || status === 'RUNNING')
            return 'green';
        if (status === 'QUEUED')
            return 'orange';
        return 'unset';*/
    }

    const getIconStatus = (status:TriggeredLineOfInquiry["status"]) => {
        if (status === 'FAILED')
            return <ErrorIcon/>;
        if (status === 'SUCCESSFUL')
            return <CheckIcon/>;
        if (status === 'QUEUED' || status === 'RUNNING')
            return <WaitIcon/>;
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

    const onTestHypothesisClicked = () => {
        dispatch(openBackdrop());
        dispatch(openNotification({
            severity: 'info',
            text: "Looking for new executions..."
        }));
        execHypothesis(selectedId)
                .then((value: {data:TriggeredLineOfInquiry[]} | {error:any}) => {
                    let newTLOIs = (value as {data:TriggeredLineOfInquiry[]}).data;
                    if (newTLOIs) {
                        setNewTLOIs(newTLOIs.filter((tloi) => tloi.status !== 'FAILED' && tloi.status !== 'SUCCESSFUL'));
                        dispatch(openNotification({
                            severity: 'success',
                            text: newTlOIs && newTlOIs.length > 0 ? (newTlOIs.length + " new executions found") : "No new executions"
                        }));
                    } else if ((value as {error:any}).error) {
                        dispatch(openNotification({
                            severity: 'error',
                            text: "An error has ocurred while searching new executions."
                        }));
                    }
                })
                .catch((e) => {
                    dispatch(openNotification({
                        severity: 'error',
                        text: "An error has ocurred while searching new executions."
                    }));
                    console.warn(e);
                })
                .finally(() => {
                    dispatch(closeBackdrop());
                });
    }

    const onSendEditedRun = (tloi:TriggeredLineOfInquiry) => {
        dispatch(openBackdrop());
        dispatch(openNotification({
            severity: 'info',
            text: "Sending new execution..."
        }));
        postTLOI({data:tloi})
                .then((data : {data:TriggeredLineOfInquiry} | {error: any}) => {
                    let savedTLOI = (data as {data:TriggeredLineOfInquiry}).data;
                    if (savedTLOI) {
                        console.log("RETURNED:", savedTLOI);
                        setNewTLOIs([tloi]);
                        dispatch(openNotification({
                            severity: 'success',
                            text: newTlOIs && newTlOIs.length > 0 ? (newTlOIs.length + " new executions found") : "No new executions"
                        }));
                    }
                })
                .finally(() => {
                    dispatch(closeBackdrop());
                });
    }

    const renderOptionalButtons = (cur:TriggeredLineOfInquiry) => {
        const SHINY_FILENAME = "shiny_visualization";
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

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)", overflowY: "auto"}}>
        {loading ? 
            <Skeleton sx={{height:"40px", margin: "8px 12px", minWidth: "250px"}}/>
        :
            <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor: "whitesmoke"}}>
                <Typography variant="h5">
                    {error ? "Error loading hypothesis" : hypothesis?.name}
                </Typography>
                {authenticated ? 
                <Tooltip arrow title="Edit">
                    <IconButton component={Link} to={PATH_HYPOTHESES + "/" + hypothesis?.id + "/edit"}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
                : null }
            </Box>
        }
        <Divider/>
        <Box sx={{padding:"10px"}}>
            <Box>
                <TypographyLabel>Description: </TypographyLabel>
                    {loading ? (<Skeleton sx={{display:"inline-block", width: "200px"}}/>)
                    : (<TypographyInline>{!!hypothesis && hypothesis.description}</TypographyInline>)}
            </Box>
            <Box>
                <TypographyLabel>Additional notes: </TypographyLabel>
                    {loading ? 
                        <Skeleton sx={{display:"inline-block", width: "200px"}}/> :
                        (!!hypothesis && hypothesis.notes ? 
                            <TypographyInline>{hypothesis.notes}</TypographyInline> : 
                            <InfoInline> None specified </InfoInline>
                        )
                    }
            </Box>

            <TypographySubtitle>
                Hypothesis or question:
            </TypographySubtitle>
            {!loading && !!hypothesis ? 
                <QuestionPreview selected={hypothesis.question as string} bindings={hypothesis.questionBindings}/>
                : <Skeleton/>}
        </Box>

        <Box sx={{padding:"10px"}}>
            <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', mb: "10px"}}>
                <TypographySubtitle>
                    Lines of inquiry triggered to test this hypothesis and answer the question:
                </TypographySubtitle>
                <Button variant="outlined" onClick={onTestHypothesisClicked}>
                    <CachedIcon sx={{mr:"5px"}}/> Update
                </Button>
            </Box>
            {TLOIloading ? 
                <Skeleton/>
                : (Object.keys(myTLOIs).length === 0 ? <Card variant="outlined" sx={{display:'flex', justifyContent:'center'}}>
                    No executions
                </Card>
                :   Object.keys(myTLOIs).map((loiId:string) => 
                <Card variant="outlined" key={loiId} sx={{marginBottom: "5px", padding: "2px 10px"}}>
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent:"space-between"}}>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <SettingsIcon sx={{color: "green", mr: "5px"}}/>
                            <span style={{marginRight: ".5em"}}> Triggered line of inquiry: </span> 
                            <b> {myTLOIs[loiId].name}</b>
                        </Box>
                        <Box>{myTLOIs[loiId].value.length} runs</Box>
                    </Box>
                    <Divider/>
                    <TypographyLabel>Overview of results:</TypographyLabel>
                    <TableContainer sx={{display: "flex", justifyContent: "center"}}>
                        <Table sx={{width:"unset"}}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{padding: "0 10px"}}> # </TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>Date</TableCell>
                                    <TableCell sx={{padding: "0 10px", minWidth:"100px"}}>Run Status</TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>Input Files</TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>Output Files</TableCell>
                                    <TableCell sx={{padding: "0 10px", minWidth: "120px"}}>Confidence Value</TableCell>
                                    <TableCell sx={{padding: "0 10px", minWidth: "70px"}}></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {myTLOIs[loiId].value.map((tloi, index) => <TableRow key={tloi.id}>
                                    <TableCell sx={{padding: "0 10px"}}>
                                        <Box component={Link} to={PATH_TLOIS + "/" + tloi.id} sx={{textDecoration: "none", color: "black"}}>
                                            {index+1}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>
                                        <Box component={Link} to={PATH_TLOIS + "/" + tloi.id} sx={{textDecoration: "none", color: "black"}}>
                                            {tloi.dateCreated} 
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{padding: "0 10px", color: getColorStatus(tloi.status)}}>
                                        <Box component={Link} to={PATH_TLOIS + "/" + tloi.id} sx={{textDecoration: "none", color: "black", display:'flex', alignItems:'center'}}>
                                            {getIconStatus(tloi.status)}
                                            <Box sx={{marginLeft: '6px'}}>
                                                {tloi.status === 'SUCCESSFUL' ? 'DONE' : tloi.status}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>
                                        <FileList type="input" tloi={tloi} label="Input files"/>
                                    </TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>
                                        {tloi.status === 'SUCCESSFUL' ? 
                                            <FileList type="output" tloi={tloi} label="Output files"/>
                                        :
                                            null
                                        }
                                    </TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>
                                        {tloi.status === 'SUCCESSFUL' && (
                                            tloi.confidenceValue > 0 ?
                                                (tloi.confidenceValue < 0.0001 ?
                                                    tloi.confidenceValue.toExponential(3)
                                                :
                                                    tloi.confidenceValue.toFixed(4)) 
                                            : 
                                                0
                                        )
                                        }
                                        {/** TODO: Remove p-value as default confidence type */}
                                        {tloi.confidenceType ?  ` (${tloi.confidenceType})` : " (P-value)"}
                                    </TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>
                                        <Box sx={{display:'flex', alignItems:'center', justifyContent:"end"}}>
                                            {hypothesis != null && (
                                                <NarrativeModal hypothesis={hypothesis} tloi={tloi}/>
                                            )}
                                            {authenticated && tloi.status === 'SUCCESSFUL' && (
                                                <TLOIEdit tloi={tloi} label={"Editing " + tloi.name} onSave={onSendEditedRun}/>
                                            )}
                                            {authenticated && renderOptionalButtons(tloi) }
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
                                    </TableCell>
                                </TableRow>)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>))
            }
        </Box>
    </Card>
}
