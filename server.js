const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const urlController = require('./controllers/urlController');
const rateLimit = require('./middleware/rateLimit');
const cors = require('cors');
require('dotenv').config();

// Aplicar CORS para permitir peticiones de otros dominios
app.use(cors());

// Aplica limitador de tasa a todas las rutas
app.use(rateLimit);

// Parseo del body en formato JSON
app.use(bodyParser.json());

// Definición de rutas
app.post('/shorten', urlController.shortenURL);             // Acortar URL
app.post('/shorten/bulk', urlController.shortenURLsBulk);   // Acortar múltiples URLs
app.get('/hitCount/stats', urlController.getStats);         // Obtener estadísticas
app.get('/:id', urlController.redirectURL);                 // Redireccionar a URL original
app.delete('/delete/:id', urlController.deleteURL);         // Eliminar URL


// Manejo de errores 404 para rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error detectado:', err.stack);
  res.status(500).json({ error: 'Ocurrió un error en el servidor' });
});

// Levantar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));