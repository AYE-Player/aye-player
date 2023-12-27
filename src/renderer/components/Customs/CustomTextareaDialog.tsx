import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  useTheme,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React from 'react';

interface ICustomTextareaDialogProps {
  id: string;
  title: string;
  label: string;
  button: React.JSX.Element;
  dialogText: string;
  open: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  confirmButtonText: string;
  cancelButtonText: string;
  placeholder: string;
  type: string;
}

const useStyles = makeStyles(() =>
  createStyles({
    textField: {
      marginLeft: useTheme().spacing(1),
      marginRight: useTheme().spacing(1),
      width: 400,
    },
  }),
);

// TODO: Style this accordingly to theme
const CustomTextareaDialog: React.FunctionComponent<
  ICustomTextareaDialogProps
> = (props) => {
  const {
    id,
    button,
    open,
    title,
    dialogText,
    handleChange,
    handleClose,
    handleConfirm,
    placeholder,
    cancelButtonText,
    label,
    confirmButtonText,
    type,
  } = props;
  const classes = useStyles(props);

  return (
    <>
      {button}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        id={id}
      >
        <DialogTitle id="form-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogText}</DialogContentText>
          <TextField
            id="outlined-textarea"
            label={label}
            placeholder={placeholder}
            multiline
            autoFocus
            minRows={4}
            maxRows={4}
            className={classes.textField}
            margin="dense"
            variant="outlined"
            onChange={handleChange}
            type={type}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            {cancelButtonText}
          </Button>
          <Button onClick={handleConfirm} color="primary">
            {confirmButtonText}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomTextareaDialog;
