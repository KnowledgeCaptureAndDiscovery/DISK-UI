import { Box, Button, Card, Divider, FormHelperText, IconButton, Skeleton, Tooltip, Typography } from "@mui/material";
import { DataEndpoint } from "DISK/interfaces";
import { Fragment, useEffect } from "react";
import { Link, useParams } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';
import { PATH_LOIS } from "constants/routes";
import { useAuthenticated } from "redux/hooks";
import { QuestionLinker } from "components/questions/QuestionLinker";
import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import React from "react";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { renderDescription } from "DISK/util";
import { WorkflowList } from "components/methods/WorkflowList";
import { useGetEndpointsQuery } from "redux/apis/server";
import { useGetLOIByIdQuery } from "redux/apis/lois";
import { InfoInline, TypographyInline, TypographyLabel, TypographySection, TypographySubtitle } from "components/Styles";

export const LOIView = () => {
    const authenticated = useAuthenticated();
    const { loiId } = useParams();
    const selectedId = loiId as string;

    const {data:LOI, isLoading:loading, isError:error} = useGetLOIByIdQuery(selectedId, {skip:!selectedId});
    const {data:endpoints, isLoading:loadingEndpoints} = useGetEndpointsQuery();

    const [selectedDataSource, setSelectedDataSource] = React.useState("");
    const [dataSource, setDataSource] = React.useState<DataEndpoint|null>();
    const [formalView, setFormalView] = React.useState<boolean>(false);

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

    return <Card variant="outlined">
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
            <QuestionLinker selected={LOI? LOI.questionId : ""} disabled={true}/>
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Data query:</TypographySubtitle>
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
                <Tooltip arrow title={(formalView? "Hide" : "Show") + " query template"}>
                    <Button sx={{p:0}} onClick={() => setFormalView(!formalView)}>
                        {formalView? <VisibilityIcon sx={{mr:'10px'}}/> : <VisibilityOffIcon sx={{mr:'10px'}}/>}
                        Data query template
                    </Button>
                </Tooltip>
            </Box>
            {formalView && (<Fragment>
                <TypographySection>Data query template:</TypographySection>
                <Box sx={{display: "inline-flex", alignItems: "baseline"}}>
                    <TypographyLabel sx={{whiteSpace: 'nowrap'}}>Data source: </TypographyLabel>
                    {loadingEndpoints ? 
                        <Skeleton sx={{display:"inline-block", width: "400px"}}/> :
                        (dataSource && <TypographyInline sx={{ml:"5px", whiteSpace: 'nowrap', fontWeight: '500'}}> {dataSource.name.replaceAll('_',' ')} </TypographyInline>)
                    }
                </Box>
                {!loadingEndpoints && dataSource && (
                    <Box sx={{ display: "inline-block", ml: "5px", fontSize: ".85em" }}>
                        {renderDescription(dataSource.description)}
                    </Box>
                )}
                <Box sx={{fontSize: "0.94rem", mb:"10px"}} >
                    <CodeMirror value={!!LOI? LOI.dataQuery : ""}
                        extensions={[StreamLanguage.define(sparql)]}
                        onChange={(value, viewUpdate) => {
                        }}
                    />
                </Box> 
            </Fragment>)}
            <Card variant="outlined" sx={{p:'5px'}}>
                <TypographySection>Data retrieved:</TypographySection>
                <Divider/>
                <FormHelperText sx={{fontSize: ".9rem"}}>
                    When the data source is accessed, a table will be generated that will show the following information about the datasets retrieved:
                </FormHelperText>
                <Box>
                    <TypographyLabel>Dataset information to be shown:</TypographyLabel>
                    {loading ? 
                        <Skeleton sx={{display:"inline-block", width: "400px"}}/> :
                        (!!LOI && LOI.tableVariables ? 
                            <TypographyInline> {LOI.tableVariables} </TypographyInline> :
                            <InfoInline> None specified </InfoInline>
                        )
                    }
                </Box>
                <Box>
                    <TypographyLabel>Description of the datasets:</TypographyLabel>
                    {loading?
                        <Skeleton sx={{display:"inline-block", width: "400px"}}/> :
                        (!!LOI && LOI.tableDescription ? 
                            <TypographyInline> {LOI.tableDescription} </TypographyInline> :
                            <InfoInline> None specified </InfoInline>
                        )
                    }
                </Box>
            </Card>
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