import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';

interface SummaryCardProps {
  interval: string;
  amount: string;
}
const SummaryCard = ({interval, amount}: SummaryCardProps) => (
  <Card>
    <CardActionArea>
      <CardContent>
        <Typography color="text.secondary" gutterBottom>
          {interval}
        </Typography>
        <Typography variant="h6" component="div">
          {amount}
        </Typography>
        <Typography color="text.secondary">
          placeholder
        </Typography>
      </CardContent>
    </CardActionArea>
  </Card>
)

export default SummaryCard;
