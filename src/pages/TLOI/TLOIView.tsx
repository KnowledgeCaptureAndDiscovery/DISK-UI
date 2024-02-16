import { Box, Button, Card, Divider, FormHelperText, IconButton, Skeleton, TextField, Tooltip, Typography } from "@mui/material";
import { DataEndpoint, TriggeredLineOfInquiry } from "DISK/interfaces";
import { Fragment, useEffect } from "react";
import { Link, useParams } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import { styled } from '@mui/material/styles';
import { PATH_LOIS } from "constants/routes";
import { useAppDispatch, useAuthenticated } from "redux/hooks";
import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import React from "react";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsIcon from '@mui/icons-material/Settings';
import { ResultTable } from "components/ResultTable";
import { WorkflowSeedList } from "components/methods/WorkflowList";
import { QuestionPreview } from "components/questions/QuestionPreview";
import { getId, renderDescription } from "DISK/util";
import { useGetGoalByIdQuery } from "redux/apis/goals";
import { useGetEndpointsQuery } from "redux/apis/server";
import { useGetTLOIByIdQuery, usePutTLOIMutation } from "redux/apis/tlois";
import { closeBackdrop, openBackdrop } from "redux/slices/backdrop";
import { openNotification } from "redux/slices/notifications";
import { SHINY_FILENAME, BRAIN_FILENAME } from "constants/general";

const TypographyLabel = styled(Typography)(({ theme }) => ({
    color: 'gray',
    display: "inline",
    fontWeight: "bold",
    fontSize: ".9em"
}));

const InfoInline = styled(Typography)(({ theme }) => ({
    display: "inline",
    color: "darkgray"
}));

const TypographyInline = styled(Typography)(({ theme }) => ({
    display: "inline",
}));

const TypographySubtitle = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: "1.2em"
}));

interface TLOIViewProps {
    edit?: boolean
}

const TypographySection = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: "1.05em"
}));

export const TLOIView = ({edit} : TLOIViewProps) => {
    const dispatch = useAppDispatch();
    const {tloiId} = useParams();
    const selectedId = tloiId as string; // Could be undefined?
    const authenticated = useAuthenticated();

    const [formalView, setFormalView] = React.useState<boolean>(false);
    const [editMode, setEditMode] = React.useState<boolean>(false);
    const [notes, setNotes] = React.useState<string>("");

    const { data:TLOI, isError:error, isLoading:loading} = useGetTLOIByIdQuery(selectedId);
    const { data:selectedHypothesis, isLoading:loadingHyp } = useGetGoalByIdQuery(TLOI? TLOI.parentGoal.id : "invalid", {skip: (!TLOI || !TLOI.parentGoal.id) });
    const { data:endpoints, isLoading:loadingEndpoints } = useGetEndpointsQuery();
    const [ putTLOI, { isLoading: isUpdating }] = usePutTLOIMutation();
    const [dataSource, setDataSource] = React.useState<DataEndpoint|null>(null);

    // Viz TODO: all of this needs to be reworked 
    const [shinyData, setShinyData] = React.useState<{url:string,source:string}>({url:'',source:''});
    const [brainData, setBrainData] = React.useState<{url:string,source:string}>({url:'',source:''});
    const [nViz, setNViz] = React.useState<number>(0);

    useEffect(() => {
        if (TLOI) {
            let n = 0;
            // I saw this code in other place
            [ ...TLOI.workflows, ...TLOI.metaWorkflows ].forEach((wf) => {
                //Object.values(wf.runs||{}).forEach((run) => {
                //    if (run.outputs) {
                //        Object.keys(run.outputs).forEach(((name:string) => {
                //            if (name === SHINY_FILENAME) {
                //                setShinyData({
                //                    source: wf.source,
                //                    url: run ? (run.outputs[name].id || "") : ""
                //                });
                //                n += 1;
                //            } else if (name === BRAIN_FILENAME) {
                //                setBrainData({
                //                    source: wf.source,
                //                    url: run ? (run.outputs[name].id || "") : ""
                //                });
                //                n += 1;
                //            }
                //        }));
                //    }
                //})
            });
            setNViz(n);
        }

    }, [TLOI])



    useEffect(() => {
        //if (!!TLOI && TLOI.dataSource && !!endpoints && endpoints.length > 0) {
        //    for (let i = 0; i < endpoints.length; i++) {
        //        let endpoint : DataEndpoint = endpoints[i];
        //        if (endpoint.url === TLOI.dataSource) {
        //            setDataSource(endpoint);
        //            break;
        //        }
        //    }
        //}
    }, [TLOI, endpoints]);

    useEffect(() => {
        if (!!TLOI && TLOI.notes) {
            setNotes(TLOI.notes);
        }
    }, [TLOI]);

    const updateNotes = () => {
        if (TLOI) {
            let editedTLOI : TriggeredLineOfInquiry = { ...TLOI, notes: notes };
            dispatch(openBackdrop())
            putTLOI({data:editedTLOI})
                    .then((data : {data:TriggeredLineOfInquiry} | {error: any}) => {
                        let savedTLOI = (data as {data:TriggeredLineOfInquiry}).data;
                        if (savedTLOI) {
                            //FIXME: UI does not update.
                            setNotes(savedTLOI.notes);
                            dispatch(openNotification({severity:'success', text:'Notes were updated successfully'}));
                        }
                    })
                    .catch((e) =>{
                        dispatch(openNotification({severity:'error', text:'Error trying to update notes. TLOI was not edited'}));
                        console.warn(e);
                    })
                    .finally(() => {
                        dispatch(closeBackdrop())
                        setEditMode(false);
                    })
        }
        return;
    }


    return <Card variant="outlined">
        {loading ? 
            <Skeleton sx={{height:"40px", margin: "8px 12px", minWidth: "250px"}}/>
        :
            <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor: "whitesmoke"}}>
                <Typography variant="h5">
                    {error ? "Error loading TLOI" : TLOI?.name}
                </Typography>
                { authenticated ? 
                <Tooltip arrow title={editMode ? "Cancel" : "Edit"}>
                    <IconButton onClick={() => setEditMode(!editMode)}>
                        {editMode ? <CancelIcon /> : <EditIcon /> }
                    </IconButton>
                </Tooltip>
                : null }
            </Box>
        }
        <Divider/>
        <Box sx={{padding:"10px"}}>
            {!loadingHyp && !!selectedHypothesis ? 
                <QuestionPreview selected={selectedHypothesis.question.id as string} bindings={selectedHypothesis.questionBindings} label="Hypothesis or question tested"/>
                : <Skeleton/>}
            <Card variant="outlined" sx={{mt: "8px", p: "0px 10px 0px;", position:"relative", overflow:"visible", mb: "5px"}}>
                <FormHelperText sx={{position: 'absolute', background: 'white', padding: '0 4px', margin: '-9px 0 0 0'}}> Line of inquiry: </FormHelperText>
                <Box component={Link} to={PATH_LOIS + "/" + (!!TLOI ? getId(TLOI.parentLoi) : "")} sx={{textDecoration: "none", display:"inline-flex", alignItems:"center", padding: "0 5px", ml: "10px", mt: "12px"}}>
                    <SettingsIcon sx={{color: "green", mr:"5px"}}/>
                    <span style={{color:"black"}}>
                        {!!TLOI ? TLOI.name.replace("Triggered: ", "") : null}
                    </span>
                </Box>
            </Card>
            {editMode ?
                <Box>
                    <TextField multiline fullWidth size="small" id="TLOINotes" label="Notes"
                        value={notes} onChange={(e) => setNotes(e.target.value)}/>
                    <Box sx={{display:"flex", justifyContent:"flex-end", mt:"4px"}}>
                        <Button variant="outlined" color="success" onClick={updateNotes}>
                            Save
                        </Button>
                        <Button variant="outlined" color="error" sx={{ml: "5px"}} onClick={() => setEditMode(false)}>
                            Cancel
                        </Button>
                    </Box>
                </Box>    
            :
                <Box>
                    <TypographyLabel>Notes: </TypographyLabel>
                    {TLOI && TLOI.notes ?
                        <TypographyInline>{TLOI.notes}</TypographyInline>
                    :
                        <InfoInline>None specified. 
                            { authenticated ? 
                                <> Click the edit button to add notes. </> :
                                <> Please login to add notes </>
                            }
                        </InfoInline>
                    }
                </Box>
            }
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Data:</TypographySubtitle>
            <Box sx={{display: "inline-flex", alignItems: "baseline"}}>
                <TypographyLabel sx={{whiteSpace: 'nowrap'}}>Data source: </TypographyLabel>
                {loadingEndpoints ? 
                    <Skeleton sx={{display:"inline-block", width: "400px"}}/> :
                    (dataSource && (<Fragment>
                        <TypographyInline sx={{ml:"5px", whiteSpace: 'nowrap'}}> {dataSource.name} </TypographyInline>
                        <Box sx={{display:"inline-block", ml:"5px", fontSize:".85em"}}>
                            {renderDescription(dataSource.description)}
                        </Box>
                    </Fragment>))
                }
            </Box>
            <Box sx={{display:"flex", justifyContent:"space-between", alignItems: "center"}}>
                <Box>
                    <TypographyLabel>Data query explanation:</TypographyLabel>
                    {loading ? 
                        <Skeleton sx={{display:"inline-block", width: "400px"}}/> :
                        (!!TLOI && false ? 
                            <TypographyInline> {TLOI?.description} </TypographyInline> :
                            <InfoInline> None specified </InfoInline>
                        )
                    }
                </Box>
                <Tooltip arrow title={(formalView? "Hide" : "Show") + " data query"}>
                    <IconButton onClick={() => setFormalView(!formalView)}>
                        {formalView? <VisibilityIcon/> : <VisibilityOffIcon/>}
                    </IconButton>
                </Tooltip>
            </Box>

            {formalView && <Fragment>
                <TypographySection>Data query:</TypographySection>
                <Box sx={{fontSize: "0.94rem"}} >
                    <CodeMirror readOnly value={''}
                        extensions={[StreamLanguage.define(sparql)]}
                        onChange={(value, viewUpdate) => {
                        }}
                    />
                </Box>
            </Fragment>}

            <Box> 
                <Divider/>
                {//loading ? 
                 //   <Skeleton/> :
                 //   <Box>
                 //       {!!TLOI && (TLOI.tableDescription || (TLOI.dataQuery && TLOI.tableVariables && dataSource)) &&
                 //           <TypographySection>Input data retrieved:</TypographySection>}
                 //       {!!TLOI && TLOI.tableDescription && 
                 //       <Box sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                 //           <TypographyLabel sx={{mr:"5px"}}>Table: </TypographyLabel>
                 //           <TypographyInline> {TLOI.tableDescription} </TypographyInline>
                 //       </Box>}
                 //       {!!TLOI && dataSource && TLOI.tableVariables && TLOI.dataQuery &&
                 //           <ResultTable query={TLOI.dataQuery} variables={[]} dataSource={dataSource}/> }
                 //   </Box>
                }
            </Box>
        </Box>
        <Divider/>
        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle sx={{display: "inline-block"}}>Methods:</TypographySubtitle>
            {!!TLOI && <WorkflowSeedList editable={false} workflows={[]} metaworkflows={[]} options={[]}/>}
        </Box>
    </Card>
}