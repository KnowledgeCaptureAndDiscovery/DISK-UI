import { Alert, Backdrop, Box, Button, Card, CircularProgress, InputAdornment, MenuItem, Select, SelectChangeEvent, Skeleton, Snackbar, TextField } from "@mui/material";
import { PATH_LOI_NEW } from "constants/routes";
import { DISKAPI } from "DISK/API";
import { LineOfInquiry } from "DISK/interfaces";
import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "redux/hooks";
import { setLOIs, setLoadingAll, setErrorAll, remove } from "redux/lois";
import { RootState } from "redux/store";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { Link } from "react-router-dom";
import { LOIPreview } from "components/LOIPreview";

type OrderType = 'date'|'author';

export const LinesOfInquiry = () => {
    const dispatch = useAppDispatch();
    const [order, setOrder] = React.useState<OrderType>('date');
    const LOIs = useAppSelector((state:RootState) => state.lois.LOIs);
    const loading = useAppSelector((state:RootState) => state.lois.loadingAll);
    const error = useAppSelector((state:RootState) => state.lois.errorAll);

    //deleting
    const [waiting, setWaiting] = React.useState<boolean>(false);;
    const [deleteNotification, setDeleteNotification] = React.useState<boolean>(false);
    const [lastDeletedName, setLastDeletedNamed] = React.useState<string>("");
    const [errorNotification, setErrorNotification] = React.useState<boolean>(false);

    useEffect(() => {
        if (LOIs.length === 0 && !loading && !error) {
            dispatch(setLoadingAll());
            DISKAPI.getLOIs()
                .then((lois:LineOfInquiry[]) => dispatch(setLOIs(lois)))
                .catch(() => dispatch(setErrorAll()) );
        }
    });

    const handleChangeOrder = (event: SelectChangeEvent<OrderType>) => {
        let order : OrderType = event.target!.value as OrderType;
        if (order) setOrder(order);
    }

    const deleteLOI = (loi:LineOfInquiry) => {
        console.log("DELETING: ", loi.id);
        setWaiting(true);
        setLastDeletedNamed(loi.name);
        DISKAPI.deleteLOI(loi.id)
            .then((b:boolean) => {
                if (b) {
                    dispatch(remove(loi.id));
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
                    Line of inquiry {lastDeletedName} was deleted
                </Alert>
            </Snackbar>
            <Snackbar open={errorNotification} autoHideDuration={3000} onClose={handleDeleteNotificationClose} anchorOrigin={{vertical:'bottom', horizontal: 'right'}}>
                <Alert severity="error" sx={{ width: '100%' }} onClose={handleDeleteNotificationClose}>
                    Error trying to delete {lastDeletedName}. The line of inquiry was not deleted
                </Alert>
            </Snackbar>

            <Box sx={{display:'flex', paddingBottom: "5px"}}>
                <TextField id="input-text-search" label="Search lines of inquiry" variant="outlined" size="small" 
                    sx={{width:'100%', paddingRight:'5px'}} InputProps={{
                    startAdornment: <InputAdornment position="start"> <SearchIcon/> </InputAdornment>
                }}/>
                <Select id="select-order" value={order} label="Order" onChange={handleChangeOrder} size="small">
                    <MenuItem value={'date'}>Date</MenuItem>
                    <MenuItem value={'author'}>Author</MenuItem>
                </Select>
                <Button variant="outlined" sx={{marginLeft: "4px"}} component={Link} to={PATH_LOI_NEW}>
                    <AddIcon/>
                </Button>
            </Box>
            <Card variant="outlined" sx={{height: "calc(100vh - 157px)", overflowY:"auto"}}>
                {loading ?
                    <Skeleton sx={{margin: "0px 10px"}} height={90}/>
                :
                    (error ? 
                        <Box> Error loading Lines of Inquiry </Box>
                    :
                        LOIs.map((loi:LineOfInquiry) => <LOIPreview key={loi.id} LOI={loi} onDelete={deleteLOI}/>)
                    )
                }
            </Card>
        </Box>
    )
}