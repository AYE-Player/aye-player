import { Grid } from "@material-ui/core";
import { useSnackbar } from "notistack";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import CustomButton from "../components/Customs/CustomButton";
import CustomTextField from "../components/Customs/CustomTextField";
import SnackMessage from "../components/Customs/SnackMessage";
import Divider from "../components/Divider";
import routes from "../constants/routes.json";
import RootStore from "../dataLayer/stores/RootStore";
import { validateEmail } from "../helpers/";
import useInject from "../hooks/useInject";
import AyeLogger from "../modules/AyeLogger";
import { LogType } from "../types/enums";

const Header = styled.div`
  font-size: 24px;
  padding-bottom: 8px;
`;

const RegisterPage: React.FunctionComponent = () => {
  const store = ({ user }: RootStore) => ({
    user
  });

  const { user } = useInject(store);

  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [password2, setPassword2] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [invalidEmail, setInvalidEmail] = React.useState(false);

  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    document.addEventListener("keypress", _handleKeyPress);

    return () => {
      document.removeEventListener("keypress", _handleKeyPress);
    };
  });

  const _handleKeyPress = async (event: any) => {
    if (event.key === "Enter" && name && email && password && password2) {
      _handleOnClick();
    }
  };

  const _handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const _handlePasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPassword(event.target.value);
  };

  const _handlePassword2Change = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPassword2(event.target.value);
  };

  const _handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);

    setInvalidEmail(!validateEmail(event.target.value));
  };

  const _handleOnClick = async (event?: React.MouseEvent) => {
    try {
      await user.register(name, email, password);
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage
            id={key}
            variant="success"
            message={t("RegisterPage.success")}
          />
        ),
        disableWindowBlurListener: true
      });
      window.location.href = `${window.location.href.split("#/")[0]}#${
        routes.LOGIN
      }`;
    } catch (error) {
      AyeLogger.player(`Error registering User ${error}`, LogType.ERROR);
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage id={key} variant="error" message={t("General.error")} />
        ),
        disableWindowBlurListener: true
      });
    }
  };

  const _passwordsMatch = () => {
    if (password.length < 8) {
      return t("RegisterPage.minLengthPassword");
    } else if (password !== password2 && password.length >= 8) {
      return t("RegisterPage.matchPassword");
    } else {
      return "";
    }
  };

  const _disableButton = () => {
    if (name === "" || password === "" || email === "" || invalidEmail) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="center"
      style={{ height: "100%" }}
    >
      <Header>Register</Header>
      <Divider size={2} />
      <CustomTextField
        label={t("RegisterPage.username")}
        id="username"
        onChange={_handleNameChange}
        key="username"
        type="text"
        required
      />
      <Divider size={2} />
      <CustomTextField
        label={t("RegisterPage.email")}
        id="email"
        onChange={_handleEmailChange}
        key="email"
        type="email"
        error={invalidEmail}
        required
      />
      <Divider size={2} />
      <CustomTextField
        label={t("RegisterPage.password")}
        id="password"
        onChange={_handlePasswordChange}
        key="password"
        type="password"
        error={password.length < 8 && password.length > 0}
        required
      />
      <Divider size={2} />
      <CustomTextField
        label={t("RegisterPage.repeatPassword")}
        id="password2"
        onChange={_handlePassword2Change}
        key="password2"
        type="password"
        helperText={_passwordsMatch()}
        error={
          (password2.length < 8 && password2.length > 0) ||
          password2 !== password
        }
        required
      />
      <Divider size={3} />
      <CustomButton
        onClick={_handleOnClick}
        disabled={_disableButton()}
        name={t("RegisterPage.registerButton")}
      />
    </Grid>
  );
};

export default RegisterPage;
