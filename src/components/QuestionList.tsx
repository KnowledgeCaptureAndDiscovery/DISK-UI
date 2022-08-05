import { Box, Button, Card, CircularProgress, Divider, Link as MuiLink, Tooltip, Typography } from "@mui/material";
import { Hypothesis, LineOfInquiry, Question } from "DISK/interfaces";
import { Fragment, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { loadHypotheses, loadLOIs, loadQuestions } from "redux/loader";
import { RootState } from "redux/store";
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import AddIcon from '@mui/icons-material/Add';
import { Link } from "react-router-dom";
import { PATH_HYPOTHESES, PATH_HYPOTHESIS_NEW, PATH_LOIS } from "constants/routes";

import ScienceIcon from '@mui/icons-material/Science';
import SettingsIcon from '@mui/icons-material/Settings';

interface QuestionListProps {
    expanded?: boolean
}

export const QuestionList = ({expanded=false}) => {
    const dispatch = useAppDispatch();
    const error : boolean = useAppSelector((state:RootState) => state.question.errorAll);
    const loading : boolean = useAppSelector((state:RootState) => state.question.loadingAll);
    const initialized : boolean = useAppSelector((state:RootState) => state.question.initialized);
    const questions : Question[] = useAppSelector((state:RootState) => state.question.questions);
    const authenticated = useAppSelector((state:RootState) => state.keycloak.authenticated);

    const initHyp : boolean = useAppSelector((state:RootState) => state.hypotheses.initialized);
    const initLOI : boolean = useAppSelector((state:RootState) => state.lois.initialized);
    const hypotheses : Hypothesis[] = useAppSelector((state:RootState) => state.hypotheses.hypotheses);
    const lois : LineOfInquiry[] = useAppSelector((state:RootState) => state.lois.LOIs);

    useEffect(() => {
        if (!error && !loading && !initialized) {
            loadQuestions(dispatch);
        }
    }, [])

    useEffect(() => {
        if (expanded) {
            if (!initHyp) loadHypotheses(dispatch);
            if (!initLOI) loadLOIs(dispatch);
        }
    }, [expanded])

    const renderQuestion = (q:Question) => {
        let variableStep : number = q.name.charAt(0) === '?' ? 1 : 0;
        let parts : string[] = q.name.split(/<(.*?)>/); // parse <var>
        if (parts.length === 1) {
            parts = q.name.split(/(\?.* )/); // parse ?var
        }
        return (<Fragment>
            {parts.map((txt:string, i:number) => i%2===variableStep ?
                <span key={i}>{txt}</span>
                :
                <Tooltip key={i} arrow title={"You can set this variable on the hypothesis."}>
                    <span style={{textDecoration: "underline", textDecorationStyle: "dotted"}}>?{txt}</span>
                </Tooltip>
                

            )}
        </Fragment>)
    }

    const renderQuestionDetails = (q:Question) => {
         let myHyp : Hypothesis[] = hypotheses.filter((h:Hypothesis) => h.question === q.id);
         let myLOI : LineOfInquiry[] = lois.filter((l:LineOfInquiry) => l.question === q.id);
         if (myHyp.length === 0 && myLOI.length === 0)
            return null
         return (<Fragment>
            <Divider sx={{mb: '5px'}}/>
            {myHyp.map((h:Hypothesis) => <Card variant="elevation" sx={{display:'flex', alignItems:'center', textDecoration: 'none', mb:'5px', ':hover': {backgroundColor:'#ddd'}}}
                component={Link} to={PATH_HYPOTHESES + '/' + h.id} key={h.id}>
                <ScienceIcon sx={{color:'darkorange'}}/> {h.name}
            </Card>)}
            {myLOI.map((l:LineOfInquiry) => <Card variant="elevation" sx={{display:'flex', alignItems:'center', textDecoration: 'none', mb:'5px', ':hover': {backgroundColor:'#ddd'}}}
                component={Link} to={PATH_LOIS + '/' + l.id} key={l.id}>
                <SettingsIcon sx={{color:'darkgreen'}}/> {l.name}
            </Card>)}
         </Fragment>)
    }

    return (<Box sx={{display: "flex", justifyContent: "center"}}>
        {loading ? 
            <CircularProgress/>
        :  (error ? 
                <Box>
                    <span style={{marginRight:'5px'}}>
                        An error has ocurred while loading.
                    </span>
                    <MuiLink onClick={() => loadQuestions(dispatch)} sx={{cursor: 'pointer'}}>
                        Click here to reload
                    </MuiLink>
                </Box>
            :
                <Box>
                    {questions.map((q:Question) => <Card variant="outlined" sx={{mb: "5px", p: '5px 10px'}} key={q.id}>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <QuestionMarkIcon sx={{color:'burlywood'}}/>
                                <Box sx={{p: '0 5px', fontWeight: 500}}>
                                    {renderQuestion(q)}
                                </Box>
                            </Box>
                            <Box>
                                <Tooltip arrow title="Create a new Hypothesis based on this template" placement="top">
                                    <Button component={Link} to={PATH_HYPOTHESIS_NEW+"?q="+q.id} disabled={!authenticated}>
                                        <AddIcon sx={{mr:'5px'}}/> New
                                    </Button>
                                </Tooltip>
                            </Box>

                        </Box>
                        {expanded && renderQuestionDetails(q)}
                    </Card>)}
                </Box>
            )
        }
    </Box>);
}