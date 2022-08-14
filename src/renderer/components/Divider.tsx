import React from 'react';
import styled from 'styled-components';

interface IDividerProps {
  size?: number;
}

const DividerStyle = styled.div<IDividerProps>`
  height: ${(props: IDividerProps) => `${props.size! * 8}px`};
`;

const Divider: React.FunctionComponent<IDividerProps> = (props) => {
  const { size } = props;
  return <DividerStyle size={size} />;
};

Divider.defaultProps = {
  size: 1,
};

export default Divider;
