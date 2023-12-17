import { useSnackbar } from 'notistack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import SnackMessage from '../Customs/SnackMessage';
import User from '../../dataLayer/models/User';
import CustomButton from '../Customs/CustomButton';

const placeholder = require('../../../images/placeholder.png');

interface IAvatarUploadProps {
  avatar: string;
  setAvatar: React.Dispatch<React.SetStateAction<string>>;
  setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>;
  user: User;
}

const Aligner = styled.div`
  display: flex;
  width: 264px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Image = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  &:hover {
    cursor: pointer;
  }
`;

const AvatarUpload: React.FunctionComponent<IAvatarUploadProps> = (props) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { setAvatar, setAvatarFile, user, avatar } = props;

  const fileSelectedHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const file = event.target.files![0];

    const fileSize = file.size / 1024 / 1024;
    if (fileSize > 2) {
      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="warning"
            message={t('AccountPage.avatarToBig')}
          />
        ),
        disableWindowBlurListener: true,
      });
      return;
    }
    setAvatarFile(file);
    setAvatar(URL.createObjectURL(file));
  };

  const clickInputFaker = () => {
    document.getElementById('file-input-element')?.click();
  };

  const getAvatar = () => {
    if (avatar) return avatar;
    if (user) return user.avatar;
    return placeholder;
  };

  return (
    <Aligner>
      <input
        accept="image/png, image/jpeg, image/gif, image/webp"
        style={{ display: 'none' }}
        id="file-input-element"
        type="file"
        onChange={fileSelectedHandler}
      />
      <Image src={getAvatar()} onClick={clickInputFaker} />
      <CustomButton onClick={clickInputFaker}>
        {t('AccountPage.changeAvatarButton')}
      </CustomButton>
    </Aligner>
  );
};

export default AvatarUpload;
