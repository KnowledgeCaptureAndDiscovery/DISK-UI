import { Alert, Backdrop, Box, Button, Card, CircularProgress, InputAdornment, MenuItem, Select, SelectChangeEvent, Skeleton, Snackbar, TextField } from "@mui/material";
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


    useEffect(() => {
        if (hypotheses.length === 0 && !loading && !error) {
            dispatch(setLoadingAll());
            DISKAPI.getHypotheses()
                .then((hypotheses:Hypothesis[]) => {
                    dispatch(setHypotheses(hypotheses));
                })
                .catch(() => {
                    dispatch(setErrorAll());
                });
        }
    });

    const handleChangeOrder = (event: SelectChangeEvent<OrderType>) => {
        let order : OrderType = event.target!.value as OrderType;
        if (order) setOrder(order);
    }

    const deleteHypothesis = (hypothesis:Hypothesis) => {
        console.log("DELETING: ", hypothesis.id);
        setWaiting(true);
        setLastDeletedNamed(hypothesis.name);
        DISKAPI.deleteHypothesis(hypothesis.id)
            .then((b:boolean) => {
                if (b) {
                    dispatch(remove(hypothesis.id));
                    setDeleteNotification(true);
                } else {
                    setErrorNotification(true);
                }
                setWaiting(false);
            })
            .catch((e) => {
                setErrorNotification(true);
                console.warn(e);
                setWaiting(false);
            })
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

            <Box sx={{display:'flex', paddingBottom: "5px"}}>
                <TextField id="input-text-search" label="Search hypotheses" variant="outlined" size="small" 
                    sx={{width:'100%', paddingRight:'5px'}} InputProps={{
                    startAdornment: <InputAdornment position="start"> <SearchIcon/> </InputAdornment>
                }}/>
                <Select id="select-order" value={order} label="Order" onChange={handleChangeOrder} size="small">
                    <MenuItem value={'date'}>Date</MenuItem>
                    <MenuItem value={'author'}>Author</MenuItem>
                </Select>
                <Button variant="outlined" sx={{marginLeft: "4px"}} component={Link} to={PATH_HYPOTHESIS_NEW}>
                    <AddIcon/>
                </Button>
            </Box>
            <Card variant="outlined" sx={{height: "calc(100vh - 157px)", overflowY: "auto"}}>
                {loading ?
                    <Skeleton sx={{margin: "0px 10px"}} height={90}/>
                :
                    (error ? 
                        <Box> Error loading Hypotheses </Box>
                    :
                        hypotheses.map((h:Hypothesis) => <HypothesisPreview key={h.id} hypothesis={h} onDelete={(h:Hypothesis) => deleteHypothesis(h)}/>)
                    )
                }
            </Card>
        </Box>
    )
}