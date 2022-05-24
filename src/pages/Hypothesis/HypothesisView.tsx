import { Box, Card, Divider, IconButton, Skeleton, Typography } from "@mui/material";
import { DISKAPI } from "DISK/API";
import { Hypothesis, idPattern } from "DISK/interfaces";
import { useEffect } from "react";
import { Link, useLocation } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';
import { PATH_HYPOTHESES } from "constants/routes";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { setSelectedHypothesis, setLoadingSelected, setErrorSelected } from 'redux/hypothesis';
import { QuestionPreview } from "components/QuestionPreview";

const TypographyLabel = styled(Typography)(({ theme }) => ({
    color: 'gray',
    display: "inline",
    fontWeight: "bold",
    fontSize: ".9em"
}));

const TypographyInline = styled(Typography)(({ theme }) => ({
    display: "inline",
}));

const TypographySubtitle = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: "1.2em"
}));

export const HypothesisView = () => {
    const location = useLocation();

    const hypothesis = useAppSelector((state:RootState) => state.hypotheses.selectedHypothesis);
    const selectedId = useAppSelector((state:RootState) => state.hypotheses.selectedId);
    const loading = useAppSelector((state:RootState) => state.hypotheses.loadingSelected);
    const error = useAppSelector((state:RootState) => state.hypotheses.errorSelected);
    const dispatch = useAppDispatch();

    const loadHypothesis = () => {
        let id : string = location.pathname.replace(idPattern, '');
        if (!!id && !loading && !error && selectedId !== id) {
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

    useEffect(loadHypothesis);

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)"}}>
        {loading ? 
            <Skeleton sx={{height:"40px", margin: "8px 12px", minWidth: "250px"}}/>
        :
            <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor: "whitesmoke"}}>
                <Typography variant="h5">
                    {error ? "Error loading hypothesis" : hypothesis?.name}
                </Typography>
                <IconButton component={Link} to={PATH_HYPOTHESES + "/" + hypothesis?.id + "/edit"}>
                    <EditIcon />
                </IconButton>
            </Box>
        }
        <Divider/>
        <Box sx={{padding:"10px"}}>
            <Box>
                <TypographyLabel>Description: </TypographyLabel>
                <TypographyInline>
                    {!loading && !!hypothesis ? hypothesis.description : <Skeleton sx={{display:"inline-block", width: "200px"}} />}
                </TypographyInline>
            </Box>
            {!!hypothesis && hypothesis.notes ? <Box>
                <TypographyLabel>Notes: </TypographyLabel>
                <TypographyInline>{hypothesis.notes}</TypographyInline>
            </Box> : ""}

            <TypographySubtitle>
                Hypothesis question:
            </TypographySubtitle>
            {!loading && !!hypothesis ? 
            <QuestionPreview selected={hypothesis.question as string} bindings={hypothesis.questionBindings}/>
            : <Skeleton/>}

            <TypographySubtitle>
                Hypothesis testing executions:
            </TypographySubtitle>
            <Skeleton/>

        </Box>
        
    </Card>
}