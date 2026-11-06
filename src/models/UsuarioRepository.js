const db = require('../config/database');
const Usuario = require('./Usuario');

/**
 * Repositorio de Usuarios (POO - Persistencia en MySQL)
 */
class UsuarioRepository {
  constructor(database = db) {
    this.db = database;
  }

  /**
   * Busca un usuario por su nombre de usuario en MySQL
   * @param {string} username
   * @returns {Promise<Usuario|null>}
   */
  async findByUsername(username) {
    const normalizado = String(username).trim().toLowerCase();
    const [rows] = await this.db.query(
      'SELECT id, username, password_hash FROM usuarios WHERE username = ? LIMIT 1',
      [normalizado]
    );

    if (rows.length === 0) return null;
    const row = rows[0];
    return new Usuario(row.id, row.username, row.password_hash);
  }

  /**
   * Verifica si un nombre de usuario ya está registrado en MySQL
   * @param {string} username
   * @returns {Promise<boolean>}
   */
  async existsByUsername(username) {
    const normalizado = String(username).trim().toLowerCase();
    const [rows] = await this.db.query(
      'SELECT 1 FROM usuarios WHERE username = ? LIMIT 1',
      [normalizado]
    );
    return rows.length > 0;
  }

  /**
   * Registra un nuevo usuario en la base de datos MySQL
   * @param {string} username
   * @param {string} passwordHash
   * @returns {Promise<Usuario>}
   */
  async create(username, passwordHash) {
    const id = String(Date.now());
    const normalizado = String(username).trim().toLowerCase();

    await this.db.query(
      'INSERT INTO usuarios (id, username, password_hash) VALUES (?, ?, ?)',
      [id, normalizado, passwordHash]
    );

    return new Usuario(id, normalizado, passwordHash);
  }

  /**
   * Retorna la lista de usuarios desde MySQL
   * @returns {Promise<Usuario[]>}
   */
  async findAll() {
    const [rows] = await this.db.query('SELECT id, username, password_hash FROM usuarios');
    return rows.map((row) => new Usuario(row.id, row.username, row.password_hash));
  }
}

// Instancia singleton
module.exports = new UsuarioRepository();
