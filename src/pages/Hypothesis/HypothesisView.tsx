import { Box, Button, Card, Divider, IconButton, Skeleton, Tooltip, Typography } from "@mui/material";
import { TriggeredLineOfInquiry } from "DISK/interfaces";
import { useEffect, useState } from "react";
import { Link, useParams } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { styled } from '@mui/material/styles';
import { PATH_HYPOTHESES } from "constants/routes";
import { useAppDispatch, useAuthenticated } from "redux/hooks";
import { QuestionPreview } from "components/questions/QuestionPreview";
import CachedIcon from '@mui/icons-material/Cached';
import { closeBackdrop, openBackdrop } from "redux/slices/backdrop";
import { openNotification } from "redux/slices/notifications";
import { useGetHypothesisByIdQuery } from "redux/apis/hypotheses";
import { useExecuteHypothesisByIdMutation, useGetTLOIsQuery } from "redux/apis/tlois";
import { TLOIList } from "components/tlois/TLOIList";

const TypographyLabel = styled(Typography)(({ theme }) => ({
    color: 'gray',
    display: "inline",
    fontWeight: "bold",
    fontSize: ".9em"
}));

const TypographyInline = styled(Typography)(({ theme }) => ({
    display: "inline",
}));

const InfoInline = styled(Typography)(({ theme }) => ({
    display: "inline",
    color: "darkgray"
}));

const TypographySubtitle = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: "1.2em"
}));

type TLOIMap = {[id:string]: {
    value: TriggeredLineOfInquiry[],
    name: string,
}};

export const HypothesisView = () => {
    const dispatch = useAppDispatch();
    const {hypothesisId} = useParams();
    const selectedId = hypothesisId as string; // Could be undefined?
    const authenticated = useAuthenticated();
    const { data:hypothesis, isError:error, isLoading:loading} = useGetHypothesisByIdQuery(selectedId);
    const { data:TLOIs, isLoading:TLOIloading} = useGetTLOIsQuery();
    const [execHypothesis, {}] = useExecuteHypothesisByIdMutation();

    const [myTLOIs, setMyTLOIs] = useState<TLOIMap>({});

    useEffect(() => {
        let map : TLOIMap = {};
        (TLOIs||[]).filter((tloi) => tloi.parentHypothesisId === selectedId).forEach((tloi:TriggeredLineOfInquiry) => {
            if (!map[tloi.parentLoiId]) {
                map[tloi.parentLoiId] = {
                    value: [],
                    name: tloi.name.replace("Triggered: ",""),
                }
            }
            let cur = map[tloi.parentLoiId].value;
            cur.push(tloi);
        });
        setMyTLOIs(map);
    }, [TLOIs, selectedId]);

    const onTestHypothesisClicked = () => {
        dispatch(openBackdrop());
        dispatch(openNotification({
            severity: 'info',
            text: "Looking for new executions..."
        }));
        execHypothesis(selectedId)
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

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)", overflowY: "auto"}}>
        {loading ? 
            <Skeleton sx={{height:"40px", margin: "8px 12px", minWidth: "250px"}}/>
        :
            <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor: "whitesmoke"}}>
                <Typography variant="h5">
                    {error ? "Error loading hypothesis" : hypothesis?.name}
                </Typography>
                {authenticated ? 
                <Tooltip arrow title="Edit">
                    <IconButton component={Link} to={PATH_HYPOTHESES + "/" + hypothesis?.id + "/edit"}>
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
                <QuestionPreview selected={hypothesis.questionId as string} bindings={hypothesis.questionBindings}/>
                : <Skeleton/>}
        </Box>

        <Box sx={{padding:"10px"}}>
            <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', mb: "10px"}}>
                <TypographySubtitle>
                    Lines of inquiry triggered to test this hypothesis and answer the question:
                </TypographySubtitle>
                <Button variant="outlined" onClick={onTestHypothesisClicked}>
                    <CachedIcon sx={{mr:"5px"}}/> Update
                </Button>
            </Box>
            {TLOIloading ? 
                <Skeleton/>
                : (Object.keys(myTLOIs).length === 0 ? <Card variant="outlined" sx={{display:'flex', justifyContent:'center'}}>
                    No executions
                </Card>
                :   Object.keys(myTLOIs).map((loiId:string) => 
                <Card variant="outlined" key={loiId} sx={{marginBottom: "5px", padding: "2px 10px"}}>
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent:"space-between"}}>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <SettingsIcon sx={{color: "darkgray", mr: "5px"}}/>
                            <PlayArrowIcon sx={{color: "green", ml: "-23px", mb: "-10px"}}/>
                            <span style={{marginRight: ".5em"}}> Triggered line of inquiry: </span> 
                            <b> {myTLOIs[loiId].name}</b>
                        </Box>
                        <Box>{myTLOIs[loiId].value.length} runs</Box>
                    </Box>
                    <Divider/>
                    <TypographyLabel>Overview of results:</TypographyLabel>
                    <TLOIList hypothesis={hypothesis} loiId={loiId}/>
                </Card>))
            }
        </Box>
    </Card>
}
