import { TextField, withStyles } from "@material-ui/core";
import React from "react";

interface ICustomTextFieldProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type: string;
  id: string;
  label: string;
  helperText?: string;
  error?: boolean;
  required?: boolean;
}

// TODO: Implement correct coloring for error handling
const CssTextField = withStyles({
  root: {
    "& label": {
      color: "#565f6c"
    },
    "& label.Mui-focused": {
      color: "#4fc3f7"
    },
    "& label.Mui-focused.Mui-error": {
      color: "#f44336"
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#4fc3f7"
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#565f6c"
      },
      "&:hover fieldset": {
        borderColor: "#4fc3f7"
      },
      "&.Mui-focused fieldset": {
        borderColor: "#4fc3f7"
      },
      "&.Mui-focused fieldset.Mui-error": {
        borderColor: "#f44336"
      }
    },
    "& .MuiOutlinedInput-input": {
      color: "#fbfbfb"
    },
    "& .MuiFormHelperText-root": {
      color: "#707986"
    }
  }
})(TextField);

const CustomTextField: React.FunctionComponent<ICustomTextFieldProps> = props => {
  return (
    <CssTextField
      id={props.id}
      label={props.label}
      type={props.type}
      variant="outlined"
      helperText={props.helperText}
      onChange={props.onChange}
      required={props.required}
      error={props.error}
    />
  );
};

export default CustomTextField;
