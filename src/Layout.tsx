import type {ReactElement} from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AccountCircle from '@mui/icons-material/AccountCircle';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import theme from './theme';

type LayoutProps = {
  children: ReactElement
}
export default function Layout({ children }: LayoutProps) {
  return (
    <Container maxWidth="md" disableGutters sx={{backgroundColor: theme.palette.common.white}}>
      <Box sx={{height: '100vh'}}>
        <AppBar position="relative">
          <Toolbar>
            <Typography
              variant="h6"
              noWrap
              component="div"
            >
              Contatempo
            </Typography>
            <Box sx={{flexGrow: 1}} />
            <Box sx={{ display: 'flex' }}>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <Box component="main">{children}</Box>
      </Box>
      <Box component="footer" sx={{textAlign: 'center'}}>
        <Divider sx={{marginBottom: 2}}/>
        <Typography>
          Made with ❤️ by <Link href="https://www.github.com/fmilani">fmilani</Link>
        </Typography>
      </Box>
    </Container>
  )
}
