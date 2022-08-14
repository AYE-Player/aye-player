import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

interface ISmallLinkProps {
  to: string;
  name: string;
}

const StyledNavLink = styled(NavLink)`
  font-size: 12px;
`;

const SmallLink: React.FunctionComponent<ISmallLinkProps> = (props) => {
  const { name, to } = props;
  return <StyledNavLink to={to}>{name}</StyledNavLink>;
};

export default SmallLink;
