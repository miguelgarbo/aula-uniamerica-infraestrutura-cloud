const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// String de Conexão com authSource=admin
const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:rootpassword@127.0.0.1:27017/todo-app?authSource=admin';

// Função de Conexão com Re-tentativa Automática
const connectWithRetry = () => {
  console.log('Tentando conectar ao MongoDB...');
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('Conectado ao MongoDB com sucesso!');
    })
    .catch((err) => {
      console.error('Erro de conexão com o MongoDB. Tentando novamente em 5 segundos...', err.message);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

// Schema do Mongoose
const TodoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const Todo = mongoose.model('Todo', TodoSchema);

// Rotas
app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/todos', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: 'O campo "text" é obrigatório' });
  }

  try {
    const newTodo = await Todo.create({ text, completed: false });
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});