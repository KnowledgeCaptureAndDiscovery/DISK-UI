import { Box, Button, Card, Divider, FormHelperText, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Skeleton, TextField, Tooltip, Typography } from "@mui/material";
import { DataEndpoint, idPattern, Workflow } from "DISK/interfaces";
import { Fragment, useEffect } from "react";
import { Link, useLocation } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import { styled } from '@mui/material/styles';
import { PATH_LOIS } from "constants/routes";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { loadTLOI } from "redux/loader";
import React from "react";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsIcon from '@mui/icons-material/Settings';
import { ResultTable } from "components/ResultTable";
import { WorkflowList } from "components/WorkflowList";
import { loadHypothesis } from "redux/loader";
import { QuestionPreview } from "components/QuestionPreview";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { loadDataEndpoints } from "redux/loader";
import { downloadFile, renderDescription } from "DISK/util";

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

export const TLOIView = ({edit} : TLOIViewProps) => {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const [formalView, setFormalView] = React.useState<boolean>(false);
    const [editMode, setEditMode] = React.useState<boolean>(false);
    const [notes, setNotes] = React.useState<string>("");

    const TLOI = useAppSelector((state:RootState) => state.tlois.selectedTLOI);
    const selectedId = useAppSelector((state:RootState) => state.tlois.selectedId);
    const loading = useAppSelector((state:RootState) => state.tlois.loadingSelected);
    const error = useAppSelector((state:RootState) => state.tlois.errorSelected);

    const selectedHypothesis = useAppSelector((state:RootState) => state.hypotheses.selectedHypothesis);
    const selectedHypId = useAppSelector((state:RootState) => state.hypotheses.selectedId);
    const loadingHyp = useAppSelector((state:RootState) => state.hypotheses.loadingSelected);
    const errorHyp = useAppSelector((state:RootState) => state.hypotheses.errorSelected);

    const [dataSource, setDataSource] = React.useState<DataEndpoint|null>(null);
    const endpoints : DataEndpoint[] = useAppSelector((state:RootState) => state.server.endpoints);
    const initializedEndpoint : boolean = useAppSelector((state:RootState) => state.server.initializedEndpoints);
    const loadingEndpoints = useAppSelector((state:RootState) => state.server.loadingEndpoints);

    useEffect(() => {
        if (!initializedEndpoint) {
            loadDataEndpoints(dispatch);
        }
    }, []);

    useEffect(() => {
        if (!!TLOI && TLOI.parentHypothesisId && TLOI.parentHypothesisId != selectedHypId && !loadingHyp && !errorHyp) {
            loadHypothesis(dispatch, TLOI.parentHypothesisId);
        }
        if (!!TLOI && TLOI.notes) {
            setNotes(TLOI.notes);
        }
    }, [TLOI]);

    useEffect(() => {
        if (!!TLOI && TLOI.dataSource && endpoints.length > 0) {
            for (let i = 0; i < endpoints.length; i++) {
                let endpoint : DataEndpoint = endpoints[i];
                if (endpoint.url === TLOI.dataSource) {
                    setDataSource(endpoint);
                    break;
                }
            }
        }
    }, [TLOI, endpoints]);

    useEffect(() => {
        let id : string = location.pathname.replace(idPattern, '');
        if (!!id && !loading && !error && selectedId !== id) {
            loadTLOI(dispatch, id);
        }
    }, [location, dispatch, error, loading, selectedId]);

    const displayFilename = (text:string) => {
        return text.replace(/.*#/,'').replace(/-\w{24,25}/,'');
    }

    const updateNotes = () => {
        //Fix server 
        if (TLOI) {
            TLOI.notes = notes;
            setEditMode(false);
        }
        return;
    }

    const onDownloadFile = (url:string) => {
        if (url && TLOI) {
            let methodSource : string = "";
            [ ...(TLOI.workflows||[]), ...(TLOI.metaWorkflows||[]) ].forEach((w:Workflow) => {
                methodSource = w.source;
            })
            console.log("Downloading " + url);
            downloadFile(methodSource, url, displayFilename(url));
        }
    }

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)", overflowY:"auto"}}>
        {loading ? 
            <Skeleton sx={{height:"40px", margin: "8px 12px", minWidth: "250px"}}/>
        :
            <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor: "whitesmoke"}}>
                <Typography variant="h5">
                    {error ? "Error loading TLOI" : TLOI?.name}
                </Typography>

                <Tooltip arrow title={editMode ? "Cancel" : "Edit"}>
                    <IconButton onClick={() => setEditMode(!editMode)}>
                        {editMode ? <CancelIcon /> : <EditIcon /> }
                    </IconButton>
                </Tooltip>
            </Box>
        }
        <Divider/>
        <Box sx={{padding:"10px"}}>
            {
            //<Box>
            //    <TypographyLabel>Description: </TypographyLabel>
            //    <TypographyInline>
            //        {!loading && !!TLOI ? TLOI.description : <Skeleton sx={{display:"inline-block", width: "200px"}} />}
            //    </TypographyInline>
            //</Box>
            }
            {!loadingHyp && !!selectedHypothesis ? 
                <QuestionPreview selected={selectedHypothesis.question as string} bindings={selectedHypothesis.questionBindings} label="Hypothesis tested"/>
                : <Skeleton/>}
            <Card variant="outlined" sx={{mt: "8px", p: "0px 10px 0px;", position:"relative", overflow:"visible", mb: "5px"}}>
                <FormHelperText sx={{position: 'absolute', background: 'white', padding: '0 4px', margin: '-9px 0 0 0'}}> Line of inquiry: </FormHelperText>
                <Box component={Link} to={PATH_LOIS + "/" + (!!TLOI ? TLOI.loiId : "")} sx={{textDecoration: "none", display:"inline-flex", alignItems:"center", padding: "0 5px", ml: "10px", mt: "12px"}}>
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
                        <InfoInline>None specified. Click the edit button to add notes.</InfoInline>
                    }
                </Box>
            }

        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Data needed to execute this line of inquiry:</TypographySubtitle>
            <Box sx={{display: "inline-flex", alignItems: "baseline"}}>
                <TypographyLabel sx={{whiteSpace: 'nowrap'}}>Data source: </TypographyLabel>
                {loadingEndpoints ? 
                    <Skeleton sx={{display:"inline-block", width: "400px"}}/> :
                    (dataSource ?
                        <Fragment>
                            <TypographyInline sx={{ml:"5px", whiteSpace: 'nowrap'}}> {dataSource.name} </TypographyInline>
                            <Box sx={{display:"inline-block", ml:"5px", fontSize:".85em"}}>
                                {renderDescription(dataSource.description)}
                            </Box>
                        </Fragment>
                    :
                        null
                    )
                }
            </Box>

            <Box sx={{display:"flex", justifyContent:"space-between", alignItems: "center"}}>
                <Box>
                    <TypographyLabel>Data query explanation:</TypographyLabel>
                    {loading ? 
                        <Skeleton sx={{display:"inline-block", width: "400px"}}/> :
                        (!!TLOI && TLOI.dataQueryExplanation ? 
                            <TypographyInline> {TLOI.dataQueryExplanation} </TypographyInline> :
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
            {formalView ? 
            <Box sx={{fontSize: "0.94rem"}} >
                <CodeMirror value={!!TLOI? TLOI.dataQuery : ""}
                    extensions={[StreamLanguage.define(sparql)]}
                    onChange={(value, viewUpdate) => {
                        console.log('value:', value);
                    }}
                />
            </Box> : null}
            <Box> 
                <Divider/>
                {loading ? 
                    <Skeleton/> :
                    <Box>
                        {!!TLOI && TLOI.tableDescription ? 
                        <Box sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <TypographyLabel sx={{mr:"5px"}}>Table: </TypographyLabel>
                            <TypographyInline> {TLOI.tableDescription} </TypographyInline>
                        </Box> : null}
                        {!!TLOI && dataSource && TLOI.tableVariables && TLOI.dataQuery ? 
                            <ResultTable query={TLOI.dataQuery} variables={TLOI.tableVariables} dataSource={dataSource}/> 
                            : null}
                    </Box>
                }
            </Box>
        </Box>
        <Divider/>
        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle sx={{display: "inline-block"}}>Method configuration:</TypographySubtitle>
            {!!TLOI && <WorkflowList editable={false} workflows={TLOI.workflows} metaworkflows={TLOI.metaWorkflows} options={[]}/>}
        </Box>

        <Divider/>
        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle sx={{display: "inline-block"}}>Generated outputs:</TypographySubtitle>
            {TLOI == null || TLOI.outputFiles.length == 0 ? 
                <TypographyInline> No outputs were generated </TypographyInline>
             :  <List>
                {TLOI.outputFiles.map((url:string) => 
                <ListItem disablePadding key={url}>
                    <ListItemButton onClick={() => onDownloadFile(url)}>
                        <ListItemIcon>
                            <InsertDriveFileIcon />
                        </ListItemIcon>
                        <ListItemText primary={displayFilename(url)} />
                    </ListItemButton>
                </ListItem>
                )}
             </List> }
        </Box>
    </Card>
}