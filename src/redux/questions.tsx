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
        setLoadingOptions: (state, action: PayloadAction<string>) => {
            state.options[action.payload] = {
                values: [],
                loading: true,
                error: false
            }
        },
        setErrorOptions: (state, action: PayloadAction<string>) => {
            state.options[action.payload] = {
                values: [],
                loading: false,
                error: true
            }
        }
    },
});

export const { setQuestions, setLoadingAll, setErrorAll, setOptions, setLoadingOptions, setErrorOptions } = questionSlice.actions;