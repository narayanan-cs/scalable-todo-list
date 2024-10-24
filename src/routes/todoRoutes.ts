import express from 'express';
import { createTodo, getAllTodos, getPersonalTodos, updateTodo, deleteTodo } from '../controllers/todoController';

const router = express.Router();

router.post('/', createTodo);
router.get('/', getAllTodos);
router.get('/:email', getPersonalTodos);
router.put('/:id', updateTodo);
router.delete('/:id', deleteTodo);

export default router;
