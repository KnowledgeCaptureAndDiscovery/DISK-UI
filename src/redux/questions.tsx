import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Question, VariableOption } from "DISK/interfaces";

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
  options: OptionMap,
  initialized: boolean
}

interface PartialQuestionState {
  questions?: Question[],
  loadingAll?: boolean,
  errorAll?: boolean,
  options?: OptionMap
  initialized?: boolean
}

export const questionSlice = createSlice({
    name: 'question',
    initialState: {
        initialized: false,
        questions: [],
        loadingAll: false,
        errorAll: false,
        options: {},
    } as QuestionState,
    reducers: {
        setQuestions: (state:QuestionState, action: PayloadAction<Question[]>) => {
            let newState : PartialQuestionState = {
                questions: action.payload,
                loadingAll: false,
                errorAll: false,
                initialized: true
            }
            return  { ...state , ...newState };
        },
        setLoadingAll: (state:QuestionState) => {
            let newState : PartialQuestionState = {
                questions: [],
                loadingAll: true,
                errorAll: false,
            }
            return  { ...state , ...newState };
        },
        setErrorAll: (state:QuestionState) => {
            let newState : PartialQuestionState = {
                questions: [],
                loadingAll: false,
                errorAll: true,
            }
            return  { ...state , ...newState };
        },
        setOptions: (state:QuestionState, action:PayloadAction<{id:string, options:VariableOption[]}>) => {
            let newOpts : Option[] = []
            action.payload.options.forEach((opt:VariableOption) => 
                newOpts.push({id: opt.value, name:opt.label})
            );
            let newOptionMap : OptionMap = { ...state.options };
            newOptionMap[action.payload.id] = {
                values: newOpts,
                loading: false,
                error: false
            };
            return { ...state, options: newOptionMap };
        },
        setLoadingOptions: (state:QuestionState, action: PayloadAction<string>) => {
            let newOptionMap : OptionMap = { ...state.options };
            newOptionMap[action.payload] = {
                values: [],
                loading: true,
                error: false
            }
            return { ...state, options: newOptionMap };
        },
        setErrorOptions: (state:QuestionState, action: PayloadAction<string>) => {
            let newOptionMap : OptionMap = { ...state.options };
            newOptionMap[action.payload] = {
                values: [],
                loading: false,
                error: true
            }
            return { ...state, options: newOptionMap };
        }
    },
});

export const { setQuestions, setLoadingAll, setErrorAll, setOptions, setLoadingOptions, setErrorOptions } = questionSlice.actions;