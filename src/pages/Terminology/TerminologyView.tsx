import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { loadVocabularies } from "redux/loader";
import { Box, Card, Divider, Skeleton, Tooltip, Typography } from "@mui/material";
import { Vocabulary, VocabularyIndividual, VocabularyProperty, VocabularyType } from "DISK/interfaces";
import MenuBookIcon from '@mui/icons-material/MenuBook';

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
            The DISK system is configured to work with the following external vocabularies:
        </Typography>
        {loading ? <Skeleton/> : (vocabularies ? 
            Object.values(vocabularies).map((v:Vocabulary) =>
                <Card variant="outlined" sx={{mb:"5px", padding: "0 5px"}} key={`v_${v.namespace}`}>
                    <Box sx={{display:'flex', alignItems: 'center'}}>
                        <MenuBookIcon  sx={{color: 'blue', mr: "5px"}}/>
                        <Typography variant="h6">
                            {v.title}
                        </Typography>
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
                            Example resources:
                        </Typography>
                        {Object.values(v.types).map((t:VocabularyType) => 
                            <Tooltip arrow title={t.id} key={`t_${t.id}`}>
                                <Card variant="outlined" sx={{display:"inline-block", padding:"0px 4px", m: "0 3px", borderColor: "green"}}>
                                    {t.label ? t.label : t.id.replaceAll(/.*#/g,'')}
                                </Card>
                            </Tooltip>
                        )}
                        {Object.values(v.properties).map((t:VocabularyProperty) => 
                            <Tooltip arrow title={t.id} key={`t_${t.id}`}>
                                <Card variant="outlined" sx={{display:"inline-block", padding:"0px 4px", m: "0 3px", borderColor: "orange"}}>
                                    {t.label ? t.label : t.id.replaceAll(/.*#/g,'')}
                                </Card>
                            </Tooltip>
                        )}
                        {Object.values(v.individuals).map((t:VocabularyIndividual) => 
                            <Tooltip arrow title={t.id} key={`t_${t.id}`}>
                                <Card variant="outlined" sx={{display:"inline-block", padding:"0px 4px", m: "0 3px", borderColor: "blue"}}>
                                    {t.label ? t.label : t.id.replaceAll(/.*#/g,'')}
                                </Card>
                            </Tooltip>
                        )}
                    </Box>
                </Card>
            ) : null)}
    </Box>
}
