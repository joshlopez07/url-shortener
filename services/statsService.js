// services/statsService.js

const urlModel = require('../models/urlModel');

/**
 * Obtiene estadísticas de uso del acortador de URLs.
 * @returns {object} - Objeto con estadísticas de uso.
 */
exports.getUsageStats = async () => {
  try {
    // Obtener la lista de URLs con su número de visitas desde el modelo
    const urls = await urlModel.getStats();

    // Si no se encuentran datos, devolver un mensaje adecuado
    if (!urls.length) {
      console.log('No se encontraron URLs en la base de datos.');
      return {
        totalURLs: 0,
        totalHits: 0,
        topURL: null,
        urls: [] // Lista vacía de URLs
      };
    }

    // Calcular estadísticas adicionales
    const totalURLs = urls.length; // Total de URLs
    const totalHits = urls.reduce((acc, url) => acc + (url.hitCount || 0), 0); // Total de hits
    const topURL = urls[0] || null; // URL más visitada

    console.log(`Total URLs: ${totalURLs}, Total Hits: ${totalHits}, Top URL: ${JSON.stringify(topURL)}`);

    return {
      totalURLs,
      totalHits,
      topURL,
      urls // Lista completa de URLs con estadísticas
    };
  } catch (error) {
    console.error('Error al procesar las estadísticas:', error);
    throw new Error('Error al procesar las estadísticas de uso');
  }
};

//const urlModel = require('../models/urlModel');

/**
 * Obtiene estadísticas de uso del acortador de URLs.
 * @returns {object} - Objeto con estadísticas de uso.
 */
/*exports.getUsageStats = async () => {
  try {
    // Obtener estadísticas desde el modelo
    const stats = await urlModel.getStats();
    const totalURLs = stats.length;
    const totalHits = stats.reduce((acc, url) => acc + (url.hitCount || 0), 0);
    const topURL = stats[0] || null;

    return {
      totalURLs,
      totalHits,
      topURL,
      urls: stats, // Lista completa de URLs con estadísticas
    };
  } catch (error) {
    throw new Error('Error al obtener las estadísticas de uso');
  }
};*/