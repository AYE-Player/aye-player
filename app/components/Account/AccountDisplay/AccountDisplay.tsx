import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import AccountDisplayMenu from "./AccountDisplayMenu";

interface IAccountDisplayProps {
  username?: string;
  avatar?: string;
}

const Container = styled.div`
  position: absolute;
  top: 8px;
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

const Text = styled.div``;

const AccountDisplay: React.FunctionComponent<IAccountDisplayProps> = props => {
  return (
    <Container>
      {props.username ? (
        <AccountDisplayMenu>
          {props.avatar ? (
            <Avatar src={props.avatar} />
          ) : (
            <AccountCircleIcon style={{ marginRight: "8px" }} />
          )}
          <Text>{props.username}</Text>
        </AccountDisplayMenu>
      ) : (
        <Link to="/account" style={{ display: "flex", alignItems: "center" }}>
          <AccountCircleIcon style={{ marginRight: "8px" }} />
          Login
        </Link>
      )}
    </Container>
  );
};

export default AccountDisplay;
