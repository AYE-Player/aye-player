import React from "react";
import styled from "styled-components";
import CustomButton from "../../Customs/CustomButton/CustomButton";
import { UserModel } from "../../../dataLayer/models/User";
import { useTranslation } from "react-i18next";
const placeholder = require("../../../images/placeholder.png");

interface IAvatarUploadProps {
  avatar: any;
  setAvatar: Function;
  user?: UserModel;
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

const AvatarUpload: React.FunctionComponent<IAvatarUploadProps> = props => {
  const { t } = useTranslation();

  const fileSelectedHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setAvatar(URL.createObjectURL(event.target.files[0]));
  };

  const _clickInputFaker = () => {
    document.getElementById("file-input-element").click();
  };

  return (
    <>
      <Aligner>
        <input
          accept="image/*"
          style={{ display: "none" }}
          id="file-input-element"
          type="file"
          onChange={fileSelectedHandler}
        />
        <Image
          src={
            props.avatar
              ? props.avatar
              : props.user
              ? props.user.avatar
              : placeholder
          }
          onClick={() => _clickInputFaker()}
        />
        <CustomButton onClick={() => _clickInputFaker()}>
          {t("AccountPage.changeAvatarButton")}
        </CustomButton>
      </Aligner>
    </>
  );
};

export default AvatarUpload;
