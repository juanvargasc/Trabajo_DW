const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Clase Database (POO)
 * Administra la conexión y el pool a la base de datos MySQL.
 */
class Database {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.user = process.env.DB_USER || 'root';
    this.password = process.env.DB_PASSWORD || '';
    this.database = process.env.DB_NAME || 'gestion_personas';
    this.port = Number(process.env.DB_PORT) || 3306;

    this.pool = null;
    this.isConnected = false;
  }

  /**
   * Obtiene o inicializa el Pool de conexiones a MySQL
   */
  getPool() {
    if (!this.pool) {
      this.pool = mysql.createPool({
        host: this.host,
        user: this.user,
        password: this.password,
        database: this.database,
        port: this.port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        timezone: 'Z'
      });
    }
    return this.pool;
  }

  /**
   * Ejecuta una consulta SQL en el pool
   * @param {string} sql
   * @param {any[]} [params]
   * @returns {Promise<[any[], any]>}
   */
  async query(sql, params = []) {
    const pool = this.getPool();
    return pool.query(sql, params);
  }

  /**
   * Inicializa la base de datos y crea las tablas si no existen
   */
  async init() {
    try {
      // 1. Conexión inicial sin seleccionar base de datos para crearla si no existe
      const connectionInicial = await mysql.createConnection({
        host: this.host,
        user: this.user,
        password: this.password,
        port: this.port
      });

      await connectionInicial.query(
        `CREATE DATABASE IF NOT EXISTS \`${this.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await connectionInicial.end();

      // 2. Conectar al pool y asegurar la creación de tablas
      const pool = this.getPool();

      // Tabla personas
      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`personas\` (
          \`identificacion\` VARCHAR(50) NOT NULL,
          \`nombre\` VARCHAR(120) NOT NULL,
          \`edad\` INT NOT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`identificacion\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Tabla usuarios
      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`usuarios\` (
          \`id\` VARCHAR(50) NOT NULL,
          \`username\` VARCHAR(60) NOT NULL UNIQUE,
          \`password_hash\` VARCHAR(255) NOT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      this.isConnected = true;
      console.log(`[MySQL] Conectado exitosamente a la base de datos "${this.database}" en ${this.host}:${this.port}`);
      return true;
    } catch (error) {
      this.isConnected = false;
      console.warn(`[MySQL AVISO] No se pudo conectar al servidor MySQL en ${this.host}:${this.port} (${error.message})`);
      console.warn(`[MySQL AVISO] Si usas XAMPP, asegúrate de haber iniciado el servicio MySQL desde el Panel de Control.`);
      return false;
    }
  }

  /**
   * Cierra el pool de conexiones
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
    }
  }
}

// Instancia singleton de la base de datos
module.exports = new Database();

