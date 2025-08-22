function parseMultipart(buffer, boundary) {
  const parts = [];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const endBoundaryBuffer = Buffer.from(`--${boundary}--`);
  
  let start = buffer.indexOf(boundaryBuffer);
  let end = buffer.indexOf(endBoundaryBuffer);
  
  if (start === -1 || end === -1) {
    throw new Error('Invalid multipart data');
  }
  
  let currentPos = start + boundaryBuffer.length;
  
  while (currentPos < end) {
    // Find next boundary
    const nextBoundary = buffer.indexOf(boundaryBuffer, currentPos);
    if (nextBoundary === -1) break;
    
    // Parse part
    const partData = buffer.slice(currentPos, nextBoundary);
    const part = parsePart(partData);
    if (part) parts.push(part);
    
    currentPos = nextBoundary + boundaryBuffer.length;
  }
  
  return parts;
}

function parsePart(partBuffer) {
  const headerEnd = partBuffer.indexOf('\r\n\r\n');
  if (headerEnd === -1) return null;
  
  const headers = partBuffer.slice(0, headerEnd).toString();
  const data = partBuffer.slice(headerEnd + 4);
  
  // Extract name from Content-Disposition
  const nameMatch = headers.match(/name="([^"]+)"/); 
  if (!nameMatch) return null;
  
  // Extract filename if present
  const filenameMatch = headers.match(/filename="([^"]+)"/); 
  const filename = filenameMatch ? filenameMatch[1] : null;
  
  // Extract content type if present
  const contentTypeMatch = headers.match(/Content-Type: ([^\r\n]+)/);
  const contentType = contentTypeMatch ? contentTypeMatch[1] : null;
  
  return {
    name: nameMatch[1],
    filename,
    contentType,
    data
  };
}

async function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function setupCORS(req, res, origin = '*') {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function handlePreflight(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export {
  parseMultipart,
  parseRequestBody,
  setupCORS,
  handlePreflight,
  sendJson
};
