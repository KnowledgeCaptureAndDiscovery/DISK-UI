import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ServerState {
  endpoints: {[name:string]: string} | null,
  loadingEndpoints: boolean,
  errorEndpoints: boolean
}

interface PartialServerState {
  endpoints?: {[name:string]: string} | null, 
  loadingEndpoints?: boolean,
  errorEndpoints?: boolean
}

export const serverSlice = createSlice({
  name: 'server',
  initialState: {
    endpoints: null,
    loadingEndpoints: false,
    errorEndpoints: false,
  } as ServerState,
  reducers: {
    setEndpoint: (state:ServerState, action: PayloadAction<{[name:string]: string}>) => {
      let newState  : PartialServerState = {
        endpoints: action.payload,
        loadingEndpoints: false,
        errorEndpoints: false,
      };
      return { ...state, ...newState };
    },
    setLoadingEndpoints: (state:ServerState) => {
      let newState  : PartialServerState = {
        loadingEndpoints: true,
        errorEndpoints : false,
        endpoints: null
      };
      return { ...state, ...newState };
    },
    setErrorEndpoint: (state:ServerState) => {
      let newState  : PartialServerState = {
        loadingEndpoints: false,
        errorEndpoints : true,
        endpoints: null
      };
      return { ...state, ...newState };
    },
  },
});

export const { setEndpoint, setErrorEndpoint, setLoadingEndpoints } = serverSlice.actions;