import { Box, Button, Card, Divider, IconButton, Skeleton, Typography } from "@mui/material";
import { idPattern, TriggeredLineOfInquiry } from "DISK/interfaces";
import { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit';
import PlayIcon from '@mui/icons-material/PlayArrow';
import ErrorIcon from '@mui/icons-material/ErrorOutline';
import WaitIcon from '@mui/icons-material/HourglassBottom';
import CheckIcon from '@mui/icons-material/Check';
import { styled } from '@mui/material/styles';
import { PATH_HYPOTHESES } from "constants/routes";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { QuestionPreview } from "components/QuestionPreview";
import { loadTLOIs, loadHypothesis } from "redux/loader";
import { DISKAPI } from "DISK/API";

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

    const TLOIs = useAppSelector((state:RootState) => state.tlois.TLOIs);
    const TLOIloading = useAppSelector((state:RootState) => state.tlois.loadingAll);
    const TLOIerror = useAppSelector((state:RootState) => state.tlois.errorAll);

    const [myTLOIs, setMyTLOIs] = useState<TriggeredLineOfInquiry[]>([]);

    useEffect(() => {
        let id : string = location.pathname.replace(idPattern, '');
        if (!!id && !loading && !error && selectedId !== id) {
            loadHypothesis(dispatch, id);
        }
    }, [location, dispatch, error, loading, selectedId]);

    useEffect(() => {
        if (!TLOIloading && !TLOIerror && TLOIs.length === 0)
            loadTLOIs(dispatch);
    });

    useEffect(() => {
        setMyTLOIs(TLOIs.filter((tloi) => tloi.parentHypothesisId === selectedId));
    }, [TLOIs, selectedId]);

    const queryHypothesis = () => {
        DISKAPI.queryHypothesis(selectedId)
            .then((tlois:TriggeredLineOfInquiry[]) => {
                console.log(tlois);
            });
    };

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)", overflowY: "auto"}}>
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
        </Box>

        <Box sx={{padding:"10px"}}>
            <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <TypographySubtitle sx={{mt: "10px"}}>
                    Hypothesis testing executions:
                </TypographySubtitle>
                <Button variant="outlined" onClick={() => queryHypothesis()}>
                    <PlayIcon/> Test hypothesis
                </Button>
            </Box>
            {TLOIloading ? 
                <Skeleton/>
                : (myTLOIs.length === 0 ? <Card variant="outlined" sx={{display:'flex', justifyContent:'center'}}>
                    No executions
                </Card>
                :   myTLOIs.map((tloi:TriggeredLineOfInquiry) => 
                <Card variant="outlined" key={tloi.id} sx={{marginBottom: "5px", padding: "2px 10px"}}>
                    <Box sx={{display:"flex"}}>
                        {tloi.status === 'FAILED' ? 
                            <ErrorIcon sx={{color:"red"}}/> 
                            : (tloi.status === 'SUCCESSFUL' ?
                                <CheckIcon sx={{color:"green"}}/> 
                                : <WaitIcon sx={{color:(tloi.status === 'RUNNING' ? "green" : "yellow")}}/>)}
                        <Box sx={{marginLeft: "5px"}}>
                            {tloi.name}
                        </Box>
                    </Box>
                </Card>))
            }
        </Box>
        
    </Card>
}