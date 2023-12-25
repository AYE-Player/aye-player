import {
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  useTheme,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React from 'react';
import styled from 'styled-components';

interface IOption {
  value: string;
  text: string;
}

interface ICustomDropDownProps {
  options: IOption[];
  name: string;
  id: string;
  handleChange: (
    event: SelectChangeEvent<unknown>,
    child: React.ReactNode,
  ) => {};
  selected: string;
}

const useStyles = makeStyles(() =>
  createStyles({
    formControl: {
      margin: useTheme().spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: useTheme().spacing(2),
    },
  }),
);

const StyledSelect = styled(Select)`
  background-color: '#3D4653';
`;

const CustomDropDown: React.FunctionComponent<ICustomDropDownProps> = (
  props,
) => {
  const classes = useStyles(props);
  const { name, id, selected, options, handleChange } = props;

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel style={{ color: '#f2f5f4' }} htmlFor={id}>
          {name}
        </InputLabel>
        <StyledSelect
          value={selected}
          onChange={handleChange}
          style={{
            color: '#f2f5f4',
          }}
          inputProps={{
            name,
            id,
          }}
        >
          {options.map((option: IOption) => (
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
