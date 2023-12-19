/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import Switch from 'react-switch';

interface ICustomSwitchProps {
  onChange: (
    checked: boolean,
    event: MouseEvent | React.SyntheticEvent<MouseEvent | KeyboardEvent, Event>,
    id: string,
  ) => void;
  label: string;
  checked: boolean;
}

const CustomSwitch: React.FunctionComponent<ICustomSwitchProps> = (props) => {
  const { checked, label, onChange } = props;
  return (
    <label style={{ display: 'flex', alignItems: 'center' }}>
      <Switch
        onChange={onChange}
        checked={checked}
        onColor="#f0ad4e"
        onHandleColor="#565f6c"
        handleDiameter={24}
        uncheckedIcon={false}
        checkedIcon={false}
        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
        activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
        height={16}
        width={48}
      />
      <span style={{ marginLeft: '16px', width: '100%' }}>{label}</span>
    </label>
  );
};

export default CustomSwitch;
