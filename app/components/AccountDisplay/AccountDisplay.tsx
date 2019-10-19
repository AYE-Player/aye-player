import React from "react";
import styled from "styled-components";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import AccountDisplayMenu from "./AccountDisplayMenu";

interface IAccountDisplayProps {
  username: string;
  avatar: string;
}

const Container = styled.div`
  position: absolute;
  top: 0;
  right: 16px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-items: center;
`;

const Avatar = styled.img`
  border-radius: 15px;
  width: 24px;
  height: 24px;
  margin-right: 8px;
`;

const UserName = styled.div``;

const AccountDisplay: React.FunctionComponent<IAccountDisplayProps> = props => {
  return (
    <Container>
      <AccountDisplayMenu >
        {props.avatar ? <Avatar src={props.avatar} /> : <AccountCircleIcon />}
        <UserName>{props.username}</UserName>
      </AccountDisplayMenu>
    </Container>
  );
};

export default AccountDisplay;
