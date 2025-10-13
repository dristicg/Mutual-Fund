'use client';
import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NextAppDirEmotionCacheProvider from './EmotionCache';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366F1',
      dark: '#4F46E5',
      light: '#A5B4FC',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#A855F7',
      dark: '#9333EA',
      light: '#D8B4FE',
      contrastText: '#ffffff',
    },
    success: { main: '#22C55E' },
    warning: { main: '#F59E0B' },
    info: { main: '#0EA5E9' },
    error: { main: '#EF4444' },
    background: {
      default: '#0b0e14',
      paper: 'rgba(255,255,255,0.06)',
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
    },
    divider: 'rgba(99,102,241,0.24)'
  },
  typography: {
    fontFamily: `var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`,
    h3: { fontWeight: 800, letterSpacing: '-0.02em' },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 14 },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.06)',
    '0 2px 6px rgba(0,0,0,0.08)',
    '0 8px 24px rgba(79,70,229,0.18)',
    ...Array(21).fill('0 8px 24px rgba(0,0,0,0.12)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { scrollBehavior: 'smooth' },
        body: {
          background:
            'radial-gradient(1000px 600px at 10% -10%, rgba(99,102,241,0.24), transparent 40%), radial-gradient(800px 600px at 120% 10%, rgba(168,85,247,0.22), transparent 40%), linear-gradient(180deg, rgba(14,18,28,1) 0%, rgba(10,12,20,1) 100%)',
          backgroundAttachment: 'fixed',
        },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(148,163,184,0.45)',
          borderRadius: 999,
          border: '2px solid transparent',
          backgroundClip: 'content-box',
        },
        '*::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
      },
    },
    MuiContainer: {
      defaultProps: { maxWidth: 'xl' },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          backdropFilter: 'saturate(120%) blur(8px)',
          border: `1px solid rgba(99,102,241,0.15)`,
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          border: `1px solid rgba(99,102,241,0.15)`,
          backdropFilter: 'saturate(120%) blur(8px)',
          transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
          willChange: 'transform',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 14px 42px rgba(79,70,229,0.28)',
            borderColor: 'rgba(99,102,241,0.35)'
          },
        }),
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          paddingInline: theme.spacing(2),
          '&.MuiButton-outlined': {
            borderColor: 'rgba(99,102,241,0.35)'
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 10 },
        label: { fontWeight: 600 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: 'rgba(17,24,39,0.35)',
          borderRadius: 12,
          color: '#e2e8f0',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(99,102,241,0.5)'
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
            boxShadow: '0 0 0 3px rgba(99,102,241,0.25)'
          },
        }),
        notchedOutline: {
          borderColor: 'rgba(148,163,184,0.25)'
        },
        input: { 
          paddingBlock: 12,
          color: '#e2e8f0',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#94a3b8',
          '&.Mui-focused': {
            color: '#a5b4fc',
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
        },
        option: {
          color: '#e2e8f0',
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
          },
          '&[aria-selected="true"]': {
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
          },
        },
        noOptions: {
          color: '#94a3b8',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(148,163,184,0.25)',
          backgroundColor: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(6px)',
        },
        icon: { opacity: 0.9 },
      },
    },
  },
});

export default function ThemeRegistry({ children }) {
  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </NextAppDirEmotionCacheProvider>
  );
}