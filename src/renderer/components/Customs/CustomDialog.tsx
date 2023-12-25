import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

interface ICustomDialogProps {
  openButtonText?: string;
  confirmButtonText: string;
  title: string;
  text: string;
  handleClose: () => void;
  handleClickOpen: () => void;
  handleConfirmClose: () => void;
  open: boolean;
  children: JSX.Element | JSX.Element[];
}

const styles = () =>
  createStyles({
    root: {
      margin: 0,
      padding: useTheme().spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: useTheme().spacing(1),
      top: useTheme().spacing(1),
      color: useTheme().palette.grey[500],
    },
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}

const StyledDialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, ...other } = props;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <DialogTitle className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
});

const StyledDialogContent = withStyles(() => ({
  root: {
    padding: useTheme().spacing(2),
  },
}))(DialogContent);

const StyledDialogActions = withStyles(() => ({
  root: {
    margin: 0,
    padding: useTheme().spacing(1),
  },
}))(DialogActions);

const CustomDialog: React.FunctionComponent<ICustomDialogProps> = (props) => {
  const {
    open,
    openButtonText,
    children,
    handleClickOpen,
    handleClose,
    handleConfirmClose,
    title,
    text,
    confirmButtonText,
  } = props;
  return (
    <>
      {openButtonText ? (
        <Button variant="outlined" color="secondary" onClick={handleClickOpen}>
          {openButtonText}
        </Button>
      ) : (
        children
      )}
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <StyledDialogTitle id="customized-dialog-title" onClose={handleClose}>
          {title}
        </StyledDialogTitle>
        <StyledDialogContent dividers>
          <Typography gutterBottom>{text}</Typography>
        </StyledDialogContent>
        <StyledDialogActions>
          <Button onClick={handleConfirmClose} color="secondary">
            {confirmButtonText}
          </Button>
        </StyledDialogActions>
      </Dialog>
    </>
  );
};

CustomDialog.defaultProps = {
  openButtonText: undefined,
};

export default CustomDialog;
