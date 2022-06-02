import { DISKAPI } from 'DISK/API';
import { Hypothesis, TriggeredLineOfInquiry } from 'DISK/interfaces';
import { setLoadingSelected as setLoadingHypothesis, setSelectedHypothesis, setErrorSelected as setErrorHypothesis } from './hypothesis';
import type { AppDispatch } from './store';
import {setLoadingAll as setLoadingTLOIs, setErrorAll as setErrorTLOIs, setTLOIs} from './tlois';

// Hypothesis
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

// TLOIS
export const loadTLOIs = (dispatch:AppDispatch) => {
    dispatch(setLoadingTLOIs());
    return DISKAPI.getTLOIs()
        .then((tlois:TriggeredLineOfInquiry[]) => dispatch(setTLOIs(tlois)))
        .catch(() => dispatch(setErrorTLOIs()));
};