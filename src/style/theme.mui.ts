// src/style/theme.mui.ts
import { createTheme } from '@mui/material/styles';

// Paleta focalizada en notificaciones
const GREEN_MAIN = '#386641';
const GREEN_LIGHT = '#6A994E';
const GREEN_DARK = '#1B4332';
const NEUTRAL_BORDER = '#E5E5E5';
const NEUTRAL_BG_SOFT = '#F8F9F8';
const INFO_MAIN = '#2A9D8F';
const WARN_MAIN = '#E9C46A';
const ERROR_MAIN = '#D64545';
const SUCCESS_MAIN = GREEN_MAIN;

const theme = createTheme({
  palette: {
    primary: {
      main: GREEN_MAIN,
      light: GREEN_LIGHT,
      dark: GREEN_DARK,
      contrastText: '#FFFFFF',
    },
    success: {
      main: SUCCESS_MAIN,
      contrastText: '#FFFFFF',
    },
    info: {
      main: INFO_MAIN,
      contrastText: '#FFFFFF',
    },
    warning: {
      main: WARN_MAIN,
      contrastText: '#1B4332',
    },
    error: {
      main: ERROR_MAIN,
      contrastText: '#FFFFFF',
    },
    divider: NEUTRAL_BORDER,
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1B4332',
      secondary: '#6B6B6B',
    },
  },
  typography: {
    // No importo las fuentes, solo las declaro aquí.
    fontFamily: ['Inter', 'Roboto', 'sans-serif'].join(','),
    h5: { fontFamily: 'Inter, sans-serif', fontWeight: 600 },
    subtitle1: { fontFamily: 'Inter, sans-serif', fontWeight: 600 },
    body1: { fontFamily: 'Roboto, sans-serif', fontWeight: 400 },
    body2: { fontFamily: 'Roboto, sans-serif', fontWeight: 400 },
    caption: { fontFamily: 'Roboto, sans-serif', fontWeight: 400 },
    button: { fontFamily: 'Inter, sans-serif', fontWeight: 600, textTransform: 'none' },
  },
  components: {
    // Tabs de filtro
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 2,
          backgroundColor: GREEN_MAIN,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#6B6B6B',
          '&.Mui-selected': {
            color: GREEN_MAIN,
            fontWeight: 600,
          },
          textTransform: 'none',
          fontFamily: 'Inter, sans-serif',
        },
      },
    },

    // Snackbar y Alert (pop-ups)
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: GREEN_MAIN,
          color: '#FFFFFF',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          // Para pop-ups "variant=filled"
          '&.MuiAlert-filledInfo': {
            backgroundColor: GREEN_MAIN,
            color: '#FFFFFF',
          },
          '& .MuiAlertTitle-root': {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
          },
        },
      },
    },

    // Cards (sutil hover para la bandeja)
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'background-color 120ms ease',
          '&:hover': {
            backgroundColor: NEUTRAL_BG_SOFT,
          },
        },
      },
    },
  },
});

export default theme;