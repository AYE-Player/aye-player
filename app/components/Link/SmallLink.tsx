import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

interface ISmallLinkProps {
  to: string;
  name: string;
}

const StyledNavLink = styled(NavLink)`
  font-size: 12px;
`;

const SmallLink: React.FunctionComponent<ISmallLinkProps> = props => {
  return (
    <StyledNavLink to={props.to} >{props.name}</StyledNavLink>
  );
};

export default SmallLink;
