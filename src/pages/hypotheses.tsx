import { Box, Card, InputAdornment, MenuItem, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import { DISKAPI } from "DISK/API";
import { Hypothesis } from "DISK/interfaces";
import React, { useEffect } from "react";
import SearchIcon from '@mui/icons-material/Search';

type OrderType = 'date'|'author';

export const Hypotheses = () => {
    const [hypotheses, setHypotheses] = React.useState<Hypothesis[]>([]);
    const [order, setOrder] = React.useState<OrderType>('date');

    useEffect(() => {
        let hypP : Promise<Hypothesis[]> =DISKAPI.getHypotheses();
        hypP.then((hypotheses:Hypothesis[]) => {
            setHypotheses(hypotheses);
        })
    }, []);

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
            </Box>
            <Card variant="outlined" sx={{height: "calc(100vh - 157px)"}}>
                {hypotheses.map((h:Hypothesis) => <Box key={h.id}>
                    <Typography variant="h6"> {h.name} </Typography>
                    <Typography> {h.description} </Typography>
                </Box>)}
            </Card>
        </Box>
    )
}