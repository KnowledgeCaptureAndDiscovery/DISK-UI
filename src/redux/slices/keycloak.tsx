import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Keycloak from "keycloak-js";
import { DISK } from "redux/apis/DISK";

interface KeycloakState {
    token?: string
    parsedToken?: Keycloak.KeycloakTokenParsed,
    username?: string,
    authenticated: boolean,
}

export interface KeycloakUserToken {
    token: string
    parsedToken?: Keycloak.KeycloakTokenParsed,
}

export const keycloakSlice = createSlice({
  name: 'keycloak',
  initialState: {
    token: undefined,
    parsedToken: undefined,
    username: undefined,
    authenticated: false
  } as KeycloakState,
  reducers: {
    setToken: (state:KeycloakState, action: PayloadAction<KeycloakUserToken>) => {
        let cur : KeycloakUserToken = action.payload;
        if (cur && cur.token && cur.parsedToken) {
            DISK.setToken(cur.token);
            let username : string = (cur.parsedToken as any)["preferred_username"];
            if (!username) username = (cur.parsedToken as any)["email"];
            if (!username) username = (cur.parsedToken as any)["azp"];
            return {
                token: cur.token,
                parsedToken: cur.parsedToken,
                username: username,
                authenticated: true,
            } as KeycloakState;
        }
        return {
            token:undefined,
            parsedToken:undefined,
            username:undefined,
            authenticated:false,
        } as KeycloakState;
    },
  },
});

export const { setToken } = keycloakSlice.actions;