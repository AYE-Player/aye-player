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
  autoFocus?: boolean;
}

const CssTextField = withStyles({
  root: {
    "& label": {
      color: "#565f6c"
    },
    "& label.Mui-focused": {
      color: "#f0ad4e"
    },
    "& label.Mui-focused.Mui-error": {
      color: "#f44336"
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#f0ad4e"
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#565f6c"
      },
      "&:hover fieldset": {
        borderColor: "#f0ad4e"
      },
      "&.Mui-focused fieldset": {
        borderColor: "#f0ad4e"
      },
      "&.Mui-focused.Mui-error fieldset": {
        borderColor: "#f44336"
      }
    },
    "& .MuiOutlinedInput-input": {
      color: "#f2f5f4"
    },
    "& .MuiFormHelperText-root": {
      color: "#707986"
    }
  }
})(TextField);

const CustomTextField: React.FunctionComponent<ICustomTextFieldProps> = props => {
  return (
    <CssTextField
      autoFocus={props.autoFocus}
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
