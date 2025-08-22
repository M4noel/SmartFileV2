const { setupCORS, handlePreflight } = require('./utils/multipart.js');

module.exports = async function handler(req, res) {
  // Configurar CORS
  setupCORS(res, process.env.CORS_ORIGIN?.split(',') || '*');
  
  // Handle preflight request
  if (handlePreflight(req, res)) return;
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  return res.status(501).json({ 
    success: false, 
    error: 'Adicionar senha ao PDF não é suportado no ambiente serverless atual.' 
  });
}


