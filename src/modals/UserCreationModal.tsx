import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, CircularProgress, Alert, Box, FormControl,
  InputLabel, Select, MenuItem, Chip,
  Typography
} from '@mui/material';
import { useUserManagement, UserFormData } from '../hooks/useUserManagement';

interface UserCreationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const UserCreationModal: React.FC<UserCreationModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    displayName: '',
    role: 'viewer'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  const { createUser, loading, error: apiError } = useUserManagement();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Name is required';
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Name must be at least 2 characters';
    }

    setErrors(newErrors);
    setSubmitAttempted(true);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof UserFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRoleChange = (e: any) => {
    setFormData(prev => ({ ...prev, role: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const result = await createUser({
      email: formData.email.trim(),
      password: formData.password,
      displayName: formData.displayName.trim(),
      role: formData.role
    });

    if (result.success) {
      onSuccess(result.user);
      onClose();
      setFormData({ email: '', password: '', displayName: '', role: 'viewer' });
      setErrors({});
    }
  };

  const shouldShowError = (field: string) => {
    return submitAttempted && !!errors[field];
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New User</DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Full Name *"
            value={formData.displayName}
            onChange={handleChange('displayName')}
            error={shouldShowError('displayName')}
            helperText={shouldShowError('displayName') ? errors.displayName : 'John Doe'}
            fullWidth
            required
          />

          <TextField
            label="Email *"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            error={shouldShowError('email')}
            helperText={shouldShowError('email') ? errors.email : 'user@company.com'}
            fullWidth
            required
          />

          <TextField
            label="Password *"
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            error={shouldShowError('password')}
            helperText={
              shouldShowError('password') 
                ? errors.password 
                : 'Minimum 6 characters'
            }
            fullWidth
            required
          />

 
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={handleRoleChange}
            >
              <MenuItem value="viewer">Viewer</MenuItem>
              <MenuItem value="pricing_manager">Pricing Manager</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Viewer:</strong> Read-only access to pricing data
              <br />
              <strong>Pricing Manager:</strong> Edit pricing records
              <br />
              <strong>Admin:</strong> Full access + user management
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button onClick={onClose} disabled={loading}>
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
              Creating...
            </>
          ) : (
            'Create User'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
