import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import routes from '../../../constants/routes.json';
import AccountDisplayMenu from './AccountDisplayMenu';

interface IAccountDisplayProps {
  username?: string;
  avatar?: string;
  email?: string;
}

const Container = styled.div`
  position: absolute;
  top: 8px;
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
  props
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
            <AccountCircleIcon style={{ marginRight: '8px' }} />
          )}
          <Text>{username || email}</Text>
          <ExpandMoreIcon />
        </AccountDisplayMenu>
      ) : (
        <Link
          to={routes.LOGIN}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <AccountCircleIcon style={{ marginRight: '8px' }} />
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
