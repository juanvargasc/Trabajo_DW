const express = require('express');
const cors = require('cors');
const path = require('path');
const database = require('./config/database');
const personaRoutes = require('./routes/persona.routes');
const authRoutes = require('./routes/auth.routes');

/**
 * Clase principal de la Aplicación Express (POO)
 */
class App {
  constructor(port = process.env.PORT || 3000) {
    this.app = express();
    this.port = port;
    this.database = database;

    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  /**
   * Configura los middlewares globales
   */
  configureMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());

    // Servir archivos estáticos (Vista)
    const publicPath = path.join(__dirname, '..', 'public');
    this.app.use(express.static(publicPath));
  }

  /**
   * Configura los enrutadores de la API
   */
  configureRoutes() {
    // Rutas de autenticación
    this.app.use('/auth', authRoutes);
    this.app.use('/api/auth', authRoutes);

    // Rutas de personas (montadas en /personas y /api/personas para compatibilidad)
    this.app.use('/personas', personaRoutes);
    this.app.use('/api/personas', personaRoutes);
  }

  /**
   * Manejador global para rutas inexistentes (404)
   */
  configureErrorHandling() {
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Ruta no encontrada' });
    });
  }

  /**
   * Inicializa la conexión a MySQL e inicia la escucha del servidor HTTP
   * @param {number} [port]
   * @param {() => void} [callback]
   */
  async listen(port = this.port, callback) {
    // Inicializar base de datos MySQL (crear base y tablas si no existen)
    await this.database.init();

    return this.app.listen(port, () => {
      if (callback) {
        callback();
      } else {
        console.log(`Servidor ejecutándose en http://localhost:${port}`);
        console.log(`Endpoints disponibles:`);
        console.log(` - POST   http://localhost:${port}/auth/register (Registro con bcrypt)`);
        console.log(` - POST   http://localhost:${port}/auth/login (Login con JWT)`);
        console.log(` - GET    http://localhost:${port}/auth/perfil (Ruta protegida con JWT)`);
        console.log(` - GET    http://localhost:${port}/personas`);
        console.log(` - POST   http://localhost:${port}/personas`);
        console.log(` - GET    http://localhost:${port}/personas/:identificacion`);
        console.log(` - GET    http://localhost:${port}/personas/nombre/:nombre`);
        console.log(` - PUT    http://localhost:${port}/personas/:identificacion`);
        console.log(` - DELETE http://localhost:${port}/personas/:identificacion`);
      }
    });
  }

  /**
   * Obtiene la instancia subyacente de Express
   */
  getApp() {
    return this.app;
  }
}

module.exports = App;
