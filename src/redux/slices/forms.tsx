import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SimpleMap = {[id:string]: string};

export interface FormsState {
  selectedQuestionId: string,
  questionBindings: SimpleMap,
}

export const formsSlice = createSlice({
  name: 'forms',
  initialState: {
    selectedQuestionId: '',
    questionBindings: {}
  } as FormsState,
  reducers: {
    setQuestionBindings: (state:FormsState, action: PayloadAction<{id:string, map:SimpleMap}>) => {
      return { 
        ...state,
        questionBindings: action.payload.map,
        selectedQuestionId: action.payload.id,
      };
    },
  },
});

export const { setQuestionBindings } = formsSlice.actions;