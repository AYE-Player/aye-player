import * as React from "react";
import { Component } from "react";
import styled from "styled-components";
import PlaylistEntity from "./PlaylistEntity";

interface IProps {}

const Container = styled.div`
  margin: 10px 10px;
`;

export default class Playlist extends Component<IProps> {
  props: IProps;

  render() {
    return (
      <Container>
        <PlaylistEntity title="NIghtcore" duration="2:22"></PlaylistEntity>
        <PlaylistEntity title="NIghtcore" duration="2:22"></PlaylistEntity>
        <PlaylistEntity title="NIghtcore" duration="2:22"></PlaylistEntity>
        <PlaylistEntity title="NIghtcore" duration="2:22"></PlaylistEntity>
        <PlaylistEntity title="NIghtcore" duration="2:22"></PlaylistEntity>
      </Container>
    );
  }
}
