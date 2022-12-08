import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
//import { hypothesisSlice } from './hypothesis';
import { keycloakSlice } from './stores/keycloak';
import { loisSlice } from './lois';
//import { questionSlice } from './questions';
//import { serverSlice } from './server';
import { tloisSlice } from './tlois';
import { workflowSlice } from './workflows';
import { brainSlice } from './brain';

import { hypothesisAPI, questionsAPI, serverApi, workflowsApi } from '../DISK/queries';
import { setupListeners } from '@reduxjs/toolkit/dist/query';
import { notificationSlice } from './stores/notifications';
import { backdropSlice } from './stores/backdrop';
import { formsSlice } from './stores/forms';

export const store = configureStore({
  reducer: {
    lois: loisSlice.reducer,
    tlois: tloisSlice.reducer,
    brain: brainSlice.reducer,
    //workflows: workflowSlice.reducer,
    //hypotheses: hypothesisSlice.reducer,
    //question: questionSlice.reducer,
    //server: serverSlice.reducer,

    [formsSlice.name]: formsSlice.reducer,
    [backdropSlice.name]: backdropSlice.reducer,
    [keycloakSlice.name]: keycloakSlice.reducer,
    [notificationSlice.name]: notificationSlice.reducer,
    [serverApi.reducerPath]: serverApi.reducer,
    [workflowsApi.reducerPath]: workflowsApi.reducer,
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
