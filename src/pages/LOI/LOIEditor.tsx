import React from "react";
import { Box, Card, Divider, IconButton, MenuItem, Select, SelectChangeEvent, Skeleton, TextField, Typography } from "@mui/material";
import { DISKAPI } from "DISK/API";
import { LineOfInquiry } from "DISK/interfaces";
import { useEffect } from "react";
import { Link, useLocation } from 'react-router-dom'
import CancelIcon from '@mui/icons-material/Cancel';
import { styled } from '@mui/material/styles';
import { PATH_LOIS, PATH_LOI_ID_EDIT_RE, PATH_LOI_NEW } from "constants/routes";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { setErrorSelected, setLoadingSelected, setSelectedLOI } from "redux/lois";
import { setEndpoint, setErrorEndpoint, setLoadingEndpoints } from "redux/server";
import { QuestionLinker } from "components/QuestionLinker";


const TextFieldBlock = styled(TextField)(({ theme }) => ({
    display: "block",
    marginBottom: "4px",
}));

const TypographySubtitle = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: "1.2em",
    padding: "5px 5px 0px 5px",
}));

export const LOIEditor = () => {
    const location = useLocation();
    const dispatch = useAppDispatch();

    const LOI = useAppSelector((state:RootState) => state.lois.selectedLOI);
    const selectedId = useAppSelector((state:RootState) => state.lois.selectedId);
    const loading = useAppSelector((state:RootState) => state.lois.loadingSelected);
    const error = useAppSelector((state:RootState) => state.lois.errorSelected);

    const endpoints = useAppSelector((state:RootState) => state.server.endpoints);
    const loadingEndpoints = useAppSelector((state:RootState) => state.server.loadingEndpoints);
    const errorEndpoints = useAppSelector((state:RootState) => state.server.errorEndpoints);

    const [fakeLoading, setFakeLoading] = React.useState(false);
    const [selectedDataSource, setSelectedDataSource] = React.useState("");

    useEffect(() => {
        let match = PATH_LOI_ID_EDIT_RE.exec(location.pathname);
        if (match != null && match.length === 2) {
            let id : string = match[1];
            if (!loading && !error && selectedId !== id) {
                dispatch(setLoadingSelected(id));
                DISKAPI.getLOI(id)
                    .then((LOI:LineOfInquiry) => {
                        console.log(LOI);
                        dispatch(setSelectedLOI(LOI));
                        if (LOI.dataSource) setSelectedDataSource(LOI.dataSource);
                    })
                    .catch(() => dispatch(setErrorSelected())); 
            } else if (LOI && LOI.dataSource) {
                setSelectedDataSource(LOI.dataSource);
            }
        } else if (location.pathname === PATH_LOI_NEW) {
            dispatch(setSelectedLOI(null));
        }
        if (endpoints == null && !loadingEndpoints && !errorEndpoints) {
            dispatch(setLoadingEndpoints());
            DISKAPI.getEndpoints()
                .then((endpointMap:{[name:string]: string}) => {
                    dispatch(setEndpoint(endpointMap))
                })
                .catch(() => dispatch(setErrorEndpoint()));
        }
    }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!selectedId && !fakeLoading) {
            setFakeLoading(true);
            setTimeout(() => {
                setFakeLoading(false);
            }, 100);
        }
    }, [selectedId])  // eslint-disable-line react-hooks/exhaustive-deps

    const onDataSourceChange = (event:SelectChangeEvent<string>) => {
        if (event && event.target.value) {
            setSelectedDataSource(event.target.value);
        }
    }

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)", overflowY: 'auto'}}>
        <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            {!loading && !fakeLoading? 
                <TextField fullWidth size="small" id="LOIName" label="LOI Name" required
                    defaultValue={!!LOI ? LOI.name : ''}/>
            : <Skeleton/> }

            <IconButton component={Link} to={PATH_LOIS + (LOI && LOI.id ? "/" + LOI.id : "")}>
                <CancelIcon /> 
            </IconButton>
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Description:</TypographySubtitle>
            {!loading && !fakeLoading?
                <TextFieldBlock multiline fullWidth required size="small" id="LOIDescription" label="LOI Description"
                    sx={{marginTop: "5px"}} defaultValue={!!LOI ? LOI.description : ""}/>
            : <Skeleton/> }
            {!loading && !fakeLoading ?
                <TextFieldBlock multiline fullWidth required size="small" id="LOINotes" label="LOI Notes"
                    sx={{marginTop: "10px"}} defaultValue={!!LOI ? LOI.notes : ""}/>
            : <Skeleton/> }
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Hypothesis linking:</TypographySubtitle>
            <QuestionLinker selected={LOI? LOI.question : ""} />
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Data extraction:</TypographySubtitle>
            <Box sx={{display: "inline-flex", alignItems: "center"}}>
                <Typography sx={{display: "inline-block", marginRight: "5px"}}> Data source: </Typography>
                <Select size="small" sx={{display: 'inline-block', minWidth: "150px"}} variant="standard" value={selectedDataSource} label={"Data source:"} onChange={onDataSourceChange}>
                    {loadingEndpoints ? 
                        <MenuItem value={selectedDataSource}> Loading ... </MenuItem> 
                    : (
                        endpoints ? 
                            Object.keys(endpoints).map((name:string) => <MenuItem key={`endpoint_${name}`} value={endpoints[name]}>{name}</MenuItem>)
                        :
                            <MenuItem value={selectedDataSource}>{selectedDataSource}</MenuItem>
                    )}
                </Select>
            </Box>
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Method configuration:</TypographySubtitle>
        </Box>
    </Card>
}