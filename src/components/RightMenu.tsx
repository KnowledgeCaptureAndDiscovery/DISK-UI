import * as React from 'react';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import MenuIcon from '@mui/icons-material/Menu';
import ScienceIcon from '@mui/icons-material/Science';
import SettingIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom'
import { PATH_HOME, PATH_HYPOTHESES, PATH_HYPOTHESIS_ID_EDIT_RE, PATH_HYPOTHESIS_ID_RE, PATH_HYPOTHESIS_NEW, PATH_LOIS, PATH_LOI_ID_EDIT_RE, PATH_LOI_ID_RE } from 'constants/routes';
import { AccountCircle } from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { Hypothesis, LineOfInquiry } from 'DISK/interfaces';
import { useKeycloak } from '@react-keycloak/web';
import { Button } from '@mui/material';
import Keycloak from 'keycloak-js';
import { setToken } from 'redux/keycloak';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  [theme.breakpoints.up('md')]: {
    ...(open && {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  },
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
    [theme.breakpoints.down('md')]: {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }
  }),
);

const AutohideIconButton = styled(IconButton)(
  ({ theme }) => ({
    marginRight: 5,
    [theme.breakpoints.down('md')]: {
      display: 'unset',
    }
  }),
);

const MainBox = styled(Box)(
  ({ theme }) => ({
    flexGrow: 1,
    padding: '24px',
    [theme.breakpoints.up('lg')]: {
      maxWidth: '1090px',
      margin: 'auto',
    }
  }),
);


const renderTitle = (url:string, selectedHypothesis:Hypothesis|null, selectedLOI:LineOfInquiry|null) => {
  if (PATH_HYPOTHESIS_ID_RE.test(url)) {
    return <Box>Hypothesis: { selectedHypothesis ? selectedHypothesis.name : "..."}</Box>
  } else if (PATH_HYPOTHESIS_ID_EDIT_RE.test(url)) {
    return <Box>Editing hypothesis: { selectedHypothesis ? selectedHypothesis.name : "..."}</Box>
  } else if (PATH_LOI_ID_RE.test(url)) {
    return <Box>Line of Inquiry: { selectedLOI ? selectedLOI.name : "..."}</Box>
  } else if (PATH_LOI_ID_EDIT_RE.test(url)) {
    return <Box>Editing Line of Inquiry: { selectedLOI ? selectedLOI.name : "..."}</Box>
  }

  switch (url) {
    case PATH_HOME:
      return <Box>DISK Home</Box>;
    case PATH_HYPOTHESES:
      return <Box>Hypotheses</Box>;
    case PATH_HYPOTHESIS_NEW:
      return <Box>Creating new hypothesis</Box>;
    case PATH_LOIS:
      return <Box>Lines of Inquiry</Box>
    default: {
      return <Box>{url}</Box>;
    }
  }
}

export default function MiniDrawer(props: { children: string | number | boolean | {} | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactNodeArray | React.ReactPortal | null | undefined; }) {
  const theme = useTheme();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const selectedHypothesis = useAppSelector((state:RootState) => state.hypotheses.selectedHypothesis);
  const selectedLOI = useAppSelector((state:RootState) => state.lois.selectedLOI);
  const username = useAppSelector((state:RootState) => state.keycloak.username);
  const { keycloak, initialized } = useKeycloak();

  React.useEffect(() => {
  dispatch(setToken(
    (initialized && keycloak && keycloak.authenticated && keycloak.token && keycloak.tokenParsed) ?
      {
        token: keycloak.token,
        parsedToken: keycloak.tokenParsed,
      } : {
        token: "",
      }
  ));
  }, [keycloak, initialized]);

  const [open, setOpen] = React.useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const inLocation = (loc:string) => {
      return location.pathname.includes(loc);
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <AutohideIconButton color="inherit" aria-label="open drawer" onClick={handleDrawerOpen} edge="start"
            sx={{ ...(open && { display: 'none' }) }}>
            <MenuIcon />
          </AutohideIconButton>
          <Typography variant="h6" noWrap component="div">
            { renderTitle(location.pathname, selectedHypothesis, selectedLOI) }
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader sx={{justifyContent:"space-between"}}>
          <Box sx={{display:"inline-flex", alignItems:"center", textDecoration: 'unset'}} component={Link} to={PATH_HOME}>
            <img alt='DISK Logo' src='/logo256.png' style={{width:"auto", height: "38px", padding: "0 15px 0 5px"}} />
            <Typography variant='h4' sx={{display:"inline-block", fontWeight: 700, color: "gray"}} >DISK</Typography>
          </Box>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <ListItemButton  key={PATH_HYPOTHESES} component={Link} to={PATH_HYPOTHESES}
              sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5, }}>
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: inLocation(PATH_HYPOTHESES) ? "darkorange" : "orange" }} >
              <ScienceIcon />
            </ListItemIcon>
            <ListItemText disableTypography sx={{ opacity: open ? 1 : 0}} primary={
              <Typography sx={{fontWeight: inLocation(PATH_HYPOTHESES) ? 700 : 400}}>Hypotheses</Typography>
            }/>
          </ListItemButton>

          <ListItemButton key={PATH_LOIS} component={Link} to={PATH_LOIS}
              sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5, }}>
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: inLocation(PATH_LOIS) ? "darkgreen" : "green" }} >
              <SettingIcon />
            </ListItemIcon>
            <ListItemText  sx={{ opacity: open ? 1 : 0 }} primary={
              <Typography sx={{fontWeight: inLocation(PATH_LOIS) ? 700 : 400}}>Lines of Inquiry</Typography>
            }/>
          </ListItemButton>
        </List>
        <Box sx={{height: "100%", display:"flex", justifyContent: "end", flexDirection: "column"}}>
          <Divider />
          <Box sx={{height: "50px", display: "flex", alignItems: "center"}}>
            <AccountCircle sx={{fontSize: "2em", margin: "0px 16px"}}/>
            {keycloak && !keycloak.authenticated &&
              (<Button onClick={() => keycloak.login()}>
                LOGIN
              </Button>)
            }
            {keycloak && keycloak.authenticated && username &&
              (<Box>
                {username}
                <Button onClick={() => keycloak.logout()}>
                  LOGOUT
                </Button>
              </Box>)
            }
          </Box>
        </Box>
      </Drawer>

      <MainBox component="main">
        <DrawerHeader />
        { props.children }
      </MainBox>
    </Box>
  );
}