import { Box, Button, Card, InputAdornment, MenuItem, Select, SelectChangeEvent, Skeleton, TextField } from "@mui/material";
import { DISKAPI } from "DISK/API";
import { Hypothesis } from "DISK/interfaces";
import React, { useEffect } from "react";
import SearchIcon from '@mui/icons-material/Search';
import { HypothesisPreview } from "components/HypothesisPreview";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from 'redux/store';
import { setErrorAll, setLoadingAll, setHypotheses } from 'redux/hypothesis';
import AddIcon from '@mui/icons-material/Add';
import { PATH_HYPOTHESES } from "constants/routes";
import { Link } from "react-router-dom";

type OrderType = 'date'|'author';

export const Hypotheses = () => {
    const [order, setOrder] = React.useState<OrderType>('date');
    const hypotheses = useAppSelector((state:RootState) => state.hypotheses.hypotheses);
    const loading = useAppSelector((state:RootState) => state.hypotheses.loadingAll);
    const error = useAppSelector((state:RootState) => state.hypotheses.errorAll);
    const dispatch = useAppDispatch();

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

    return (
        <Box>
            <Box sx={{display:'flex', paddingBottom: "5px"}}>
                <TextField id="input-text-search" label="Search hypotheses" variant="outlined" size="small" 
                    sx={{width:'100%', paddingRight:'5px'}} InputProps={{
                    startAdornment: <InputAdornment position="start"> <SearchIcon/> </InputAdornment>
                }}/>
                <Select id="select-order" value={order} label="Order" onChange={handleChangeOrder} size="small">
                    <MenuItem value={'date'}>Date</MenuItem>
                    <MenuItem value={'author'}>Author</MenuItem>
                </Select>
                <Button variant="outlined" sx={{marginLeft: "4px"}} component={Link} to={PATH_HYPOTHESES+ "/new"}>
                    <AddIcon/>
                </Button>
            </Box>
            <Card variant="outlined" sx={{height: "calc(100vh - 157px)"}}>
                {loading ?
                    <Skeleton sx={{margin: "0px 10px"}} height={90}/>
                :
                    (error ? 
                        <Box> Error loading Hypotheses </Box>
                    :
                        hypotheses.map((h:Hypothesis) => <HypothesisPreview key={h.id} hypothesis={h}/>)
                    )
                }
            </Card>
        </Box>
    )
}