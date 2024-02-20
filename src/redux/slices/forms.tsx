import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Question, QuestionVariableAssignation } from "DISK/interfaces";

export interface FormsState {
  selectedQuestion: Question | null,
  questionBindings: QuestionVariableAssignation,
}

export const formsSlice = createSlice({
  name: 'forms',
  initialState: {
    selectedQuestion: null,
    questionBindings: {}
  } as FormsState,
  reducers: {
    setSelectedQuestion: (state:FormsState, action: PayloadAction<Question>) => {
      // Pattern is optional 
      return { 
        ...state,
        selectedQuestion: action.payload
      };
    },
    setQuestionBindings: (state:FormsState, action: PayloadAction<QuestionVariableAssignation>) => {
      // Pattern is optional 
      return { 
        ...state,
        questionBindings: action.payload,
      };
    },
  },
});

export const { setQuestionBindings, setSelectedQuestion } = formsSlice.actions;