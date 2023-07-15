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
    return res.status(400).json({message: "Usuário já existente"})
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
  // Complete aqui
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  // Complete aqui
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