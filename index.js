import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api/user', authRoutes);
app.use('/api/event', eventRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
