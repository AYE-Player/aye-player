import React from "react";
import styled from "styled-components";

interface IDividerProps {
  size?: number;
}

const DividerStyle = styled.div<IDividerProps>`
  height: ${(props: IDividerProps) =>
    props.size ? props.size * 8 + "px" : "8px"};
`;

const Divider: React.FunctionComponent<IDividerProps> = props => {
  return <DividerStyle size={props.size} />;
};

export default Divider;
