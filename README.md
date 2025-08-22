# SmartFiles 

Frontend da aplicação SmartFiles - Ferramentas Inteligentes Online para PDF, imagens e documentos.

## 🚀 

### Pré-requisitos
- Node.js 20.19.0 ou superior
- Conta na [Vercel](https://vercel.com)
- Repositório no GitHub

### 1. Configuração Local

```bash
# Instalar dependências
npm install

# Criar arquivo .env baseado no env.example
cp env.example .env

# Editar .env com suas configurações
# As variáveis de ambiente já estão configuradas com valores padrão
# VITE_API_BASE_URL=${VITE_API_PROTOCOL:-http}://${HOST:-localhost}:${PORT:-3000}
```

### 2. Build Local

```bash
# Build para desenvolvimento
npm run build

# Build para produção
npm run build:prod

# Preview do build
npm run preview
```

### 3. Deploy na Vercel

#### Opção A: Deploy via GitHub (Recomendado)

1. **Faça push para o GitHub:**
   ```bash
   git add .
   git commit -m "Configuração para deploy na Vercel"
   git push origin main
   ```

2. **Na Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe seu repositório do GitHub
   - Configure o projeto:

   **Build Settings:**
   - Framework Preset: `Vite`
   - Root Directory: `frontend/client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

   **Environment Variables:**
   - `VITE_API_BASE_URL`: URL do seu backend em produção

3. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build completar

#### Opção B: Deploy via Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login na Vercel
vercel login

# Deploy
vercel --prod
```

### 4. Configurações de Rota

O arquivo `vercel.json` já está configurado para:
- ✅ SPA routing (todas as rotas vão para index.html)
- ✅ Cache otimizado para assets
- ✅ Headers de segurança
- ✅ Suporte ao Vue Router history mode

### 5. URLs de Produção

Após o deploy, você terá:
- **Frontend**: `https://seu-projeto.vercel.app`
- **Backend**: Configure em `VITE_API_BASE_URL`

### 6. Verificação

- ✅ Todas as rotas funcionam (sem 404)
- ✅ Assets carregam corretamente
- ✅ API conecta com o backend
- ✅ SEO meta tags funcionam

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run build:prod   # Build otimizado para produção
npm run analyze      # Análise do bundle
```

## 📁 Estrutura do Projeto

```
frontend/client/
├── src/
│   ├── components/     # Componentes Vue
│   ├── pages/         # Páginas/rotas
│   ├── assets/        # Assets estáticos
│   └── main.js        # Entry point
├── public/            # Arquivos públicos
├── vercel.json        # Configuração Vercel
├── vite.config.js     # Configuração Vite
└── package.json       # Dependências
```

## 🔧 Configurações de Produção

### Vite
- ✅ Base path configurado para `/`
- ✅ Minificação com Terser
- ✅ Code splitting otimizado
- ✅ Assets organizados por tipo

### Vue Router
- ✅ History mode ativado
- ✅ Rotas configuradas
- ✅ 404 page implementada

### SEO
- ✅ Meta tags dinâmicas
- ✅ Open Graph configurado
- ✅ Twitter Cards configurado
- ✅ Sitemap e robots.txt

## 🚨 Troubleshooting

### Erro 404 em rotas
- Verifique se o `vercel.json` está na raiz do projeto
- Confirme que o build está na pasta `dist`

### Assets não carregam
- Verifique se o `base: '/'` está no `vite.config.js`
- Confirme que os arquivos estão na pasta `dist/assets`

### API não conecta
- Configure `VITE_API_BASE_URL` nas variáveis de ambiente da Vercel
- Verifique se o backend está rodando e acessível

## 📞 Suporte

Para problemas específicos:
1. Verifique os logs de build na Vercel
2. Teste localmente com `npm run build && npm run preview`
3. Confirme que todas as dependências estão instaladas

---

**SmartFiles** - Ferramentas Inteligentes Online 🚀
