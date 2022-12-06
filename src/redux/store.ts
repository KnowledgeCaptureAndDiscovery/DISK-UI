import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { hypothesisSlice } from './hypothesis';
import { keycloakSlice } from './keycloak';
import { loisSlice } from './lois';
//import { questionSlice } from './questions';
import { serverSlice } from './server';
import { tloisSlice } from './tlois';
import { workflowSlice } from './workflows';
import { brainSlice } from './brain';

import { hypothesisAPI, questionsAPI } from '../DISK/queries';
import { setupListeners } from '@reduxjs/toolkit/dist/query';
import { notificationSlice } from './stores/notifications';
import { backdropSlice } from './stores/backdrop';
import { formsSlice } from './stores/forms';

export const store = configureStore({
  reducer: {
    brain: brainSlice.reducer,
    server: serverSlice.reducer,
    hypotheses: hypothesisSlice.reducer,
    //question: questionSlice.reducer,
    lois: loisSlice.reducer,
    workflows: workflowSlice.reducer,
    tlois: tloisSlice.reducer,
    keycloak: keycloakSlice.reducer,

    [notificationSlice.name]: notificationSlice.reducer,
    [formsSlice.name]: formsSlice.reducer,
    [backdropSlice.name]: backdropSlice.reducer,
    [questionsAPI.reducerPath]: questionsAPI.reducer,
    [hypothesisAPI.reducerPath]: hypothesisAPI.reducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(hypothesisAPI.middleware, questionsAPI.middleware),
});

setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
