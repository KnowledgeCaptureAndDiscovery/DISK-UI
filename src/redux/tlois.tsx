import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TriggeredLineOfInquiry } from "DISK/interfaces";

interface TLOIsState {
  TLOIs: TriggeredLineOfInquiry[],
  loadingAll: boolean,
  errorAll: boolean,
  selectedId: string,
  selectedTLOI: TriggeredLineOfInquiry | null,
  loadingSelected: boolean,
  errorSelected: boolean
}

interface PartialTLOIsState {
  TLOIs?: TriggeredLineOfInquiry[],
  loadingAll?: boolean,
  errorAll?: boolean,
  selectedId?: string,
  selectedTLOI?: TriggeredLineOfInquiry | null,
  loadingSelected?: boolean,
  errorSelected?: boolean
}

export const tloisSlice = createSlice({
  name: 'lois',
  initialState: {
    TLOIs: [],
    loadingAll: false,
    errorAll: false,
    selectedId: "",
    selectedTLOI: null,
    loadingSelected: false,
    errorSelected: false,
  } as TLOIsState,
  reducers: {
    setTLOIs: (state:TLOIsState, action: PayloadAction<TriggeredLineOfInquiry[]>) => {
      let newState  : PartialTLOIsState = {
        TLOIs: action.payload,
        loadingAll: false,
        errorAll: false,
      };
      return { ...state, ...newState };
    },
    setLoadingAll: (state:TLOIsState) => {
      let newState  : PartialTLOIsState = {
        loadingAll : true,
        errorAll : false,
        TLOIs : [],
      };
      return { ...state, ...newState };
    },
    setErrorAll: (state:TLOIsState) => {
      let newState  : PartialTLOIsState = {
        errorAll : true,
        loadingAll : false,
        TLOIs : [],
      };
      return { ...state, ...newState };
    },
    setSelectedTLOI: (state:TLOIsState, action:PayloadAction<TriggeredLineOfInquiry|null>) => {
      let newState  : PartialTLOIsState = {
        selectedTLOI: action.payload,
        loadingSelected: false,
        errorSelected: false,
      }
      if (action.payload == null) {
        newState.selectedId = "";
      }

      return { ...state, ...newState };
    },
    setLoadingSelected: (state:TLOIsState, action:PayloadAction<string>) => {
      let newState  : PartialTLOIsState = {
        selectedId : action.payload,
        selectedTLOI : null,
        loadingSelected : true,
        errorSelected : false,
      };
      return { ...state, ...newState };
    },
    setErrorSelected: (state:TLOIsState) => {
      let newState  : PartialTLOIsState = {
        selectedId : "",
        selectedTLOI : null,
        loadingSelected : false,
        errorSelected : true,
      };
      return { ...state, ...newState };
    }
  },
});

export const { setTLOIs, setLoadingAll, setErrorAll, setSelectedTLOI, setLoadingSelected, setErrorSelected } = tloisSlice.actions;