import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LineOfInquiry } from "DISK/interfaces";

interface LOIsState {
  LOIs: LineOfInquiry[],
  loadingAll: boolean,
  errorAll: boolean,
  selectedId: string,
  selectedLOI: LineOfInquiry | null,
  loadingSelected: boolean,
  errorSelected: boolean
}

interface PartialLOIsState {
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
    }
  },
});

export const { setLOIs, setLoadingAll, setErrorAll, setSelectedLOI, setLoadingSelected, setErrorSelected } = loisSlice.actions;