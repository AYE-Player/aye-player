import * as React from "react";
import { Component } from "react";
import { Row, Col } from "react-bootstrap";

interface IProps {}

export default class Player extends Component<IProps> {
  props: IProps;

  render() {
    return (
      <Row key="player" data-tid="player">
        <Col>
          <h2>PLAYER</h2>
        </Col>
      </Row>
    );
  }
}
