import { DISKAPI } from 'DISK/API';
import { DataEndpoint, Hypothesis, LineOfInquiry, TriggeredLineOfInquiry, Vocabularies } from 'DISK/interfaces';
import { setLoadingSelected as setLoadingHypothesis, setSelectedHypothesis, setErrorSelected as setErrorHypothesis, setLoadingAll as setLoadingHypotheses,
        setHypotheses, setErrorAll as setErrorHypotheses} from './hypothesis';
import type { AppDispatch } from './store';
import {setLoadingAll as setLoadingTLOIs, setErrorAll as setErrorTLOIs, setTLOIs, setLoadingSelected as setLoadingTLOI,
        setSelectedTLOI, setErrorSelected as setErrorTLOI } from './tlois';
import {setLoadingAll as setLoadingLOIs, setErrorAll as setErrorLOIs, setLOIs, setLoadingSelected as setLoadingLOI, setSelectedLOI, setErrorSelected as setErrorLOI } from './lois';
import { setEndpoint, setErrorEndpoint, setErrorVocabularies, setLoadingEndpoints, setLoadingVocabularies, setVocabularies } from './server';

// Hypothesis
export const loadHypotheses = (dispatch:AppDispatch) => {
    dispatch(setLoadingHypotheses());
    return DISKAPI.getHypotheses()
        .then((hyps:Hypothesis[]) => dispatch(setHypotheses(hyps)))
        .catch(() => dispatch(setErrorHypotheses()));
};

export const loadHypothesis = (dispatch:AppDispatch, id:string) => {
    dispatch(setLoadingHypothesis(id));
    return DISKAPI.getHypothesis(id)
        .then((hypothesis:Hypothesis) => {
            dispatch(setSelectedHypothesis(hypothesis));
        })
        .catch(() => {
            dispatch(setErrorHypothesis());
        });
};

// LOIS
export const loadLOIs = (dispatch:AppDispatch) => {
    dispatch(setLoadingLOIs());
    return DISKAPI.getLOIs()
        .then((lois:LineOfInquiry[]) => dispatch(setLOIs(lois)))
        .catch(() => dispatch(setErrorLOIs()));
};

export const loadLOI = (dispatch:AppDispatch, id:string) => {
    dispatch(setLoadingLOI(id));
    return DISKAPI.getLOI(id)
        .then((LOI:LineOfInquiry) => dispatch(setSelectedLOI(LOI)))
        .catch(() => dispatch(setErrorLOI()));
};

// TLOIS
export const loadTLOIs = (dispatch:AppDispatch) => {
    dispatch(setLoadingTLOIs());
    return DISKAPI.getTLOIs()
        .then((tlois:TriggeredLineOfInquiry[]) => dispatch(setTLOIs(tlois)))
        .catch(() => dispatch(setErrorTLOIs()));
};

export const loadTLOI = (dispatch:AppDispatch, id:string) => {
    dispatch(setLoadingTLOI(id));
    return DISKAPI.getTLOI(id)
        .then((TLOI:TriggeredLineOfInquiry) => dispatch(setSelectedTLOI(TLOI)))
        .catch(() => dispatch(setErrorTLOI()));
};

// Vocabularies
export const loadVocabularies = (dispatch:AppDispatch) => {
    dispatch(setLoadingVocabularies());
    return DISKAPI.getVocabulary()
        .then((vocabs:Vocabularies) => dispatch(setVocabularies(vocabs)))
        .catch(() => dispatch(setErrorVocabularies()));
};

// Data endpoints
export const loadDataEndpoints = (dispatch:AppDispatch) => {
    dispatch(setLoadingEndpoints());
    return DISKAPI.getEndpoints()
        .then((endpoints:DataEndpoint[]) => dispatch(setEndpoint(endpoints)))
        .catch(() => dispatch(setErrorEndpoint()));
}