import React from "react";
import styled from "styled-components";
import CustomTextField from "../../../components/Customs/CustomTextField/CustomTextField";
import Divider from "../../Divider/Divider";
import { useTranslation } from "react-i18next";

interface INewPasswordProps {
  handlePasswordChange: any;
  handlePasswordChange2: any;
}

const Aligner = styled.div`
  display: flex;
  width: 400px;
  flex-direction: column;
`;

const NewPassword: React.FunctionComponent<INewPasswordProps> = props => {
  const { t } = useTranslation();

  return (
    <Aligner>
      <CustomTextField
        type="password"
        id="password"
        label={t("AccountPage.password")}
        onChange={props.handlePasswordChange}
      />
      <Divider size={2} />
      <CustomTextField
        type="password"
        id="password2"
        label={t("AccountPage.repeatPassword")}
        onChange={props.handlePasswordChange2}
      />
    </Aligner>
  );
};

export default NewPassword;
