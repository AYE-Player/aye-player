import * as React from "react";
import { Component } from "react";
//import { Link } from "react-router-dom";
import Player from "./Player";
import Playlist from "./Playlist";
//const routes = require("../constants/routes.json");
import { Grid, Paper } from "@material-ui/core";

interface IProps {}

export default class Home extends Component<IProps> {
  props: IProps;

  render() {
    return (
      <Grid container data-tid="container">
        <Grid container direction="column" justify="center">
          <Grid item xs>
            <Player />
          </Grid>
          <Grid item xs>
            <Playlist />
          </Grid>
        </Grid>
        <Grid container direction="row" justify="center">
          <Grid item xs>
            <Paper>TEST</Paper>
          </Grid>
          <Grid item xs>
            <Paper>TEST</Paper>
          </Grid>
          <Grid item xs>
            <Paper>TEST</Paper>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
