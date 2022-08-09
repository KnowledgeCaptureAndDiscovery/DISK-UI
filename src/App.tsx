import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { AppRouter } from "AppRouter";
import { Provider } from "react-redux";
import { useAppDispatch } from "redux/hooks";
import { setToken } from "redux/keycloak";
import { store } from "redux/store";
import keycloak from "./keycloak";

// Theme
const theme = createTheme({
  /*palette: {
    primary: {
      light: "#6fbf73",
      main: "#4caf50",
      dark: "#357a38",
    },
    secondary: {
      light: "#ffcf33",
      main: "#ffc400",
      dark: "#b28900",
    },
  },*/
});

function App() {
  const dispatch = useAppDispatch();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <ReactKeycloakProvider
          authClient={keycloak}
          onTokens={({ token }) => {
            dispatch(
              setToken(
                keycloak &&
                  keycloak.authenticated &&
                  keycloak.token &&
                  keycloak.tokenParsed
                  ? {
                      token: keycloak.token,
                      parsedToken: keycloak.tokenParsed,
                    }
                  : {
                      token: "",
                    }
              )
            );
          }}
        >
          <AppRouter />
        </ReactKeycloakProvider>
      </Provider>
    </ThemeProvider>
  );
}

export default App;
