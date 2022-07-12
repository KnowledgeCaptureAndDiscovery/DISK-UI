import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { loadVocabularies } from "redux/loader";
import { Box, Skeleton } from "@mui/material";
import { Vocabularies, Vocabulary } from "DISK/interfaces";

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
        <div>Terminology:</div>
        {loading ? <Skeleton/> : (vocabularies ? 
            Object.values(vocabularies).map((v:Vocabulary) =>
                <Box>{v.namespace}</Box>
            ) : null)}
    </Box>
}
