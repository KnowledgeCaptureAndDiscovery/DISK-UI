import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SimpleMap = {[id:string]: string};

export interface FormsState {
  selectedQuestionId: string,
  selectedPattern: string,
  questionBindings: SimpleMap,
}

export const formsSlice = createSlice({
  name: 'forms',
  initialState: {
    selectedQuestionId: '',
    selectedPattern: '',
    questionBindings: {}
  } as FormsState,
  reducers: {
    setQuestionBindings: (state:FormsState, action: PayloadAction<{id:string, map:SimpleMap, pattern?:string}>) => {
      return { 
        ...state,
        questionBindings: action.payload.map,
        selectedQuestionId: action.payload.id,
        selectedPattern: action.payload.pattern ? action.payload.pattern : state.selectedPattern,
      };
    },
  },
});

export const { setQuestionBindings } = formsSlice.actions;