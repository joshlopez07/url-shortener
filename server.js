require('dotenv').config();

// Toggle simple para las pruebas de health check de Octopus: dejar
// SIMULATE_STARTUP_CRASH=true en .env reproduce el crash real que tuvimos
// (el server se cae apenas arranca), para volver a probar que Octopus lo
// detecte como Failed. En false (o sin la variable) el server arranca
// normal. Se chequea ANTES que cualquier otro require/ruta a propósito --
// mismo lugar/momento donde ocurría el crash real original.
if (process.env.SIMULATE_STARTUP_CRASH === 'true') {
  throw new Error('Simulated startup crash (SIMULATE_STARTUP_CRASH=true in .env) -- for testing Octopus health check failure detection.');
}

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const urlController = require('./controllers/urlController');
const rateLimit = require('./middleware/rateLimit');
const cors = require('cors');

// Aplicar CORS para permitir peticiones de otros dominios
app.use(cors());

// Health check para Octopus DevOps -- no depende de Firestore/Firebase a
// propósito, así que responde 200 apenas el proceso HTTP está arriba,
// independientemente de si Firestore está configurado o no. Configurar esta
// URL (http://localhost:<PORT>/health) en el campo opcional "Health Check
// URL" del Wizard/Settings del proyecto para que Octopus la consulte además
// de su chequeo genérico de proceso.
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

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