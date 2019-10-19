import React from "react";
import { Button } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

interface ICustomButtonProps {
  onClick?: (event: React.MouseEvent) => void;
  name?: string;
}

const CssButton = withStyles({
  root: {
    color: "#fbfbfb",
    height: "40px",
    width: "100px",
    padding: "0 16px",
    backgroundColor: "#3d4653",
    "&:hover": {
      backgroundColor: "#565f6c",
      borderColor: "#565f6c"
    },
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: '#9cf',
      },
    },
    borderRadius: "5px"
  }
})(Button);


const CustomButton: React.FunctionComponent<ICustomButtonProps> = props => {
  return (
    <>
      <CssButton variant="outlined" onClick={props.onClick}>
        {props.name ? props.name : props.children}
      </CssButton>
    </>
  );
};

export default CustomButton;
