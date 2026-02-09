// src/components/EditRecordModal.tsx - FULL VALIDATION
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, CircularProgress, Alert, Box, Typography
} from '@mui/material';
import { usePricingRecords } from '../hooks/usePricingRecords';

interface EditRecordModalProps {
  open: boolean;
  recordId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormErrors {
  storeId?: string;
  sku?: string;
  productName?: string;
  price?: string;
  date?: string;
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  open,
  recordId,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    storeId: '',
    sku: '',
    productName: '',
    price: '',
    date: '',
    notes: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const { getRecordById, updateRecord } = usePricingRecords();

  // Load record when modal opens
  useEffect(() => {
    if (open && recordId) {
      loadRecord(recordId);
    } else if (!open) {
      // Reset form when closing
      setFormData({
        storeId: '',
        sku: '',
        productName: '',
        price: '',
        date: '',
        notes: ''
      });
      setErrors({});
      setSubmitAttempted(false);
    }
  }, [open, recordId]);

  const loadRecord = async (id: string) => {
    setLoading(true);
    const record = await getRecordById(id);
    if (record) {
      setFormData({
        storeId: record.storeId || '',
        sku: record.sku || '',
        productName: record.productName || '',
        price: record.price?.toString() || '',
        date: record.date || '',
        notes: record.notes || ''
      });
    }
    setLoading(false);
  };

  // ✅ VALIDATION FUNCTIONS
  const validateStoreId = (value: string): string => {
    if (!value.trim()) return 'Store ID is required';
    if (!/^[A-Z]{3}-\d{4,}$/.test(value.trim())) {
      return 'Format: XXX-1234 (e.g., IND-0456)';
    }
    return '';
  };

  const validateSku = (value: string): string => {
    if (!value.trim()) return 'SKU is required';
    if (!/^[A-Z0-9]{6,12}$/.test(value.trim())) {
      return '6-12 uppercase letters/numbers only';
    }
    return '';
  };

  const validateProductName = (value: string): string => {
    if (!value.trim()) return 'Product name is required';
    if (value.trim().length < 2) return 'Minimum 2 characters';
    if (value.trim().length > 100) return 'Maximum 100 characters';
    return '';
  };

  const validatePrice = (value: string): string => {
    const num = parseFloat(value);
    if (!value || isNaN(num)) return 'Valid price required';
    if (num <= 0) return 'Price must be greater than 0';
    if (num > 999999) return 'Price too high';
    return '';
  };

  const validateDate = (value: string): string => {
    if (!value.trim()) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Invalid date format';
    return '';
  };

  // ✅ REAL-TIME VALIDATION (onChange)
  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error on valid input
    if (!errors[field as keyof FormErrors]) return;

    // Re-validate on change
    let error = '';
    switch (field) {
      case 'storeId': error = validateStoreId(value); break;
      case 'sku': error = validateSku(value); break;
      case 'productName': error = validateProductName(value); break;
      case 'price': error = validatePrice(value); break;
      case 'date': error = validateDate(value); break;
    }

    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // ✅ FULL FORM VALIDATION (onSubmit)
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.storeId = validateStoreId(formData.storeId);
    newErrors.sku = validateSku(formData.sku);
    newErrors.productName = validateProductName(formData.productName);
    newErrors.price = validatePrice(formData.price);

    // Optional date validation
    const dateError = validateDate(formData.date);
    if (dateError) newErrors.date = dateError;

    setErrors(newErrors);
    setSubmitAttempted(true);

    // Return true only if NO errors
    return Object.values(newErrors).every(error => !error);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!recordId) return;

    setLoading(true);

    try {
      const success = await updateRecord(recordId, {
        storeId: formData.storeId.trim(),
        sku: formData.sku.trim(),
        productName: formData.productName.trim(),
        price: parseFloat(formData.price),
        date: formData.date.trim(),
        notes: formData.notes.trim()
      });

      if (success) {
        onSuccess();
        onClose();
      } else {
        setErrors({ ...errors, price: 'Failed to save record' });
      }
    } catch (err: any) {
      setErrors({ ...errors, price: err.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  // Show validation errors only after submit attempt or if field has been touched
  const shouldShowError = (field: keyof FormErrors) => {
    return submitAttempted || !!formData[field as keyof typeof formData];
  };

  if (loading && !formData.storeId) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading record...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Pricing Record</DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: '1fr 1fr' }}>
          {/* Store ID */}
          <TextField
            label="Store ID *"
            value={formData.storeId}
            onChange={handleChange('storeId')}
            error={!!errors.storeId && shouldShowError('storeId')}
            helperText={shouldShowError('storeId') ? errors.storeId : 'e.g., IND-0456'}
            fullWidth
            required
          />
          
          {/* SKU */}
          <TextField
            label="SKU *"
            value={formData.sku}
            onChange={handleChange('sku')}
            error={!!errors.sku && shouldShowError('sku')}
            helperText={shouldShowError('sku') ? errors.sku : 'e.g., ABC123'}
            fullWidth
            required
          />
          
          {/* Product Name */}
          <TextField
            label="Product Name *"
            value={formData.productName}
            onChange={handleChange('productName')}
            error={!!errors.productName && shouldShowError('productName')}
            helperText={shouldShowError('productName') ? errors.productName : 'e.g., iPhone 15 Pro'}
            fullWidth
            required
            sx={{ gridColumn: '1 / -1' }}
          />
          
          {/* Price */}
          <TextField
            label="Price ($) *"
            type="number"
            value={formData.price}
            onChange={handleChange('price')}
            error={!!errors.price && shouldShowError('price')}
            helperText={shouldShowError('price') ? errors.price : 'e.g., 999.99'}
            fullWidth
            required
            inputProps={{ step: '0.01', min: '0.01' }}
          />
          
          {/* Date */}
          <TextField
            label="Date"
            value={formData.date}
            onChange={handleChange('date')}
            error={!!errors.date && shouldShowError('date')}
            helperText={shouldShowError('date') ? errors.date : 'YYYY-MM-DD (optional)'}
            fullWidth
          />
          
          {/* Notes */}
          <TextField
            label="Notes"
            value={formData.notes}
            onChange={handleChange('notes')}
            multiline
            rows={2}
            fullWidth
            sx={{ gridColumn: '1 / -1' }}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ ml: 'auto' }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
