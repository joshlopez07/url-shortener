const admin = require('firebase-admin');

// Antes esto leía GOOGLE_APPLICATION_CREDENTIALS_JSON (un solo blob JSON) con
// JSON.parse directo -- esa variable nunca estuvo seteada en .env (que en
// cambio ya traía los 3 campos sueltos FIREBASE_PROJECT_ID/CLIENT_EMAIL/
// PRIVATE_KEY, comentados), así que JSON.parse(undefined) tiraba
// `SyntaxError: "undefined" is not valid JSON` apenas algo hacía
// require('./firebaseConfig') -- tumbaba el server ENTERO antes de levantar,
// sin loguear nada útil. Ahora lee los 3 campos que .env ya tenía, y si
// faltan, NO tira: deja `db` en null y loguea una advertencia clara. Así el
// servidor siempre levanta (y /health siempre responde) aunque Firestore no
// esté configurado -- solo las rutas que de verdad usan `db` fallan en el
// momento, no todo el proceso al arrancar.
const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

let db = null;

if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
  const serviceAccount = {
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    // El .env puede traer el salto de línea como los 2 caracteres literales
    // "\n" en vez de un salto real, según cómo se haya guardado/copiado la
    // llave -- .replace() sobre una que YA tiene saltos reales es un no-op
    // seguro.
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
  }
  db = admin.firestore();
} else {
  console.warn(
    'Firebase no está configurado (faltan FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY en .env) -- ' +
    'el servidor sigue levantando, pero las rutas que usan Firestore van a fallar hasta que se configure.'
  );
}

// Exporta la instancia de la base de datos (puede ser null) para usarla en otros módulos
module.exports = { db };

