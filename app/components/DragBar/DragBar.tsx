import React from "react";
import { Component } from "react";
import styled from "styled-components";

interface IProps {}

const Container = styled.div`
  height: 20px;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  margin-top: -7px;
  
  -webkit-app-region: drag;
`;


export default class DragBar extends Component<IProps> {
  props: IProps;

  render() {
    return (
      <Container>
      </Container>
    );
  }
}
