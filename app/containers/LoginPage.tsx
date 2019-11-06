import { Grid } from "@material-ui/core";
import React from "react";
import styled from "styled-components";
import CustomButton from "../components/Customs/CustomButton/CustomButton";
import CustomTextField from "../components/Customs/CustomTextField/CustomTextField";
import Divider from "../components/Divider/Divider";
import SmallLink from "../components/Link/SmallLink";
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import { useTranslation } from "react-i18next";

const Header = styled.div`
  font-size: 24px;
  padding-bottom: 8px;
`;

const LoginPage: React.FunctionComponent<any> = () => {
  const { t } = useTranslation();

  const UserStore = ({ user }: RootStoreModel) => ({
    user
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
      <Header>{t("LoginPage.header")}</Header>
      <Divider size={2} />
      <CustomTextField
        label={t("LoginPage.username")}
        id="username"
        onChange={_handleNameChange}
        key="username"
        type="text"
      />
      <Divider size={2} />
      <CustomTextField
        label={t("LoginPage.password")}
        id="password"
        onChange={_handlePasswordChange}
        key="password"
        type="password"
      />
      <Divider size={3} />
      <CustomButton onClick={_handleOnClick} name={t("LoginPage.loginButton")} />
      <Divider size={3} />
      <SmallLink name={t("LoginPage.registerLink")} to="/register" />
      <Divider />
      <SmallLink name={t("LoginPage.forgotPasswordLink")} to="/passwordForgotten" />
    </Grid>
  );
};

export default LoginPage;
