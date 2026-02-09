// src/providers/ThemeProvider.tsx - PERFECTLY WORKING
import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import figmaTheme from '../theme/theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MuiThemeProvider theme={figmaTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
