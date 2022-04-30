import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Question } from "DISK/interfaces";

export interface OptionMap {
    [id:string]: {
        values: string[][],
        loading: boolean, 
        error: boolean
    }
}

export const questionSlice = createSlice({
  name: 'question',
  initialState: {
    questions: [] as Question[],
    loadingAll: false,
    errorAll: false,
    options: {} as OptionMap
  },
  reducers: {
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
      state.loadingAll = false;
      state.errorAll = false;
    },
    setLoadingAll: (state) => {
      state.loadingAll = true;
      state.errorAll = false;
      state.questions = [];
    },
    setErrorAll: (state) => {
      state.errorAll = true;
      state.loadingAll = false;
      state.questions = [];
    },
    setOptions: (state, action:PayloadAction<{id:string, options:string[][]}>) => {
      state.options[action.payload.id] = {
          values: action.payload.options,
          loading: false,
          error: false
      }
    },
    setLoadingOptions: (state, action:PayloadAction<string>) => {
      state.options[action.payload] = {
          values: [],
          loading: true,
          error: false
      }
    },
    setErrorOptions: (state, action:PayloadAction<string>) => {
      state.options[action.payload] = {
          values: [],
          loading: false,
          error: true
      }
    }
  },
});

export const { setQuestions, setLoadingAll, setErrorAll, setOptions, setLoadingOptions, setErrorOptions } = questionSlice.actions;