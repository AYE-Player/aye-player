import { Button } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import React from "react";

interface ICustomButtonProps {
  onClick?: (event: React.MouseEvent) => void;
  name?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const CssButton = withStyles({
  root: {
    color: "#161618",
    height: "40px",
    width: "140px",
    padding: "0 16px",
    backgroundColor: "#f0ad4e",
    "&:hover": {
      backgroundColor: "#565f6c",
      borderColor: "#565f6c"
    },
    "& .MuiOutlinedInput-root": {
      "&:hover fieldset": {
        borderColor: "#f0ad4e"
      }
    },
    borderRadius: "5px"
  }
})(Button);

const CustomButton: React.FunctionComponent<ICustomButtonProps> = props => {
  return (
    <>
      <CssButton
        variant="outlined"
        disabled={props.disabled}
        onClick={props.onClick}
        style={{ ...props.style }}
      >
        {props.name ? props.name : props.children}
      </CssButton>
    </>
  );
};

export default CustomButton;
