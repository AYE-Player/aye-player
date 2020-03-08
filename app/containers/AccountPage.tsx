import { Button } from "@material-ui/core";
import AyeLogger from "../modules/AyeLogger";
import { LogType } from "../types/enums";
import { observer } from "mobx-react-lite";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import AvatarUpload from "../components/Account/AvatarUpload";
import NewPassword from "../components/Account/NewPassword";
import CustomButton from "../components/Customs/CustomButton";
import CustomizedDialogs from "../components/Customs/CustomDialog";
import SnackMessage from "../components/Customs/SnackMessage";
import Divider from "../components/Divider";
import RootStore from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import LoginPage from "./LoginPage";

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
`;

const Container = styled.div``;

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px;
`;

const SettingsAligner = styled.div`
  width: 400px;
`;

const AvatarInfoText = styled.div`
  margin-top: 8px;
  font-size: 14px;
`;

const AccountPage: React.FunctionComponent = () => {
  const { t } = useTranslation();

  const store = ({ user, player, playlists }: RootStore) => ({
    user,
    player,
    playlists
  });

  const { user, player, playlists } = useInject(store);

  const [password, setPassword] = React.useState("");
  const [password2, setPassword2] = React.useState("");
  const [passwordsMatch, setPasswordsMatch] = React.useState(false);
  const [passwordsMatchText, setPasswordsMatchText] = React.useState("");
  const [avatar, setAvatar] = React.useState("");
  const [avatarFile, setAvatarFile] = React.useState<File>(null);
  const [open, setOpen] = React.useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const _handleDeleteClickOpen = () => {
    setOpen(true);
  };
  const _handleDeleteClose = () => {
    setOpen(false);
  };
  const _handleDeleteConfirmClose = () => {
    setOpen(false);
    _deleteUser();
  };

  const _handlePasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPassword(event.target.value);
    _checkPasswordsMatch(event.target.value, password2);
  };

  const _handlePasswordChange2 = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPassword2(event.target.value);
    _checkPasswordsMatch(password, event.target.value);
  };

  const _checkPasswordsMatch = (pass1: string, pass2: string) => {
    if (pass1.length < 8 && pass2.length > 0) {
      setPasswordsMatchText(t("RegisterPage.minLengthPassword"));
      setPasswordsMatch(false);
    } else if (pass1 !== pass2 && pass1.length >= 8 && pass2.length > 0) {
      setPasswordsMatchText(t("RegisterPage.matchPassword"));
      setPasswordsMatch(false);
    } else {
      setPasswordsMatchText("");
      setPasswordsMatch(true);
    }
  };

  const _updateUser = async () => {
    try {
      if (passwordsMatch && avatar) {
        await user.updatePassword(password);
        await user.updateAvatar(avatarFile);
      } else if (avatar) {
        await user.updateAvatar(avatarFile);
      } else if (passwordsMatch) {
        await user.updatePassword(password);
      }

      if (password || password2) {
        setPassword("");
        setPassword2("");
      }

      enqueueSnackbar("", {
        content: key => (
          <SnackMessage
            id={key}
            variant="success"
            message={t("AccountPage.updateSuccessMessage")}
          />
        )
      });
    } catch (error) {
      AyeLogger.player(`Error updating User ${error}`, LogType.ERROR);
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage id={key} variant="error" message={t("General.error")} />
        )
      });
    }
  };

  const _deleteUser = () => {
    try {
      user.delete();
      user.logout();
      player.setCurrentPlaylist(undefined);
      playlists.clear();

      enqueueSnackbar("", {
        content: key => (
          <SnackMessage id={key} variant="success" message={t("AccountPage.deleteSuccess")} />
        )
      });
    } catch (error) {
      AyeLogger.player(`Error deleting User ${error}`, LogType.ERROR);
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage id={key} variant="error" message={t("General.error")} />
        )
      });
    }
  };

  return user.isAuthenticated ? (
    <Container>
      <Header>{t("AccountPage.header")}</Header>
      <SettingsContainer>
        <div>
          {t("AccountPage.username")}: {user.name}
        </div>
        <Divider size={2} />
        <div>
          {t("AccountPage.email")}: {user.email}
        </div>
        <Divider size={3} />
        <AvatarUpload
          avatar={avatar}
          setAvatar={setAvatar}
          user={user}
          setAvatarFile={setAvatarFile}
        />
        <AvatarInfoText>max. size 2MB</AvatarInfoText>
        <Divider size={2} />
        <SettingsAligner>
          <NewPassword
            handlePasswordChange={_handlePasswordChange}
            handlePasswordChange2={_handlePasswordChange2}
            passwordsMatch={passwordsMatchText}
          />
          <Divider size={2} />
          <CustomButton onClick={() => _updateUser()} name="Update" />
        </SettingsAligner>
        <Divider size={2} />
        <CustomizedDialogs
          confirmButtonText={t("AccountPage.deleteDialog.confirmButton")}
          title={t("AccountPage.deleteDialog.title")}
          text={t("AccountPage.deleteDialog.text")}
          open={open}
          handleConfirmClose={_handleDeleteConfirmClose}
          handleClose={_handleDeleteClose}
          handleClickOpen={_handleDeleteClickOpen}
          onConfirm={() => _deleteUser()}
        >
          <Button
            variant="contained"
            color="secondary"
            style={{
              height: "40px",
              width: "140px",
              padding: "0 16px",
              backgroundColor: "#DC143C",
              borderRadius: "5px"
            }}
            onClick={() => _handleDeleteClickOpen()}
          >
            {t("AccountPage.deleteButton")}
          </Button>
        </CustomizedDialogs>
      </SettingsContainer>
    </Container>
  ) : (
    <LoginPage />
  );
};

export default observer(AccountPage);
