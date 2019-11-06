import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

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

const CustomDropDown: React.FunctionComponent<ICustomDropDownProps> = (props) => {
  const classes = useStyles(props);

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor={props.id}>{props.name}</InputLabel>
        <Select
          native
          value={props.selected}
          onChange={props.handleChange}
          inputProps={{
            name: props.name,
            id: props.id
          }}
        >
          {props.options.map((o: any) => (
            <option value={o.value} key={o.value}>{o.text}</option>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default CustomDropDown;
