import * as React from "react";
import { Component } from "react";
import styled from "styled-components";

interface IProps {}

const Container = styled.div`
  width: 200px;
  height: 30px;
  display: flex;
  margin-bottom: 5px;
  justify-content: center;
  border-width: 2px 2px 2px 2px;
  border-style: solid;
  border-color: grey;
`;

export default class PlayerControls extends Component<IProps> {
  props: IProps;

  render() {
    return (
      <Container>
        PLAYERCONTROLS
      </Container>
    );
  }
}
