import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, TextField, Button, Paper, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Box, CircularProgress,
  MenuItem, Select, InputLabel, FormControl, Typography, IconButton,
  Card, LinearProgress, Fade
} from '@mui/material';
import {
  Search, Refresh, Edit as EditIcon, Block, UploadFile, Clear
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { usePricingRecords, SearchFilters } from '../hooks/usePricingRecords';
import { EditRecordModal } from '../modals/EditRecordModal';
import { useAuth } from '../contexts/AuthContext';

const SearchRecords: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  
  const { records, loading, fetchRecords, searchRecords, filterRecords, reset, searchProductName, refetch } = usePricingRecords();
  const { hasPermission, user } = useAuth();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleTextSearch = useCallback(() => {
    if (loading) return;
    const term = searchTerm.trim().toLowerCase();    
    if (term) {
      if (term.includes('-') || /^[A-Z0-9]{3,}$/.test(term)) {
        searchRecords(term);
      } else {
        searchProductName(term);
      }
    } else {
      filterRecords(filters);
    }
  }, [searchTerm, filters, searchRecords, searchProductName, filterRecords, loading]);

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setSearchTerm('');
    setFilters({});
    reset();
  }, [reset]);

  const handleEdit = (recordId: string) => {
    if (!hasPermission('uploadCSV')) return;
    setSelectedRecordId(recordId);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    refetch();
    setEditModalOpen(false);
  };

  const showEditColumn = hasPermission('uploadCSV');
  const isPricingManagerOrAdmin = hasPermission('uploadCSV');

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Fade in={true} timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                🔍 Pricing Records
              </Typography>
              <Typography variant="h5" color="text.secondary">
                {records.length.toLocaleString()} records • 
                <Chip 
                  label={user?.role?.toUpperCase() || 'LOADING'} 
                  color={isPricingManagerOrAdmin ? "primary" : "default"}
                  variant="outlined"
                  size="small"
                  sx={{ ml: 1, fontWeight: 600 }}
                />
              </Typography>
            </Box>
            <Card sx={{ p: 2, minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Last Updated
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                {records.length > 0 ? new Date().toLocaleDateString() : 'Never'}
              </Typography>
            </Card>
          </Box>
        </Box>
      </Fade>

      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Quick Search & Filter
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'end' }}>
          <Box sx={{ flex: 1, minWidth: 400, position: 'relative' }}>
            <TextField
              fullWidth
              label="Search Store ID, SKU, or Product"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              disabled={loading}
              placeholder="Type iPhone or IND-0456 then click Search button"
            />
            {searchTerm && (
              <IconButton
                size="small"
                onClick={() => setSearchTerm('')}
                sx={{ 
                  position: 'absolute', 
                  right: 8, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'action.active'
                }}
              >
                <Clear fontSize="small" />
              </IconButton>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'end' }}>
            <FormControl size="small" sx={{ minWidth: 140 }} disabled={loading}>
              <InputLabel>Store</InputLabel>
              <Select
                value={filters.storeId || ''}
                label="Store"
                onChange={(e) => handleFilterChange('storeId', e.target.value)}
              >
                <MenuItem value="">All Stores</MenuItem>
                <MenuItem value="IND-0456">IND-0456</MenuItem>
                <MenuItem value="USA-0789">USA-0789</MenuItem>
                <MenuItem value="UK-0123">UK-0123</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }} disabled={loading}>
              <InputLabel>Country</InputLabel>
              <Select
                value={filters.country || ''}
                label="Country"
                onChange={(e) => handleFilterChange('country', e.target.value)}
              >
                <MenuItem value="">All Countries</MenuItem>
                <MenuItem value="IND">India</MenuItem>
                <MenuItem value="USA">USA</MenuItem>
                <MenuItem value="MEX">Mexico</MenuItem>
                <MenuItem value="GBR">UK</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="medium"
              startIcon={<Search />}
              onClick={handleTextSearch}
              sx={{ 
                minWidth: 120, 
                height: 44,
                boxShadow: 2,
                '&:hover': { boxShadow: 4 }
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Search'}
            </Button>
            
            <Button
              variant="outlined"
              size="medium"
              startIcon={<Refresh />}
              onClick={handleReset}
              sx={{ minWidth: 100, height: 44 }}
            >
              Reset
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mt: 2, borderRadius: 2 }} />}
      </Paper>

      <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
        <TableContainer sx={{ maxHeight: '70vh' }}>
          <Table stickyHeader>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Store ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                {showEditColumn && <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showEditColumn ? 6 : 5} sx={{ textAlign: 'center', py: 8 }}>
                    <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                        📭 No Records Found
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 3 }}>
                        {isPricingManagerOrAdmin ? 'Try searching or upload CSV first.' : 'Contact manager.'}
                      </Typography>
                      {isPricingManagerOrAdmin && (
                        <Button component={Link} to="/upload" variant="outlined" startIcon={<UploadFile />}>
                          Upload CSV
                        </Button>
                      )}
                    </Paper>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{record.storeId}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{record.sku}</TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                        {record.productName}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" fontWeight={700} color="primary.main">
                        ${record.price.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={record.date} size="small" variant="outlined" />
                    </TableCell>
                    {showEditColumn ? (
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleEdit(record.id)}>
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    ) : (
                      <TableCell align="right">
                        <IconButton size="small" disabled>
                          <Block fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {hasPermission('uploadCSV') && (
        <EditRecordModal
          open={editModalOpen}
          recordId={selectedRecordId}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </Container>
  );
};

export default SearchRecords;
