import React from "react";
import { TextField, withStyles } from "@material-ui/core";

interface ICustomTextFieldProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type: string;
  id: string;
  label: string;
  error?: boolean;
}


const CssTextField = withStyles({
  root: {
    '& label': {
      color: '#565f6c'
    },
    '& label.Mui-focused': {
      color: '#9cf',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '#9cf',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#565f6c'
      },
      '&:hover fieldset': {
        borderColor: '#9cf',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#9cf',
      },
    },
    '& .MuiOutlinedInput-input': {
      color: '#fbfbfb'
    }
  },
})(TextField);

const CustomTextField: React.FunctionComponent<ICustomTextFieldProps> = props => {
  return (
    <CssTextField
      error={props.error}
      id={props.id}
      label={props.label}
      type={props.type}
      variant="outlined"
      onChange={props.onChange}
    />
  );
};

export default CustomTextField;
