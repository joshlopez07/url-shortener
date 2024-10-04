const admin = require('firebase-admin');
//const serviceAccount = require('./config/serviceAccountKey.json');
const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

// Inicializa Firebase Admin SDK con el archivo de credenciales
if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount), // Utiliza el archivo JSON descargado
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
}

// Inicializa Firestore
const db = admin.firestore();
// Exporta la instancia de la base de datos para usarla en otros módulos
module.exports = { db };

