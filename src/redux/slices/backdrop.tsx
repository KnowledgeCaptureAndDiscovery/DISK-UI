import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BackdropState {
    open: boolean,
}

export const backdropSlice = createSlice({
  name: 'backdrop',
  initialState: {
    open: false,
  } as BackdropState,
  reducers: {
    openBackdrop: (state:BackdropState, action: PayloadAction<void>) => {
      return { 
        open: true
      } as BackdropState;
    },
    closeBackdrop: (state:BackdropState, action: PayloadAction<void>) => {
      return {
        open: false
      } as BackdropState;
    },
  },
});

export const { openBackdrop, closeBackdrop } = backdropSlice.actions;