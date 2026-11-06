const Usuario = require('./Usuario');

/**
 * Repositorio de Usuarios (POO - Capa de Modelo / Persistencia en Memoria)
 */
class UsuarioRepository {
  constructor() {
    /** @type {Usuario[]} */
    this.usuarios = [];
  }

  /**
   * Busca un usuario por su nombre de usuario
   * @param {string} username
   * @returns {Usuario|undefined}
   */
  findByUsername(username) {
    const normalizado = String(username).trim().toLowerCase();
    return this.usuarios.find((u) => u.username === normalizado);
  }

  /**
   * Verifica si un nombre de usuario ya está registrado
   * @param {string} username
   * @returns {boolean}
   */
  existsByUsername(username) {
    const normalizado = String(username).trim().toLowerCase();
    return this.usuarios.some((u) => u.username === normalizado);
  }

  /**
   * Registra un nuevo usuario en memoria
   * @param {string} username
   * @param {string} passwordHash
   * @returns {Usuario}
   */
  create(username, passwordHash) {
    const id = String(Date.now());
    const nuevoUsuario = new Usuario(id, username, passwordHash);
    this.usuarios.push(nuevoUsuario);
    return nuevoUsuario;
  }

  /**
   * Retorna la lista de usuarios
   * @returns {Usuario[]}
   */
  findAll() {
    return [...this.usuarios];
  }
}

// Instancia singleton para compartir memoria entre peticiones
module.exports = new UsuarioRepository();

