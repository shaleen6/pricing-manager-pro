import React, { useState, useCallback, useEffect } from 'react';
import {
  Container, Typography, Box, Button, Paper, Chip, Snackbar, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, FormControl, InputLabel, CircularProgress
} from '@mui/material';
import {
  CloudUpload, CheckCircle, Error as ErrorIcon, Download,
} from '@mui/icons-material';
import Papa from 'papaparse';
import { useCsvUpload } from '../hooks/useCsvUpload';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

interface ParsedRow {
  storeId: string;
  sku: string;
  productName: string;
  price: string;
  date: string;
  rowIndex: number;
  valid: boolean;
  errors: string[];
}

interface PricingRecord {
  id: string;
  storeId: string;
  sku: string;
  productName: string;
  price: number;
  date: string;
}

const UploadCSV: React.FC = () => {
  const [view, setView] = useState<'upload' | 'listing'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [uploadOption, setUploadOption] = useState<'append' | 'overwrite'>('append');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  
  const [records, setRecords] = useState<PricingRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  
  const { uploadCSV, uploading } = useCsvUpload();

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (view === 'listing') {
      setLoadingRecords(true);
      const q = query(
        collection(db, 'pricing-records'),
        orderBy('updatedAt', 'desc'),
        limit(100)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PricingRecord[];
        setRecords(data);
        setLoadingRecords(false);
      });
      
      return () => unsubscribe();
    }
  }, [view]);

  const downloadTemplate = useCallback(() => {
    const csvContent = `Store ID,SKU,Product Name,Price,Date
IND-0456,ABC123,iPhone 15 Pro,999.99,2026-02-06
IND-0456,ABC124,iPhone 15 Pro Max,1199.99,2026-02-06
USA-0789,DEF456,MacBook Pro 16",2499.99,2026-02-05`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricing-feed-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }, []);

  const parseCSV = useCallback((file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const rows: ParsedRow[] = results.data.map((row: any, index: number) => {
          const errors: string[] = [];
          
          if (!row['Store ID']?.trim()) errors.push('Missing Store ID');
          if (!row['SKU']?.trim()) errors.push('Missing SKU');
          if (!row['Product Name']?.trim()) errors.push('Missing Product Name');
          if (!row['Price'] || isNaN(parseFloat(row['Price']))) errors.push(`Invalid Price: "${row['Price']}"`);
          if (!row['Date']?.trim()) errors.push('Missing Date');

          return {
            storeId: row['Store ID']?.trim() || '',
            sku: row['SKU']?.trim() || '',
            productName: row['Product Name']?.trim() || '',
            price: row['Price'] || '',
            date: row['Date'] || '',
            rowIndex: index + 2,
            valid: errors.length === 0,
            errors
          };
        });

        setParsedData(rows);
      }
    });
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) return;

    try {
      showSnackbar('Uploading to Firebase...', 'success');
      
      await uploadCSV(file, uploadOption);
      
      showSnackbar(`Batch upload completed! ${parsedData.filter(r => r.valid).length} records saved`, 'success');
      
      setTimeout(() => {
        setFile(null);
        setParsedData([]);
        setView('listing');
      }, 2000);
      
    } catch (error: any) {
      showSnackbar(`Upload failed: ${error.message}`, 'error');
    }
  }, [file, parsedData, uploadCSV, uploadOption]);

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.name.endsWith('.csv')) {
      setFile(droppedFile);
      parseCSV(droppedFile);
    }
  }, [parseCSV]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.name.endsWith('.csv')) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  }, [parseCSV]);

  const validRecords = parsedData.filter(row => row.valid);
  const invalidRecords = parsedData.filter(row => !row.valid);

  const resetToUpload = () => {
    setView('upload');
    setFile(null);
    setParsedData([]);
  };

  if (view === 'upload') {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 3 }}>
          <Typography variant="h4">📤 CSV Pricing Upload</Typography>
        </Box>

        <Button 
          variant="outlined" 
          startIcon={<Download />}
          onClick={downloadTemplate}
          sx={{ mb: 4 }}
        >
          Download Template CSV
        </Button>

        {!file ? (
          <Paper sx={{
            border: '3px dashed #1976d2', borderRadius: 3, p: 8, textAlign: 'center',
            cursor: 'pointer', transition: 'all 0.3s', '&:hover': { bgcolor: '#f5faff' }
          }}
            onDrop={handleFileDrop} onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('csv-upload')?.click()}
          >
            <CloudUpload sx={{ fontSize: 64, color: '#1976d2', mb: 3 }} />
            <Typography variant="h6" color="primary">Drag & drop CSV file</Typography>
            <input id="csv-upload" type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileSelect} />
          </Paper>
        ) : (
          <>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">{file.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(file.size / 1024 / 1024).toFixed(1)} MB • {parsedData.length} rows
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Chip label={`${validRecords.length}`} color="success" />
                  <Chip label={`${invalidRecords.length}`} color="error" />
                </Box>
              </Box>

              <FormControl size="small" sx={{ mt: 2, minWidth: 200 }}>
                <InputLabel>Upload Mode</InputLabel>
                <Select value={uploadOption} label="Upload Mode" onChange={(e) => setUploadOption(e.target.value as any)}>
                  <MenuItem value="append">Append (Skip duplicates)</MenuItem>
                  <MenuItem value="overwrite">Overwrite existing</MenuItem>
                </Select>
              </FormControl>
            </Paper>

            <Paper sx={{ mb: 4 }}>
              <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle color="success" /> VALID RECORDS ({validRecords.length})
                </Typography>
              </Box>
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Row</TableCell>
                      <TableCell>Store ID</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell>Product Name</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {validRecords.slice(0, 10).map((row) => (
                      <TableRow key={row.rowIndex} hover>
                        <TableCell>{row.rowIndex}</TableCell>
                        <TableCell><strong>{row.storeId}</strong></TableCell>
                        <TableCell>{row.sku}</TableCell>
                        <TableCell sx={{ maxWidth: 250 }}>{row.productName}</TableCell>
                        <TableCell><strong>${parseFloat(row.price).toFixed(2)}</strong></TableCell>
                        <TableCell>{row.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {invalidRecords.length > 0 && (
              <Paper sx={{ mb: 4 }}>
                <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ErrorIcon color="error" /> INVALID RECORDS ({invalidRecords.length})
                  </Typography>
                </Box>
                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Row</TableCell>
                        <TableCell>Store ID</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Errors</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invalidRecords.slice(0, 10).map((row) => (
                        <TableRow key={row.rowIndex} sx={{ bgcolor: 'error.50' }}>
                          <TableCell>{row.rowIndex}</TableCell>
                          <TableCell>{row.storeId || '❌'}</TableCell>
                          <TableCell>{row.sku || '❌'}</TableCell>
                          <TableCell sx={{ maxWidth: 200 }}>{row.productName || '❌'}</TableCell>
                          <TableCell sx={{ color: 'error.main' }}>{row.price || '❌'}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>
                            {row.errors.map((error, i) => (
                              <div key={i}>• {error}</div>
                            ))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            <Box sx={{ display: 'flex', gap: 2, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<CloudUpload />}
                onClick={handleUpload}
                disabled={uploading || validRecords.length === 0}
                sx={{ flex: 1, py: 1.5 }}
              >
                {uploading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Uploading...
                  </>
                ) : (
                  `Upload ${validRecords.length} Valid Records`
                )}
              </Button>
              <Button variant="outlined" onClick={() => setFile(null)} sx={{ py: 1.5 }}>
                Cancel
              </Button>
            </Box>
          </>
        )}

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 3 }}>
        <Typography variant="h4">📋 Pricing Records ({records.length})</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<CloudUpload />}
            onClick={resetToUpload}
          >
            New CSV Upload
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Download />}
            onClick={downloadTemplate}
          >
            Download Template
          </Button>
        </Box>
      </Box>

      {loadingRecords ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading records...</Typography>
        </Paper>
      ) : records.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No records found. Upload your first CSV!
          </Typography>
          <Button variant="contained" startIcon={<CloudUpload />} onClick={resetToUpload}>
            Start Upload
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Store ID</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>{record.storeId}</TableCell>
                  <TableCell>{record.sku}</TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>{record.productName}</TableCell>
                  <TableCell><strong>${Number(record.price)?.toFixed(2)}</strong></TableCell>
                  <TableCell>{record.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default UploadCSV;
