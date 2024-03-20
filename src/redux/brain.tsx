import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BrainFiles {
  colors: {[id:string] : [number, number, number]},
  filename: {[id:string] : string},
  name: {[id:string] : string},
}

interface BrainState {
  loaded: boolean,
  fileList: BrainFiles | null,
  meshes: {[id:string]: string}
}

export const brainSlice = createSlice({
  name: 'brain',
  initialState: {
    loaded: false,
    fileList: null,
    meshes: {},
  } as BrainState,
  reducers: {
    setFileList: (state:BrainState, action: PayloadAction<BrainFiles>) => {
      let cfg : BrainFiles = action.payload;
      let newState = { ...state };
      newState.fileList = cfg;
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
    setFullyDone: (state:BrainState, action:PayloadAction<boolean>) => {
      return {
        ...state,
        loaded: action.payload
      }
    }
  },
});

export const { setFileList: setFileList, addMesh, setFullyDone } = brainSlice.actions;