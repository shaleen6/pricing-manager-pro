import React from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Tooltip, IconButton, Chip, Divider, Paper, Fade
} from '@mui/material';
import {
  Dashboard, UploadFile, Search, VerifiedUser, Logout, 
  ChevronLeft, ChevronRight, Menu
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useLayout } from '../contexts/LayoutContext';
import { useAuth } from '../contexts/AuthContext';

const SideNav: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const location = useLocation();
  const { collapsed, toggleCollapse, drawerWidth } = useLayout();
  const { logout, hasPermission, user } = useAuth();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
      permission: 'viewDashboard' as const
    },
    {
      text: 'Search Records',
      icon: <Search />,
      path: '/search',
      permission: 'searchRecords' as const
    },
    {
      text: 'Upload CSV',
      icon: <UploadFile />,
      path: '/upload',
      permission: 'uploadCSV' as const
    },
    {
      text: 'User Management',
      icon: <VerifiedUser />,
      path: '/users',
      permission: 'manageUsers' as const
    }
  ].filter(item => hasPermission(item.permission));

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        position: 'fixed',
        top: '64px',
        height: 'calc(100vh - 64px)',
        width: drawerWidth,
        flexShrink: 0,
        zIndex: 1200,
        '& .MuiDrawer-paper': {
          top: '64px',
          height: 'calc(100vh - 64px)',
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: 'none',
          bgcolor: collapsed ? '#f8fafc' : '#ffffff',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          boxShadow: collapsed 
            ? '2px 0 8px rgba(0,0,0,0.06)' 
            : '4px 0 24px rgba(0,0,0,0.12)',
        }
      }}
    >
      <Box sx={{ 
        p: collapsed ? 1.5 : 2.5, 
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        bgcolor: '#f8fafc'
      }}>
        {collapsed ? (
          <Tooltip title="Expand Menu">
            <IconButton
              onClick={toggleCollapse}
              sx={{ 
                color: '#64748b',
                '&:hover': { bgcolor: '#f1f5f9' }
              }}
            >
              <Menu sx={{ fontSize: 24 }} />
            </IconButton>
          </Tooltip>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: '#6366f1', 
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, fontSize: '1.25rem' }}>
                {user?.role.charAt(0).toUpperCase()}
              </Typography>
            </Box>
            
            <Box sx={{ flexGrow: 1 }}>
              <Chip 
                label={user?.role?.toUpperCase() || 'ADMIN'} 
                size="small"
                color="primary"
                variant="filled"
                sx={{ fontSize: '0.7rem', height: 22 }}
              />             
            </Box>
            <Tooltip title="Collapse Menu">
              <IconButton
                onClick={toggleCollapse}
                sx={{ 
                  color: '#475569',
                  '&:hover': { bgcolor: '#f1f5f9' }
                }}
              >
                <ChevronLeft />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto', px: collapsed ? 0.5 : 1.5, py: 2 }}>
        <List disablePadding sx={{ gap: 0.5 }}>
          {menuItems.map((item, index) => {
            const selected = location.pathname === item.path;
            return (
              <Tooltip key={item.text} title={collapsed ? item.text : ''} placement="right" arrow>
                <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    selected={selected}
                    onClick={onClose}
                    sx={{
                      borderRadius: 2.5,
                      mx: collapsed ? 1 : 0.5,
                      my: 0.25,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      minHeight: 52,
                      px: collapsed ? 2.5 : 3,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      '&:hover': {
                        bgcolor: selected ? '#4f46e5' : '#f8fafc',
                        transform: selected ? 'none' : 'translateX(4px)',
                      },
                      '&.Mui-selected': {
                        bgcolor: '#6366f1',
                        color: 'white',
                        transform: 'scale(1.02)',
                        boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                        '&:hover': { bgcolor: '#4f46e5' }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: 'auto',
                      justifyContent: 'center',
                      mr: collapsed ? 0 : 2,
                      color: selected ? 'white' : '#6366f1',
                      transition: 'all 0.2s ease'
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText 
                        primary={item.text} 
                        sx={{ 
                          '& .MuiTypography-root': { 
                            fontSize: '0.95rem', 
                            fontWeight: 600,
                            letterSpacing: '-0.01em',
                            color: selected ? 'white' : '#1e293b'
                          } 
                        }} 
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            );
          })}
          
          {menuItems.length === 0 && !collapsed && (
            <Box sx={{ p: 4, textAlign: 'center', mt: 2 }}>
              <Paper sx={{ p: 3, bgcolor: '#f8fafc', border: '2px dashed #cbd5e1' }}>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                  No accessible features
                </Typography>
                <Chip 
                  label={user?.role?.toUpperCase() || 'LOADING'} 
                  sx={{ bgcolor: '#fed7aa', color: '#92400e' }}
                  size="small"
                />
              </Paper>
            </Box>
          )}
        </List>
      </Box>

      <Box sx={{ p: 1 }}>
        <Tooltip title={collapsed ? "Sign Out" : ''} placement="right" arrow>
          <ListItemButton 
            sx={{ 
              borderRadius: 2.5, 
              mx: collapsed ? 1 : 0.5,
              my: 1,
              p: 2,
              transition: 'all 0.2s ease',
              '&:hover': { 
                bgcolor: '#fee2e2',
                transform: 'translateX(2px)'
              }
            }}
            onClick={logout}
          >
            <ListItemIcon sx={{ 
              minWidth: 'auto', 
              justifyContent: 'center',
              mr: collapsed ? 0 : 2,
              color: '#dc2626'
            }}>
              <Logout />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText 
                primary="Sign Out" 
                sx={{ 
                  '& .MuiTypography-root': { 
                    color: '#dc2626',
                    fontWeight: 600,
                    fontSize: '0.95rem'
                  } 
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
};

export default SideNav;
