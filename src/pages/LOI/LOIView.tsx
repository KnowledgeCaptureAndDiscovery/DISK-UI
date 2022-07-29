import { Box, Card, Divider, FormHelperText, IconButton, Skeleton, Tooltip, Typography } from "@mui/material";
import { DISKAPI } from "DISK/API";
import { LineOfInquiry, idPattern, DataEndpoint } from "DISK/interfaces";
import { Fragment, useEffect } from "react";
import { Link, useLocation } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';
import { PATH_LOIS } from "constants/routes";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { setSelectedLOI, setLoadingSelected, setErrorSelected } from 'redux/lois';
import { QuestionLinker } from "components/QuestionLinker";
import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import React from "react";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { loadDataEndpoints } from "redux/loader";
import { renderDescription } from "DISK/util";
import { WorkflowList } from "components/WorkflowList";

const TypographyLabel = styled(Typography)(({ theme }) => ({
    color: 'gray',
    display: "inline",
    fontWeight: "bold",
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

const TypographySection = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: "1.05em"
}));

export const LOIView = () => {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const authenticated = useAppSelector((state:RootState) => state.keycloak.authenticated);

    const LOI = useAppSelector((state:RootState) => state.lois.selectedLOI);
    const selectedId = useAppSelector((state:RootState) => state.lois.selectedId);
    const loading = useAppSelector((state:RootState) => state.lois.loadingSelected);
    const error = useAppSelector((state:RootState) => state.lois.errorSelected);

    const endpoints : DataEndpoint[] = useAppSelector((state:RootState) => state.server.endpoints);
    const initializedEndpoint : boolean = useAppSelector((state:RootState) => state.server.initializedEndpoints);
    const loadingEndpoints = useAppSelector((state:RootState) => state.server.loadingEndpoints);
    const [selectedDataSource, setSelectedDataSource] = React.useState("");
    const [dataSource, setDataSource] = React.useState<DataEndpoint|null>();
    const [formalView, setFormalView] = React.useState<boolean>(false);

    const loadLOI = () => {
        let id : string = location.pathname.replace(idPattern, '');
        if (!!id && !loading && !error && selectedId !== id) {
            dispatch(setLoadingSelected(id));
            DISKAPI.getLOI(id)
                .then((LOI:LineOfInquiry) => {
                    dispatch(setSelectedLOI(LOI));
                })
                .catch(() => {
                    dispatch(setErrorSelected());
                });
        }
        if (!initializedEndpoint) {
            loadDataEndpoints(dispatch);
        }
    }

    useEffect(() => {
        if (LOI) {
            setSelectedDataSource(LOI.dataSource)
        }
    }, [LOI]);

    const updateDataSourceLabel = () => {
        if (endpoints && selectedDataSource) {
            endpoints.forEach((endpoint:DataEndpoint) => {
                if (endpoint.url === selectedDataSource)
                    setDataSource(endpoint);
            });
        }
    }

    useEffect(updateDataSourceLabel, [endpoints, selectedDataSource]);

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
                    {!loading && !!LOI ? LOI.description : <Skeleton sx={{display:"inline-block", width: "200px"}}/>}
                </TypographyInline>
            </Box>
            <Box>
                <TypographyLabel>Notes: </TypographyLabel>
                {loading ?
                    <Skeleton sx={{display:"inline-block", width: "200px"}}/> :
                    (!!LOI && LOI.notes ? 
                        <TypographyInline>{LOI.notes}</TypographyInline> :
                        <InfoInline> None specified </InfoInline>
                    )}
            </Box>
        </Box>
        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Hypothesis or question template:</TypographySubtitle>
            <QuestionLinker selected={LOI? LOI.question : ""} disabled={true}/>
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Data:</TypographySubtitle>
            <Box sx={{display:"flex", justifyContent:"space-between", alignItems: "center"}}>
                <Box>
                    <TypographyLabel>Data query explanation:</TypographyLabel>
                    {loading ? 
                        <Skeleton sx={{display:"inline-block", width: "400px"}}/> :
                        (!!LOI && LOI.dataQueryExplanation ? 
                            <TypographyInline> {LOI.dataQueryExplanation} </TypographyInline> :
                            <InfoInline> None specified </InfoInline>
                        )
                    }
                </Box>
                <Tooltip arrow title={(formalView? "Hide" : "Show") + " data query"}>
                    <IconButton sx={{p:0}} onClick={() => setFormalView(!formalView)}>
                        {formalView? <VisibilityIcon/> : <VisibilityOffIcon/>}
                    </IconButton>
                </Tooltip>
            </Box>
            {formalView ?
            <Fragment>
                <TypographySection>Data query:</TypographySection>
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
                <Box sx={{fontSize: "0.94rem"}} >
                    <CodeMirror value={!!LOI? LOI.dataQuery : ""}
                        extensions={[StreamLanguage.define(sparql)]}
                        onChange={(value, viewUpdate) => {
                        console.log('value:', value);
                        }}
                    />
                </Box> 
            </Fragment> : null }
            <Box>
                <TypographySection>Input data retrieved:</TypographySection>
                <FormHelperText sx={{fontSize: ".9rem"}}>
                    When the data source is accessed, a table will be generated that will show the following information about the datasets retrieved:
                </FormHelperText>
                <Box>
                    <TypographyLabel>Columns to show on table:</TypographyLabel>
                    {loading ? 
                        <Skeleton sx={{display:"inline-block", width: "400px"}}/> :
                        (!!LOI && LOI.tableVariables ? 
                            <TypographyInline> {LOI.tableVariables} </TypographyInline> :
                            <InfoInline> None specified </InfoInline>
                        )
                    }
                </Box>
                <Box>
                    <TypographyLabel>Description of the table:</TypographyLabel>
                    {loading?
                        <Skeleton sx={{display:"inline-block", width: "400px"}}/> :
                        (!!LOI && LOI.tableDescription ? 
                            <TypographyInline> {LOI.tableDescription} </TypographyInline> :
                            <InfoInline> None specified </InfoInline>
                        )
                    }
                </Box>
            </Box>
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle sx={{display: "inline-block"}}>Methods:</TypographySubtitle>
            {loading?
                <Skeleton/> 
            : 
                !!LOI && <WorkflowList editable={false} workflows={LOI.workflows} metaworkflows={LOI.metaWorkflows} options={[]}/>
            }
        </Box>
    </Card>
}