const bcrypt = require('bcryptjs');

/**
 * Modelo Usuario (POO)
 * Representa la entidad Usuario para autenticación con contraseña encriptada.
 */
class Usuario {
  /**
   * @param {string} id - Identificador único de usuario
   * @param {string} username - Nombre de usuario normalizado
   * @param {string} passwordHash - Hash bcrypt de la contraseña
   */
  constructor(id, username, passwordHash) {
    this._id = String(id);
    this._username = String(username).trim().toLowerCase();
    this._passwordHash = passwordHash;
  }

  get id() {
    return this._id;
  }

  get username() {
    return this._username;
  }

  get passwordHash() {
    return this._passwordHash;
  }

  /**
   * Genera un hash seguro con bcrypt para la contraseña en texto plano
   * @param {string} password
   * @returns {Promise<string>}
   */
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compara una contraseña en texto plano con el hash del usuario
   * @param {string} passwordPlano
   * @returns {Promise<boolean>}
   */
  async verificarPassword(passwordPlano) {
    return bcrypt.compare(passwordPlano, this._passwordHash);
  }

  /**
   * Valida los datos requeridos para registrar un usuario
   * @param {object} datos
   * @returns {{ valido: boolean, error?: string }}
   */
  static validarRegistro(datos) {
    const { username, password } = datos || {};

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return { valido: false, error: 'El campo "username" es obligatorio' };
    }

    if (!password || typeof password !== 'string' || password.length < 4) {
      return { valido: false, error: 'La contraseña debe tener al menos 4 caracteres' };
    }

    return { valido: true };
  }

  /**
   * Serializa el usuario sin exponer la contraseña encriptada
   */
  toJSON() {
    return {
      id: this._id,
      username: this._username
    };
  }
}

module.exports = Usuario;

