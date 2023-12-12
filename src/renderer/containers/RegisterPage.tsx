import { Grid } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ApolloError } from '@apollo/client';
import { Channel } from '../../types/enums';
import CustomButton from '../components/Customs/CustomButton';
import CustomTextField from '../components/Customs/CustomTextField';
import SnackMessage from '../components/Customs/SnackMessage';
import Divider from '../components/Divider';
import { useStore } from '../components/StoreProvider';
import routes from '../constants/routes.json';
import { validateEmail } from '../../helpers';

const Header = styled.div`
  font-size: 24px;
  padding-bottom: 8px;
`;

const RegisterPage: React.FunctionComponent = () => {
  const { user } = useStore();
  const navigate = useNavigate();

  const [name, setName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [password2, setPassword2] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [invalidEmail, setInvalidEmail] = React.useState(false);

  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const handleOnClick = async () => {
    try {
      await user.register(name, email, password);

      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="success"
            message={t('RegisterPage.success')}
          />
        ),
        disableWindowBlurListener: true,
      });
      navigate(routes.LOGIN);
    } catch (error) {
      if (error instanceof ApolloError) {
        enqueueSnackbar('', {
          content: (key) => (
            <SnackMessage
              id={key}
              variant="error"
              message={(error as ApolloError).message}
            />
          ),
          disableWindowBlurListener: true,
        });
      } else {
        window.electron.ipcRenderer.sendMessage(Channel.LOG, {
          message: `Error registering User ${error}`,

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
      }
    }
  };

  const handleKeyPress = async (event: KeyboardEvent) => {
    if (event.key === 'Enter' && name && email && password && password2) {
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

  const handlePassword2Change = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPassword2(event.target.value);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);

    setInvalidEmail(!validateEmail(event.target.value));
  };

  const passwordsMatch = () => {
    if (password.length < 8) {
      return t('RegisterPage.minLengthPassword');
    }
    if (password !== password2 && password.length >= 8) {
      return t('RegisterPage.matchPassword');
    }
    return '';
  };

  const disableButton = () => {
    if (
      name === '' ||
      password === '' ||
      email === '' ||
      invalidEmail ||
      password !== password2
    ) {
      return true;
    }
    return false;
  };

  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      style={{ height: '100%' }}
    >
      <Header>Register</Header>
      <Divider size={2} />
      <CustomTextField
        label={t('RegisterPage.username')}
        id="username"
        onChange={handleNameChange}
        key="username"
        type="text"
        required
      />
      <Divider size={2} />
      <CustomTextField
        label={t('RegisterPage.email')}
        id="email"
        onChange={handleEmailChange}
        key="email"
        type="email"
        error={invalidEmail}
        required
      />
      <Divider size={2} />
      <CustomTextField
        label={t('RegisterPage.password')}
        id="password"
        onChange={handlePasswordChange}
        key="password"
        type="password"
        error={password.length < 8 && password.length > 0}
        required
      />
      <Divider size={2} />
      <CustomTextField
        label={t('RegisterPage.repeatPassword')}
        id="password2"
        onChange={handlePassword2Change}
        key="password2"
        type="password"
        helperText={passwordsMatch()}
        error={
          (password2.length < 8 && password2.length > 0) ||
          password2 !== password
        }
        required
      />
      <Divider size={3} />
      <CustomButton
        onClick={handleOnClick}
        disabled={disableButton()}
        name={t('RegisterPage.registerButton')}
      />
    </Grid>
  );
};

export default RegisterPage;
