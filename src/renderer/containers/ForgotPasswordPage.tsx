import { Grid } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Channel } from '../../types/enums';
import CustomButton from '../components/Customs/CustomButton';
import CustomTextField from '../components/Customs/CustomTextField';
import SnackMessage from '../components/Customs/SnackMessage';
import Divider from '../components/Divider';
import { useStore } from '../components/StoreProvider';
import { validateEmail } from '../../helpers';

const Header = styled.div`
  font-size: 24px;
  padding-bottom: 8px;
`;

const PasswordForgotPage: React.FunctionComponent = () => {
  const { user } = useStore();

  const [email, setEmail] = React.useState('');
  const [invalidEmail, setInvalidEmail] = React.useState(false);

  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const handleOnClick = () => {
    try {
      user.forgotPassword(email);
      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="info"
            message={t('PasswordForgotPage.success')}
          />
        ),
      });
    } catch (error) {
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `Failed to start password reset process ${JSON.stringify(
          error,
          null,
          2,
        )}`,

        type: 'error',
      });
      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage id={key} variant="error" message={t('General.error')} />
        ),
      });
    }
  };

  const handleKeyPress = async (event: KeyboardEvent) => {
    if (event.key === 'Enter' && email) {
      handleOnClick();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  });

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);

    setInvalidEmail(!validateEmail(event.target.value));
  };

  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      style={{ height: '100%' }}
    >
      <Header>{t('PasswordForgotPage.header')}</Header>
      <Divider size={2} />
      {t('PasswordForgotPage.text')}
      <Divider size={2} />
      <CustomTextField
        label={t('PasswordForgotPage.textfield.label')}
        id="email"
        onChange={handleEmailChange}
        key="email"
        type="email"
        error={invalidEmail}
        required
      />
      <Divider size={3} />
      <CustomButton
        onClick={handleOnClick}
        name={t('PasswordForgotPage.resetButton.name')}
      />
    </Grid>
  );
};

export default PasswordForgotPage;
