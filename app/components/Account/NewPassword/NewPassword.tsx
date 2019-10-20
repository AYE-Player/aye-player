import React from "react";
import styled from "styled-components";
import Divider from "../../Divider/Divider";

import CustomTextField from "../../../components/Customs/CustomTextField/CustomTextField";

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
  return (
    <Aligner>
      <CustomTextField
        type="password"
        id="password"
        label="New Password"
        onChange={props.handlePasswordChange}
      />
      <Divider size={2} />
      <CustomTextField
        type="password"
        id="password2"
        label="Repeat Password"
        onChange={props.handlePasswordChange2}
      />
    </Aligner>
  );
};

export default NewPassword;
