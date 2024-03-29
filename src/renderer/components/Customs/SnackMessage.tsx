import React from 'react';
import styled from 'styled-components';

interface ISnackMessageProps {
  id: string | number;
  variant: 'warning' | 'success' | 'info' | 'error';
  message: string;
}

interface IContainerProps {
  length: number;
  variant: 'warning' | 'success' | 'info' | 'error';
  ref: any;
}

const Container = styled.div<IContainerProps>`
  ${(props) => {
    if (props.length >= 25) {
      return 'width: 500px;';
    }
    if (props.length >= 15) {
      return 'width: 350px;';
    }
    return 'width: 256px;';
  }}
  margin-top: 16px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  color: #f2f5f4;
  boxshadow: '0px 1px 5px rgba(0, 0, 0, 0.6)';
  ${(props) => {
    if (props.variant === 'warning') return 'background-color: #ef6c00;';
    if (props.variant === 'success') return 'background-color: #f0ad4e;';
    if (props.variant === 'error') return 'background-color: #f44336;';
    return 'background-color: #546e7a;';
  }}
`;

const SnackMessage = React.forwardRef((props: ISnackMessageProps, ref) => {
  return (
    <Container
      key={props.id}
      variant={props.variant}
      ref={ref}
      length={props.message.length}
    >
      {props.message}
    </Container>
  );
});

export default SnackMessage;
