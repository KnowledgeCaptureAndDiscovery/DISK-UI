import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { ReactKeycloakProvider } from '@react-keycloak/web';
//import { UserContextProvider } from 'redux/UserContext';
import { AppRouter } from 'AppRouter';
import { Provider } from 'react-redux';
import { store } from 'redux/store';
import keycloak from "./keycloak";
// Setup Keycloak instance as needed

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

/*const eventLogger = (event: unknown, error: unknown) => {
  console.log('onKeycloakEvent', event, error)
}

const tokenLogger = (tokens: unknown) => {
  console.log('onKeycloakTokens', tokens)
}*/

/*
        <ReactKeycloakProvider authClient={keycloak}
              onEvent={eventLogger}
              onTokens={tokenLogger}>
        </ReactKeycloakProvider>
 */

function App() {
  const eventLogger = (e:any) => {
    console.log("1>", e);
  }

  const tokenLogger = (e:any) => {
    console.log("2>", e);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <ReactKeycloakProvider authClient={keycloak}
              onEvent={eventLogger}
              onTokens={tokenLogger}>
          <AppRouter/>
        </ReactKeycloakProvider>
      </Provider>
    </ThemeProvider>
  );
}

export default App;
