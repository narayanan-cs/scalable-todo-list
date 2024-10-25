import { Request, Response } from 'express';
import Todo from '../models/Todo';
import { getCache } from '../services/igniteService';

export const createTodo = async (req: Request, res: Response): Promise<void> => {
console.log(req.body, "post request body from gateway")
  const { userId, title, username, email } = req.body;
  const todo = new Todo({
    userId, // Use _id here
    title,
    username,
    email
  });

  await todo.save();
const cache = await getCache(); 

let todosFromCache = await cache.get(`user:${req.body.email}`)
 todosFromCache =  todosFromCache === null ?'[]':todosFromCache
const parsedTodos = JSON.parse(todosFromCache)
//console.log(todosFromCache,parsedTodos,"parsed to dos")
parsedTodos.push(todo)

await cache.put(`user:${req.body.email}`, JSON.stringify(parsedTodos)); // Store updated array

  res.status(201).json(todo);
};

export const getPersonalTodos = async (req: Request, res: Response): Promise<void> => {
if(!req.params.email)
{
 res.status(400);
 return
}
console.log("email at todo service", req.params.email)
const cache = await getCache();  
  const cachedTodos = await cache.get(`user:${req.params.email}`); // Use _id here
//console.log(cachedTodos,"cachedtodos")
  if (cachedTodos) {
    res.json(cachedTodos);
    return
  }

  const todos = await Todo.find( { email: req.params.email } ); // Use _id here
  await cache.put(`user:${req.params.email}`, JSON.stringify(todos)); // Cache user todos
  res.json(todos);
};

export const getAllTodos = async (req: Request, res: Response): Promise<void> => {
	console.log(req.body,"request body reaching todo service from gateway")

  const todos = await Todo.find( { userId: req.query.userId } ); // Use _id here
  res.json(todos);
};

export const updateTodo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
    const { username, email, title, completed } = req.body;

    // Update the ToDo in the MongoDB
    const updatedTodo = await Todo.findByIdAndUpdate(
        id,
        { title, completed },
        { new: true } // Return the updated document
    );

    if (!updatedTodo) {
        res.status(404).send('Todo not found');
	return
    }

    // Update the cache
    const cache = await getCache();  
    let todosFromCache = await cache.get(`user:${req.body.email}`); 
    todosFromCache = todosFromCache === null? '[]':todosFromCache
    const parsedTodos = JSON.parse(todosFromCache)
    const index = parsedTodos.findIndex((todo: any) => todo._id.toString() === id);
    if (index !== -1) {
        parsedTodos[index] = updatedTodo;
        await cache.put(`user:${req.body.email}`, JSON.stringify(parsedTodos));
    }

    res.json(updatedTodo);
    return
};

export const deleteTodo = async (req: Request, res: Response): Promise<void> => {
   const { id } = req.params;
   const todo = await Todo.findById(id);
    // Delete the ToDo from MongoDB
    const deletedTodo = await Todo.findByIdAndDelete(id);
    if (!deletedTodo) {
      res.status(404).send('Todo not found');
    }

    // Remove from the cache
    const cache = await getCache();
    let todosFromCache = await cache.get(`user:${todo.email}`);
    todosFromCache = todosFromCache === null? '[]':todosFromCache
    const parsedTodos = JSON.parse(todosFromCache)	
    const updatedTodos = parsedTodos.filter((todo: any) => todo._id.toString() !== id);
    await cache.put(`user:${todo.email}`, JSON.stringify(updatedTodos));
        
    res.status(204).send(); // No content to send back
};
