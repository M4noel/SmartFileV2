// Endpoint de teste para Vercel
module.exports = (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Resposta para qualquer método
  res.json({
    success: true,
    message: 'Vercel API funcionando! 🚀',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
};
