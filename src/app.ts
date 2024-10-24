import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import dotenv from 'dotenv';
import todoRoutes from './routes/todoRoutes';
import { Request, Response } from 'express';
import Todo from './models/Todo';
import { getCache } from './services/igniteService';

dotenv.config();

process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error:', err);
    // You might want to log the error to an external service here
    // Optionally exit the process
//    process.exit(1); // Exit the process with an error code
});

const app = express();
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));	
app.use(express.json());


app.use('/api/todos', todoRoutes);

module.exports = app
export default app;
