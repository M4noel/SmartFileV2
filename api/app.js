import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

// Add the bin directory to PATH for qpdf if it exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const binPath = path.join(__dirname, '..', 'bin');

// Verificar se o diretório bin existe antes de adicioná-lo ao PATH
import fs from 'fs';
try {
  if (fs.existsSync(binPath)) {
    process.env.PATH = `${binPath};${process.env.PATH}`;
    console.log(`qpdf binary path added to PATH: ${binPath}`);
  } else {
    console.log(`Bin directory not found: ${binPath}. Using system binaries.`);
  }
} catch (err) {
  console.error(`Error checking bin directory: ${err.message}`);
}

import apiRoutes from './routes/api.js';

const app = express();

// Configurações
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*'
}));
app.use(express.json());
app.use(express.static('public'));

// Multer para uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB limit
  }
});

// Rotas
const router = apiRoutes(upload);
app.use('/api', router);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});