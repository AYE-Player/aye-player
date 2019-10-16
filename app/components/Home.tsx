import React from "react";
import { Component } from "react";
import Player from "./Player/Player";
import Playlist from "./Playlist/Playlist";
import { Grid, Paper } from "@material-ui/core";
import DebugAddTrack from "./Debug/DebugAddTrack";

interface IProps {}

export default class Home extends Component<IProps> {
  props: IProps;

  render() {
    return (
      <Grid
        container
        direction="row"
        data-tid="container"
        style={{ height: "100vh" }}
      >
        <Grid
          container
          direction="column"
          justify="center"
          style={{ height: "100%" }}
          xs={2}
        >
          <Grid item xs={2}>
            <Playlist />
          </Grid>
          <Grid item xs={2}>
            <Player />
          </Grid>
        </Grid>
        <Grid container direction="row" xs={9} justify="center">
          <Grid item xs>
            <Paper>TEST</Paper>
          </Grid>
          <Grid item xs>
            <Paper>TEST</Paper>
            <DebugAddTrack />
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
