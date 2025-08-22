const pdfEditor = require('../server/utils/pdfEditor.js');
const { setupCORS, handlePreflight, parseRequestBody, parseMultipart, sendJson } = require('./utils/multipart.js');

module.exports = async function handler(req, res) {
  setupCORS(res, process.env.CORS_ORIGIN?.split(',') || '*');
  if (handlePreflight(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }
  try {
    const bodyBuffer = await parseRequestBody(req);
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    if (!boundary) return sendJson(res, 400, { error: 'Content-Type boundary not found' });

    const parts = parseMultipart(bodyBuffer, boundary);
    const title = parts.find(p => p.name === 'title')?.data?.toString();
    const pageSize = parts.find(p => p.name === 'pageSize')?.data?.toString();
    const fontSize = parts.find(p => p.name === 'fontSize')?.data?.toString();
    const contentDataPart = parts.find(p => p.name === 'contentData')?.data?.toString();

    if (!contentDataPart) return sendJson(res, 400, { success: false, error: 'contentData é obrigatório' });

    const parsedContentData = JSON.parse(contentDataPart);
    const contentItems = [];

    let imageIndex = 0;
    for (let i = 0; i < parsedContentData.length; i++) {
      const item = parsedContentData[i];
      const contentItem = { type: item.type };
      switch (item.type) {
        case 'text':
          contentItem.content = item.content || '';
          break;
        case 'image':
          const fieldName = `image_${imageIndex}`;
          const filePart = parts.find(p => p.name === fieldName);
          if (filePart) {
            contentItem.imageBuffer = filePart.data;
            imageIndex++;
          }
          break;
        case 'table':
          if (item.tableData) {
            contentItem.tableData = item.tableData;
            contentItem.tableHeaders = item.tableHeaders || [];
          }
          break;
      }
      contentItems.push(contentItem);
    }

    const pdfBuffer = await pdfEditor.createPdfFromMultipleContent(contentItems, { title, pageSize, fontSize });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="documento.pdf"');
    res.end(pdfBuffer);
  } catch (error) {
    console.error('Erro ao gerar PDF combinado:', error);
    return sendJson(res, 500, { success: false, error: 'Erro interno ao gerar PDF combinado', details: error.message });
  }
}


