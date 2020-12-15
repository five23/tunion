import * as React from "react";
import {
  AppBar,
  Container,
  CssBaseline,
  Drawer,
  Grid,
  Paper,
  Toolbar,
  Typography,
  IconButton,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { Toggle } from "react-nexusui";
import Scope from "./Scope.tsx";
import Effects from "./Effects.tsx";
import Vco from "./Vco.tsx";

export default function Dashboard() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const [playing, setPlaying] = React.useState(false);

  const toggleAudio = (value) => {
    console.log(value);
    setPlaying(!playing);
  };

  return (
    <div>
      <CssBaseline />
      <AppBar position="absolute">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap>
            Dashboard
          </Typography>
          <Toggle size={[100, 30]} state={playing} onChange={toggleAudio} />
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <div>
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
      </Drawer>
      <main>
        <div />
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12} md={8} lg={9}>
              <Paper>
                <Vco />
              </Paper>
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
              <Paper>
                <Effects />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper>
                <Scope />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </main>
    </div>
  );
}
