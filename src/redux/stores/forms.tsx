import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SimpleMap = {[id:string]: string};

export interface FormsState {
    questionBindings: SimpleMap,
}

export const formsSlice = createSlice({
  name: 'forms',
  initialState: {
    questionBindings: {}
  } as FormsState,
  reducers: {
    setQuestionBindings: (state:FormsState, action: PayloadAction<SimpleMap>) => {
      return { 
        ...state,
        questionBindings: action.payload,
      };
    },
  },
});

export const { setQuestionBindings } = formsSlice.actions;