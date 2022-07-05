import { Alert, Backdrop, Box, Button, Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputAdornment, MenuItem, Select, SelectChangeEvent, Skeleton, Snackbar, TextField, Tooltip } from "@mui/material";
import { DISKAPI } from "DISK/API";
import { Hypothesis } from "DISK/interfaces";
import React, { useEffect } from "react";
import { HypothesisPreview } from "components/HypothesisPreview";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from 'redux/store';
import { setErrorAll, setLoadingAll, setHypotheses, remove } from 'redux/hypothesis';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { PATH_HYPOTHESIS_NEW } from "constants/routes";
import { Link } from "react-router-dom";

type OrderType = 'date'|'author';

export const Hypotheses = () => {
    const [order, setOrder] = React.useState<OrderType>('date');
    const hypotheses = useAppSelector((state:RootState) => state.hypotheses.hypotheses);
    const loading = useAppSelector((state:RootState) => state.hypotheses.loadingAll);
    const error = useAppSelector((state:RootState) => state.hypotheses.errorAll);
    const dispatch = useAppDispatch();

    const [waiting, setWaiting] = React.useState<boolean>(false);;
    const [deleteNotification, setDeleteNotification] = React.useState<boolean>(false);
    const [lastDeletedName, setLastDeletedNamed] = React.useState<string>("");
    const [errorNotification, setErrorNotification] = React.useState<boolean>(false);

    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState<boolean>(false);
    const [hypothesisToDelete, setHypothesisToDelete] = React.useState<Hypothesis|null>(null);
    const authenticated = useAppSelector((state:RootState) => state.keycloak.authenticated);

    useEffect(() => {
        if (hypotheses && hypotheses.length === 0 && !loading && !error) {
            dispatch(setLoadingAll());
            DISKAPI.getHypotheses()
                .then((hypotheses:Hypothesis[]) => {
                    dispatch(setHypotheses(hypotheses));
                })
                .catch(() => {
                    dispatch(setErrorAll());
                });
        }
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
                        hypotheses.map((h:Hypothesis) => <HypothesisPreview key={h.id} hypothesis={h} onDelete={(h:Hypothesis) => {
                            setHypothesisToDelete(h);
                            setConfirmDialogOpen(true);
                        }}/>)
                    )
                }
            </Card>
        </Box>
    )
}