import { Alert, Backdrop, Box, Button, Card, CircularProgress, Divider, FormHelperText, IconButton, Skeleton, Snackbar, TextField, Tooltip, Typography } from "@mui/material";
import { DataEndpoint, idPattern, TriggeredLineOfInquiry } from "DISK/interfaces";
import { Fragment, useEffect } from "react";
import { Link, useLocation } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import { styled } from '@mui/material/styles';
import { PATH_LOIS } from "constants/routes";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { loadTLOI } from "redux/loader";
import React from "react";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsIcon from '@mui/icons-material/Settings';
import { ResultTable } from "components/ResultTable";
import { WorkflowList } from "components/WorkflowList";
import { loadHypothesis } from "redux/loader";
import { QuestionPreview } from "components/QuestionPreview";
import { loadDataEndpoints } from "redux/loader";
import { renderDescription } from "DISK/util";
import { DISKAPI } from "DISK/API";
import { setErrorSelected, setLoadingSelected, setSelectedTLOI } from "redux/tlois";

const TypographyLabel = styled(Typography)(({ theme }) => ({
    color: 'gray',
    display: "inline",
    fontWeight: "bold",
    fontSize: ".9em"
}));

const InfoInline = styled(Typography)(({ theme }) => ({
    display: "inline",
    color: "darkgray"
}));

const TypographyInline = styled(Typography)(({ theme }) => ({
    display: "inline",
}));

const TypographySubtitle = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: "1.2em"
}));

interface TLOIViewProps {
    edit?: boolean
}

const TypographySection = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: "1.05em"
}));

export const TLOIView = ({edit} : TLOIViewProps) => {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const [formalView, setFormalView] = React.useState<boolean>(false);
    const [editMode, setEditMode] = React.useState<boolean>(false);
    const [notes, setNotes] = React.useState<string>("");

    const TLOI = useAppSelector((state:RootState) => state.tlois.selectedTLOI);
    const selectedId = useAppSelector((state:RootState) => state.tlois.selectedId);
    const loading = useAppSelector((state:RootState) => state.tlois.loadingSelected);
    const error = useAppSelector((state:RootState) => state.tlois.errorSelected);

    const selectedHypothesis = useAppSelector((state:RootState) => state.hypotheses.selectedHypothesis);
    const selectedHypId = useAppSelector((state:RootState) => state.hypotheses.selectedId);
    const loadingHyp = useAppSelector((state:RootState) => state.hypotheses.loadingSelected);
    const errorHyp = useAppSelector((state:RootState) => state.hypotheses.errorSelected);

    const [dataSource, setDataSource] = React.useState<DataEndpoint|null>(null);
    const endpoints : DataEndpoint[] = useAppSelector((state:RootState) => state.server.endpoints);
    const initializedEndpoint : boolean = useAppSelector((state:RootState) => state.server.initializedEndpoints);
    const loadingEndpoints = useAppSelector((state:RootState) => state.server.loadingEndpoints);

    const [waiting, setWaiting] = React.useState<boolean>(false);;
    const [doneNotification, setDoneNotification] = React.useState<boolean>(false);
    const [errorNotification, setErrorNotification] = React.useState<boolean>(false);

    useEffect(() => {
        if (!initializedEndpoint) {
            loadDataEndpoints(dispatch);
        }
    }, []);

    useEffect(() => {
        if (!!TLOI && TLOI.parentHypothesisId && TLOI.parentHypothesisId !== selectedHypId && !loadingHyp && !errorHyp) {
            loadHypothesis(dispatch, TLOI.parentHypothesisId);
        }
        if (!!TLOI && TLOI.notes) {
            setNotes(TLOI.notes);
        }
    }, [TLOI]);

    useEffect(() => {
        if (!!TLOI && TLOI.dataSource && endpoints.length > 0) {
            for (let i = 0; i < endpoints.length; i++) {
                let endpoint : DataEndpoint = endpoints[i];
                if (endpoint.url === TLOI.dataSource) {
                    setDataSource(endpoint);
                    break;
                }
            }
        }
    }, [TLOI, endpoints]);

    useEffect(() => {
        let id : string = location.pathname.replace(idPattern, '');
        if (!!id && !loading && !error && selectedId !== id) {
            loadTLOI(dispatch, id);
        }
    }, [location, dispatch, error, loading, selectedId]);

    const updateNotes = () => {
        if (TLOI) {
            let editedTLOI : TriggeredLineOfInquiry = { ...TLOI, notes: notes };
            setSelectedTLOI(null);
            setLoadingSelected(editedTLOI.id);
            setWaiting(true);
            DISKAPI.updateTLOI(editedTLOI)
                    .then((tloi:TriggeredLineOfInquiry) => {
                        //FIXME: UI does not update.
                        console.log("SUCCESS:", tloi.notes);
                        setNotes(tloi.notes);
                        setSelectedTLOI(tloi);
                        setDoneNotification(true);
                    })
                    .catch((e) =>{
                        setErrorNotification(true);
                        setErrorSelected();
                        console.warn(e);
                    })
                    .finally(() => {
                        setWaiting(false);
                        setEditMode(false);
                    })
        }
        return;
    }

    const handleNotificationClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setDoneNotification(false);
        setErrorNotification(false);
    };

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)", overflowY:"auto"}}>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={waiting}>
            <CircularProgress color="inherit" />
        </Backdrop>
        <Snackbar open={doneNotification} autoHideDuration={3000} onClose={handleNotificationClose} anchorOrigin={{vertical:'bottom', horizontal: 'right'}}>
            <Alert severity="info" sx={{ width: '100%' }} onClose={handleNotificationClose}>
                Notes were updated successfully
            </Alert>
        </Snackbar>
        <Snackbar open={errorNotification} autoHideDuration={3000} onClose={handleNotificationClose} anchorOrigin={{vertical:'bottom', horizontal: 'right'}}>
            <Alert severity="error" sx={{ width: '100%' }} onClose={handleNotificationClose}>
                Error trying to update notes. TLOI was not edited
            </Alert>
        </Snackbar>

        {loading ? 
            <Skeleton sx={{height:"40px", margin: "8px 12px", minWidth: "250px"}}/>
        :
            <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor: "whitesmoke"}}>
                <Typography variant="h5">
                    {error ? "Error loading TLOI" : TLOI?.name}
                </Typography>

                <Tooltip arrow title={editMode ? "Cancel" : "Edit"}>
                    <IconButton onClick={() => setEditMode(!editMode)}>
                        {editMode ? <CancelIcon /> : <EditIcon /> }
                    </IconButton>
                </Tooltip>
            </Box>
        }
        <Divider/>
        <Box sx={{padding:"10px"}}>
            {
            //<Box>
            //    <TypographyLabel>Description: </TypographyLabel>
            //    <TypographyInline>
            //        {!loading && !!TLOI ? TLOI.description : <Skeleton sx={{display:"inline-block", width: "200px"}} />}
            //    </TypographyInline>
            //</Box>
            }
            {!loadingHyp && !!selectedHypothesis ? 
                <QuestionPreview selected={selectedHypothesis.question as string} bindings={selectedHypothesis.questionBindings} label="Hypothesis or question tested"/>
                : <Skeleton/>}
            <Card variant="outlined" sx={{mt: "8px", p: "0px 10px 0px;", position:"relative", overflow:"visible", mb: "5px"}}>
                <FormHelperText sx={{position: 'absolute', background: 'white', padding: '0 4px', margin: '-9px 0 0 0'}}> Line of inquiry: </FormHelperText>
                <Box component={Link} to={PATH_LOIS + "/" + (!!TLOI ? TLOI.parentLoiId : "")} sx={{textDecoration: "none", display:"inline-flex", alignItems:"center", padding: "0 5px", ml: "10px", mt: "12px"}}>
                    <SettingsIcon sx={{color: "green", mr:"5px"}}/>
                    <span style={{color:"black"}}>
                        {!!TLOI ? TLOI.name.replace("Triggered: ", "") : null}
                    </span>
                </Box>
            </Card>
            {editMode ?
                <Box>
                    <TextField multiline fullWidth size="small" id="TLOINotes" label="Notes"
                        value={notes} onChange={(e) => setNotes(e.target.value)}/>
                    <Box sx={{display:"flex", justifyContent:"flex-end", mt:"4px"}}>
                        <Button variant="outlined" color="success" onClick={updateNotes}>
                            Save
                        </Button>
                        <Button variant="outlined" color="error" sx={{ml: "5px"}} onClick={() => setEditMode(false)}>
                            Cancel
                        </Button>
                    </Box>
                </Box>    
            :
                <Box>
                    <TypographyLabel>Notes: </TypographyLabel>
                    {TLOI && TLOI.notes ?
                        <TypographyInline>{TLOI.notes}</TypographyInline>
                    :
                        <InfoInline>None specified. Click the edit button to add notes.</InfoInline>
                    }
                </Box>
            }

        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Data:</TypographySubtitle>
            <Box sx={{display: "inline-flex", alignItems: "baseline"}}>
                <TypographyLabel sx={{whiteSpace: 'nowrap'}}>Data source: </TypographyLabel>
                {loadingEndpoints ? 
                    <Skeleton sx={{display:"inline-block", width: "400px"}}/> :
                    (dataSource ?
                        <Fragment>
                            <TypographyInline sx={{ml:"5px", whiteSpace: 'nowrap'}}> {dataSource.name} </TypographyInline>
                            <Box sx={{display:"inline-block", ml:"5px", fontSize:".85em"}}>
                                {renderDescription(dataSource.description)}
                            </Box>
                        </Fragment>
                    :
                        null
                    )
                }
            </Box>
            <Box sx={{display:"flex", justifyContent:"space-between", alignItems: "center"}}>
                <Box>
                    <TypographyLabel>Data query explanation:</TypographyLabel>
                    {loading ? 
                        <Skeleton sx={{display:"inline-block", width: "400px"}}/> :
                        (!!TLOI && TLOI.dataQueryExplanation ? 
                            <TypographyInline> {TLOI.dataQueryExplanation} </TypographyInline> :
                            <InfoInline> None specified </InfoInline>
                        )
                    }
                </Box>
                <Tooltip arrow title={(formalView? "Hide" : "Show") + " data query"}>
                    <IconButton onClick={() => setFormalView(!formalView)}>
                        {formalView? <VisibilityIcon/> : <VisibilityOffIcon/>}
                    </IconButton>
                </Tooltip>
            </Box>

            {formalView && <Fragment>
                <TypographySection>Data query:</TypographySection>
                <Box sx={{fontSize: "0.94rem"}} >
                    <CodeMirror value={!!TLOI? TLOI.dataQuery : ""}
                        extensions={[StreamLanguage.define(sparql)]}
                        onChange={(value, viewUpdate) => {
                            console.log('value:', value);
                        }}
                    />
                </Box>
            </Fragment>}

            <Box> 
                <Divider/>
                {loading ? 
                    <Skeleton/> :
                    <Box>
                        {!!TLOI && (TLOI.tableDescription || (TLOI.dataQuery && TLOI.tableVariables && dataSource)) &&
                            <TypographySection>Input data retrieved:</TypographySection>}
                        {!!TLOI && TLOI.tableDescription && 
                        <Box sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <TypographyLabel sx={{mr:"5px"}}>Table: </TypographyLabel>
                            <TypographyInline> {TLOI.tableDescription} </TypographyInline>
                        </Box>}
                        {!!TLOI && dataSource && TLOI.tableVariables && TLOI.dataQuery &&
                            <ResultTable query={TLOI.dataQuery} variables={TLOI.tableVariables} dataSource={dataSource}/> }
                    </Box>
                }
            </Box>
        </Box>
        <Divider/>
        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle sx={{display: "inline-block"}}>Methods:</TypographySubtitle>
            {!!TLOI && <WorkflowList editable={false} workflows={TLOI.workflows} metaworkflows={TLOI.metaWorkflows} options={[]}/>}
        </Box>
    </Card>
}