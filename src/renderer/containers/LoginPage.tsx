import { Grid } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { HTTPError } from 'ky';
import { useNavigate } from 'react-router-dom';
import { Channel } from '../../types/enums';
import CustomButton from '../components/Customs/CustomButton';
import CustomTextField from '../components/Customs/CustomTextField';
import SnackMessage from '../components/Customs/SnackMessage';
import Divider from '../components/Divider';
import SmallLink from '../components/Link/SmallLink';
import routes from '../constants/routes.json';
import ApiClient from '../dataLayer/api/ApiClient';
import Playlist from '../dataLayer/models/Playlist';
import { useStore } from '../components/StoreProvider';

const Header = styled.div`
  font-size: 24px;
  padding-bottom: 8px;
`;

const LoginPage: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const { user, playlists } = useStore();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [name, setName] = React.useState('');
  const [password, setPassword] = React.useState('');

  const getPlaylists = async () => {
    const data = await ApiClient.getPlaylists();

    for (const playlist of data) {
      const pl = new Playlist({
        id: playlist.id,
        name: playlist.name,
        duration: playlist.duration,
        trackCount: playlist.songCount,
        tracks: [],
      });

      playlists.add(pl);
    }
  };

  const handleOnClick = async () => {
    try {
      await user.authenticate(name, password);
      await getPlaylists();
      navigate(routes.SEARCH);
    } catch (error) {
      /* if (err.response.status === 401) {
        enqueueSnackbar('', {
          content: (key) => (
            <SnackMessage
              id={key}
              variant="error"
              message={t('LoginPage.error.invalidCredentials')}
            />
          ),
          disableWindowBlurListener: true,
        });
      } else {
        window.electron.ipcRenderer.sendMessage(Channel.LOG, {
          message: `Error on login ${JSON.stringify(error, null, 2)}`,

          type: 'error',
        });
        enqueueSnackbar('', {
          content: (key) => (
            <SnackMessage
              id={key}
              variant="error"
              message={t('General.error')}
            />
          ),
          disableWindowBlurListener: true,
        });
      } */
    }
  };

  const handleKeyPress = async (event: KeyboardEvent) => {
    if (event.key === 'Enter' && name && password) {
      handleOnClick();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  });

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      style={{ height: '100%' }}
    >
      <Header>{t('LoginPage.header')}</Header>
      <Divider size={2} />
      <CustomTextField
        autoFocus
        label={t('LoginPage.username')}
        id="username"
        onChange={handleNameChange}
        key="username"
        type="text"
      />
      <Divider size={2} />
      <CustomTextField
        label={t('LoginPage.password')}
        id="password"
        onChange={handlePasswordChange}
        key="password"
        type="password"
      />
      <Divider size={3} />
      <CustomButton onClick={handleOnClick} name={t('LoginPage.loginButton')} />
      <Divider size={3} />
      <SmallLink name={t('LoginPage.registerLink')} to={routes.REGISTER} />
      <Divider />
      <SmallLink
        name={t('LoginPage.forgotPasswordLink')}
        to={routes.FORGOTPASSWORD}
      />
    </Grid>
  );
};

export default LoginPage;
