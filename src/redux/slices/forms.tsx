import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SimpleMap = {[id:string]: string};

export interface FormsState {
  selectedPattern: string,
  questionBindings: SimpleMap,
}

export const formsSlice = createSlice({
  name: 'forms',
  initialState: {
    selectedPattern: '',
    questionBindings: {}
  } as FormsState,
  reducers: {
    setQuestionBindings: (state:FormsState, action: PayloadAction<{map:SimpleMap, pattern?:string}>) => {
      return { 
        ...state,
        questionBindings: action.payload.map,
        selectedPattern: action.payload.pattern ? action.payload.pattern : state.selectedPattern,
      };
    },
  },
});

export const { setQuestionBindings } = formsSlice.actions;