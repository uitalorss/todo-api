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

function validateTitleToBeUpdated(title){
  return title.length > 0 ? true : false;
}

function validateDeadlineToBeUpdated(deadline){
  return deadline.length > 0 ? true : false;
}

app.post('/users', (req, res) => {
  const {name, username} = req.body;

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todo: []
  }
  if(users.find((user) => user.username === newUser.username)){
    return res.status(400).json({message: "Cliente já existe."})
  }else{
    users.push(newUser);
    return res.status(201).json(newUser);
  }
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
  const {user} = req;
  const {id} = req.params;
  const {title, deadline} = req.body;
  const isContentTitleValid = validateTitleToBeUpdated(title);
  const isContentDeadlineValid = validateDeadlineToBeUpdated(deadline);


  for(let todo of user.todo){
    if(todo.id === id){
      if(isContentTitleValid){
        todo.title = title
      }
      if(isContentDeadlineValid){
        todo.deadline = deadline;
      }
      return res.status(201).json({message: "Tarefa atualizada com sucesso."});
    }
    return res.status(400).json({message: "Tarefa não encontrada"});
  }

});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const {id} = req.params;
  const {user} = req;
  let updated = false;

  for(let todo of user.todo){
    if(todo.id === id){
      todo.done = true;
      updated = true;
    }
  }
  return updated ? 
  res.status(201).json({message: "Tarefa atualizada com sucesso"}) : 
  res.status(404).json({message: "Tarefa não encontrada"}) 

});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const {id} = req.params;
  const {user} = req;

  const indexTodoToDelete = user.todo.findIndex((todo) => {
    return todo.id === id
  })

  user.todo.splice(indexTodoToDelete, 1)

  return res.status(201).json({message: "Tarefa removida com sucesso."})
});

export default app;