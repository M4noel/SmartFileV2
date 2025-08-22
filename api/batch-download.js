const tempStorageModule = require('../server/utils/tempStorage.js');
const { setupCORS, handlePreflight, parseRequestBody, sendJson } = require('./utils/multipart.js');

module.exports = async function handler(req, res) {
  // Configurar CORS
  setupCORS(req, res, process.env.CORS_ORIGIN?.split(',') || '*');
  
  // Handle preflight request
  if (handlePreflight(req, res)) return;
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }
  
  try {
    const buffer = await parseRequestBody(req);
    const body = buffer.toString();
    
    // Parse JSON body
    let fileIds;
    try {
      const data = JSON.parse(body);
      fileIds = data.fileIds;
    } catch (e) {
      return sendJson(res, 400, { success: false, error: 'Body deve ser JSON válido' });
    }
    
    const files = [];
    for (const fileId of fileIds || []) {
      try {
        const file = await tempStorageModule.retrieveFile(fileId);
        files.push(file);
      } catch (e) {
        // skip
      }
    }
    
    if (files.length === 0) {
      return sendJson(res, 404, { success: false, error: 'Nenhum arquivo encontrado' });
    }
    
    const zipBuffer = await tempStorageModule.createZipArchive(files);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="arquivos-processados.zip"');
    res.end(zipBuffer);
    
  } catch (error) {
    console.error('Erro ao criar download em lote:', error);
    return sendJson(res, 500, { success: false, error: 'Erro interno ao criar download em lote', details: error.message });
  }
}


