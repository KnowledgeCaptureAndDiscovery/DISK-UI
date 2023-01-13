import { useState } from "react";
import { Box, Button, Card, Divider, IconButton, Skeleton, Tooltip, Typography } from "@mui/material";
import { Vocabulary, VocabularyIndividual, VocabularyProperty, VocabularyType } from "DISK/interfaces";
import MenuBookIcon from '@mui/icons-material/MenuBook';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { renderDescription } from "DISK/util";
import { useGetVocabulariesQuery } from "redux/apis/server";

export const TerminologyView = () => {
    const { data:vocabularies, isLoading:loading, isError:error } = useGetVocabulariesQuery();
    const [showMore, setShowMore] = useState<{[id:string]:boolean}>({});

    return <Box>
        <Typography variant="h5">Terminology:</Typography>
        <Typography>
            DISK uses the terms below.
            The terms are defined in several ontologies, some general and some more specific to neuroscience.
            <span style={{marginLeft: '4px', color: 'green'}}>Types are shown in green</span>,
            <span style={{marginLeft: '4px', color: 'orange'}}>properties in orange</span>, and 
            <span style={{marginLeft: '4px', color: 'blue'}}>individuals in blue</span>.
        </Typography>
        {loading ? <Skeleton/> : (vocabularies ? 
            Object.values(vocabularies)
                    .filter(v => v.prefix.substring(0,4) !== 'disk' && v.prefix.substring(0,3) !== 'sqo')
                    .map((v:Vocabulary) =>
                <Card variant="outlined" sx={{mb:"5px", padding: "0 5px"}} key={`v_${v.namespace}`}>
                    <Box sx={{display:'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <Box sx={{display:'flex', alignItems: 'center'}}>
                            <MenuBookIcon  sx={{color: 'blue', mr: "5px"}}/>
                            <Typography variant="h6">
                                {v.title}
                            </Typography>
                        </Box>
                        <IconButton onClick={() => window.open(v.namespace, '_blank')}>
                            <OpenInNewIcon />
                        </IconButton>
                    </Box>
                    <Divider/>
                    {v.description && renderDescription(v.description)}
                    <Typography sx={{fontFamily: "monospace"}}>
                        PREFIX {v.prefix}: &lt;{v.namespace}&gt;
                    </Typography>
                    <Box>
                        <Box style={{display:"flex", justifyContent:"space-between", alignItems: "center", borderBottom: '1px solid #ddd'}}>
                            <Typography>
                                This ontology includes the following definitions:
                            </Typography>
                            <Button onClick={() => setShowMore((cur) => {
                                let next = { ...cur};
                                next[v.namespace] = !next[v.namespace];
                                return next;
                            })}>See {showMore[v.namespace]? 'less' : 'more'}</Button>
                        </Box>
                        <Box style={{maxHeight: showMore[v.namespace] ? 'unset' : '52px', overflow:'hidden'}}>
                            {Object.values(v.types).filter(v => !!v.description).map((t:VocabularyType) => 
                            <Box key={`t_${t.id}`} sx={{display: "flex", alignItems:"baseline", mb: "2px"}}>
                                <Tooltip arrow title={t.id}>
                                    <Card variant="outlined" sx={{display:"inline-block", padding:"0px 4px", m: "0 3px", whiteSpace: "nowrap", overflow: "visible", borderColor: "green"}}>
                                        {t.label ? t.label : t.id.replaceAll(/.*#/g,'')}
                                    </Card>
                                </Tooltip>:
                                <Box sx={{ml:"3px"}}>
                                    {t.description}
                                </Box>
                            </Box>
                            )}
                            {Object.values(v.properties).filter(v => !!v.description).map((t:VocabularyProperty) => 
                            <Box key={`p_${t.id}`} sx={{display: "flex", alignItems:"baseline", mb: "2px"}}>
                                <Tooltip arrow title={t.id}>
                                    <Card variant="outlined" sx={{display:"inline-block", padding:"0px 4px", m: "0 3px", whiteSpace: "nowrap", overflow: "visible", borderColor: "orange"}}>
                                        {t.label ? t.label : t.id.replaceAll(/.*#/g,'')}
                                    </Card>
                                </Tooltip>:
                                <Box sx={{ml:"3px"}}>
                                    {t.description}
                                </Box>
                            </Box>
                            )}
                            {Object.values(v.individuals).filter(v => !!v.description).map((t:VocabularyIndividual) => 
                            <Box key={`i_${t.id}`} sx={{display: "flex", alignItems:"baseline", mb: "2px"}}>
                                <Tooltip arrow title={t.id}>
                                    <Card variant="outlined" sx={{display:"inline-block", padding:"0px 4px", m: "0 3px", whiteSpace: "nowrap", overflow: "visible", borderColor: "blue"}}>
                                        {t.label ? t.label : t.id.replaceAll(/.*#/g,'')}
                                    </Card>
                                </Tooltip>:
                            </Box>
                            )}
                        </Box>
                    </Box>
                </Card>
            ) : null)}
    </Box>
}
