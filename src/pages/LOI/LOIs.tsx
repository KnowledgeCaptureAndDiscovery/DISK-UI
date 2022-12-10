import { Box, Button, Card, InputAdornment, MenuItem, Select, SelectChangeEvent, Skeleton, TextField, Tooltip } from "@mui/material";
import { PATH_LOI_NEW } from "constants/routes";
import { LineOfInquiry } from "DISK/interfaces";
import React from "react";
import { useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { Link } from "react-router-dom";
import { useGetLOIsQuery } from "redux/apis/lois";
import { LOIList } from "components/lois/LOIList";

type OrderType = 'date'|'author';

interface ViewProps {
    myPage?:boolean
}

export const LinesOfInquiry = ({myPage=false} : ViewProps) => {
    const [order, setOrder] = React.useState<OrderType>('date');
    const [searchTerm, setSearchTerm] = React.useState<string>("");
    const authenticated = useAppSelector((state:RootState) => state.keycloak.authenticated);
    const username = useAppSelector((state:RootState) => state.keycloak.username);
    const {data:LOIs, isLoading:loading, isError:error} = useGetLOIsQuery();

    const handleChangeOrder = (event: SelectChangeEvent<OrderType>) => {
        let order : OrderType = event.target!.value as OrderType;
        if (order) setOrder(order);
    }

    const applyFilters = (loi:LineOfInquiry) => {
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
                    (error || !LOIs? 
                        <Box> Error loading Lines of Inquiry </Box>
                    :
                        <LOIList list={LOIs.filter(applyFilters)} enableDeletion enableEdition/>
                    )
                }
            </Card>
        </Box>
    )
}