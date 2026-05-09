import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import houseRoutes from './modules/houses/house.routes';
import itemRoutes from './modules/items/item.routes';
import recipeRoutes from './modules/recipes/recipe.routes';
import choreRoutes from './modules/chores/chore.routes';
import shoppingRoutes from './modules/shopping/shopping.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/houses', houseRoutes);
app.use('/items', itemRoutes);
app.use('/recipes', recipeRoutes);
app.use('/chores', choreRoutes);
app.use('/shopping-lists', shoppingRoutes);

export default app;
