import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import CustomTextField from "../../../components/Customs/CustomTextField/CustomTextField";
import Divider from "../../Divider/Divider";

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
        helperText={props.passwordsMatch}
      />
    </Aligner>
  );
};

export default NewPassword;
