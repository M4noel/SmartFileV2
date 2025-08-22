// Este arquivo serve como ponto de entrada para a aplicação
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';

// Configuração do ambiente
dotenv.config();

// Configuração do Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do Multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Rotas da API
app.use('/api', apiRoutes(upload));

// Rota de verificação de saúde
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Iniciar o servidor se não estiver em ambiente serverless
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

// Exportar a aplicação para uso serverless
export default app;