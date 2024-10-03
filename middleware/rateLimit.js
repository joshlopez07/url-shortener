const rateLimit = require('express-rate-limit');

// Limitar a 100 solicitudes por cada 10 minutos por IP
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos en milisegundos
  max: 100, // Limitar a 100 solicitudes por IP
  message: {
    error: 'Se ha excedido el límite de solicitudes. Inténtelo de nuevo más tarde.',
  },
});

module.exports = limiter;