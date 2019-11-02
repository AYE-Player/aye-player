import { Button } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import AvatarUpload from "../components/Account/AvatarUpload/AvatarUpload";
import NewPassword from "../components/Account/NewPassword/NewPassword";
import CustomButton from "../components/Customs/CustomButton/CustomButton";
import CustomizedDialogs from "../components/Customs/CustomDialog/CustomDialog";
import Divider from "../components/Divider/Divider";
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import LoginPage from "./LoginPage";
import { useSnackbar } from "notistack";
import SnackMessage from "../components/Customs/SnackMessage/SnackMessage";

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

const AccountPage: React.FunctionComponent = () => {
  const UserStore = ({ user, playlists }: RootStoreModel) => ({
    user,
    playlists
  });

  const { user } = useInject(UserStore);

  const [password, setPassword] = React.useState("");
  const [password2, setPassword2] = React.useState("");
  const [avatar, setAvatar] = React.useState("");
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
  };

  const _handlePasswordChange2 = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPassword2(event.target.value);
  };

  const _updateUser = () => {
    try {
      console.log(password, password2, avatar);
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage id={key} variant="success" message="Update successfull" />
        )
      });
    } catch (error) {
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage
            id={key}
            variant="error"
            message="Something went wrong"
          />
        )
      });
    }
  };

  const _deleteUser = () => {
    user.delete();
    user.logout();
  };

  return user.isAuthenticated ? (
    <Container>
      <Header>Account Settings</Header>
      <SettingsContainer>
        Username: {user.name}
        <AvatarUpload avatar={avatar} setAvatar={setAvatar} user={user} />
        <Divider size={2} />
        <SettingsAligner>
          <NewPassword
            handlePasswordChange={_handlePasswordChange}
            handlePasswordChange2={_handlePasswordChange2}
          />
          <Divider size={2} />
          <CustomButton onClick={() => _updateUser()} name="Update" />
        </SettingsAligner>
        <Divider size={2} />
        <CustomizedDialogs
          confirmButtonText="Confirm Delete"
          title="Account Deletion"
          text="Do you really want to delete your Account? This action is irrevesible."
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
              width: "100px",
              padding: "0 16px",
              backgroundColor: "#DC143C",
              borderRadius: "5px"
            }}
            onClick={() => _handleDeleteClickOpen()}
          >
            Delete
          </Button>
        </CustomizedDialogs>
      </SettingsContainer>
    </Container>
  ) : (
    <LoginPage />
  );
};

export default observer(AccountPage);
