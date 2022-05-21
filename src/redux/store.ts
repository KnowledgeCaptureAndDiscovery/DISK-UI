import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { hypothesisSlice } from './hypothesis';
import { loisSlice } from './lois';
import { questionSlice } from './questions';
import { serverSlice } from './server';
import { workflowSlice } from './workflows';


export const store = configureStore({
  reducer: {
    server: serverSlice.reducer,
    hypotheses: hypothesisSlice.reducer,
    question: questionSlice.reducer,
    lois: loisSlice.reducer,
    workflows: workflowSlice.reducer,
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
