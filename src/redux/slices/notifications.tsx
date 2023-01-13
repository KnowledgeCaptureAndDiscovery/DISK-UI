import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SeverityLevel = 'error' | 'info' | 'success' | 'warning';

export interface NotificationState {
    open: boolean,
    severity: SeverityLevel,
    text: string,
}

export const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    open: false,
    severity: 'info',
    text: ''
  } as NotificationState,
  reducers: {
    openNotification: (state:NotificationState, action: PayloadAction<{severity:SeverityLevel, text:string}>) => {
      return { 
        open: true, severity: action.payload.severity, text: action.payload.text
      } as NotificationState;
    },
    closeNotification: (state:NotificationState, action: PayloadAction<void>) => {
      return {
        open: false, severity: 'info', text: ''
      } as NotificationState
    },
  },
});

export const { openNotification, closeNotification } = notificationSlice.actions;