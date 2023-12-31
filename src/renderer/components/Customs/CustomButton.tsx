import { Button } from '@mui/material';
import React from 'react';

interface ICustomButtonProps {
  onClick?: (event: React.MouseEvent) => void;
  name?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  children?: any;
}

const CustomButton: React.FunctionComponent<ICustomButtonProps> = (props) => {
  const { onClick, disabled, style, children, name } = props;
  return (
    <Button
      color="primary"
      variant="contained"
      disabled={disabled}
      onClick={onClick}
      style={{ ...style }}
    >
      {name || children}
    </Button>
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
