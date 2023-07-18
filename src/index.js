import express, { json } from 'express';
import cors from 'cors';
import {v4 as uuidv4, validate} from 'uuid';

const app = express();

app.use(cors());
app.use(json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const {username} = req.headers;
  const user = users.find((user) => user.username === username);
  if(!user){
    return res.status(404).json({message: "Cliente não encontrado."})
  }
  req.user = user;
  next();
}

function checkCreateTodosUserAvailability(req, res, next){
  const {user} = req;
  if(user.pro === true || user.todo.length < 10){
    return next();
  }else{
    return res.status(403).json({message: "Usuário incapaz de criar mais tarefas"})
  }
}

function checkTodoExists(req, res, next){
  const {id} = req.params;
  const {user} = req;
  if(!validate(id)){
    return res.status(404).json({message: "id de tarefa inválido"});
  }

  const todo = user.todo.find((item) => item.id === id);
  if(!todo){
    return res.status(404).json({message: "Tarefa não pertence a esse usuário"});
  }

  req.todo = todo;
  next();
}

function findUserById(req, res, next){
  const {id} = req.params;

  const user = users.find((item) => item.id === id);
  if(!user){
    return res.status(404).json({message: "Cliente não encontrado."})
  }
  req.user = user;
  next();

}

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const {user} = req;
  return res.status(200).json(user.todo);
});

app.get('/users/:id', findUserById, (req, res) => {
  const {user} = req;
  res.status(200).json({user});
});

app.post('/users', (req, res) => {
  const {name, username} = req.body;

  const newUser = {
    id: uuidv4(),
    name,
    username,
    pro: false,
    todo: []
  }
  if(users.find((user) => user.username === newUser.username)){
    return res.status(400).json({message: "Cliente já existe."})
  }else{
    users.push(newUser);
    return res.status(201).json(newUser);
  }
});

app.post('/todos', checksExistsUserAccount, checkCreateTodosUserAvailability, (req, res) => {
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

app.put('/todos/:id', checksExistsUserAccount, checkTodoExists, (req, res) => {
  const {todo} = req;
  const {title, deadline} = req.body;

  todo.title = title;
  todo.deadline = new Date(deadline);
  return res.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkTodoExists, (req, res) => {
  const {todo} = req;

  todo.done = true;
  return res.status(201).json({message: "Tarefa atualizada com sucesso"});
});

app.patch('/users/:id/pro', findUserById, (req, res) => {
  const {user} = req;

  if(user.pro){
    return res.status(400).json({message: "Plano pro já ativado"});
  }
  user.pro = true;
  res.status(201).json({message: "usuário atualizado com sucesso."});
});

app.delete('/todos/:id', checksExistsUserAccount, checkTodoExists, (req, res) => {
  const {user, todo} = req;

  const indexTodoToDelete = user.todo.findIndex((item) => {
    return item.id === todo.id
  })

  user.todo.splice(indexTodoToDelete, 1)
  return res.status(201).json({message: "Tarefa removida com sucesso."});
});

export default app;