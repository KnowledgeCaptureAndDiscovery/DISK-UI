import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { AppRouter } from 'AppRouter';
import Keycloak from 'keycloak-js';

// Setup Keycloak instance as needed
const keycloak = new Keycloak({
  url: 'https://auth.mint.isi.edu/auth',
  realm: 'production',
  clientId: 'mint-ui',
});

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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ReactKeycloakProvider authClient={keycloak}>
        <AppRouter/>
      </ReactKeycloakProvider>
    </ThemeProvider>
  );
}

export default App;
