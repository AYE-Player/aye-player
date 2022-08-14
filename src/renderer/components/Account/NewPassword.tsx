import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import CustomTextField from '../Customs/CustomTextField';
import Divider from '../Divider';

interface INewPasswordProps {
  handlePasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange2: (event: React.ChangeEvent<HTMLInputElement>) => void;
  passwordsMatch: string;
}

const Aligner = styled.div`
  display: flex;
  width: 400px;
  flex-direction: column;
`;

const NewPassword: React.FunctionComponent<INewPasswordProps> = (props) => {
  const { t } = useTranslation();
  const { handlePasswordChange, handlePasswordChange2, passwordsMatch } = props;

  return (
    <Aligner>
      <CustomTextField
        type="password"
        id="password"
        label={t('AccountPage.password')}
        onChange={handlePasswordChange}
      />
      <Divider size={2} />
      <CustomTextField
        type="password"
        id="password2"
        label={t('AccountPage.repeatPassword')}
        onChange={handlePasswordChange2}
        helperText={passwordsMatch}
      />
    </Aligner>
  );
};

export default NewPassword;
