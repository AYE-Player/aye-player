import { Button } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Channel } from '../../types/enums';
import AvatarUpload from '../components/Account/AvatarUpload';
import NewPassword from '../components/Account/NewPassword';
import CustomButton from '../components/Customs/CustomButton';
import CustomizedDialogs from '../components/Customs/CustomDialog';
import SnackMessage from '../components/Customs/SnackMessage';
import Divider from '../components/Divider';
import LoginPage from './LoginPage';
import { useStore } from '../components/StoreProvider';

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
  const { user, player, playlists } = useStore();
  const [oldPassword, setOldPassword] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [password2, setPassword2] = React.useState('');
  const [passwordsMatch, setPasswordsMatch] = React.useState(false);
  const [passwordsMatchText, setPasswordsMatchText] = React.useState('');
  const [avatar, setAvatar] = React.useState('');
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [open, setOpen] = React.useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const deleteUser = () => {
    try {
      user.delete();
      user.logout();
      player.setCurrentPlaylist(undefined);
      playlists.clear();

      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="success"
            message={t('AccountPage.deleteSuccess')}
          />
        ),
        disableWindowBlurListener: true,
      });
    } catch (error) {
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `Error deleting User ${error}`,

        type: 'error',
      });
      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage id={key} variant="error" message={t('General.error')} />
        ),
        disableWindowBlurListener: true,
      });
    }
  };

  const checkPasswordsMatch = (pass1: string, pass2: string) => {
    if (pass1.length < 8 && pass2.length > 0) {
      setPasswordsMatchText(t('RegisterPage.minLengthPassword'));
      setPasswordsMatch(false);
    } else if (pass1 !== pass2 && pass1.length >= 8 && pass2.length > 0) {
      setPasswordsMatchText(t('RegisterPage.matchPassword'));
      setPasswordsMatch(false);
    } else {
      setPasswordsMatchText('');
      setPasswordsMatch(true);
    }
  };

  const handleDeleteClickOpen = () => {
    setOpen(true);
  };
  const handleDeleteClose = () => {
    setOpen(false);
  };
  const handleDeleteConfirmClose = () => {
    setOpen(false);
    deleteUser();
  };

  const handleOldPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setOldPassword(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    checkPasswordsMatch(event.target.value, password2);
  };

  const handlePasswordChange2 = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPassword2(event.target.value);
    checkPasswordsMatch(password, event.target.value);
  };

  const updateUser = async () => {
    try {
      if (passwordsMatch && avatar) {
        await user.updatePassword(password, oldPassword);
        await user.updateAvatar(avatarFile!);
      } else if (avatar) {
        await user.updateAvatar(avatarFile!);
      } else if (passwordsMatch) {
        await user.updatePassword(password, oldPassword);
        user.logout();
      }

      if (password || password2) {
        setPassword('');
        setPassword2('');
      }

      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="success"
            message={t('AccountPage.updateSuccessMessage')}
          />
        ),
        disableWindowBlurListener: true,
      });
    } catch (error) {
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `Error updating User ${error}`,

        type: 'error',
      });
      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage id={key} variant="error" message={t('General.error')} />
        ),
        disableWindowBlurListener: true,
      });
    }
  };

  return user.isAuthenticated ? (
    <Container>
      <Header>{t('AccountPage.header')}</Header>
      <SettingsContainer>
        <div>
          {t('AccountPage.username')}: {user.name}
        </div>
        <Divider size={2} />
        <div>
          {t('AccountPage.email')}: {user.email}
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
            handleOldPasswordChange={handleOldPasswordChange}
            handlePasswordChange={handlePasswordChange}
            handlePasswordChange2={handlePasswordChange2}
            passwordsMatch={passwordsMatchText}
          />
          <Divider size={2} />
          <CustomButton onClick={updateUser} name="Update" />
        </SettingsAligner>
        <Divider size={2} />
        <CustomizedDialogs
          confirmButtonText={t('AccountPage.deleteDialog.confirmButton')}
          title={t('AccountPage.deleteDialog.title')}
          text={t('AccountPage.deleteDialog.text')}
          open={open}
          handleConfirmClose={handleDeleteConfirmClose}
          handleClose={handleDeleteClose}
          handleClickOpen={handleDeleteClickOpen}
        >
          <Button
            variant="contained"
            color="secondary"
            style={{
              height: '40px',
              width: '140px',
              padding: '0 16px',
              backgroundColor: '#DC143C',
              borderRadius: '5px',
            }}
            onClick={handleDeleteClickOpen}
          >
            {t('AccountPage.deleteButton')}
          </Button>
        </CustomizedDialogs>
      </SettingsContainer>
    </Container>
  ) : (
    <LoginPage />
  );
};

export default observer(AccountPage);
