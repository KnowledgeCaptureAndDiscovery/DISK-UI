import { Box, Card, Divider, IconButton, Skeleton, TextField, Typography } from "@mui/material";
import { DISKAPI } from "DISK/API";
import { Hypothesis } from "DISK/interfaces";
import { useEffect } from "react";
import { Link, useLocation } from 'react-router-dom'
import CancelIcon from '@mui/icons-material/Cancel';
import { styled } from '@mui/material/styles';
import { PATH_HYPOTHESES, PATH_HYPOTHESIS_ID_EDIT_RE, PATH_HYPOTHESIS_NEW } from "constants/routes";
import { QuestionSelector } from "components/QuestionSelector";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { setErrorSelected, setLoadingSelected, setSelectedHypothesis } from "redux/hypothesis";
import React from "react";

const TextFieldBlock = styled(TextField)(({ theme }) => ({
    display: "block",
    marginBottom: "4px",
}));

const TypographySubtitle = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: "1.2em",
    padding: "5px 5px 0px 5px",
}));

export const HypothesisEditor = () => {
    const location = useLocation();

    const hypothesis = useAppSelector((state:RootState) => state.hypotheses.selectedHypothesis);
    const selectedId = useAppSelector((state:RootState) => state.hypotheses.selectedId);
    const loading = useAppSelector((state:RootState) => state.hypotheses.loadingSelected);
    const error = useAppSelector((state:RootState) => state.hypotheses.errorSelected);
    const dispatch = useAppDispatch();

    const [fakeLoading, setFakeLoading] = React.useState(false);

    useEffect(() => {
        let match = PATH_HYPOTHESIS_ID_EDIT_RE.exec(location.pathname);
        if (match != null && match.length === 2) {
            let id : string = match[1];
            if (!loading && !error && selectedId !== id) {
                dispatch(setLoadingSelected(id));
                DISKAPI.getHypothesis(id)
                    .then((hypothesis:Hypothesis) => {
                        dispatch(setSelectedHypothesis(hypothesis));
                    })
                    .catch(() => {
                        dispatch(setErrorSelected());
                    }); 
            }
        } else if (location.pathname === PATH_HYPOTHESIS_NEW) {
            dispatch(setSelectedHypothesis(null));
        }
    }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

    //TODO: Fix this, should clean the form when on /new
    useEffect(() => {
        if (!selectedId && !fakeLoading) {
            setFakeLoading(true);
            setTimeout(() => {
                setFakeLoading(false);
            }, 100);
        }
    }, [selectedId])  // eslint-disable-line react-hooks/exhaustive-deps

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)", overflowY: 'auto'}}>
        <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor: "whitesmoke"}}>
            {!loading && !fakeLoading? 
                <TextField fullWidth size="small" id="hypothesisName" label="Hypothesis Name" required sx={{backgroundColor: "white"}}
                    defaultValue={!!hypothesis ? hypothesis.name : ''}/>
            : <Skeleton/> }

            <IconButton component={Link} to={PATH_HYPOTHESES + (hypothesis && hypothesis.id ? "/" + hypothesis.id : "")}>
                <CancelIcon /> 
            </IconButton>
        </Box>
        <Divider/>
        <Box sx={{padding:"10px"}}>
            {!loading && !fakeLoading?
                <TextFieldBlock multiline fullWidth required size="small" id="hypothesisDescription" label="Hypothesis Description"
                    sx={{marginTop: "5px"}} defaultValue={!!hypothesis ? hypothesis.description : ""}/>
            : <Skeleton/> }
            {!loading && !fakeLoading ?
                <TextFieldBlock multiline fullWidth required size="small" id="hypothesisNotes" label="Hypothesis Notes"
                    sx={{marginTop: "10px"}} defaultValue={!!hypothesis ? hypothesis.notes : ""}/>
            : <Skeleton/> }
            <Divider/>
            <TypographySubtitle>
                Hypothesis question:
            </TypographySubtitle>
            {!loading && !fakeLoading ?
                <QuestionSelector hypothesis={hypothesis}/>
            : <Skeleton/>}
        </Box>
        
    </Card>
}