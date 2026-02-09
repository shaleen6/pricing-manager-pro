import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, CircularProgress, Box, Typography, Alert, Divider
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

  useEffect(() => {
    if (open && recordId) {
      loadRecord(recordId);
    } else if (!open) {
      resetForm();
    }
  }, [open, recordId]);

  const resetForm = () => {
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
  };

  const loadRecord = async (id: string) => {
    setLoading(true);
    try {
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
    } catch (error) {
      console.error('Failed to load record:', error);
    } finally {
      setLoading(false);
    }
  };

    const validateStoreId = (value: string): string => {
    if (!value.trim()) return 'Store ID is required';
    if (!/^[A-Z]{2,4}-\d{4,}$/.test(value.trim())) {
        return 'Format: XX-1234 (e.g., UK-0123, IND-0456, USA-0789)';
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

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    newErrors.storeId = validateStoreId(formData.storeId);
    newErrors.sku = validateSku(formData.sku);
    newErrors.productName = validateProductName(formData.productName);
    newErrors.price = validatePrice(formData.price);

    const dateError = validateDate(formData.date);
    if (dateError) newErrors.date = dateError;

    setErrors(newErrors);
    setSubmitAttempted(true);

    return Object.values(newErrors).every(error => !error);
  };

  const handleSubmit = async () => {
    if (!validateForm() || !recordId) return;

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
        alert('Failed to update record');
      }
    } catch (err: any) {
      console.error('Update error:', err);
      alert('Update failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

    const shouldShowError = (field: keyof FormErrors): boolean => {
    return !!errors[field] && (submitAttempted || !!formData[field as keyof typeof formData]);
    };


  if (loading && !formData.storeId) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 6, textAlign: 'center' }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading record...
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={!loading ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1, pt: 3 }}>
        <Typography variant="h5" fontWeight={700} color="primary.main">
          Edit Pricing Record
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Update store pricing information
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 3, md: 4 }, pt: 0 }}>
        {Object.values(errors).some(e => e) && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            Please fix the errors below before saving.
          </Alert>
        )}

        <Box sx={{ 
          display: 'grid', 
          gap: 3, 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          alignItems: 'end',
          paddingTop: 2
        }}>
          <TextField
            label="Store ID"
            value={formData.storeId}
            onChange={handleChange('storeId')}
            error={shouldShowError('storeId')}
            helperText={shouldShowError('storeId') ? errors.storeId : 'e.g., IND-0456'}
            fullWidth
            required
            disabled={loading}
          />
          <TextField
            label="SKU"
            value={formData.sku}
            onChange={handleChange('sku')}
            error={shouldShowError('sku')}
            helperText={shouldShowError('sku') ? errors.sku : 'e.g., ABC123XYZ'}
            fullWidth
            required
            disabled={loading}
          />
          <TextField
            label="Product Name"
            value={formData.productName}
            onChange={handleChange('productName')}
            error={shouldShowError('productName')}
            helperText={shouldShowError('productName') ? errors.productName : 'Max 100 characters'}
            fullWidth
            required
            sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}
            disabled={loading}
          />
          <TextField
            label="Price"
            type="number"
            value={formData.price}
            onChange={handleChange('price')}
            error={shouldShowError('price')}
            helperText={shouldShowError('price') ? errors.price : 'e.g., 999.99'}
            fullWidth
            required
            inputProps={{ step: '0.01', min: '0.01' }}
            disabled={loading}
          />
          <TextField
            label="Date"
            type="date"
            value={formData.date}
            onChange={handleChange('date')}
            error={shouldShowError('date')}
            helperText={shouldShowError('date') ? errors.date : 'Optional'}
            fullWidth
            InputLabelProps={{ shrink: true }}
            disabled={loading}
          />
          <TextField
            label="Notes (Optional)"
            value={formData.notes}
            onChange={handleChange('notes')}
            multiline
            rows={3}
            fullWidth
            sx={{ gridColumn: '1 / -1' }}
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ 
        p: { xs: 2, md: 3 }, 
        gap: 2, 
        justifyContent: 'space-between',
        flexWrap: 'wrap'
      }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          size="large"
          sx={{ 
            borderWidth: 2,
            px: 4
          }}
        >
          Cancel
        </Button> 
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          size="large"
          sx={{ 
            px: 4,
            boxShadow: 3,
            '&:hover': { boxShadow: 6 }
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
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
