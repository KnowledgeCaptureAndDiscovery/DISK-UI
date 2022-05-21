import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Question } from "DISK/interfaces";

export interface Option {
    id:string,
    name:string
}

export interface OptionMap {
    [id:string]: {
        values: Option[],
        loading: boolean, 
        error: boolean
    }
}

interface QuestionState {
  questions: Question[],
  loadingAll: boolean,
  errorAll: boolean,
  options: OptionMap
}

export const questionSlice = createSlice({
    name: 'question',
    initialState: {
        questions: [],
        loadingAll: false,
        errorAll: false,
        options: {},
    } as QuestionState,
    reducers: {
        setQuestions: (state:QuestionState, action: PayloadAction<Question[]>) => {
            state.questions = action.payload;
            state.loadingAll = false;
            state.errorAll = false;
        },
        setLoadingAll: (state:QuestionState) => {
            state.loadingAll = true;
            state.errorAll = false;
            state.questions = [];
        },
        setErrorAll: (state:QuestionState) => {
            state.errorAll = true;
            state.loadingAll = false;
            state.questions = [];
        },
        setOptions: (state:QuestionState, action:PayloadAction<{id:string, options:string[][]}>) => {
            let newOpts : Option[] = []
            action.payload.options.forEach((opt:string[]) => 
                newOpts.push({id: opt[0], name:opt[1]})
            );
            state.options[action.payload.id] = {
                values: newOpts,
                loading: false,
                error: false
            }
        },
        setLoadingOptions: (state:QuestionState, action: PayloadAction<string>) => {
            state.options[action.payload] = {
                values: [],
                loading: true,
                error: false
            }
        },
        setErrorOptions: (state:QuestionState, action: PayloadAction<string>) => {
            state.options[action.payload] = {
                values: [],
                loading: false,
                error: true
            }
        }
    },
});

export const { setQuestions, setLoadingAll, setErrorAll, setOptions, setLoadingOptions, setErrorOptions } = questionSlice.actions;