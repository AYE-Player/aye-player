import React from "react";
import { Switch } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

interface ICustomSwitchProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  label: string;
}

const StyledSwitch = withStyles({
  switchBase: {
    color: "#565f6c",
    '&$checked': {
      color: "#9cf",
    },
    '&$checked + $track': {
      backgroundColor: "#9cf",
    },
  },
  checked: {},
  track: {},
  }
)(Switch);

const CustomSwitch: React.FunctionComponent<ICustomSwitchProps> = props => {
  return (
    <FormGroup>
      <FormControlLabel
        label={props.label}
        control={
          <StyledSwitch
        onChange={props.onChange}
      />

        }
      />
    </FormGroup>
  );
};

export default CustomSwitch;
