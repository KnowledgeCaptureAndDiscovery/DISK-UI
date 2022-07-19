import { Alert, Backdrop, Box, Button, Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputAdornment, MenuItem, Select, SelectChangeEvent, Skeleton, Snackbar, TextField, Tooltip } from "@mui/material";
import { PATH_LOI_NEW } from "constants/routes";
import { DISKAPI } from "DISK/API";
import { LineOfInquiry } from "DISK/interfaces";
import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "redux/hooks";
import { remove } from "redux/lois";
import { RootState } from "redux/store";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { Link } from "react-router-dom";
import { LOIPreview } from "components/LOIPreview";
import { loadLOIs } from "redux/loader";

type OrderType = 'date'|'author';

interface ViewProps {
    myPage?:boolean
}

export const LinesOfInquiry = ({myPage=false} : ViewProps) => {
    const dispatch = useAppDispatch();
    const [order, setOrder] = React.useState<OrderType>('date');
    const [searchTerm, setSearchTerm] = React.useState<string>("");
    const LOIs = useAppSelector((state:RootState) => state.lois.LOIs);
    const loading = useAppSelector((state:RootState) => state.lois.loadingAll);
    const error = useAppSelector((state:RootState) => state.lois.errorAll);
    const initializedLOIs = useAppSelector((state:RootState) => state.lois.initialized);

    //deleting
    const [waiting, setWaiting] = React.useState<boolean>(false);;
    const [deleteNotification, setDeleteNotification] = React.useState<boolean>(false);
    const [lastDeletedName, setLastDeletedNamed] = React.useState<string>("");
    const [errorNotification, setErrorNotification] = React.useState<boolean>(false);

    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState<boolean>(false);
    const [LOIToDelete, setLOIToDelete] = React.useState<LineOfInquiry|null>(null);
    const authenticated = useAppSelector((state:RootState) => state.keycloak.authenticated);
    const username = useAppSelector((state:RootState) => state.keycloak.username);

    useEffect(() => {
        if (!initializedLOIs)
            loadLOIs(dispatch);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChangeOrder = (event: SelectChangeEvent<OrderType>) => {
        let order : OrderType = event.target!.value as OrderType;
        if (order) setOrder(order);
    }

    const onDeleteConfirmed = () => {
        if (LOIToDelete === null) return;
        const loiId : string = LOIToDelete.id;
        console.log("DELETING: ", loiId);
        setWaiting(true);
        setLastDeletedNamed(LOIToDelete.name);
        DISKAPI.deleteLOI(loiId)
            .then((b:boolean) => {
                if (b) {
                    dispatch(remove(loiId));
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
        setLOIToDelete(null);
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

    const applyFilter = (loi:LineOfInquiry) => {
        //User filter
        if (myPage)
            return username && loi.author === username;
        //TextFilter
        let t : string = loi.name + loi.description + loi.author;
        if (loi.notes) t += loi.notes;
        if (loi.dateCreated) t += loi.dateCreated;
        if (loi.dateModified) t += loi.dateModified;
        return t.toLowerCase().includes(searchTerm.toLowerCase());
    }

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

            <Dialog open={confirmDialogOpen}>
                <DialogTitle id="alert-loi-delete-title">
                    {"Delete this Line of Inquiry?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-loi-delete-description">
                        Are you sure you want to delete the Line of Inquiry "{LOIToDelete?.name}"?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setConfirmDialogOpen(false);
                        setLOIToDelete(null);
                    }}>Cancel</Button>
                    <Button color="error" autoFocus onClick={onDeleteConfirmed}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Box sx={{display:'flex', paddingBottom: "5px"}}>
                <TextField id="input-text-search" label="Search lines of inquiry" variant="outlined" size="small" 
                    value={searchTerm} onChange={(ev) => setSearchTerm(ev.target.value)}
                    sx={{width:'100%', paddingRight:'5px'}} InputProps={{
                    startAdornment: <InputAdornment position="start"> <SearchIcon/> </InputAdornment>
                }}/>
                <Select id="select-order" value={order} label="Order" onChange={handleChangeOrder} size="small">
                    <MenuItem value={'date'}>Date</MenuItem>
                    <MenuItem value={'author'}>Author</MenuItem>
                </Select>
                <Tooltip arrow title={authenticated? "Create a new line of inquiry" : "You need to log in to create a new line of inquiry"}>
                    <Box sx={{display:"inline-flex"}}>
                        <Button variant="outlined" sx={{marginLeft: "4px"}} component={Link} to={PATH_LOI_NEW} disabled={!authenticated}>
                            <AddIcon/>
                        </Button>
                    </Box>
                </Tooltip>
            </Box>
            <Card variant="outlined" sx={{height: "calc(100vh - 157px)", overflowY:"auto"}}>
                {loading ?
                    <Skeleton sx={{margin: "0px 10px"}} height={90}/>
                :
                    (error ? 
                        <Box> Error loading Lines of Inquiry </Box>
                    :
                        LOIs.filter(applyFilter).map((loi:LineOfInquiry) => <LOIPreview key={loi.id} LOI={loi} onDelete={() => {
                            setConfirmDialogOpen(true);
                            setLOIToDelete(loi);
                        }}/>)
                    )
                }
            </Card>
        </Box>
    )
}