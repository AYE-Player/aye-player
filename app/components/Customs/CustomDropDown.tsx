import { MenuItem } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import React from "react";
import styled from "styled-components";

interface IOption {
  value: string;
  text: string;
}

interface ICustomDropDownProps {
  options: IOption[];
  name: string;
  id: string;
  handleChange: (
    event: React.ChangeEvent<{
      value: string;
    }>
  ) => Promise<void>;
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
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
          {props.options.map((option: IOption) => (
            <MenuItem value={option.value} key={option.value}>
              {option.text}
            </MenuItem>
          ))}
        </StyledSelect>
      </FormControl>
    </div>
  );
};

export default CustomDropDown;
