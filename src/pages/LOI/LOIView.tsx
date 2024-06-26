import { Box, Button, Card, Divider, FormHelperText, IconButton, Skeleton, Tooltip, Typography } from "@mui/material";
import { DataEndpoint } from "DISK/interfaces";
import { useEffect } from "react";
import { Link, useParams } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit';
import { PATH_LOIS } from "constants/routes";
import { useAuthenticated } from "redux/hooks";
import { QuestionLinker } from "components/questions/QuestionLinker";
import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import React from "react";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getId, renderDescription } from "DISK/util";
import { WorkflowSeedList } from "components/methods/WorkflowSeedList";
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
        if (LOI?.dataQueryTemplate?.endpoint?.url) {
            setSelectedDataSource(LOI.dataQueryTemplate.endpoint.url);
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

    const getSparqlQuery : () => string = () => {
        return (LOI?.dataQueryTemplate) ? "SELECT * WHERE {\n" + LOI.dataQueryTemplate.template + "\n}": "";
    }

    return <Card variant="outlined">
        {loading ? 
            <Skeleton sx={{height:"40px", margin: "8px 12px", minWidth: "250px"}}/>
        :
            <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor: "whitesmoke"}}>
                <Typography variant="h5">
                    {error ? "Error loading LOI" : LOI?.name}
                </Typography>
                {authenticated && LOI ? 
                <Tooltip arrow title="Edit">
                    <IconButton component={Link} to={PATH_LOIS + "/" + getId(LOI) + "/edit"}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
                : null}
            </Box>
        }
        <Divider/>
        <Box sx={{padding:"8px 12px"}}>
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
            <TypographySubtitle style={{marginBottom: "10px"}} >Hypothesis or question template:</TypographySubtitle>
            <QuestionLinker selected={LOI? LOI.question.id : ""} disabled={true} showErrors={false}/>
        </Box>
        <Divider/>

        <Box sx={{padding:"8px 12px"}}>
            <TypographySubtitle>Data query template:</TypographySubtitle>
            <Box sx={{mb:"4px"}}>
                <TypographyLabel>Data query explanation:</TypographyLabel>
                {loading ? 
                    <Skeleton sx={{display:"inline-block", width: "400px"}}/> :
                    (LOI?.dataQueryTemplate?.description ? 
                        <TypographyInline> {LOI.dataQueryTemplate.description} </TypographyInline> :
                        <InfoInline> None specified </InfoInline>
                    )
                }
            </Box>

            <Box sx={{mb:"4px"}}>
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
            </Box>

            <Box>
                <Box sx={{ display: "inline-flex", alignItems: "center", mb: "4px", width: "100%", justifyContent: "space-between" }}>
                    <TypographyLabel sx={{ whiteSpace: 'nowrap' }}>Query template:</TypographyLabel>
                    <Tooltip arrow title={(formalView? "Hide" : "Show") + " query template"}>
                        <Button sx={{p:0}} onClick={() => setFormalView(!formalView)} style={{margin: "0px 10px"}}>
                            {formalView? <VisibilityIcon sx={{mr:'5px'}}/> : <VisibilityOffIcon sx={{mr:'5px'}}/>}
                            {(formalView ? "Hide" : "Show")} query template
                        </Button>
                    </Tooltip>
                </Box>
                    
                {formalView &&                     
                    <Box sx={{fontSize: "0.94rem", mb:"10px"}}>
                        <CodeMirror value={getSparqlQuery()}
                        className="cm-readonly"
                            extensions={[StreamLanguage.define(sparql)]}
                            readOnly
                        />
                    </Box>}
            </Box>

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
                        (LOI?.dataQueryTemplate?.variablesToShow ? 
                            <TypographyInline> {LOI.dataQueryTemplate.variablesToShow.join(", ")} </TypographyInline> :
                            <InfoInline> None specified </InfoInline>
                        )
                    }
                </Box>
                <Box>
                    <TypographyLabel>Description of the datasets:</TypographyLabel>
                    {loading?
                        <Skeleton sx={{display:"inline-block", width: "400px"}}/> :
                        (LOI?.dataQueryTemplate?.footnote ? 
                            <TypographyInline> {LOI.dataQueryTemplate.footnote} </TypographyInline> :
                            <InfoInline> None specified </InfoInline>
                        )
                    }
                </Box>
            </Card>
        </Box>
        <Divider/>

        <Box sx={{padding:"8px 12px"}}>
            <TypographySubtitle sx={{display: "inline-block"}}>Methods:</TypographySubtitle>
            {loading?
                <Skeleton/> 
            : 
                !!LOI && <WorkflowSeedList editable={false} workflows={LOI.workflowSeeds} metaworkflows={LOI.metaWorkflowSeeds} options={[]}/>
            }
        </Box>
    </Card>
}