import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { hypothesisSlice } from './hypothesis';
import { questionSlice } from './questions';


export const store = configureStore({
  reducer: {
    hypotheses: hypothesisSlice.reducer,
    question: questionSlice.reducer,
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
