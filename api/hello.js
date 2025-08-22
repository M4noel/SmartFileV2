// Endpoint de teste ultra-simples
module.exports = (req, res) => {
  res.json({
    message: 'Hello World! 🌍',
    method: req.method,
    timestamp: new Date().toISOString()
  });
};
