import React from "react";
import { Grid, FormControl, InputLabel, Input, withStyles } from "@material-ui/core";
import styled from "styled-components";

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const Divider = styled.div`
  height: 16px;
  color: #fbfbfb;
`;

const PrettyInput = withStyles({
  root: {
    color: "#3f51b5",
  },
})(Input);

const LoginPage: React.FunctionComponent<any> = () => {
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");

  const _handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const _handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  return (
    <Grid
      container
      direction="column"
      style={{ height: "100%", margin: "10px" }}
    >
      <Header>Login</Header>
      <FormControl>
        <InputLabel htmlFor="username">Username</InputLabel>
        <PrettyInput id="username" style={{ color: "fbfbfb"}} value={name} onChange={_handleNameChange} />
      </FormControl>
      <Divider/>
      <FormControl>
        <InputLabel htmlFor="password">Password</InputLabel>
        <PrettyInput id="password" type="password" value={password} onChange={_handlePasswordChange} />
      </FormControl>
    </Grid>
  );
};

export default LoginPage;
