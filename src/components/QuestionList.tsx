import { Box, Button, Card, CircularProgress, Divider, Link as MuiLink, List, ListItem, Tooltip, Typography } from "@mui/material";
import { Hypothesis, idPattern, LineOfInquiry, Question, QuestionVariable, VariableBinding } from "DISK/interfaces";
import { Fragment, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { loadHypotheses, loadLOIs, loadQuestions } from "redux/loader";
import { RootState } from "redux/store";
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import AddIcon from '@mui/icons-material/Add';
import { Link } from "react-router-dom";
import { PATH_HYPOTHESES, PATH_HYPOTHESIS_NEW, PATH_LOIS, PATH_LOI_NEW } from "constants/routes";

import ScienceIcon from '@mui/icons-material/Science';
import SettingsIcon from '@mui/icons-material/Settings';
import { isBoundingBoxVariable } from "./QuestionSelector";
import { useGetHypothesesQuery } from "DISK/queries";

interface QuestionListProps {
    expanded?: boolean,
    kind: 'hypothesis' | 'loi',
}

export const normalizeURI = (uri:string) => {
    if (uri.startsWith("http") || uri.startsWith("www"))
        uri = uri.replace(idPattern, "");

    //WIKI Specific 
    if (uri.startsWith("Property-3A"))
        uri = uri.replace("Property-3A", "").replace("-28E-29", "");

    uri = uri.replaceAll("_", "");
    return uri;
}

export const normalizeTextValue = (text:string) => {
    //If is an url use the last part of the path
    if (text.startsWith("http") || text.startsWith("www"))
        text = text.replace(idPattern, "");
    text = text.replaceAll("Pages2k2_1_2#", "").replaceAll(".Location", "");
    text = text.replaceAll('-28', '(').replaceAll('-29', ')').replaceAll('-3A', ':');
    text = text.replaceAll("_(E)", "").replaceAll("Property:", "");
    text = text.replaceAll('_', ' ');
    return text;
}


export const QuestionList = ({expanded=false, kind} : QuestionListProps) => {
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

    const [count, setCount] = useState<{[id:string] : number}>({});
    const [sortedQuestions, setSortedQuestions] = useState<Question[]>([]);

    useEffect(() => {
        if (!error && !loading && !initialized) {
            loadQuestions(dispatch);
        }
    }, [])

    const countQuestions = (items: Hypothesis[] | LineOfInquiry[]) => {
        let newCount : {[id:string] : number} = {};
        items.forEach((item:Hypothesis|LineOfInquiry) => {
            if (item.question) {
                if (!newCount[item.question])
                    newCount[item.question] = 0;
                newCount[item.question] += 1;
            }
        });
        setCount(newCount);
    }

    useEffect(() => {
        countQuestions(hypotheses);
    }, [hypotheses])

    useEffect(() => {
        countQuestions(lois);
    }, [lois])

    useEffect(() => {
        let q : Question[] = [ ...questions ];
        setSortedQuestions(q.sort(sortQuestions));
    }, [questions, count])

    const sortQuestions = (q1:Question, q2:Question) => {
        let a : number = count[q1.id] ? count[q1.id] : 0;
        let b : number = count[q2.id] ? count[q2.id] : 0;
        return a < b ? 1 : -1;
    }

    useEffect(() => {
        if (expanded) {
            if (kind === 'hypothesis' && !initHyp) loadHypotheses(dispatch);
            if (kind === 'loi' && !initLOI) loadLOIs(dispatch);
        }
    }, [expanded])

    const renderQuestion = (q:Question) => {
        let variableStep : number = q.name.charAt(0) === '?' ? 1 : 0;
        let name = q.name.endsWith('?') ? q.name.substring(0, q.name.length-1) : q.name;
        let parts : string[] = name.split(/<(.*?)>/); // parse <var> FIXME: this is old.
        if (parts.length === 1) {
            parts = name.split(/(\?[A-Za-z0-9_]*)/); // parse ?var
        }
        return (<Fragment>
            {parts.map((txt:string, i:number) => i%2===variableStep ?
                <span key={i}>{txt}</span>
                :
                <Tooltip key={i} arrow title={"You can set this variable on the hypothesis."}>
                    <span style={{textDecoration: "underline", textDecorationStyle: "dotted"}}>{txt}</span>
                </Tooltip>
            )}?
        </Fragment>)
    }

    const renderQuestionHypotheses = (q:Question) => {
         let myHyp : Hypothesis[] = hypotheses.filter((h:Hypothesis) => h.question === q.id);
         if (myHyp.length === 0)
            return null
         return <Fragment>
            <Divider/>
            <Typography>Hypotheses based on this question:</Typography>
            <List sx={{p:0}}>
            {myHyp.map((h:Hypothesis) => 
                <ListItem sx={{p:"4px 16px"}} key={h.id}>
                    <Card variant="elevation" sx={{display:'flex', alignItems:'center', textDecoration: 'none', width:"100%", backgroundColor: "rgba(126,126,126,0.05)", ':hover': {backgroundColor:'#ddd'}}}
                        component={Link} to={PATH_HYPOTHESES + '/' + h.id} key={h.id}>
                        {renderHypothesisQuestionText(q, h)}
                    </Card>
                </ListItem>)}
            </List>
         </Fragment>
    }

    const renderHypothesisQuestionText = (q:Question, h:Hypothesis) => {
        let parts = q.template.split(/(\?[A-Za-z0-9_]*)/);
        let values : {[name:string]:string} = {};
        let tmp : {[url:string]:string} = {};
        q.variables.forEach((variable:QuestionVariable) => {
            tmp[variable.id] = variable.variableName;
        })
        h.questionBindings.forEach((binding:VariableBinding) => {
            if (tmp[binding.variable]) {
                values[tmp[binding.variable]] = binding.binding;
            }
        })
        q.variables.forEach((variable:QuestionVariable) => {
            if (isBoundingBoxVariable(variable)) {
                if (variable.representation != null) {
                    let explanationParts: string[] = variable.representation.split(/(\?[a-zA-Z0-9]*)/g);
                    console.log(values, explanationParts);
                    let val: string = explanationParts.map((p: string) => p.startsWith('?') && values[p] ? Number(values[p]).toFixed(2) : p).join('');
                    values[variable.variableName] = val;
                }
            }
        })
        return <Fragment>
            <ScienceIcon sx={{mx: "5px", color:'darkorange'}}/>
            {parts.map((part:string,i:number) => part.startsWith('?') ? 
                <b key={`pv_${i}`} style={{color:'green', margin: '4px'}}>
                    {normalizeTextValue(values[part])}
                </b>
            :
                <span key={`p_${i}`}>
                    {part}
                </span>
            )}
        </Fragment>
    }

    const renderQuestionLOIs = (q:Question) => {
         let myLOI : LineOfInquiry[] = lois.filter((l:LineOfInquiry) => l.question === q.id);
         if (myLOI.length === 0)
            return null
         return <Fragment>
            <Divider/>
            <Typography>Lines of Inquiry based on this question:</Typography>
            <List sx={{p:0}}>
            {myLOI.map((l:LineOfInquiry) =>
                <ListItem sx={{p:"4px 16px"}} key={l.id}>
                    <Card variant="elevation" sx={{display:'flex', alignItems:'center', textDecoration: 'none', width:"100%", backgroundColor: "rgba(126,126,126,0.05)", ':hover': {backgroundColor:'#ddd'}}}
                        component={Link} to={PATH_LOIS + '/' + l.id} key={l.id}>
                        <SettingsIcon sx={{mx: "5px", color:'darkgreen'}}/> {l.name}
                    </Card>
                </ListItem>)}
            </List>
         </Fragment>
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
                    {sortedQuestions
                            .map((q:Question) => <Card variant="outlined" sx={{mb: "5px", p: '5px 10px'}} key={q.id}>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <QuestionMarkIcon sx={{color:'burlywood'}}/>
                                <Box sx={{p: '0 5px', fontWeight: 500}}>
                                    {renderQuestion(q)}
                                </Box>
                            </Box>
                            <Box>
                                <Tooltip arrow title="Create a new Hypothesis based on this template" placement="top">
                                    <Button component={Link} to={(kind === 'hypothesis' ? PATH_HYPOTHESIS_NEW : PATH_LOI_NEW)+"?q="+q.id} disabled={!authenticated}>
                                        <AddIcon sx={{mr:'5px'}}/> New
                                    </Button>
                                </Tooltip>
                            </Box>

                        </Box>
                        {expanded && (kind === 'hypothesis' ? renderQuestionHypotheses(q) : renderQuestionLOIs(q))}
                    </Card>)}
                </Box>
            )
        }
    </Box>);
}