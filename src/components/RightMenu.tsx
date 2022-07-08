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
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ScienceIcon from '@mui/icons-material/Science';
import SettingIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Link } from 'react-router-dom';
import { Link as MuiLink, Menu, MenuItem } from '@mui/material';
import { useLocation } from 'react-router-dom'
import { PATH_DATA, PATH_HOME, PATH_HYPOTHESES, PATH_HYPOTHESIS_ID_EDIT_RE, PATH_HYPOTHESIS_ID_RE, PATH_HYPOTHESIS_NEW, PATH_LOIS, PATH_LOI_ID_EDIT_RE, PATH_LOI_ID_RE, PATH_TERMINOLOGY, PATH_TLOIS } from 'constants/routes';
import { AccountCircle } from '@mui/icons-material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StorageIcon from '@mui/icons-material/Storage';

import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { Hypothesis, LineOfInquiry } from 'DISK/interfaces';
import { useKeycloak } from '@react-keycloak/web';
import { Button } from '@mui/material';
import { setToken } from 'redux/keycloak';
import { VERSION } from 'constants/config';

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
    case PATH_TERMINOLOGY:
      return <Box>Terminology</Box>
    case PATH_DATA:
      return <Box>Data</Box>
    default: {
      return <Box>{url}</Box>;
    }
  }
}

export default function MiniDrawer(props: { children: string | number | boolean | {} | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactNodeArray | React.ReactPortal | null | undefined; }) {
  const theme = useTheme();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { keycloak, initialized } = useKeycloak();
  const selectedHypothesis = useAppSelector((state:RootState) => state.hypotheses.selectedHypothesis);
  const selectedLOI = useAppSelector((state:RootState) => state.lois.selectedLOI);
  const username = useAppSelector((state:RootState) => state.keycloak.username);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const logoutDialogOpen = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

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
  }, [keycloak, initialized]); // eslint-disable-line react-hooks/exhaustive-deps

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
              <Typography sx={{fontWeight: inLocation(PATH_HYPOTHESES) || inLocation(PATH_TLOIS) ? 700 : 400}}>Hypotheses</Typography>
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

          <ListItemButton key={PATH_TERMINOLOGY} component={Link} to={PATH_TERMINOLOGY}
              sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5, }}>
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: inLocation(PATH_TERMINOLOGY) ? "mediumblue" : "cornflowerblue" }} >
              <MenuBookIcon />
            </ListItemIcon>
            <ListItemText  sx={{ opacity: open ? 1 : 0 }} primary={
              <Typography sx={{fontWeight: inLocation(PATH_TERMINOLOGY) ? 700 : 400}}>Terminology</Typography>
            }/>
          </ListItemButton>

          <ListItemButton key={PATH_DATA} component={Link} to={PATH_DATA}
              sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5, }}>
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: inLocation(PATH_DATA) ? "brown" : "tan" }} >
              <StorageIcon />
            </ListItemIcon>
            <ListItemText  sx={{ opacity: open ? 1 : 0 }} primary={
              <Typography sx={{fontWeight: inLocation(PATH_DATA) ? 700 : 400}}>Data</Typography>
            }/>
          </ListItemButton>
        </List>
        <Box sx={{height: "100%", display:"flex", justifyContent: "end", flexDirection: "column"}}>
          <Divider />
          <Box sx={{height: "50px", display: "flex", alignItems: "center"}}>
            <Box onClick={open ? undefined : (e) => keycloak && keycloak.authenticated ? setAnchorEl(e.currentTarget) : (keycloak ? keycloak.login() : undefined)}>
              <AccountCircle sx={{fontSize: "2em", margin: "0px 16px"}} color={keycloak && keycloak.authenticated ? 'success' : 'info'}/>
            </Box>
            {keycloak && !keycloak.authenticated &&
              (<Button onClick={() => keycloak.login()}>
                LOGIN
              </Button>)
            }
            {keycloak && keycloak.authenticated && username &&
              (<Box>
                <Button onClick={(e) =>  setAnchorEl(e.currentTarget)  } endIcon={<KeyboardArrowDownIcon/>}>
                  {username}
                </Button>
              </Box>)
            }
            <Menu open={logoutDialogOpen} anchorEl={anchorEl} onClose={() => setAnchorEl(null)} >
              <MenuItem disableRipple>
                <Button onClick={() => keycloak.logout()}>
                  <LogoutIcon/> LOGOUT
                </Button>
              </MenuItem>
            </Menu>
          </Box>
          <Divider />
          <Box>
            <Typography variant="body2" color="textSecondary" align="center">
              <MuiLink  underline="none" href={`https://github.com/KnowledgeCaptureAndDiscovery/DISK-WEB/releases`}>   v{VERSION} </MuiLink>
            </Typography>
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