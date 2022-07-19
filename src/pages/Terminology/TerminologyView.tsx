import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { loadVocabularies } from "redux/loader";
import { Box, Card, Divider, IconButton, Skeleton, Tooltip, Typography } from "@mui/material";
import { Vocabulary, VocabularyIndividual, VocabularyProperty, VocabularyType } from "DISK/interfaces";
import MenuBookIcon from '@mui/icons-material/MenuBook';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export const TerminologyView = () => {
    const dispatch = useAppDispatch();
    const vocabularies = useAppSelector((state:RootState) => state.server.vocabularies);
    const loading = useAppSelector((state:RootState) => state.server.loadingVocabularies);
    const error = useAppSelector((state:RootState) => state.server.errorVocabularies);

    useEffect(() => {
        if (!vocabularies && !loading)
            loadVocabularies(dispatch);
    }, []);

    return <Box>
        <Typography variant="h5">Terminology:</Typography>
        <Typography>
            The DISK System follows the descriptions ahead. On green <span style={{color: 'green'}}>types</span>, 
            on orange <span style={{color: 'orange'}}>properties</span> and on blue <span style={{color: 'blue'}}>individuals</span>.
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
                    <Typography>
                        {v.description}
                    </Typography>

                    <Typography sx={{fontFamily: "monospace"}}>
                        PREFIX {v.prefix}: &lt;{v.namespace}&gt;
                    </Typography>
                    <Box>
                        <Typography>
                            Example terms:
                        </Typography>
                        <Box>
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
                                <Box sx={{ml:"3px"}}>
                                    {t.description}
                                </Box>
                            </Box>
                            )}
                        </Box>
                    </Box>
                </Card>
            ) : null)}
    </Box>
}
