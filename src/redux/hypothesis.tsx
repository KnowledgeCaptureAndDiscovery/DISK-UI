import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Hypothesis } from "DISK/interfaces";

export const hypothesisSlice = createSlice({
  name: 'hypothesis',
  initialState: {
    hypotheses: [] as Hypothesis[],
    loadingAll: false,
    errorAll: false,
    selectedId: "",
    selectedHypothesis: null as Hypothesis | null,
    loadingSelected: false,
    errorSelected: false,
  },
  reducers: {
    setHypotheses: (state, action: PayloadAction<Hypothesis[]>) => {
      state.hypotheses = action.payload;
      state.loadingAll = false;
      state.errorAll = false;
    },
    setLoadingAll: (state) => {
      state.loadingAll = true;
      state.errorAll = false;
      state.hypotheses = [];
    },
    setErrorAll: (state) => {
      state.errorAll = true;
      state.loadingAll = false;
      state.hypotheses = [];
    },
    setSelectedHypothesis: (state, action:PayloadAction<Hypothesis|null>) => {
      state.selectedHypothesis = action.payload;
      state.loadingSelected = false;
      state.errorSelected = false;
      if (action.payload === null) {
        state.selectedId = "";
      }
    },
    setLoadingSelected: (state, action:PayloadAction<string>) => {
      state.selectedId = action.payload;
      state.selectedHypothesis = null;
      state.loadingSelected = true;
      state.errorSelected = false;
    },
    setErrorSelected: (state) => {
      state.selectedId = "";
      state.selectedHypothesis = null;
      state.loadingSelected = false;
      state.errorSelected = true;
    }
  },
});

export const { setHypotheses, setLoadingAll, setErrorAll, setSelectedHypothesis, setLoadingSelected, setErrorSelected } = hypothesisSlice.actions;