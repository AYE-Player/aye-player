import React from "react";
import { Component } from "react";
import Player from "./Player/Player";
import Playlist from "./Playlist/Playlist";
import { Grid } from "@material-ui/core";
import Navigation from "./Navigation/Navigation";
import DragBar from "./DragBar/DragBar";

interface IProps {}

export default class Home extends Component<IProps> {
  props: IProps;

  render() {
    return (
      <>
        <DragBar />
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
            xs={3}
          >
            <Playlist />
            <Player />
          </Grid>
          <Grid container direction="row" xs={9} justify="center">
            <Grid item xs>
              <Navigation />
            </Grid>
          </Grid>
        </Grid>
      </>
    );
  }
}
