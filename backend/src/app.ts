import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import houseRoutes from './modules/houses/house.routes';
import itemRoutes from './modules/items/item.routes';
import recipeRoutes from './modules/recipes/recipe.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/houses', houseRoutes);
app.use('/items', itemRoutes);
app.use('/recipes', recipeRoutes);

export default app;
