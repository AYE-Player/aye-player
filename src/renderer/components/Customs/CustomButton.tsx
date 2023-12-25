import { Button } from '@mui/material';
import { withStyles } from '@mui/styles';
import React from 'react';

interface ICustomButtonProps {
  onClick?: (event: React.MouseEvent) => void;
  name?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  children?: any;
}

const CssButton = withStyles({
  root: {
    color: '#161618',
    height: '40px',
    width: '140px',
    padding: '0 16px',
    backgroundColor: '#f0ad4e',
    '&:hover': {
      backgroundColor: '#565f6c',
      borderColor: '#565f6c',
    },
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: '#f0ad4e',
      },
    },
    borderRadius: '5px',
  },
})(Button);

const CustomButton: React.FunctionComponent<ICustomButtonProps> = (props) => {
  const { onClick, disabled, style, children, name } = props;
  return (
    <>
      <CssButton
        variant="outlined"
        disabled={disabled}
        onClick={onClick}
        style={{ ...style }}
      >
        {name || children}
      </CssButton>
    </>
  );
};

CustomButton.defaultProps = {
  children: undefined,
  disabled: false,
  name: undefined,
  onClick: undefined,
  style: undefined,
};

export default CustomButton;
