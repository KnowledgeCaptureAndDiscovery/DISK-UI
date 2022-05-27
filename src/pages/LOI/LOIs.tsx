import { Box, Button, Card, InputAdornment, MenuItem, Select, SelectChangeEvent, Skeleton, TextField } from "@mui/material";
import { PATH_LOI_NEW } from "constants/routes";
import { DISKAPI } from "DISK/API";
import { LineOfInquiry } from "DISK/interfaces";
import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "redux/hooks";
import { setLOIs, setLoadingAll, setErrorAll } from "redux/lois";
import { RootState } from "redux/store";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { Link } from "react-router-dom";
import { LOIPreview } from "components/LOIPreview";

type OrderType = 'date'|'author';

export const LinesOfInquiry = () => {
    const [order, setOrder] = React.useState<OrderType>('date');
    const LOIs = useAppSelector((state:RootState) => state.lois.LOIs);
    const loading = useAppSelector((state:RootState) => state.lois.loadingAll);
    const error = useAppSelector((state:RootState) => state.lois.errorAll);
    const dispatch = useAppDispatch();

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

    return (
        <Box>
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
            <Card variant="outlined" sx={{height: "calc(100vh - 157px)"}}>
                {loading ?
                    <Skeleton sx={{margin: "0px 10px"}} height={90}/>
                :
                    (error ? 
                        <Box> Error loading Lines of Inquiry </Box>
                    :
                        LOIs.map((loi:LineOfInquiry) => <LOIPreview key={loi.id} LOI={loi}/>)
                    )
                }
            </Card>
        </Box>
    )
}