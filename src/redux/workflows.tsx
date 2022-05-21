import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Method, MethodInput } from "DISK/interfaces";

interface WorkflowState {
  workflows: Method[],
  loadingAll: boolean,
  errorAll: boolean,
  inputs: {[workflowId:string]: MethodInput[]},
  loading: {[workflowId:string]: boolean},
  errored: {[workflowId:string]: boolean}
}

interface PartialWorkflowState {
  workflows?: Method[],
  loadingAll?: boolean,
  errorAll?: boolean,
  inputs?: {[workflowId:string]: MethodInput[]},
  loading?: {[workflowId:string]: boolean},
  errored?: {[workflowId:string]: boolean}
}

export interface inputArgs {
    id: string,
    values: MethodInput[]
}

export const workflowSlice = createSlice({
    name: 'workflow',
    initialState: {
        workflows: [],
        loadingAll: false,
        errorAll: false,
        inputs: {},
        loading: {},
        errored: {}
    } as WorkflowState,
    reducers: {
        setWorkflow: (state:WorkflowState, action: PayloadAction<Method[]>) => {
            let newState : PartialWorkflowState = {
                workflows: action.payload,
                loadingAll: false,
                errorAll: false
            }
            return { ...state, ...newState };
        },
        setLoadingAll: (state:WorkflowState) => {
            let newState : PartialWorkflowState = {
                workflows: [],
                loadingAll: true,
                errorAll: false
            }
            return { ...state, ...newState };
        },
        setErrorAll: (state:WorkflowState) => {
            let newState : PartialWorkflowState = {
                workflows: [],
                loadingAll: false,
                errorAll: true
            }
            return { ...state, ...newState };
        },
        setLoadingInput: (state:WorkflowState, action: PayloadAction<string>) => {
            let newLoading = { ...state.loading };
            let newErrored = { ...state.errored };
            let newInputs = { ...state.inputs };
            newLoading[action.payload] = true;
            newErrored[action.payload] = false;
            newInputs[action.payload] = [];
            return { ...state, loading: newLoading, errored: newErrored, inputs: newInputs };
        },
        setErrorInput: (state:WorkflowState, action: PayloadAction<string>) => {
            let newLoading = { ...state.loading };
            let newErrored = { ...state.errored };
            let newInputs = { ...state.inputs };
            newLoading[action.payload] = false;
            newErrored[action.payload] = true;
            newInputs[action.payload] = [];
            return { ...state, loading: newLoading, errored: newErrored, inputs: newInputs };
        },
        setInputs: (state:WorkflowState, action: PayloadAction<inputArgs>) => {
            let newLoading = { ...state.loading };
            let newErrored = { ...state.errored };
            let newInputs = { ...state.inputs };
            newLoading[action.payload.id] = false;
            newErrored[action.payload.id] = false;
            newInputs[action.payload.id] = action.payload.values;
            return { ...state, loading: newLoading, errored: newErrored, inputs: newInputs };
        },
    },
});

export const { setWorkflow, setLoadingAll, setErrorAll, setLoadingInput, setErrorInput, setInputs } = workflowSlice.actions;