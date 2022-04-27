import { Box, Card, Divider, IconButton, Skeleton, TextField, Typography } from "@mui/material";
import { DISKAPI } from "DISK/API";
import { Hypothesis, idPattern } from "DISK/interfaces";
import React, { useEffect } from "react";
import { Link, useLocation } from 'react-router-dom'
import CancelIcon from '@mui/icons-material/Cancel';
import { styled } from '@mui/material/styles';
import { PATH_HYPOTHESES } from "constants/routes";
import { QuestionSelector } from "components/QuestionSelector";

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

    const [hypothesis, setHypothesis] = React.useState<Hypothesis>();
    const [loadingHypothesis, setLoadingHypothesis] = React.useState<boolean>(true);

    const loadHypothesis = () => {
        let path : string = location.pathname;
        if (path.slice(-4) === "/new") {
            setLoadingHypothesis(false);
        } else {
            setLoadingHypothesis(true);
            let id : string = path.replace("/edit",'').replace(idPattern, '');
            let hypP : Promise<Hypothesis> = DISKAPI.getHypothesis(id);
            hypP.then((hypothesis:Hypothesis) => {
                setHypothesis(hypothesis);
                setLoadingHypothesis(false);
            });
            hypP.catch(() => {
                setLoadingHypothesis(false);
            });
        }
    }

    useEffect(loadHypothesis, [location]);

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)", overflowY: 'scroll'}}>
        <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            {!loadingHypothesis ? 
                <TextField fullWidth size="small" id="hypothesisName" label="Hypothesis Name" required
                    defaultValue={!!hypothesis ? hypothesis.name : ''}/>
            : <Skeleton/> }

            <IconButton component={Link} to={PATH_HYPOTHESES + (hypothesis && hypothesis.id ? "/" + hypothesis.id : "")}>
                <CancelIcon /> 
            </IconButton>
        </Box>
        <Divider/>
        <Box sx={{padding:"10px"}}>
            {!loadingHypothesis ?
                <TextFieldBlock multiline fullWidth required size="small" id="hypothesisDescription" label="Hypothesis Description"
                    sx={{marginTop: "5px"}} defaultValue={!!hypothesis ? hypothesis.description : ""}/>
            : <Skeleton/> }
            {!loadingHypothesis ?
                <TextFieldBlock multiline fullWidth required size="small" id="hypothesisNotes" label="Hypothesis Notes"
                    sx={{marginTop: "10px"}} defaultValue={!!hypothesis ? hypothesis.notes : ""}/>
            : <Skeleton/> }
            <TypographySubtitle>
                Hypothesis question:
            </TypographySubtitle>
            <QuestionSelector selected={hypothesis?.question}/>
        </Box>
        
    </Card>
}