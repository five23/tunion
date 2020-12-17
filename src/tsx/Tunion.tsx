import {
  AppBar,
  Button,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  Toolbar,
  Snackbar
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CloseIcon from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import clsx from 'clsx';
import React from 'react';
import { Harmonic } from '../js/harmonic';
import Audiopen from './Audiopen.tsx';
import Editor from './Editor.tsx';
import Effects from './Effects.tsx';
import Scopes from './Scopes.tsx';
import VcoBank from './VcoBank.tsx';

export const H = new Harmonic();
export const audioCtx = new (window.AudioContext ||
  window.webkitAudioContext)();
export const audiopen = new Audiopen(audioCtx);

declare const window: any;

window.H = H;
window.audiopen = audiopen;
window.audioCtx = audioCtx;

//import EjectIcon from '@material-ui/icons/Eject';
//import ReplayIcon from '@material-ui/icons/Replay';
//import Replay5Icon from '@material-ui/icons/Replay5';
//import Replay10Icon from '@material-ui/icons/Replay10';
//import Replay30Icon from '@material-ui/icons/Replay30';

const drawerWidth = 600;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: 36
  },
  menuButtonHidden: {
    display: 'none'
  },
  title: {
    flexGrow: 1
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: 0
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto'
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  paper: {
    padding: 0,
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column'
  },
  fixedHeight: {
    height: 240
  }
}));

/**
 * Tunion
 *
 * @export
 * @return {*}
 */
export default function Tunion() {
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [snackOpen, setSnackOpen] = React.useState(false);

  /**
   * handleDrawerOpen
   */
  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  /**
   * handleDrawerClose
   */
  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleSnackClose = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackOpen(false);
  };

  /**
   * toggleIsPlaying
   */
  const toggleIsPlaying = (): void => {
    if (!audiopen.isPlaying) {
      audiopen.isPlaying = true;
      if (audiopen.audioCtx.state === 'suspended') {
        audiopen.audioCtx.resume();
        console.log('audiopen => audioCtx => Resuming playback');
      }
    } else {
      if (audiopen.audioCtx.state !== 'suspended') {
        audiopen.audioCtx.suspend();
      }
      audiopen.isPlaying = false;
      console.log('audiopen => audioCtx => Suspending playback');
    }
  };

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, drawerOpen && classes.appBarShift)}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(
              classes.menuButton,
              drawerOpen && classes.menuButtonHidden
            )}
          >
            <MenuIcon />
          </IconButton>
          <IconButton color="inherit">
            <PlayCircleOutlineIcon onClick={toggleIsPlaying} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(
            classes.drawerPaper,
            !drawerOpen && classes.drawerPaperClose
          )
        }}
        open={drawerOpen}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <Editor />
        <Divider />
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <VcoBank />
        </Container>
        <Container maxWidth="lg" className={classes.container}>
          <Effects />
        </Container>
        <Container maxWidth="lg" className={classes.container}>
          <Scopes />
        </Container>
      </main>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        autoHideDuration={6000}
        onClose={handleSnackClose}
        message="Note archived"
        action={
          <React.Fragment>
            <Button color="secondary" size="small" onClick={handleDrawerClose}>
              UNDO
            </Button>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleDrawerClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </div>
  );
}
