import { TextField, withStyles } from '@material-ui/core';
import React from 'react';

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
    '& label': {
      color: '#565f6c',
    },
    '& label.Mui-focused': {
      color: '#f0ad4e',
    },
    '& label.Mui-focused.Mui-error': {
      color: '#f44336',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '#f0ad4e',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#565f6c',
      },
      '&:hover fieldset': {
        borderColor: '#f0ad4e',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#f0ad4e',
      },
      '&.Mui-focused.Mui-error fieldset': {
        borderColor: '#f44336',
      },
    },
    '& .MuiOutlinedInput-input': {
      color: '#f2f5f4',
    },
    '& .MuiFormHelperText-root': {
      color: '#707986',
    },
  },
})(TextField);

const CustomTextField: React.FunctionComponent<ICustomTextFieldProps> = (
  props,
) => {
  const { autoFocus, id, label, type, helperText, onChange, required, error } =
    props;
  return (
    <CssTextField
      autoFocus={autoFocus}
      id={id}
      label={label}
      type={type}
      variant="outlined"
      helperText={helperText}
      onChange={onChange}
      required={required}
      error={error}
    />
  );
};

CustomTextField.defaultProps = {
  helperText: '',
  error: false,
  required: false,
  autoFocus: false,
};

export default CustomTextField;
