import * as React from "react";
import { Component } from "react";
import { Row, Col } from "react-bootstrap";

interface IProps {}


export default class Playlist extends Component<IProps> {
  props: IProps;

  render() {
    return (
      <Row key="playlist" data-tid="playlist">
        <Col>PLAYLIST</Col>
        <Col>HELLO</Col>
        <Col>Hello2</Col>
      </Row>
    );
  }
}
