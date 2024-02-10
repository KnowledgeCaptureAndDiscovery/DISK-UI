import { Box, Button, Card, CircularProgress, Divider, Link as MuiLink, List, ListItem, Tooltip, Typography } from "@mui/material";
import { AnyQuestionVariable, Goal, idPattern, LineOfInquiry, Question, VariableBinding, varPattern } from "DISK/interfaces";
import { Fragment, useEffect, useState } from "react";
import { useAuthenticated } from "redux/hooks";
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import AddIcon from '@mui/icons-material/Add';
import { Link } from "react-router-dom";
import { PATH_GOALS, PATH_GOAL_NEW, PATH_LOIS, PATH_LOI_NEW } from "constants/routes";

import ScienceIcon from '@mui/icons-material/Science';
import SettingsIcon from '@mui/icons-material/Settings';
import { useGetGoalsQuery } from "redux/apis/goals";
import { useGetQuestionsQuery } from "redux/apis/questions";
import { useGetLOIsQuery } from "redux/apis/lois";
import { TextPart } from "./QuestionHelpers";

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
    if (!text) return "";
    if (text === "SA") return "Surface Area";
    if (text === "TH") return "Thickness";
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
    const { data: questions, isLoading, isError, refetch } = useGetQuestionsQuery();
    const authenticated = useAuthenticated();
    const { data: hypotheses } = useGetGoalsQuery();
    const { data: lois } = useGetLOIsQuery();

    const [count, setCount] = useState<{[id:string] : number}>({});
    const [sortedQuestions, setSortedQuestions] = useState<Question[]>([]);

    const countQuestions = (items: Goal[] | LineOfInquiry[] | undefined) => {
        if (!items) return;
        let newCount : {[id:string] : number} = {};
        items.forEach((item:Goal|LineOfInquiry) => {
            if (item.question.id) {
                if (!newCount[item.question.id])
                    newCount[item.question.id] = 0;
                newCount[item.question.id] += 1;
            }
        });
        setCount(newCount);
    }

    useEffect(() => {
        if (hypotheses) countQuestions(hypotheses);
    }, [hypotheses])

    useEffect(() => {
        countQuestions(lois);
    }, [lois])

    useEffect(() => {
        let q : Question[] = questions ? [ ...questions ] : [];
        setSortedQuestions(q.sort((q1, q2) => {
            let a: number = count[q1.id] ? count[q1.id] : 0;
            let b: number = count[q2.id] ? count[q2.id] : 0;
            return a < b ? 1 : -1;
        }));
    }, [questions, count])

    const renderQuestion = (q:Question) => {
        let variableStep : number = q.name.charAt(0) === '?' ? 1 : 0;
        let name = q.name.endsWith('?') ? q.name.substring(0, q.name.length-1) : q.name;
        let parts : string[] = name.split(varPattern);

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
         let myHyp : Goal[] = hypotheses ? hypotheses.filter((h:Goal) => h.question.id === q.id) : [];
         if (myHyp.length === 0)
            return null
         return <Fragment>
            <Divider/>
            <Typography>Hypotheses based on this question:</Typography>
            <List sx={{p:0}}>
            {myHyp.map((h:Goal) => 
                <ListItem sx={{p:"4px 16px"}} key={h.id}>
                    <Card variant="elevation" sx={{display:'flex', alignItems:'center', textDecoration: 'none', width:"100%", backgroundColor: "rgba(126,126,126,0.05)", ':hover': {backgroundColor:'#ddd'}}}
                        component={Link} to={PATH_GOALS + '/' + h.id} key={h.id}>
                        {renderHypothesisQuestionText(q, h)}
                    </Card>
                </ListItem>)}
            </List>
         </Fragment>
    }

    const renderHypothesisQuestionText = (q:Question, h:Goal) => {
        let parts = q.template.split(/(\?[A-Za-z0-9_]*)/);
        let values : {[name:string]:string} = {};
        let tmp : {[url:string]:string} = {};
        q.variables.forEach((variable:AnyQuestionVariable) => {
            tmp[variable.id] = variable.variableName;
        });
        (h.questionBindings||[]).forEach((binding:VariableBinding) => {
            if (tmp[binding.variable]) {
                values[tmp[binding.variable]] = binding.binding[0];
            }
        });
        q.variables.forEach((variable:AnyQuestionVariable) => {
            if (variable ) {
                if (variable.representation != null) {
                    let explanationParts: string[] = variable.representation.split(/(\?[a-zA-Z0-9]*)/g);
                    let val: string = explanationParts.map((p: string) => p.startsWith('?') && values[p] ? Number(values[p]).toFixed(2) : p).join('');
                    values[variable.variableName] = val;
                }
            }
        });
        return <Fragment>
            <ScienceIcon sx={{mx: "5px", color:'darkorange'}}/>
            {parts.map((part:string,i:number) => part.startsWith('?') ? 
                <b key={`pv_${i}`} style={{color:'green', margin: '4px'}}>
                    {normalizeTextValue(values[part])}
                </b>
            :
                <TextPart key={`p_${i}`}>
                    {part}
                </TextPart>
            )}
        </Fragment>
    }

    const renderQuestionLOIs = (q:Question) => {
         let myLOI : LineOfInquiry[] = (lois||[]).filter((l:LineOfInquiry) => l.question.id === q.id);
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
        {isLoading ? 
            <CircularProgress/>
        :  (isError ? 
                <Box>
                    <span style={{marginRight:'5px'}}>
                        An error has ocurred while loading.
                    </span>
                    <MuiLink onClick={() => refetch()} sx={{cursor: 'pointer'}}>
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
                                    <Button component={Link} to={(kind === 'hypothesis' ? PATH_GOAL_NEW : PATH_LOI_NEW)+"?q="+q.id} disabled={!authenticated}>
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