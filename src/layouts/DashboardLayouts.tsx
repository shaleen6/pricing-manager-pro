// src/layouts/DashboardLayout.tsx - PERFECT FIGMA MATCH
import React from 'react';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Drawer,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Avatar, CssBaseline
} from '@mui/material';
import {
  Dashboard, Inventory2, People, BarChart, Menu, ChevronLeft
} from '@mui/icons-material';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 260;

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, href: '/dashboard' },
    { text: 'Pricing Records', icon: <Inventory2 />, href: '/pricing' },
    { text: 'Users', icon: <People />, href: '/users' },
    { text: 'Analytics', icon: <BarChart />, href: '/analytics' }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Top Navigation */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              onClick={handleDrawerToggle}
              sx={{ display: { sm: 'none' } }}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" fontWeight={700} color="common.white">
              Pricing Manager
            </Typography>
          </Box>
          
          <Avatar sx={{ bgcolor: '#6366F1', width: 40, height: 40 }}>
            JD
          </Avatar>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)'
            }
          }}
        >
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton>
                  <ListItemIcon sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
              borderRight: 'none'
            }
          }}
          open
        >
          <Toolbar sx={{ minHeight: 80 }} />
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  sx={{
                    borderRadius: 12,
                    margin: '4px 12px',
                    '&:hover': {
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#6366F1'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48, color: 'rgba(255,255,255,0.7)' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          backgroundColor: '#0F172A',
          minHeight: '100vh'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
