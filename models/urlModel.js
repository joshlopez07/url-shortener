const admin = require('firebase-admin');
//const db = admin.firestore();
const { db } = require('../firebaseConfig');

/**
 * Crea una nueva URL corta en la base de datos.
 * @param {string} id - ID único generado para la URL corta.
 * @param {string} originalURL - URL original que se va a acortar.
 * @returns {object} - Datos de la URL creada. 
 */
exports.createURL = async (id, originalURL) => {
    try {
      const createdAt = new Date();
      await db.collection('urls').doc(id).set({
        originalURL,
        createdAt,
        hitCount: 0  // Contador inicial de visitas
      });
      return { id, originalURL, createdAt, hitCount: 0 };
    } catch (error) {
      console.error('Error al crear la URL en Firestore:', error);
      throw new Error('Error al crear la URL en la base de datos');
    }
  };
/*exports.createURL = async (id, originalURL) => {
  try {
    await db.collection('urls').doc(id).set({
      originalURL,
      createdAt: new Date(),
      hitCount: 0,
    });
    return { id, originalURL };
  } catch (error) {
    throw new Error('Error al crear la URL en la base de datos');
  }
};*/

/**
 * Busca la URL original a partir del ID de la URL corta.
 * @param {string} id - ID de la URL corta.
 * @returns {object|null} - Documento con la URL original o null si no existe.
 */
exports.findURLById = async (id) => {
  try {
    const doc = await db.collection('urls').doc(id).get();
    if (doc.exists) {
      // Incrementar contador de visitas
      await doc.ref.update({ hitCount: admin.firestore.FieldValue.increment(1) });
      return doc.data();
    }
    return null;
  } catch (error) {
    console.error('Error al buscar la URL en Firestore:', error);
    throw new Error('Error al buscar la URL en la base de datos');
  }
};

/**
 * Elimina una URL acortada de la base de datos.
 * @param {string} id - ID de la URL corta.
 */
exports.deleteURL = async (id) => {
  try {
    await db.collection('urls').doc(id).delete();
  } catch (error) {
    console.error('Error al eliminar la URL en Firestore:', error);
    throw new Error('Error al eliminar la URL de la base de datos');
  }
};

/**
 * Obtiene estadísticas del uso de las URLs acortadas.
 * @returns {array} - Lista de URLs con su número de visitas.
 */
exports.getStats = async () => {
    try {
      const stats = [];
      const snapshot = await db.collection('urls').orderBy('hitCount', 'desc').get();
      console.log(`Documentos en Firestore: ${snapshot.size}`); // Imprimir en consola el número de documentos encontrados
      snapshot.forEach((doc) => {
        console.log(`Documento: ${JSON.stringify(doc.data())}`); // Imprimir cada documento encontrado
        stats.push({ id: doc.id, ...doc.data() });
      });
      console.log(`Estadísticas obtenidas: ${JSON.stringify(stats)}`);
      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error('Error al obtener estadísticas de la base de datos');
    }
  };