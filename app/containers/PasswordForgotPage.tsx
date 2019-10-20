import { Grid } from "@material-ui/core";
import React from "react";
import styled from "styled-components";
import CustomButton from "../components/Customs/CustomButton/CustomButton";
import CustomTextField from "../components/Customs/CustomTextField/CustomTextField";
import Divider from "../components/Divider/Divider";
import { debounce, validateEmail } from "../helpers/";
import useInject from "../hooks/useInject";
import { RootStoreModel } from "../stores/RootStore";


const Header = styled.div`
  font-size: 24px;
  padding-bottom: 8px;
`;

const PasswordForgotPage: React.FunctionComponent<any> = () => {
  const UserStore = ({ user }: RootStoreModel) => ({
    user: user
  });

  const { user } = useInject(UserStore);

  const [email, setEmail] = React.useState("");
  const [invalidEmail, setInvalidEmail] = React.useState(false);

  const _handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);

    debounce(setInvalidEmail(!validateEmail(event.target.value)), 500);
  };

  const _handleOnClick = (event: React.MouseEvent) => {
    user.forgotPassword(email);
  };

  return (
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="center"
      style={{ height: "100%" }}
    >
      <Header>Forgot Password</Header>
      <Divider size={2} />
      Please enter your E-Mail to receive an password reset link.
      <Divider size={2} />
      <CustomTextField
        label="E-Mail"
        id="email"
        onChange={_handleEmailChange}
        key="email"
        type="email"
        error={invalidEmail}
        required
      />
      <Divider size={3} />
      <CustomButton onClick={_handleOnClick} name="Reset" />
    </Grid>
  );
};

export default PasswordForgotPage;
