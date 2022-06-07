import { Box, Card, Divider, FormHelperText, Grid, IconButton, Skeleton, Typography } from "@mui/material";
import { idPattern, VariableBinding, Workflow } from "DISK/interfaces";
import { useEffect } from "react";
import { Link, useLocation } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { styled } from '@mui/material/styles';
import { PATH_LOIS } from "constants/routes";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { loadTLOI } from "redux/loader";

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

export const TLOIView = () => {
    const location = useLocation();
    const dispatch = useAppDispatch();

    const TLOI = useAppSelector((state:RootState) => state.tlois.selectedTLOI);
    const selectedId = useAppSelector((state:RootState) => state.tlois.selectedId);
    const loading = useAppSelector((state:RootState) => state.tlois.loadingSelected);
    const error = useAppSelector((state:RootState) => state.tlois.errorSelected);

    useEffect(() => {
        let id : string = location.pathname.replace(idPattern, '');
        if (!!id && !loading && !error && selectedId !== id) {
            loadTLOI(dispatch, id);
        }
    }, [location, dispatch, error, loading, selectedId]);

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)", overflowY:"auto"}}>
        {loading ? 
            <Skeleton sx={{height:"40px", margin: "8px 12px", minWidth: "250px"}}/>
        :
            <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor: "whitesmoke"}}>
                <Typography variant="h5">
                    {error ? "Error loading LOI" : TLOI?.name}
                </Typography>
                <IconButton component={Link} to={PATH_LOIS + "/" + TLOI?.id + "/edit"}>
                    <EditIcon />
                </IconButton>
            </Box>
        }
        <Divider/>
        <Box sx={{padding:"10px"}}>
            <Box>
                <TypographyLabel>Description: </TypographyLabel>
                <TypographyInline>
                    {!loading && !!TLOI ? TLOI.description : <Skeleton sx={{display:"inline-block", width: "200px"}} />}
                </TypographyInline>
            </Box>
            {!!TLOI && TLOI.notes ? <Box>
                <TypographyLabel>Notes: </TypographyLabel>
                <TypographyInline>{TLOI.notes}</TypographyInline>
            </Box> : ""}

        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Data query:</TypographySubtitle>
            <Box sx={{fontSize: "0.94rem"}} >
                <CodeMirror value={!!TLOI? TLOI.dataQuery : ""}
                    extensions={[StreamLanguage.define(sparql)]}
                    onChange={(value, viewUpdate) => {
                        console.log('value:', value);
                    }}
                />
            </Box>
            <Box>
                <FormHelperText sx={{fontSize: ".9rem"}}>
                    When this LOI is executed, a table will be generated with the values defined here:
                </FormHelperText>
                <Box>
                    <TypographyLabel>Description for the metadata table: </TypographyLabel>
                    <TypographyInline>
                        {!loading && !!TLOI ? TLOI.explanation : <Skeleton sx={{display:"inline-block", width: "200px"}} />}
                    </TypographyInline>
                </Box>
                <Box>
                    <TypographyLabel>Variables to show on table: </TypographyLabel>
                    <TypographyInline>
                        {!loading && !!TLOI ? TLOI.relevantVariables : <Skeleton sx={{display:"inline-block", width: "200px"}} />}
                    </TypographyInline>
                </Box>
            </Box>
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle sx={{display: "inline-block"}}>Method configuration:</TypographySubtitle>
            <Box>
                {loading ? <Skeleton/> : (TLOI && TLOI.workflows && TLOI.workflows.length > 0 ? 
                    <Box>
                        <FormHelperText sx={{fontSize: ".9rem"}}>
                            Workflows to run: 
                        </FormHelperText>
                        { TLOI.workflows.map((wf:Workflow, i) => <Card key={`wf_${wf.workflow}-${i}`} variant="outlined" sx={{mb:"5px"}}>
                            <Box sx={{display: "flex", justifyContent: "space-between"}}>
                                <a target="_blank" rel="noreferrer" href={wf.workflowLink} style={{display: "inline-flex", alignItems: "center", textDecoration: "none", color: "black"}}>
                                    <DisplaySettingsIcon sx={{ marginLeft: "10px" , color: "darkgreen"}} />
                                    <Typography sx={{padding:"0 10px", fontWeight: 500}}>{wf.workflow}</Typography>
                                    <OpenInNewIcon sx={{fontSize: "1rem"}}/>
                                </a>
                            </Box>
                            <Divider/>
                            <Box sx={{fontSize:".85rem"}}>
                                { wf.bindings.map((binding:VariableBinding) =>
                                    <Grid key={`var_${binding.variable}`} container spacing={1}>
                                        <Grid item xs={3} md={2} sx={{textAlign: "right"}}>
                                            <b>{binding.variable}: </b>
                                        </Grid>
                                        <Grid item xs={9} md={10}>
                                            {binding.binding}
                                        </Grid>
                                    </Grid>
                                )}
                            </Box>
                        </Card>)}
                    </Box>
                : 
                    <Card variant="outlined" sx={{display: "flex", alignItems: "center", justifyContent: "center", padding: "10px"}}>
                        <Typography>
                            No workflows to run
                        </Typography>
                    </Card>
                )}

            </Box>
        </Box>
        
    </Card>
}