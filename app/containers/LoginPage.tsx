import React from "react";
import styled from "styled-components";
import { Grid } from "@material-ui/core";

import CustomTextField from "../components/Customs/CustomTextField/CustomTextField";
import Divider from "../components/Divider/Divider";
import CustomButton from "../components/Customs/CustomButton/CustomButton";
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import SmallLink from "../components/Link/SmallLink";

const Header = styled.div`
  font-size: 24px;
  padding-bottom: 8px;
`;

const LoginPage: React.FunctionComponent<any> = () => {
  const UserStore = ({ user }: RootStoreModel) => ({
    user: user
  });

  const { user } = useInject(UserStore);

  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");

  const _handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const _handlePasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPassword(event.target.value);
  };

  const _handleOnClick = (event: React.MouseEvent) => {
    user.authenticate(name, password);
  };

  return (
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="center"
      style={{ height: "100%" }}
    >
      <Header>Login</Header>
      <Divider size={2} />
      <CustomTextField
        label="Username"
        id="username"
        onChange={_handleNameChange}
        key="username"
        type="text"
      />
      <Divider size={2} />
      <CustomTextField
        label="Password"
        id="password"
        onChange={_handlePasswordChange}
        key="password"
        type="password"
      />
      <Divider size={3} />
      <CustomButton onClick={_handleOnClick} name="Login" />
      <Divider size={3} />
      <SmallLink name="Need an account?" to="/register" />
      <Divider />
      <SmallLink name="Forgot password?" to="/passwordForgotten" />
    </Grid>
  );
};

export default LoginPage;
