const App = require('./src/app');

// Crear la instancia de la aplicación (POO)
const serverApp = new App();

// Iniciar servidor solo si se ejecuta directamente
if (require.main === module) {
  serverApp.listen();
}

// Exportar la instancia de Express para pruebas automatizadas (test.js)
module.exports = serverApp.getApp();
