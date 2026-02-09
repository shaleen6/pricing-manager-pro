// src/pages/Dashboard.tsx - WORKS WITH YOUR FIREBASE AUTH
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';  // ✅ YOUR AUTH CONTEXT
import {
  Box, Typography, Grid, Paper, Chip, 
  Avatar, Stack, Alert
} from '@mui/material';
import {
  Store, AttachMoney, Inventory2, Person, 
  Search, FileDownload, ArrowDropUp, ArrowDropDown
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  const { user, hasPermission, loading } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { title: 'Active Stores', value: '3,247', change: '+12.5%', trend: 'up', icon: <Store />, color: 'primary' },
    { title: 'Total Revenue', value: '$2.4M', change: '+8.2%', trend: 'up', icon: <AttachMoney />, color: 'success' },
    { title: 'Price Records', value: '1.2M', change: '+45%', trend: 'up', icon: <Inventory2 />, color: 'info' },
    { title: 'Active Users', value: '89', change: '-2%', trend: 'down', icon: <Person />, color: 'warning' }
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasPermission('viewDashboard')) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="error">
          ❌ Insufficient permissions to view dashboard
        </Alert>
      </Box>
    );
  }

  const handleSearchClick = () => {
    if (hasPermission('searchRecords')) {
      navigate('/search');
    }
  };

  const handleUploadClick = () => {
    if (hasPermission('uploadCSV')) {
      navigate('/upload');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header with Role Badge */}
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 500, mb: 1 }}>
            Dashboard Overview
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Monitor pricing across 3,247 stores
          </Typography>
        </Box>
      </Stack>

      {/* Stats - Always visible for dashboard access */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {stats.map((stat, index) => (
          <Grid key={index} {...({ item: true, xs: 12, sm: 6, lg: 3 } as any)}>
            <Paper sx={{
              p: 3, height: 150, borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }
            }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: `${stat.color}.100`, color: `${stat.color}.700`, width: 44, height: 44 }}>
                  {stat.icon}
                </Avatar>
                <Chip
                  label={stat.change}
                  size="small"
                  color={stat.trend === 'up' ? 'success' : 'error'}
                  icon={stat.trend === 'up' ? <ArrowDropUp /> : <ArrowDropDown />}
                />
              </Stack>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid {...({ item: true, xs: 12, lg: hasPermission('viewAnalytics') ? 8 : 12 } as any)}>
          <Paper sx={{ p: 4, height: 420, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              Recent Price Changes {hasPermission('viewAnalytics') ? '' : '(Limited View)'}
            </Typography>
            <Box sx={{ height: 300, bgcolor: 'grey.50', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">📈 Price Trends Chart</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions - FULLY RBAC CONTROLLED */}
        <Grid {...({ item: true, xs: 12, lg: 4 } as any)}>
          <Paper sx={{ p: 4, height: 420, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              Quick Actions
            </Typography>
            <Stack spacing={2}>
              {/* Search Records */}
              <Paper 
                sx={{ 
                  p: 3, borderRadius: 2, 
                  opacity: hasPermission('searchRecords') ? 1 : 0.5,
                  '&:hover': { 
                    bgcolor: hasPermission('searchRecords') ? 'action.hover' : 'transparent',
                    cursor: hasPermission('searchRecords') ? 'pointer' : 'not-allowed',
                    transform: hasPermission('searchRecords') ? 'translateX(4px)' : 'none'
                  },
                  transition: 'all 0.2s ease'
                }}
                onClick={handleSearchClick}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.100', color: 'primary.main' }}>
                    <Search />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>Search Records</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {hasPermission('searchRecords') ? 'Find any price record' : 'Viewer+ required'}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Upload CSV - Manager+ only */}
              <Paper 
                sx={{ 
                  p: 3, borderRadius: 2, 
                  opacity: hasPermission('uploadCSV') ? 1 : 0.5,
                  '&:hover': { 
                    bgcolor: hasPermission('uploadCSV') ? 'action.hover' : 'transparent',
                    cursor: hasPermission('uploadCSV') ? 'pointer' : 'not-allowed',
                    transform: hasPermission('uploadCSV') ? 'translateX(4px)' : 'none'
                  },
                  transition: 'all 0.2s ease'
                }}
                onClick={handleUploadClick}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'success.100', color: 'success.main' }}>
                    <FileDownload />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>Upload CSV</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {hasPermission('uploadCSV') ? 'Bulk price updates' : 'Manager+ required'}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Paper>
        </Grid>

        <Grid {...({ item: true, xs: 12 } as any)}>
          <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              Recent Activity
            </Typography>
            {/* Activity list... */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
