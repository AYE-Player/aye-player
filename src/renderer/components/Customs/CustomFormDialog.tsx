import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import React from 'react';

interface ICustomFormDialogProps {
  id: string;
  title: string;
  label: string;
  button?: JSX.Element;
  dialogText: string;
  open: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  confirmButtonText: string;
  cancelButtonText: string;
  type: string;
}

// TODO: Style this accordingly to theme
const CustomFormDialog: React.FunctionComponent<ICustomFormDialogProps> = (
  props,
) => {
  const {
    button,
    open,
    handleChange,
    handleClose,
    handleConfirm,
    cancelButtonText,
    confirmButtonText,
    dialogText,
    id,
    label,
    title,
    type,
  } = props;
  return (
    <>
      {button}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogText}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id={id}
            label={label}
            type={type}
            fullWidth
            onChange={handleChange}
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

CustomFormDialog.defaultProps = {
  button: undefined,
};

export default CustomFormDialog;
