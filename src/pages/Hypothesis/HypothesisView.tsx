import { Alert, Backdrop, Box, Button, Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, Skeleton, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { idPattern, TriggeredLineOfInquiry } from "DISK/interfaces";
import { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit';
import PlayIcon from '@mui/icons-material/PlayArrow';
import ErrorIcon from '@mui/icons-material/ErrorOutline';
import WaitIcon from '@mui/icons-material/HourglassBottom';
import CheckIcon from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import { PATH_HYPOTHESES } from "constants/routes";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { QuestionPreview } from "components/QuestionPreview";
import { loadTLOIs, loadHypothesis } from "redux/loader";
import { DISKAPI } from "DISK/API";
import { add as addTLOI, remove as removeTLOI } from "redux/tlois";

const TypographyLabel = styled(Typography)(({ theme }) => ({
    color: 'gray',
    display: "inline",
    fontWeight: "bold",
    fontSize: ".9em"
}));

const TypographyInline = styled(Typography)(({ theme }) => ({
    display: "inline",
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
    const location = useLocation();
    const dispatch = useAppDispatch();

    const hypothesis = useAppSelector((state:RootState) => state.hypotheses.selectedHypothesis);
    const selectedId = useAppSelector((state:RootState) => state.hypotheses.selectedId);
    const loading = useAppSelector((state:RootState) => state.hypotheses.loadingSelected);
    const error = useAppSelector((state:RootState) => state.hypotheses.errorSelected);

    const TLOIs = useAppSelector((state:RootState) => state.tlois.TLOIs);
    const TLOIloading = useAppSelector((state:RootState) => state.tlois.loadingAll);
    const TLOIerror = useAppSelector((state:RootState) => state.tlois.errorAll);
    const authenticated = useAppSelector((state:RootState) => state.keycloak.authenticated);

    const [myTLOIs, setMyTLOIs] = useState<TLOIMap>({});
    const [newTlOIs, setNewTLOIs] = useState<TriggeredLineOfInquiry[]>([]);
    const [TLOIToDelete, setTLOIToDelete] = useState<TriggeredLineOfInquiry|null>(null);

    const [waiting, setWaiting] = useState<boolean>(false);;
    const [deleteNotification, setDeleteNotification] = useState<boolean>(false);
    const [errorNotification, setErrorNotification] = useState<boolean>(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [queryNotification, setQueryNotification] = useState<boolean>(false);

    useEffect(() => {
        let id : string = location.pathname.replace(idPattern, '');
        if (!!id && !loading && !error && selectedId !== id) {
            loadHypothesis(dispatch, id);
        }
    }, [location, dispatch, error, loading, selectedId]);

    useEffect(() => {
        if (!TLOIloading && !TLOIerror && TLOIs.length === 0)
            loadTLOIs(dispatch);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        let map : TLOIMap = {};
        TLOIs.filter((tloi) => tloi.parentHypothesisId === selectedId).forEach((tloi:TriggeredLineOfInquiry) => {
            if (!map[tloi.loiId]) {
                map[tloi.loiId] = {
                    value: [],
                    name: tloi.name.replace("Triggered: ",""),
                }
            }
            let cur = map[tloi.loiId].value;
            cur.push(tloi);
        });
        setMyTLOIs(map);
    }, [TLOIs, selectedId]);


    const getColorStatus = (status:TriggeredLineOfInquiry["status"]) => {
        if (status === 'FAILED')
            return 'red';
        if (status === 'SUCCESSFUL' || status === 'RUNNING')
            return 'green';
        if (status === 'QUEUED')
            return 'orange';
        return 'unset';
    }

    const getIconStatus = (status:TriggeredLineOfInquiry["status"]) => {
        if (status === 'FAILED')
            return <ErrorIcon/>;
        if (status === 'SUCCESSFUL')
            return <CheckIcon/>;
        if (status === 'QUEUED' || status === 'RUNNING')
            return <WaitIcon/>;
    }
    
    const onDeleteConfirmed = () => {
        if (TLOIToDelete === null) {
            //maybe close the alert
            return;
        }
        console.log("DELETING: ", TLOIToDelete.id);
        setWaiting(true);
        //setLastDeletedNamed(hypothesis.name);

        DISKAPI.deleteTLOI(TLOIToDelete.id)
            .then((b:boolean) => {
                if (b) {
                    dispatch(removeTLOI(TLOIToDelete.id));
                    setDeleteNotification(true);
                }
            })
            .catch((e) => {
                setErrorNotification(true);
                console.warn(e);
            })
            .finally(() => {
                setWaiting(false);
            })
        setConfirmDialogOpen(false);
        setTLOIToDelete(null);
    }

    const handleDeleteNotificationClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setDeleteNotification(false);
        setErrorNotification(false);
    };

    const onTestHypothesisClicked = () => {
        setWaiting(true);
        setQueryNotification(true);
        DISKAPI.queryHypothesis(selectedId)
                .then((tlois:TriggeredLineOfInquiry[]) => {
                    setNewTLOIs(tlois);
                    tlois.forEach((tloi:TriggeredLineOfInquiry) => {
                        dispatch(addTLOI(tloi));
                    });
                    setQueryNotification(true);
                })
                .finally(() => {
                    setWaiting(false);
                });
    }

    const handleQueryNotificationClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setQueryNotification(false);
    };

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)", overflowY: "auto"}}>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={waiting}>
            <CircularProgress color="inherit" />
        </Backdrop>
        <Snackbar open={queryNotification} autoHideDuration={3000} onClose={handleQueryNotificationClose} anchorOrigin={{vertical:'bottom', horizontal: 'right'}}>
            <Alert severity={newTlOIs && newTlOIs.length > 0 ? 'success' : 'info'} sx={{ width: '100%' }} onClose={handleQueryNotificationClose}>
                {waiting ? "Looking for new executions..." : (
                    newTlOIs && newTlOIs.length > 0 ? (newTlOIs.length + " new executions found") : "No new executions"
                )}
            </Alert>
        </Snackbar>
        <Snackbar open={deleteNotification} autoHideDuration={3000} onClose={handleDeleteNotificationClose} anchorOrigin={{vertical:'bottom', horizontal: 'right'}}>
            <Alert severity="info" sx={{ width: '100%' }} onClose={handleDeleteNotificationClose}>
                Triggered Line of Inquiry was deleted
            </Alert>
        </Snackbar>
        <Snackbar open={errorNotification} autoHideDuration={3000} onClose={handleDeleteNotificationClose} anchorOrigin={{vertical:'bottom', horizontal: 'right'}}>
            <Alert severity="error" sx={{ width: '100%' }} onClose={handleDeleteNotificationClose}>
                Error trying to delete Triggered Line of Inquiry
            </Alert>
        </Snackbar>
        <Dialog open={confirmDialogOpen}>
            <DialogTitle id="alert-tloi-delete-title">
                {"Delete this Triggered Line of Inquiry?"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-tloi-delete-description">
                    Are you sure you want to delete this Triggered Line of Inquiry?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    setConfirmDialogOpen(false);
                    setTLOIToDelete(null);
                }}>Cancel</Button>
                <Button color="error" autoFocus onClick={onDeleteConfirmed}>
                    Delete
                </Button>
            </DialogActions>
      </Dialog>

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
                <TypographyInline>
                    {!loading && !!hypothesis ? hypothesis.description : <Skeleton sx={{display:"inline-block", width: "200px"}} />}
                </TypographyInline>
            </Box>
            {!!hypothesis && hypothesis.notes ? <Box>
                <TypographyLabel>Notes: </TypographyLabel>
                <TypographyInline>{hypothesis.notes}</TypographyInline>
            </Box> : ""}

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
                    Analyses executed to test the hypothesis or answer the question:
                </TypographySubtitle>
                <Button variant="outlined" onClick={onTestHypothesisClicked}>
                    <PlayIcon/> Run analysis 
                </Button>
            </Box>
            {/*newTlOIs.map((tloi:TriggeredLineOfInquiry) => 
                <Card variant="outlined" key={tloi.id} sx={{marginBottom: "5px", padding: "2px 10px"}}>
                    <Box sx={{display:"flex"}}>
                        {tloi.status === 'FAILED' ? 
                            <ErrorIcon sx={{color:"red"}}/> 
                            : (tloi.status === 'SUCCESSFUL' ?
                                <CheckIcon sx={{color:"green"}}/> 
                                : <WaitIcon sx={{color:(tloi.status === 'RUNNING' ? "green" : "yellow")}}/>)}
                        <Box sx={{marginLeft: "5px"}}>
                            {tloi.name}
                        </Box>
                    </Box>
                </Card>
            )*/}
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
                            <b>{myTLOIs[loiId].name}</b>
                        </Box>
                        <Box>{myTLOIs[loiId].value.length} runs</Box>
                    </Box>
                    <Divider/>
                    <TableContainer sx={{display: "flex", justifyContent: "center"}}>
                        <Table sx={{width:"unset"}}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{padding: "0 10px"}}> # </TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>Status</TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>Inputs</TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>Outputs</TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>p-value</TableCell>
                                    <TableCell sx={{padding: "0 10px"}}></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {myTLOIs[loiId].value.map((tloi, index) => <TableRow key={tloi.id}>
                                    <TableCell sx={{padding: "0 10px"}}>{index+1}</TableCell>
                                    <TableCell sx={{padding: "0 10px", color: getColorStatus(tloi.status)}}>
                                        <Box sx={{display:'flex', alignItems:'center'}}>
                                            {getIconStatus(tloi.status)}
                                            <Box sx={{marginLeft: '6px'}}>
                                                {tloi.status}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>
                                        {tloi.inputFiles.length}
                                    </TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>
                                        {tloi.status !== 'SUCCESSFUL' ? "" : tloi.outputFiles.length}
                                    </TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>
                                        {tloi.status !== 'SUCCESSFUL' ? "" : tloi.confidenceValue}
                                    </TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>
                                        <Box sx={{display:'flex', alignItems:'center'}}>
                                            <Tooltip arrow placement="top" title="Delete">
                                                <IconButton sx={{padding:"0"}} onClick={() => {
                                                    setConfirmDialogOpen(true);
                                                    setTLOIToDelete(tloi);
                                                }}>
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </Tooltip>
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
