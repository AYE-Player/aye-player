import * as React from "react";
import { Component } from "react";
import styled from "styled-components";

interface IProps {
  title: string;
  duration: string;
}

const Container = styled.div`
  height: 50px;
  width: 200px;
`;

export default class PlaylistEntity extends Component<IProps> {
  props: IProps;

  render() {
    return (
      <Container>
        {this.props.title} {this.props.duration}
      </Container>
    );
  }
}
