import React from "react";
import { Component } from "react";
import styled from "styled-components";

interface IProps {}

const Container = styled.div`
  width: calc(100% - 320px);
  display: flex;
  position: absolute;
  margin: 10px;
  bottom: 0;
  right: 0;
`;

const MenuItem = styled.div`
  border-top: 1px solid #565f6c;
  height: 36px;
  justify-content: center;
  align-items: center;
  display: flex;
  flex: 1;
  &:nth-child(2n) {
    border-left: 1px solid #565f6c;
    border-right: 1px solid #565f6c;
  }
`;

export default class Navigation extends Component<IProps> {
  props: IProps;

  render() {
    return (
      <Container>
        <MenuItem>Search</MenuItem>
        <MenuItem>Playlist</MenuItem>
        <MenuItem>Account</MenuItem>
      </Container>
    );
  }
}
