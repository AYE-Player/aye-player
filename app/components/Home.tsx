import * as React from "react";
import { Component } from "react";
//import { Link } from "react-router-dom";
import Player from "./Player";
import Playlist from "./Playlist";
//const routes = require("../constants/routes.json");
import { Container } from "react-bootstrap";

interface IProps {};

export default class Home extends Component<IProps> {
  props: IProps;

  render() {
    return (
      <Container data-tid="container">
        <Player/>
        <Playlist/>
      </Container>
    );
  }
}
