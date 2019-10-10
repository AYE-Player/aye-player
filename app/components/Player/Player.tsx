import * as React from "react";
import { Component } from "react";
import styled from "styled-components";

interface IProps {}

const Container = styled.div`
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  border-width: 2px 2px 2px 2px;
  border-style: solid;
  border-color: red;
`;

export default class Player extends Component<IProps> {
  props: IProps;

  render() {
    return (
      <Container>
        PLAYER
      </Container>
    );
  }
}
