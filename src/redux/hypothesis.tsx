import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Hypothesis } from "DISK/interfaces";

interface HypothesisState {
  hypotheses: Hypothesis[],
  loadingAll: boolean,
  errorAll: boolean,
  selectedId: string,
  selectedHypothesis: Hypothesis | null,
  loadingSelected: boolean,
  errorSelected: boolean
}

interface PartialHypothesisState {
  hypotheses?: Hypothesis[],
  loadingAll?: boolean,
  errorAll?: boolean,
  selectedId?: string,
  selectedHypothesis?: Hypothesis | null,
  loadingSelected?: boolean,
  errorSelected?: boolean
}

export const hypothesisSlice = createSlice({
  name: 'hypothesis',
  initialState: {
    hypotheses: [],
    loadingAll: false,
    errorAll: false,
    selectedId: "",
    selectedHypothesis: null,
    loadingSelected: false,
    errorSelected: false,
  } as HypothesisState,
  reducers: {
    setHypotheses: (state:HypothesisState, action: PayloadAction<Hypothesis[]>) => {
      let newState  : PartialHypothesisState = {
        hypotheses: action.payload,
        loadingAll: false,
        errorAll: false,
      };
      return { ...state, ...newState };
    },
    setLoadingAll: (state:HypothesisState) => {
      let newState  : PartialHypothesisState = {
        loadingAll : true,
        errorAll : false,
        hypotheses : [],
      };
      return { ...state, ...newState };
    },
    setErrorAll: (state:HypothesisState) => {
      let newState  : PartialHypothesisState = {
        errorAll : true,
        loadingAll : false,
        hypotheses : [],
      };
      return { ...state, ...newState };
    },
    setSelectedHypothesis: (state:HypothesisState, action:PayloadAction<Hypothesis|null>) => {
      let newState  : PartialHypothesisState = {
        selectedHypothesis: action.payload,
        loadingSelected: false,
        errorSelected: false,
      }
      if (action.payload == null) {
        newState.selectedId = "";
      }

      return { ...state, ...newState };
    },
    setLoadingSelected: (state:HypothesisState, action:PayloadAction<string>) => {
      let newState  : PartialHypothesisState = {
        selectedId : action.payload,
        selectedHypothesis : null,
        loadingSelected : true,
        errorSelected : false,
      };
      return { ...state, ...newState };
    },
    setErrorSelected: (state:HypothesisState) => {
      let newState  : PartialHypothesisState = {
        selectedId : "",
        selectedHypothesis : null,
        loadingSelected : false,
        errorSelected : true,
      };
      return { ...state, ...newState };
    }
  },
});

export const { setHypotheses, setLoadingAll, setErrorAll, setSelectedHypothesis, setLoadingSelected, setErrorSelected } = hypothesisSlice.actions;