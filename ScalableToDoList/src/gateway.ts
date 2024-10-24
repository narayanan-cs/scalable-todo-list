import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import session from 'express-session';
import { body, validationResult, param } from 'express-validator';
import dotenv from 'dotenv'; 
import { configurePassport } from './config/passport'; // Adjust the path as needed
import isAuthenticated from './middlewares/authentication';
import {User} from './models/User'
dotenv.config();

process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error in gateway:', err);
});

const app = express();
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not defined');
}
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));	
app.use(express.json());
const PORT = process.env.PORT || 3000;
const TODO_SERVICE_URL = 'http://localhost:4000'; // Change this to your actual service URL

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 1000 * 60 * 15 // Cookie expiration
    }
}));
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// GitHub OAuth routes
app.get('/auth/github', (req, res, next) => {
console.log("Logging in")
 passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
});

app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
console.log("calling back")
        res.redirect('/api/todos');
    }
);

// Request validation middleware
const validateTodo = [
    body('title').isString().notEmpty().withMessage('Title is required'),
];

const validateTodoId = [
    param('id').isString().withMessage('Valid Todo Id is required'),
];

// Error handling middleware
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
}

app.use(express.json());

// Route to get all todos
app.get('/api/todos', isAuthenticated, async (req: Request, res: Response): Promise<void> => {
    try {
if (!req.user) {
             res.status(401).json({ error: 'Unauthorized' });
             return
        }
	const userId = (req.user as User)?._id
console.log((req.user as User)?._id,"userId in gateway",userId)
        const response = await axios.get(`${TODO_SERVICE_URL}/api/todos?userId=${userId}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching todos' });
    }
});

// Route to get todos by email
app.get('/api/todos/:email', isAuthenticated, async (req: Request, res: Response) => {
    try {
	console.log("email at gateway", req.params.email)
        const response = await axios.get(`${TODO_SERVICE_URL}/api/todos/${req.params.email}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching todos' });
    }
});

// Route to create a new todo
app.post('/api/todos', isAuthenticated, validateTodo, async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    }

    try {
if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return
        }
	req.body.userId = (req.user as User)?._id
console.log(req.body,"post request at gateway")	
        const response = await axios.post(`${TODO_SERVICE_URL}/api/todos`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error creating todo' });
    }
});

// Update Todo Handler
app.put('/api/todos/:id', isAuthenticated, validateTodoId,  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return; // Explicit early return to prevent any further execution
    }

    try {
        const { username, email, title, completed } = req.body; // Adjust destructuring as needed
       const updatedTodo = await axios.put(`${TODO_SERVICE_URL}/api/todos/${req.params.id}`, { username, email, title, completed });
        res.json(updatedTodo.data); 
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error updating todo:', error.response?.data);
            res.status(error.response?.status || 500).json({ message: 'Error updating todo' });
        } else {
            console.error('Unexpected error:', error);
            res.status(500).json({ message: 'Unexpected error occurred' });
        }
    }
});

// Delete Todo Handler
app.delete('/api/todos/:id', isAuthenticated, validateTodoId, async (req: Request, res: Response): Promise<void> => {
    try {
        await axios.delete(`${TODO_SERVICE_URL}/api/todos/${req.params.id}`);
        res.status(204).send(); // No content
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error('Error deleting todo:', error.response?.data);
            res.status(error.response?.status || 500).json({ message: 'Error deleting todo' });
        } else {
            console.error('Unexpected error:', error);
            res.status(500).json({ message: 'Unexpected error occurred' });
        }
    }
});


// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`API Gateway listening on port ${PORT}`);
});
module.exports = app
export default app;