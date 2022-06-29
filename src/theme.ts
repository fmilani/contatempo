import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
  },
  components: {
    MuiCard: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiPaper: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  }
});

export default responsiveFontSizes(theme);
