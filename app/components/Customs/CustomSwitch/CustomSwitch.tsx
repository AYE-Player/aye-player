import React from "react";
import Switch from "react-switch";

interface ICustomSwitchProps {
  onChange: (
    checked: boolean,
    event: MouseEvent | React.SyntheticEvent<MouseEvent | KeyboardEvent, Event>,
    id: string
  ) => void;
  label: string;
  checked: boolean;
}

const CustomSwitch: React.FunctionComponent<ICustomSwitchProps> = props => {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        width: "264px",
        justifyContent: "flex-start",
        height: "48px"
      }}
    >
      <Switch
        onChange={props.onChange}
        checked={props.checked}
        onColor="#4fc3f7"
        onHandleColor="#565f6c"
        handleDiameter={24}
        uncheckedIcon={false}
        checkedIcon={false}
        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
        activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
        height={16}
        width={48}
      />
      <span style={{ marginLeft: "16px", width: "100%" }}>{props.label}</span>
    </label>
  );
};

export default CustomSwitch;
