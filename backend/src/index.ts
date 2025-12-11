import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import searchRoutes from './routes/searchRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend is healthy' });
});

app.use('/api', searchRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
