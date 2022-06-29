import type { NextPage } from 'next';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import PlayIcon from '@mui/icons-material/PlayArrowRounded';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import SummaryCard from '../src/SummaryCard';

const Home: NextPage = () => {
  return (
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sx={{mb: 4}}>
            <Paper sx={{p: 2}}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" component="div" color="text.secondary" gutterBottom>Today</Typography>
                  <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography variant="h2" component="div">01:30</Typography>
                    <Typography variant="h4" component="div" color="success.main">+00:15</Typography>
                  </Stack>
                  <Typography variant="h6" component="div" color="text.secondary">placeholder</Typography>
                </Box>
                <IconButton aria-label="start" color="success" edge="end">
                  <PlayIcon fontSize="large" sx={{fontSize: 80}} />
                </IconButton>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <SummaryCard interval="This week" amount="38 hours 42 minutes" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SummaryCard interval="This month" amount="157 hours 08 minutes" />
          </Grid>
        </Grid>
      </Box>
  );
};

export default Home;
