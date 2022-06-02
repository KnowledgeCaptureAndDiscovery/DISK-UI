import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { hypothesisSlice } from './hypothesis';
import { keycloakSlice } from './keycloak';
import { loisSlice } from './lois';
import { questionSlice } from './questions';
import { serverSlice } from './server';
import { tloisSlice } from './tlois';
import { workflowSlice } from './workflows';


export const store = configureStore({
  reducer: {
    server: serverSlice.reducer,
    hypotheses: hypothesisSlice.reducer,
    question: questionSlice.reducer,
    lois: loisSlice.reducer,
    workflows: workflowSlice.reducer,
    tlois: tloisSlice.reducer,
    keycloak: keycloakSlice.reducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
