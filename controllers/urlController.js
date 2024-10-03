const shortid = require('shortid');
const urlModel = require('../models/urlModel');
const statsService = require('../services/statsService');
const { db } = require('../firebaseConfig');

// Controlador para acortar la URL
exports.shortenURL = async (req, res) => {
  const { originalURL } = req.body;  // Obtener la URL original desde el cuerpo de la petición
  if (!originalURL) {
    return res.status(400).json({ error: 'URL original es requerida.' });
  }

  const id = shortid.generate();  // Generar ID corto único para la URL

  try {
    // Crear la URL en la base de datos usando el modelo
    const newURL = await urlModel.createURL(id, originalURL);
    console.log(`URL almacenada: ${JSON.stringify(newURL)}`);
    // Devolver la URL acortada al cliente
    res.status(201).json({ shortURL: `${req.protocol}://${req.get('host')}/${id}` });
  } catch (error) {
    console.error('Error al acortar la URL:', error);
    res.status(500).json({ error: 'Error al acortar la URL' });
  }
};

// Controlador para redireccionar a la URL original usando la URL corta
exports.redirectURL = async (req, res) => {
  const id = req.params.id;  // Obtener el ID desde la URL corta

  try {
    // Buscar la URL en la base de datos usando el modelo
    const urlData = await urlModel.findURLById(id);
    if (urlData) {
      // Redireccionar a la URL original si se encuentra
      res.redirect(urlData.originalURL);
    } else {
      res.status(404).json({ message: 'URL no encontrada' });
    }
  } catch (error) {
    console.error('Error al redireccionar:', error);
    res.status(500).json({ error: 'Error al redireccionar la URL' });
  }
};

// Controlador para eliminar una URL corta
exports.deleteURL = async (req, res) => {
  const id = req.params.id;  // Obtener el ID desde la URL corta

  try {
    // Eliminar la URL de la base de datos usando el modelo
    await urlModel.deleteURL(id);
    res.status(200).json({ message: 'Borrado exitoso' });
  } catch (error) {
    console.error('Error al eliminar la URL:', error);
    res.status(500).json({ error: 'Error al eliminar la URL' });
  }
};

// Controlador para obtener las estadísticas de uso del acortador de URLs
exports.getStats = async (req, res) => {
  try {
    // Obtener estadísticas de uso desde el servicio de estadísticas
    const stats = await statsService.getUsageStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

/**
 * Crea múltiples URLs cortas a partir de una lista de URLs originales.
 * @param {object} req - Objeto de la solicitud.
 * @param {object} res - Objeto de la respuesta.
 */
/*exports.shortenURLsBulk = async (req, res) => {
  const { urls } = req.body;

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'Se requiere una lista de URLs para acortar.' });
  }

  try {
    const promises = urls.map(async (item) => {
      const id = shortid.generate();
      const originalURL = item.originalURL;
      if (!originalURL) return null;

      // Crear la URL en la base de datos usando el modelo
      await urlModel.createURL(id, originalURL);
      return { originalURL, shortURL: `${req.protocol}://${req.get('host')}/${id}` };
    });

    // Ejecutar todas las promesas en paralelo
    const shortenedURLs = await Promise.all(promises);

    // Filtrar resultados nulos en caso de URLs inválidas
    res.status(201).json({ shortenedURLs: shortenedURLs.filter(Boolean) });
  } catch (error) {
    console.error('Error al acortar URLs de forma masiva:', error);
    res.status(500).json({ error: 'Error al acortar URLs de forma masiva.' });
  }
};*/

exports.shortenURLsBulk = async (req, res) => {
  const { urls } = req.body;

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'Se requiere una lista de URLs para acortar.' });
  }

  try {
    const shortenedURLs = [];
    const batch = db.batch(); // Crear un batch de Firestore para escritura masiva

    urls.forEach((item) => {
      const id = shortid.generate();
      const originalURL = item.originalURL;

      if (!originalURL) return; // Saltar si la URL no es válida

      const urlRef = db.collection('urls').doc(id);
      batch.set(urlRef, { originalURL, createdAt: new Date(), hitCount: 0 });
      shortenedURLs.push({ originalURL, shortURL: `${req.protocol}://${req.get('host')}/${id}` });
    });

    // Ejecutar el batch de Firestore
    await batch.commit();

    res.status(201).json({ shortenedURLs });
  } catch (error) {
    console.error('Error al acortar URLs de forma masiva:', error);
    res.status(500).json({ error: 'Error al acortar URLs de forma masiva.' });
  }
};

