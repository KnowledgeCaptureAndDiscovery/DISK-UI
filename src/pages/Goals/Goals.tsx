import { Box, Button, Card, InputAdornment, MenuItem, Select, SelectChangeEvent, Skeleton, TextField, Tooltip } from "@mui/material";
import { Goal } from "DISK/interfaces";
import React from "react";
import AddIcon from '@mui/icons-material/Add';
import { useUser } from "redux/hooks";
import SearchIcon from '@mui/icons-material/Search';
import { PATH_GOAL_NEW } from "constants/routes";
import { Link } from "react-router-dom";
import { HypothesisList } from "components/goals/GoalsList";
import { useGetGoalsQuery } from "redux/apis/goals";

type OrderType = 'date'|'author';

interface ViewProps {
    myPage?:boolean
}

export const Goals = ({myPage=false} : ViewProps) => {
    const { data, isLoading, isError } = useGetGoalsQuery();
    const [order, setOrder] = React.useState<OrderType>('date');
    const [searchTerm, setSearchTerm] = React.useState<string>("");
    const [authenticated, username] = useUser();

    const handleChangeOrder = (event: SelectChangeEvent<OrderType>) => {
        let order : OrderType = event.target!.value as OrderType;
        if (order) setOrder(order);
    }

    const applyFilters = (hypothesis:Goal) => {
        //User filter
        if (myPage)
            return username && hypothesis.author && hypothesis.author.email === username;
        //Text Filter:
        let t : string = hypothesis.name + hypothesis.description + hypothesis.author;
        if (hypothesis.notes) t += hypothesis.notes;
        if (hypothesis.dateCreated) t += hypothesis.dateCreated;
        if (hypothesis.dateModified) t += hypothesis.dateModified;
        return t.toLowerCase().includes(searchTerm.toLowerCase());
    }

    return (
        <Box>
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
                        <Button variant="outlined" sx={{marginLeft: "4px"}} component={Link} to={PATH_GOAL_NEW} disabled={!authenticated}>
                            <AddIcon/>
                        </Button>
                    </Box>
                </Tooltip>
            </Box>
            <Card variant="outlined">
                {isLoading ?
                    <Skeleton sx={{margin: "0px 10px"}} height={90}/>
                :
                    (isError || !data? 
                        <Box> Error loading Hypotheses </Box>
                    :
                        <HypothesisList list={data.filter(applyFilters)} enableDeletion enableEdition/>
                    )
                }
            </Card>
        </Box>
    )
}