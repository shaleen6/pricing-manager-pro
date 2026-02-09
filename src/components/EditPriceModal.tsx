import React from 'react';
import {
  TextField, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions, 
} from '@mui/material';
import { PricingRecord } from '../models/PricingRecords';

interface EditModalProps {
  open: boolean;
  onClose: () => void;
  row?: PricingRecord | null;
}

const EditModal: React.FC<EditModalProps> = ({ open, onClose, row }) => {
  if (!row) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit {row.productName}</DialogTitle>
      <DialogContent>
        <TextField label="Price" fullWidth margin="dense" defaultValue={row.price.toString()} type="number" />
        <TextField label="Effective Date" type="date" fullWidth margin="dense" defaultValue={row.date} />
        <TextField label="Notes" fullWidth margin="dense" multiline rows={2} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onClose}>Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditModal;