import React from "react";
import styled from "styled-components";

interface ISnackMessageProps {
  id: string | number;
  variant: "warning" | "success" | "info" | "error";
  message: string;
}

const Container = styled.div<any>`
  ${props => {
    if (props.length >= 25) {
      return "width: 500px";
    } else if (props.lenght >= 15) {
      return "width: 350px";
    } else {
      return "width: 256px";
    }
  }}
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  color: #fbfbfb;
  boxshadow: "0px 1px 5px rgba(0, 0, 0, 0.6)";
  ${props => {
    if (props.variant === "warning") return "background-color: #ff9800;";
    else if (props.variant === "success") return "background-color: #689f38;";
    else if (props.variant === "info") return "background-color: #546e7a;";
    else if (props.variant === "error") return "background-color: #f44336;";
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
