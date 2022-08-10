import { Alert, Backdrop, Box, Button, Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputAdornment, MenuItem, Select, SelectChangeEvent, Skeleton, Snackbar, TextField, Tooltip, Typography } from "@mui/material";
import { DISKAPI } from "DISK/API";
import { Hypothesis } from "DISK/interfaces";
import React, { useEffect } from "react";
import { HypothesisPreview } from "components/HypothesisPreview";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from 'redux/store';
import { remove } from 'redux/hypothesis';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { PATH_HYPOTHESIS_NEW } from "constants/routes";
import { Link } from "react-router-dom";
import { loadHypotheses } from "redux/loader";
import { QuestionList } from "components/QuestionList";

type OrderType = 'date'|'author';

interface ViewProps {
    myPage?:boolean
}

export const Hypotheses = ({myPage=false} : ViewProps) => {
    const dispatch = useAppDispatch();
    const [order, setOrder] = React.useState<OrderType>('date');
    const [searchTerm, setSearchTerm] = React.useState<string>("");
    const hypotheses = useAppSelector((state:RootState) => state.hypotheses.hypotheses);
    const loading = useAppSelector((state:RootState) => state.hypotheses.loadingAll);
    const error = useAppSelector((state:RootState) => state.hypotheses.errorAll);
    const initializedHypotheses = useAppSelector((state:RootState) => state.hypotheses.initialized);

    const [waiting, setWaiting] = React.useState<boolean>(false);;
    const [deleteNotification, setDeleteNotification] = React.useState<boolean>(false);
    const [lastDeletedName, setLastDeletedNamed] = React.useState<string>("");
    const [errorNotification, setErrorNotification] = React.useState<boolean>(false);

    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState<boolean>(false);
    const [hypothesisToDelete, setHypothesisToDelete] = React.useState<Hypothesis|null>(null);
    const authenticated = useAppSelector((state:RootState) => state.keycloak.authenticated);
    const username = useAppSelector((state:RootState) => state.keycloak.username);

    useEffect(() => {
        if (!initializedHypotheses) loadHypotheses(dispatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChangeOrder = (event: SelectChangeEvent<OrderType>) => {
        let order : OrderType = event.target!.value as OrderType;
        if (order) setOrder(order);
    }

    const onDeleteConfirmed = () => {
        if (hypothesisToDelete === null) return;
        
        console.log("DELETING: ", hypothesisToDelete.id);
        setWaiting(true);
        setLastDeletedNamed(hypothesisToDelete.name);
        DISKAPI.deleteHypothesis(hypothesisToDelete.id)
            .then((b:boolean) => {
                if (b) {
                    dispatch(remove(hypothesisToDelete.id));
                    setDeleteNotification(true);
                } else {
                    setErrorNotification(true);
                }
            })
            .catch((e) => {
                setErrorNotification(true);
                console.warn(e);
            })
            .finally(() => {
                setWaiting(false);
            });
        setHypothesisToDelete(null);
        setConfirmDialogOpen(false);
    }

    const handleDeleteNotificationClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setDeleteNotification(false);
        setErrorNotification(false);
        setLastDeletedNamed("");
    };

    const applyFilters = (hypothesis:Hypothesis) => {
        //User filter
        if (myPage)
            return username && hypothesis.author === username;
        //Text Filter:
        let t : string = hypothesis.name + hypothesis.description + hypothesis.author;
        if (hypothesis.notes) t += hypothesis.notes;
        if (hypothesis.dateCreated) t += hypothesis.dateCreated;
        if (hypothesis.dateModified) t += hypothesis.dateModified;
        return t.toLowerCase().includes(searchTerm.toLowerCase());
    }

    const renderHypotheses = () => {
        let curH = hypotheses.filter(applyFilters);
        if (curH.length > 0)
            return curH.map((h:Hypothesis) => <HypothesisPreview key={h.id} hypothesis={h} onDelete={(h:Hypothesis) => {
                setHypothesisToDelete(h);
                setConfirmDialogOpen(true);
            }}/>)
        else
            return <Box sx={{p:"5px"}}>
                <Typography variant="h6">
                    You do not have any hypotheses. You can create a new one based on one of the following questions:
                </Typography>
                <QuestionList kind="hypothesis"/>
            </Box>
    }

    return (
        <Box>
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={waiting}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <Snackbar open={deleteNotification} autoHideDuration={3000} onClose={handleDeleteNotificationClose} anchorOrigin={{vertical:'bottom', horizontal: 'right'}}>
                <Alert severity="info" sx={{ width: '100%' }} onClose={handleDeleteNotificationClose}>
                    Hypothesis {lastDeletedName} was deleted
                </Alert>
            </Snackbar>
            <Snackbar open={errorNotification} autoHideDuration={3000} onClose={handleDeleteNotificationClose} anchorOrigin={{vertical:'bottom', horizontal: 'right'}}>
                <Alert severity="error" sx={{ width: '100%' }} onClose={handleDeleteNotificationClose}>
                    Error trying to delete {lastDeletedName}. The hypothesis was not deleted
                </Alert>
            </Snackbar>

            <Dialog open={confirmDialogOpen}>
                <DialogTitle id="alert-hyp-delete-title">
                    {"Delete this Hypothesis?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-hyp-delete-description">
                        Are you sure you want to delete the hypothesis "{hypothesisToDelete?.name}"?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setConfirmDialogOpen(false);
                        setHypothesisToDelete(null);
                    }}>Cancel</Button>
                    <Button color="error" autoFocus onClick={onDeleteConfirmed}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Box sx={{display:'flex', paddingBottom: "5px"}}>
                <TextField id="input-text-search" label="Search hypotheses" variant="outlined" size="small" 
                    value={searchTerm} onChange={(ev) => setSearchTerm(ev.target.value)}
                    sx={{width:'100%', paddingRight:'5px'}} InputProps={{
                    startAdornment: <InputAdornment position="start"> <SearchIcon/> </InputAdornment>
                }}/>
                <Select id="select-order" value={order} label="Order" onChange={handleChangeOrder} size="small">
                    <MenuItem value={'date'}>Date</MenuItem>
                    <MenuItem value={'author'}>Author</MenuItem>
                </Select>
                <Tooltip arrow title={authenticated? "Create a new hypothesis" : "You need to log in to create a new hypothesis"}>
                    <Box sx={{display:"inline-flex"}}>
                        <Button variant="outlined" sx={{marginLeft: "4px"}} component={Link} to={PATH_HYPOTHESIS_NEW} disabled={!authenticated}>
                            <AddIcon/>
                        </Button>
                    </Box>
                </Tooltip>
            </Box>
            <Card variant="outlined" sx={{height: "calc(100vh - 157px)", overflowY: "auto"}}>
                {loading ?
                    <Skeleton sx={{margin: "0px 10px"}} height={90}/>
                :
                    (error ? 
                        <Box> Error loading Hypotheses </Box>
                    :
                        renderHypotheses()
                    )
                }
            </Card>
        </Box>
    )
}