import React from "react";
import { Grid } from "@material-ui/core";
import Routes from "../Routes";
import Navigation from "../components/Navigation/Navigation";

export default class MainPage extends React.Component {
  render() {
    return (
      <Grid>
        <Routes />
        <Grid item xs>
          <Navigation />
        </Grid>
      </Grid>
    );
  }
}
