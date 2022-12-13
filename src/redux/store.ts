import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { keycloakSlice } from './slices/keycloak';
import { loisSlice } from './lois';
import { tloisSlice } from './tlois';
import { brainSlice } from './brain';
import { setupListeners } from '@reduxjs/toolkit/dist/query';
import { notificationSlice } from './slices/notifications';
import { backdropSlice } from './slices/backdrop';
import { formsSlice } from './slices/forms';
import { questionsAPI } from './apis/questions';
import { serverApi } from './apis/server';
import { workflowsApi } from './apis/workflows';
import { hypothesesAPI } from './apis/hypotheses';
import { loisAPI } from './apis/lois';
import { tloisAPI } from './apis/tlois';

export const store = configureStore({
  reducer: {
    //lois: loisSlice.reducer,
    //tlois: tloisSlice.reducer,
    brain: brainSlice.reducer,
    //Slices
    [formsSlice.name]: formsSlice.reducer,
    [backdropSlice.name]: backdropSlice.reducer,
    [keycloakSlice.name]: keycloakSlice.reducer,
    [notificationSlice.name]: notificationSlice.reducer,
    //APIS
    [loisAPI.reducerPath]: loisAPI.reducer,
    [tloisAPI.reducerPath]: tloisAPI.reducer,
    [serverApi.reducerPath]: serverApi.reducer,
    [workflowsApi.reducerPath]: workflowsApi.reducer,
    [questionsAPI.reducerPath]: questionsAPI.reducer,
    [hypothesesAPI.reducerPath]: hypothesesAPI.reducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(
      loisAPI.middleware,
      tloisAPI.middleware,
      serverApi.middleware,
      workflowsApi.middleware,
      questionsAPI.middleware,
      hypothesesAPI.middleware,
    ),
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
