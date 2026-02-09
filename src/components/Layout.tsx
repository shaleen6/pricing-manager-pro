import React, { useState } from 'react';
import {
  Box, AppBar, Toolbar, Typography, IconButton, useTheme, useMediaQuery,
  Avatar, Tooltip, Menu, MenuItem, Badge, Divider, Paper,
  Chip
} from '@mui/material';
import { 
  Menu as MenuIcon, Notifications, Logout, Person, Settings 
} from '@mui/icons-material';
import SideNav from './SideNav';
import { Outlet } from 'react-router-dom';
import { LayoutProvider, useLayout } from '../contexts/LayoutContext';
import { useAuth } from '../contexts/AuthContext';

const LayoutContent: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElNotif, setAnchorElNotif] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const { drawerWidth, collapsed } = useLayout(); 
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotif = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotif(event.currentTarget);
  };

  const handleCloseNotif = () => {
    setAnchorElNotif(null);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          zIndex: theme.zIndex.drawer + 1,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{ 
              display: { xs: 'none', sm: 'block' },
              fontWeight: 700,
              letterSpacing: '-0.025em',
              flexGrow: 1
            }}
          >
            Pricing Manager Pro
          </Typography>

          <Box 
            sx={{ 
              position: 'absolute', 
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Tooltip title="Notifications">
              <IconButton 
                onClick={handleOpenNotif} 
                size="small"
                sx={{ 
                  color: 'rgba(255,255,255,0.85)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
                }}
              >
                <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}>
                  <Notifications fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Profile">
              <IconButton 
                onClick={handleOpenUserMenu}
                sx={{ 
                  p: 0.75,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                    borderRadius: 2
                  }
                }}
              >
                <Avatar 
                  alt={user?.email || 'U'} 
                  sx={{ 
                    width: 40, 
                    height: 40,
                    bgcolor: 'rgba(255,255,255,0.25)',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                >
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          ml: { lg: `${drawerWidth}px` },
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1
        }}
      >
        <SideNav open={mobileOpen || isDesktop} onClose={handleDrawerToggle} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            mt: 0,
            bgcolor: 'background.default',
            minHeight: 'calc(100vh - 64px)'
          }}
        >
          <Outlet />
        </Box>
      </Box>

      <Menu
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 260,
            boxShadow: '0 12px 48px rgba(0,0,0,0.2)',
            borderRadius: 2.5,
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      >
        <Paper 
          sx={{ 
            p: 3, 
            m: 1, 
            borderRadius: 2.5,
            bgcolor: 'background.paper',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar 
              sx={{ 
                width: 52, height: 52, 
                bgcolor: 'primary.main',
                fontSize: '1.3rem',
                fontWeight: 700
              }}
            >
              {user?.email?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight={600} sx={{ mb: 0.25 }}>
                {user?.email}
              </Typography>
              <Chip 
                label={user?.role?.toUpperCase() || 'ADMIN'} 
                size="small"
                color="primary"
                variant="filled"
                sx={{ fontSize: '0.7rem', height: 22 }}
              />
            </Box>
          </Box>
        </Paper>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={handleCloseUserMenu} sx={{ py: 1.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Person fontSize="small" />
            <Typography variant="body2">Profile</Typography>
          </Box>
        </MenuItem>

        <MenuItem onClick={handleCloseUserMenu} sx={{ py: 1.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Settings fontSize="small" />
            <Typography variant="body2">Settings</Typography>
          </Box>
        </MenuItem>

        <Divider />

        <MenuItem 
          onClick={() => {
            handleCloseUserMenu();
            logout();
          }}
          sx={{ 
            py: 1.75,
            '&:hover': { bgcolor: 'error.50' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Logout fontSize="small" color="error" />
            <Typography variant="body2" color="error.main" fontWeight={600}>
              Sign Out
            </Typography>
          </Box>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={anchorElNotif}
        open={Boolean(anchorElNotif)}
        onClose={handleCloseNotif}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { minWidth: 280 } }}
      >
        <MenuItem disabled>Coming Soon...</MenuItem>
      </Menu>
    </Box>
  );
};

const Layout: React.FC = () => {
  return (
    <LayoutProvider>
      <LayoutContent />
    </LayoutProvider>
  );
};

export default Layout;
