import { Box, Card, Divider, FormHelperText, Grid, IconButton, MenuItem, Select, Skeleton, Tooltip, Typography } from "@mui/material";
import { DISKAPI } from "DISK/API";
import { LineOfInquiry, idPattern, VariableBinding, Workflow } from "DISK/interfaces";
import { useEffect } from "react";
import { Link, useLocation } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { styled } from '@mui/material/styles';
import { PATH_LOIS } from "constants/routes";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { setSelectedLOI, setLoadingSelected, setErrorSelected } from 'redux/lois';
import { QuestionLinker } from "components/QuestionLinker";
import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { setEndpoint, setErrorEndpoint, setLoadingEndpoints } from "redux/server";
import React from "react";

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

export const LOIView = () => {
    const location = useLocation();

    const LOI = useAppSelector((state:RootState) => state.lois.selectedLOI);
    const selectedId = useAppSelector((state:RootState) => state.lois.selectedId);
    const loading = useAppSelector((state:RootState) => state.lois.loadingSelected);
    const error = useAppSelector((state:RootState) => state.lois.errorSelected);
    const dispatch = useAppDispatch();

    const endpoints = useAppSelector((state:RootState) => state.server.endpoints);
    const loadingEndpoints = useAppSelector((state:RootState) => state.server.loadingEndpoints);
    const errorEndpoints = useAppSelector((state:RootState) => state.server.errorEndpoints);
    const [selectedDataSource, setSelectedDataSource] = React.useState("");
    const authenticated = useAppSelector((state:RootState) => state.keycloak.authenticated);

    const loadLOI = () => {
        let id : string = location.pathname.replace(idPattern, '');
        if (!!id && !loading && !error && selectedId !== id) {
            dispatch(setLoadingSelected(id));
            DISKAPI.getLOI(id)
                .then((LOI:LineOfInquiry) => {
                    dispatch(setSelectedLOI(LOI));
                        setSelectedDataSource(LOI.dataSource)
                })
                .catch(() => {
                    dispatch(setErrorSelected());
                });
        }
        if (endpoints == null && !loadingEndpoints && !errorEndpoints) {
            dispatch(setLoadingEndpoints());
            DISKAPI.getEndpoints()
                .then((endpointMap:{[name:string]: string}) => {
                    dispatch(setEndpoint(endpointMap))
                })
                .catch(() => dispatch(setErrorEndpoint()));
        }
    }

    useEffect(loadLOI, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)", overflowY:"auto"}}>
        {loading ? 
            <Skeleton sx={{height:"40px", margin: "8px 12px", minWidth: "250px"}}/>
        :
            <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor: "whitesmoke"}}>
                <Typography variant="h5">
                    {error ? "Error loading LOI" : LOI?.name}
                </Typography>
                {authenticated ? 
                <Tooltip arrow title="Edit">
                    <IconButton component={Link} to={PATH_LOIS + "/" + LOI?.id + "/edit"}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
                : null}
            </Box>
        }
        <Divider/>
        <Box sx={{padding:"10px"}}>
            <Box>
                <TypographyLabel>Description: </TypographyLabel>
                <TypographyInline>
                    {!loading && !!LOI ? LOI.description : <Skeleton sx={{display:"inline-block", width: "200px"}} />}
                </TypographyInline>
            </Box>
            {!!LOI && LOI.notes ? <Box>
                <TypographyLabel>Notes: </TypographyLabel>
                <TypographyInline>{LOI.notes}</TypographyInline>
            </Box> : ""}

        </Box>
        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Hypothesis or question template:</TypographySubtitle>
            <QuestionLinker selected={LOI? LOI.question : ""} disabled={true}/>
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Data needed to execute this line of inquiry:</TypographySubtitle>
            <Box sx={{display: "inline-flex", alignItems: "center"}}>
                <Typography sx={{display: "inline-block", marginRight: "5px"}}> Data source: </Typography>
                <Select size="small" sx={{display: 'inline-block', minWidth: "150px"}} variant="standard" value={selectedDataSource} label={"Data source:"} disabled>
                    {loadingEndpoints ? 
                        <MenuItem value={selectedDataSource}> Loading ... </MenuItem> 
                    : (
                        endpoints ? 
                            Object.keys(endpoints).map((name:string) => <MenuItem key={`endpoint_${name}`} value={endpoints[name]}>{name}</MenuItem>)
                        :
                            <MenuItem value={selectedDataSource}>{selectedDataSource}</MenuItem>
                    )}
                </Select>
            </Box>
            <Box sx={{fontSize: "0.94rem"}} >
                <CodeMirror value={!!LOI? LOI.dataQuery : ""}
                    extensions={[StreamLanguage.define(sparql)]}
                    onChange={(value, viewUpdate) => {
                    console.log('value:', value);
                    }}
                />
            </Box>
            {loading?
                <Skeleton sx={{display:"inline-block", width: "400px"}}/>
                : (!!LOI && (LOI.relevantVariables || LOI.explanation) ?
                    <Box>
                        <FormHelperText sx={{fontSize: ".9rem"}}>
                            When the data source is accessed, a table will be generated that will show the following information about the datasets retrieved:
                        </FormHelperText>
                        <Box>
                            <TypographyLabel>List of variables to show on table:</TypographyLabel>
                            <TypographyInline> {LOI.relevantVariables} </TypographyInline>
                        </Box>
                        <Box>
                            <TypographyLabel>Information to show on the table:</TypographyLabel>
                            <TypographyInline> {LOI.explanation} </TypographyInline>
                        </Box>
                    </Box> : null
                )
            }
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle sx={{display: "inline-block"}}>Methods:</TypographySubtitle>
            <Box>
                {loading ? <Skeleton/> : (LOI && LOI.workflows && LOI.workflows.length > 0 ? 
                    <Box>
                        <FormHelperText sx={{fontSize: ".9rem"}}>
                            The data analysis methods are represented in the following workflows:
                        </FormHelperText>
                        { LOI.workflows.map((wf:Workflow, i) => <Card key={`wf_${wf.workflow}-${i}`} variant="outlined" sx={{mb:"5px"}}>
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