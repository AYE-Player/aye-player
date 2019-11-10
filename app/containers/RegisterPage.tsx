import { Grid } from "@material-ui/core";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import CustomButton from "../components/Customs/CustomButton/CustomButton";
import CustomTextField from "../components/Customs/CustomTextField/CustomTextField";
import SnackMessage from "../components/Customs/SnackMessage/SnackMessage";
import Divider from "../components/Divider/Divider";
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import { debounce, validateEmail } from "../helpers/";
import useInject from "../hooks/useInject";

const Header = styled.div`
  font-size: 24px;
  padding-bottom: 8px;
`;

const RegisterPage: React.FunctionComponent<any> = () => {
  const UserStore = ({ user }: RootStoreModel) => ({
    user
  });

  const { user } = useInject(UserStore);

  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [password2, setPassword2] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [invalidEmail, setInvalidEmail] = React.useState(false);

  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

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

    debounce(setInvalidEmail(!validateEmail(event.target.value)), 500);
  };

  const _handleOnClick = async (event: React.MouseEvent) => {
    try {
      await user.register(name, email, password);
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage
            id={key}
            variant="success"
            message={t("RegisterPage.success")}
          />
        )
      });
    } catch (error) {
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage
            id={key}
            variant="error"
            message={t("RegisterPage.error")}
          />
        )
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
        error={password.length < 8 && password.length > 0 ? true : false}
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
            ? true
            : false
        }
        required
      />
      <Divider size={2} />
      <CustomButton
        onClick={_handleOnClick}
        disabled={_disableButton()}
        name={t("RegisterPage.registerButton")}
      />
    </Grid>
  );
};

export default RegisterPage;
