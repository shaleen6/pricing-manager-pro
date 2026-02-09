import { createTheme } from '@mui/material/styles';

const figmaTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366F1', 
      light: '#818CF8',
      dark: '#4F46E5'
    },
    secondary: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669'
    },
    background: {
      default: '#0F172A', 
      paper: '#1E293B'
    },
    text: {
      primary: '#F8FAFC', 
      secondary: '#CBD5E1'
    },
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    info: { main: '#3B82F6' }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1.125rem', fontWeight: 600 },
    body1: { fontSize: '0.875rem', lineHeight: 1.6 }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.05), transparent)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          textTransform: 'none',
          padding: '12px 24px',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.6)',
            transform: 'translateY(-1px)'
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '16px'
        },
        head: {
          fontWeight: 600,
          background: 'rgba(99, 102, 241, 0.15)',
          borderBottom: '2px solid rgba(99, 102, 241, 0.3)'
        }
      }
    }
  }
});

export default figmaTheme;
