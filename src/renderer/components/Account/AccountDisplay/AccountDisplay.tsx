import { AccountCircle, ExpandMore } from '@mui/icons-material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import AccountDisplayMenu from './AccountDisplayMenu';
import { routes } from 'renderer/constants';

interface IAccountDisplayProps {
  username?: string;
  avatar?: string;
  email?: string;
}

const Container = styled.div`
  position: absolute;
  top: 24px;
  right: 16px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-items: center;
`;

const Avatar = styled.img`
  border-radius: 16px;
  width: 24px;
  height: 24px;
  margin-right: 8px;
`;

const Text = styled.div``;

const AccountDisplay: React.FunctionComponent<IAccountDisplayProps> = (
  props,
) => {
  const { t } = useTranslation();

  const { avatar, email, username } = props;

  return (
    <Container>
      {username ? (
        <AccountDisplayMenu>
          {avatar ? (
            <Avatar src={avatar} />
          ) : (
            <AccountCircle style={{ marginRight: '8px' }} />
          )}
          <Text>{username || email}</Text>
          <ExpandMore />
        </AccountDisplayMenu>
      ) : (
        <Link
          to={routes.LOGIN}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <AccountCircle style={{ marginRight: '8px' }} />
          {t('AccountDisplay.loginButton')}
        </Link>
      )}
    </Container>
  );
};

AccountDisplay.defaultProps = {
  avatar: undefined,
  email: undefined,
  username: undefined,
};

export default AccountDisplay;
