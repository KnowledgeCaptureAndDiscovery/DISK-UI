import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BrainFiles {
  colors: {[id:string] : [number, number, number]},
  filename: {[id:string] : string},
  name: {[id:string] : string},
}

interface BrainState {
  initialized: boolean,
  filelist: BrainFiles | null,
  meshes: {[id:string]: string}
}

export const brainSlice = createSlice({
  name: 'brain',
  initialState: {
    initialized: false,
    filelist: null,
    meshes: {},
  } as BrainState,
  reducers: {
    setFilelist: (state:BrainState, action: PayloadAction<BrainFiles>) => {
      let cfg : BrainFiles = action.payload;
      let newState = { ...state };
      newState.filelist = cfg;
      newState.initialized = true;
      console.log("new state");
      return newState;
    },
    addMesh: (state:BrainState, action: PayloadAction<string[]>) => {
      if (action.payload && action.payload.length === 2) {
        let id = action.payload[0];
        let mesh = action.payload[1];
        let prev = { ...state.meshes };
        if (id && mesh)
          prev[id] = mesh;
        return {
          ...state,
          meshes: prev,
        }
      }
      return state;
    },
  },
});

export const { setFilelist, addMesh } = brainSlice.actions;