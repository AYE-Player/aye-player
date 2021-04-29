import { Grid } from "@material-ui/core";
import { useSnackbar } from "notistack";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import CustomButton from "../components/Customs/CustomButton";
import CustomTextField from "../components/Customs/CustomTextField";
import SnackMessage from "../components/Customs/SnackMessage";
import Divider from "../components/Divider";
import { useStore } from "../components/StoreProvider";
import { validateEmail } from "../helpers";
import AyeLogger from "../modules/AyeLogger";
import { LogType } from "../types/enums";

const Header = styled.div`
  font-size: 24px;
  padding-bottom: 8px;
`;

const PasswordForgotPage: React.FunctionComponent = () => {
  const { user } = useStore();

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
    if (event.key === "Enter" && email) {
      _handleOnClick();
    }
  };

  const _handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);

    setInvalidEmail(!validateEmail(event.target.value));
  };

  const _handleOnClick = (event?: React.MouseEvent) => {
    try {
      user.forgotPassword(email);
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage
            id={key}
            variant="info"
            message={t("PasswordForgotPage.success")}
          />
        ),
        disableWindowBlurListener: true
      });
    } catch (error) {
      AyeLogger.player(
        `Failed to start password reset process ${JSON.stringify(
          error,
          null,
          2
        )}`,
        LogType.ERROR
      );
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage id={key} variant="error" message={t("General.error")} />
        ),
        disableWindowBlurListener: true
      });
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
      <Header>{t("PasswordForgotPage.header")}</Header>
      <Divider size={2} />
      {t("PasswordForgotPage.text")}
      <Divider size={2} />
      <CustomTextField
        label={t("PasswordForgotPage.textfield.label")}
        id="email"
        onChange={_handleEmailChange}
        key="email"
        type="email"
        error={invalidEmail}
        required
      />
      <Divider size={3} />
      <CustomButton
        onClick={_handleOnClick}
        name={t("PasswordForgotPage.resetButton.name")}
      />
    </Grid>
  );
};

export default PasswordForgotPage;
