import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DataEndpoint, Vocabularies } from "DISK/interfaces";

interface ServerState {
  endpoints: DataEndpoint[],
  loadingEndpoints: boolean,
  errorEndpoints: boolean,
  initializedEndpoints: boolean,

  vocabularies: Vocabularies | null,
  loadingVocabularies: boolean,
  errorVocabularies: boolean,
  initializedVocabularies: boolean,
}

interface PartialServerState {
  endpoints?: DataEndpoint[],
  loadingEndpoints?: boolean,
  errorEndpoints?: boolean,
  initializedEndpoints?: boolean,
  vocabularies?: Vocabularies | null,
  loadingVocabularies?: boolean,
  errorVocabularies?: boolean,
  initializedVocabularies?: boolean,
}

export const serverSlice = createSlice({
  name: 'server',
  initialState: {
    endpoints: [],
    loadingEndpoints: false,
    errorEndpoints: false,
    initializedEndpoints: false,

    vocabularies: null,
    loadingVocabularies: false,
    errorVocabularies: false,
    initializedVocabularies: false,
  } as ServerState,
  reducers: {
    setEndpoint: (state:ServerState, action: PayloadAction<DataEndpoint[]>) => {
      let newState  : PartialServerState = {
        endpoints: action.payload,
        loadingEndpoints: false,
        errorEndpoints: false,
        initializedEndpoints: true,
      };
      return { ...state, ...newState };
    },
    setLoadingEndpoints: (state:ServerState) => {
      let newState  : PartialServerState = {
        loadingEndpoints: true,
        errorEndpoints : false,
        endpoints: []
      };
      return { ...state, ...newState };
    },
    setErrorEndpoint: (state:ServerState) => {
      let newState  : PartialServerState = {
        loadingEndpoints: false,
        errorEndpoints : true,
        endpoints: []
      };
      return { ...state, ...newState };
    },
    setVocabularies: (state:ServerState, action: PayloadAction<Vocabularies>) => {
      let newState  : PartialServerState = {
        vocabularies: action.payload,
        loadingVocabularies: false,
        errorVocabularies: false,
        initializedVocabularies: true,
      };
      return { ...state, ...newState };
    },
    setLoadingVocabularies: (state:ServerState) => {
      let newState  : PartialServerState = {
        loadingVocabularies: true,
        errorVocabularies : false,
        vocabularies: null
      };
      return { ...state, ...newState };
    },
    setErrorVocabularies: (state:ServerState) => {
      let newState  : PartialServerState = {
        loadingVocabularies: false,
        errorVocabularies : true,
        vocabularies: null
      };
      return { ...state, ...newState };
    },
  },
});

export const { setEndpoint, setErrorEndpoint, setLoadingEndpoints, setVocabularies, setErrorVocabularies, setLoadingVocabularies } = serverSlice.actions;