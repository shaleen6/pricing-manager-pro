import React, { useState, useCallback } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, AppBar, Toolbar, Typography, TextField, Button,  CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import UploadCSV from './UploadCSV'; 
import { PricingRecord } from '../models/PricingRecords';
import SearchRecords from './SearchPage';
import EditModal from './EditPriceModal';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { usePricingRecords } from '../hooks/usePricingRecords';
import SignIn from './SignIn';
import ProtectedRoute from './ProtectedRoute';
import Layout from './Layout';
import UsersDashboard from './UserCreationDashboard';
import { LayoutProvider } from '../contexts/LayoutContext';

export const theme = createTheme({
  palette: { primary: { main: '#1976d2' }, error: { main: '#d32f2f' } },
});

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <Container maxWidth="sm">
        <SignIn />
      </Container>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <LayoutProvider>  {/* ✅ WRAP WITH LAYOUT PROVIDER */}
          <Routes>
            <Route element={<ProtectedRoute>
              <Layout />
            </ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/search" element={<SearchRecords />} />
              <Route path="/upload" element={<UploadCSV />} />
              <Route path="/users" element={<UsersDashboard />} />
            </Route>
            <Route path="/signin" element={<SignIn />} />
          </Routes>
        </LayoutProvider>
    </ThemeProvider>
  );
};

export default AppContent;