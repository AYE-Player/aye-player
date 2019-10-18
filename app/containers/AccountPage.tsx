import React from "react";
import { Grid } from "@material-ui/core";
import styled from "styled-components";

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

export default class AccountPage extends React.Component {
  render() {
    return (
        <Grid container direction="column" style={{ height: "100%", margin: "10px" }}>
          <Header>Account Settings</Header>
        </Grid>
    );
  }
}
