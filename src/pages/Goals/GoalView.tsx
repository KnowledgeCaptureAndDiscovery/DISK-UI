import { Box, Button, Card, Divider, IconButton, Skeleton, Tooltip, Typography } from "@mui/material";
import { TriggeredLineOfInquiry } from "DISK/interfaces";
import { useEffect, useState } from "react";
import { Link, useParams } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit';
import { PATH_GOALS, UI_PARAMS } from "constants/routes";
import { useAppDispatch, useAuthenticated } from "redux/hooks";
import { QuestionPreview } from "components/questions/QuestionPreview";
import CachedIcon from '@mui/icons-material/Cached';
import { closeBackdrop, openBackdrop } from "redux/slices/backdrop";
import { openNotification } from "redux/slices/notifications";
import { useGetGoalByIdQuery } from "redux/apis/goals";
import { useExecuteHypothesisByIdMutation, useGetTLOIsQuery } from "redux/apis/tlois";
import { TypographyLabel, TypographyInline, InfoInline, TypographySubtitle } from "components/Styles";
import { getId } from "DISK/util";
import { TLOIBundle } from "components/tlois/TLOIBundle";


export const HypothesisView = () => {
    const dispatch = useAppDispatch();
    const authenticated = useAuthenticated();
    const {goalId} = useParams<UI_PARAMS>();
    const { data:hypothesis, isError:error, isLoading:loading } = useGetGoalByIdQuery(goalId as string, {skip:goalId==undefined});
    const { data:TLOIs, isLoading:TLOIloading } = useGetTLOIsQuery();
    const [execHypothesis, {}] = useExecuteHypothesisByIdMutation();
    const [LOIList, setLOIList] = useState<string[]>([]);

    useEffect(() => {
        let list : string[] = (TLOIs||[])
                .filter((tloi) => getId(tloi.parentGoal) === goalId && tloi.parentLoi != null)
                .map((tloi) => tloi.parentLoi.id);
        setLOIList(Array.from(new Set(list)));
    }, [TLOIs, goalId]);

    const onTestHypothesisClicked = () => {
        if (goalId == undefined) 
            return;
        dispatch(openBackdrop());
        dispatch(openNotification({
            severity: 'info',
            text: "Looking for new executions..."
        }));
        execHypothesis(goalId)
                .then((value: {data:TriggeredLineOfInquiry[]} | {error:any}) => {
                    let curTLOIs = (value as {data:TriggeredLineOfInquiry[]}).data;
                    if (curTLOIs) {
                        curTLOIs = curTLOIs.filter((tloi) => tloi.status !== 'FAILED' && tloi.status !== 'SUCCESSFUL');
                        dispatch(openNotification({
                            severity: 'success',
                            text: curTLOIs && curTLOIs.length > 0 ? (curTLOIs.length + " new executions found") : "No new executions"
                        }));
                    } else if ((value as {error:any}).error) {
                        dispatch(openNotification({
                            severity: 'error',
                            text: "An error has ocurred while searching new executions."
                        }));
                    }
                })
                .catch((e) => {
                    dispatch(openNotification({
                        severity: 'error',
                        text: "An error has ocurred while searching new executions."
                    }));
                    console.warn(e);
                })
                .finally(() => {
                    dispatch(closeBackdrop());
                });
    }

    return <Card variant="outlined">
        {loading ? 
            <Skeleton sx={{height:"40px", margin: "8px 12px", minWidth: "250px"}}/>
        :
            <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor: "whitesmoke"}}>
                <Typography variant="h5">
                    {error ? "Error loading hypothesis" : hypothesis?.name}
                </Typography>
                {authenticated && hypothesis ? 
                <Tooltip arrow title="Edit">
                    <IconButton component={Link} to={PATH_GOALS + "/" + getId(hypothesis) + "/edit"}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
                : null }
            </Box>
        }
        <Divider/>
        <Box sx={{padding:"10px"}}>
            <Box>
                <TypographyLabel>Description: </TypographyLabel>
                    {loading ? (<Skeleton sx={{display:"inline-block", width: "200px"}}/>)
                    : (<TypographyInline>{!!hypothesis && hypothesis.description}</TypographyInline>)}
            </Box>
            <Box>
                <TypographyLabel>Additional notes: </TypographyLabel>
                    {loading ? 
                        <Skeleton sx={{display:"inline-block", width: "200px"}}/> :
                        (!!hypothesis && hypothesis.notes ? 
                            <TypographyInline>{hypothesis.notes}</TypographyInline> : 
                            <InfoInline> None specified </InfoInline>
                        )
                    }
            </Box>
            <TypographySubtitle>
                Hypothesis or question:
            </TypographySubtitle>
            {!loading && !!hypothesis ? 
                <QuestionPreview selected={hypothesis.question.id} bindings={hypothesis.questionBindings}/>
                : <Skeleton/>}
        </Box>

        <Box sx={{padding:"10px"}}>
            <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', mb: "10px"}}>
                <TypographySubtitle>
                    Lines of inquiry triggered to test this hypothesis and answer the question:
                </TypographySubtitle>
                <Button variant="outlined" onClick={onTestHypothesisClicked} disabled={!authenticated}>
                    <CachedIcon sx={{mr:"5px"}}/> Update
                </Button>
            </Box>
            {TLOIloading ? (
                <Skeleton/>
            ) : (
                LOIList.length === 0 ? (
                    <Card variant="outlined" sx={{display:'flex', justifyContent:'center'}}>
                        No executions
                    </Card>
                ) : (
                    hypothesis && (
                        LOIList.map((loiId:string) => <TLOIBundle loiId={loiId} key={loiId} goal={hypothesis} />)
                    )
                )
            )}
        </Box>
    </Card>
}
