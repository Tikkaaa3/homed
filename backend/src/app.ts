import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import houseRoutes from './modules/houses/house.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/houses', houseRoutes);

export default app;
