import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { MenuItem } from "@material-ui/core";
import styled from "styled-components";

interface ICustomDropDownProps {
  options: any;
  name: string;
  id: string;
  handleChange: any;
  selected: any;
  setSelected: any;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120
    },
    selectEmpty: {
      marginTop: theme.spacing(2)
    }
  })
);

const StyledSelect = styled(Select)`
  background-color: "#3D4653";
`;

const CustomDropDown: React.FunctionComponent<ICustomDropDownProps> = props => {
  const classes = useStyles(props);

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel style={{ color: "#FBFBFB" }} htmlFor={props.id}>
          {props.name}
        </InputLabel>
        <StyledSelect
          value={props.selected}
          onChange={props.handleChange}
          style={{
            color: "#FBFBFB"
          }}
          inputProps={{
            name: props.name,
            id: props.id
          }}
        >
          {props.options.map((option: any) => (
            <MenuItem
              value={option.value}
              key={option.value}
            >
              {option.text}
            </MenuItem>
          ))}
        </StyledSelect>
      </FormControl>
    </div>
  );
};

export default CustomDropDown;
