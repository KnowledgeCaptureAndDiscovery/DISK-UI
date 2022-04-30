import { Box, Card, Divider, IconButton, Skeleton, TextField, Typography } from "@mui/material";
import { DISKAPI } from "DISK/API";
import { Hypothesis, idPattern } from "DISK/interfaces";
import React, { useEffect } from "react";
import { Link, useLocation } from 'react-router-dom'
import CancelIcon from '@mui/icons-material/Cancel';
import { styled } from '@mui/material/styles';
import { PATH_HYPOTHESES } from "constants/routes";
import { QuestionSelector } from "components/QuestionSelector";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { setErrorSelected, setLoadingSelected, setSelectedHypothesis } from "redux/hypothesis";

const TextFieldBlock = styled(TextField)(({ theme }) => ({
    display: "block",
    marginBottom: "4px",
}));

const TypographySubtitle = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: "1.2em"
}));

export const HypothesisEditor = () => {
    const location = useLocation();

    const hypothesis = useAppSelector((state:RootState) => state.hypotheses.selectedHypothesis);
    const selectedId = useAppSelector((state:RootState) => state.hypotheses.selectedId);
    const loading = useAppSelector((state:RootState) => state.hypotheses.loadingSelected);
    const error = useAppSelector((state:RootState) => state.hypotheses.errorSelected);
    const dispatch = useAppDispatch();

    const loadHypothesis = () => {
        let page : string = location.pathname.replace(idPattern, '');
        if (page === "new" || page === "edit") {
            if (page === "new") {
                dispatch(setSelectedHypothesis(null));
            } else {
                let id : string = location.pathname.replace("/edit",'').replace(idPattern, '');
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
            }
        }
    }

    useEffect(loadHypothesis);

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)", overflowY: 'scroll'}}>
        <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            {!loading ? 
                <TextField fullWidth size="small" id="hypothesisName" label="Hypothesis Name" required
                    defaultValue={!!hypothesis ? hypothesis.name : ''}/>
            : <Skeleton/> }

            <IconButton component={Link} to={PATH_HYPOTHESES + (hypothesis && hypothesis.id ? "/" + hypothesis.id : "")}>
                <CancelIcon /> 
            </IconButton>
        </Box>
        <Divider/>
        <Box sx={{padding:"10px"}}>
            {!loading ?
                <TextFieldBlock multiline fullWidth required size="small" id="hypothesisDescription" label="Hypothesis Description"
                    sx={{marginTop: "5px"}} defaultValue={!!hypothesis ? hypothesis.description : ""}/>
            : <Skeleton/> }
            {!loading ?
                <TextFieldBlock multiline fullWidth required size="small" id="hypothesisNotes" label="Hypothesis Notes"
                    sx={{marginTop: "10px"}} defaultValue={!!hypothesis ? hypothesis.notes : ""}/>
            : <Skeleton/> }
            <TypographySubtitle>
                Hypothesis question:
            </TypographySubtitle>
            <QuestionSelector hypothesis={hypothesis}/>
        </Box>
        
    </Card>
}