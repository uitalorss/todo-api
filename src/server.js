import express, { json } from 'express';
import cors from 'cors';
import {v4 as uuidv4} from 'uuid';

const app = express();
app.listen(3331);

app.use(cors());
app.use(json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const {username} = req.headers;
  const user = users.find((user) => user.username === username);
  if(!user){
    return res.status(400).json({message: "Cliente não encontrado."})
  }
  req.user = user;
  next();
}

app.post('/users', (req, res) => {
  const {name, username} = req.body;

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todo: []
  }
  users.push(newUser);
  return res.status(200).json({message: "Usuário cadastrado com sucesso."});
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const {user} = req;
  return res.status(200).json(user.todo);
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const {user} = req;
  const { title, deadline } = req.body;

  const newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }
  user.todo.push(newTodo);
  return res.status(201).json({message: 'Tarefa cadastrada com sucesso.'})
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  // Complete aqui
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  // Complete aqui
});

export default app;