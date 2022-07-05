import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LineOfInquiry } from "DISK/interfaces";

interface LOIsState {
  initialized: boolean,
  LOIs: LineOfInquiry[],
  loadingAll: boolean,
  errorAll: boolean,
  selectedId: string,
  selectedLOI: LineOfInquiry | null,
  loadingSelected: boolean,
  errorSelected: boolean
}

interface PartialLOIsState {
  initialized?: boolean,
  LOIs?: LineOfInquiry[],
  loadingAll?: boolean,
  errorAll?: boolean,
  selectedId?: string,
  selectedLOI?: LineOfInquiry | null,
  loadingSelected?: boolean,
  errorSelected?: boolean
}

export const loisSlice = createSlice({
  name: 'lois',
  initialState: {
    initialized: false,
    LOIs: [],
    loadingAll: false,
    errorAll: false,
    selectedId: "",
    selectedLOI: null,
    loadingSelected: false,
    errorSelected: false,
  } as LOIsState,
  reducers: {
    setLOIs: (state:LOIsState, action: PayloadAction<LineOfInquiry[]>) => {
      let newState  : PartialLOIsState = {
        LOIs: action.payload,
        initialized: true,
        loadingAll: false,
        errorAll: false,
      };
      return { ...state, ...newState };
    },
    setLoadingAll: (state:LOIsState) => {
      let newState  : PartialLOIsState = {
        loadingAll : true,
        errorAll : false,
        LOIs : [],
      };
      return { ...state, ...newState };
    },
    setErrorAll: (state:LOIsState) => {
      let newState  : PartialLOIsState = {
        errorAll : true,
        loadingAll : false,
        LOIs : [],
      };
      return { ...state, ...newState };
    },
    setSelectedLOI: (state:LOIsState, action:PayloadAction<LineOfInquiry|null>) => {
      let newState  : PartialLOIsState = {
        selectedLOI: action.payload,
        loadingSelected: false,
        errorSelected: false,
      }
      if (action.payload == null) {
        newState.selectedId = "";
      }

      return { ...state, ...newState };
    },
    setLoadingSelected: (state:LOIsState, action:PayloadAction<string>) => {
      let newState  : PartialLOIsState = {
        selectedId : action.payload,
        selectedLOI : null,
        loadingSelected : true,
        errorSelected : false,
      };
      return { ...state, ...newState };
    },
    setErrorSelected: (state:LOIsState) => {
      let newState  : PartialLOIsState = {
        selectedId : "",
        selectedLOI : null,
        loadingSelected : false,
        errorSelected : true,
      };
      return { ...state, ...newState };
    },
    remove: (state:LOIsState, action:PayloadAction<string>) => {
      let newHypothesisArr : LineOfInquiry[] = [];
      state.LOIs.forEach((loi:LineOfInquiry) => {
        if (loi.id !== action.payload) newHypothesisArr.push(loi);
      });
      return { ...state, LOIs: newHypothesisArr, selectedId: ""};
    },
    add: (state:LOIsState, action:PayloadAction<LineOfInquiry>) => {
      let newLineOfInquiryArr : LineOfInquiry[] = [];
      state.LOIs.forEach((loi:LineOfInquiry) => {
        if (loi.id !== action.payload.id) newLineOfInquiryArr.push(loi);
      });
      newLineOfInquiryArr.push(action.payload);
      return { ...state, LOIs: newLineOfInquiryArr, selectedId: ""};
    },
  },
});

export const { setLOIs, setLoadingAll, setErrorAll, setSelectedLOI, setLoadingSelected, setErrorSelected, add, remove } = loisSlice.actions;