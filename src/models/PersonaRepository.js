const db = require('../config/database');
const Persona = require('./Persona');

/**
 * Repositorio de Personas (POO - Persistencia en MySQL)
 */
class PersonaRepository {
  constructor(database = db) {
    this.db = database;
  }

  /**
   * Obtiene todas las personas de MySQL, opcionalmente filtradas por nombre
   * @param {string} [filtroNombre]
   * @returns {Promise<Persona[]>}
   */
  async findAll(filtroNombre) {
    let sql = 'SELECT identificacion, nombre, edad FROM personas';
    const params = [];

    if (filtroNombre) {
      sql += ' WHERE LOWER(nombre) LIKE ?';
      params.push(`%${String(filtroNombre).toLowerCase().trim()}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const [rows] = await this.db.query(sql, params);
    return rows.map((row) => new Persona(row.identificacion, row.nombre, row.edad));
  }

  /**
   * Busca una persona por identificación en MySQL
   * @param {string} identificacion
   * @returns {Promise<Persona|null>}
   */
  async findById(identificacion) {
    const idNormalizada = String(identificacion).trim();
    const [rows] = await this.db.query(
      'SELECT identificacion, nombre, edad FROM personas WHERE identificacion = ? LIMIT 1',
      [idNormalizada]
    );

    if (rows.length === 0) return null;
    const row = rows[0];
    return new Persona(row.identificacion, row.nombre, row.edad);
  }

  /**
   * Filtra personas por nombre en MySQL
   * @param {string} nombre
   * @returns {Promise<Persona[]>}
   */
  async findByNombre(nombre) {
    const filtro = `%${String(nombre).toLowerCase().trim()}%`;
    const [rows] = await this.db.query(
      'SELECT identificacion, nombre, edad FROM personas WHERE LOWER(nombre) LIKE ? ORDER BY nombre ASC',
      [filtro]
    );

    return rows.map((row) => new Persona(row.identificacion, row.nombre, row.edad));
  }

  /**
   * Verifica si existe una persona por identificación
   * @param {string} identificacion
   * @returns {Promise<boolean>}
   */
  async existsById(identificacion) {
    const idNormalizada = String(identificacion).trim();
    const [rows] = await this.db.query(
      'SELECT 1 FROM personas WHERE identificacion = ? LIMIT 1',
      [idNormalizada]
    );
    return rows.length > 0;
  }

  /**
   * Inserta una nueva persona en la base de datos MySQL
   * @param {string} identificacion
   * @param {string} nombre
   * @param {number} edad
   * @returns {Promise<Persona>}
   */
  async create(identificacion, nombre, edad) {
    const idNormalizada = String(identificacion).trim();
    const nombreNormalizado = String(nombre).trim();
    const edadNumero = Number(edad);

    await this.db.query(
      'INSERT INTO personas (identificacion, nombre, edad) VALUES (?, ?, ?)',
      [idNormalizada, nombreNormalizado, edadNumero]
    );

    return new Persona(idNormalizada, nombreNormalizado, edadNumero);
  }

  /**
   * Actualiza los datos de una persona en MySQL
   * @param {string} identificacion
   * @param {{ nombre?: string, edad?: number }} datosActualizacion
   * @returns {Promise<Persona|null>}
   */
  async update(identificacion, datosActualizacion) {
    const persona = await this.findById(identificacion);
    if (!persona) return null;

    const campos = [];
    const params = [];

    if (datosActualizacion.nombre !== undefined) {
      campos.push('nombre = ?');
      params.push(datosActualizacion.nombre.trim());
      persona.nombre = datosActualizacion.nombre;
    }

    if (datosActualizacion.edad !== undefined) {
      campos.push('edad = ?');
      params.push(Number(datosActualizacion.edad));
      persona.edad = datosActualizacion.edad;
    }

    if (campos.length > 0) {
      params.push(String(identificacion).trim());
      await this.db.query(
        `UPDATE personas SET ${campos.join(', ')} WHERE identificacion = ?`,
        params
      );
    }

    return persona;
  }

  /**
   * Elimina una persona por su identificación en MySQL
   * @param {string} identificacion
   * @returns {Promise<Persona|null>}
   */
  async delete(identificacion) {
    const persona = await this.findById(identificacion);
    if (!persona) return null;

    await this.db.query('DELETE FROM personas WHERE identificacion = ?', [
      String(identificacion).trim()
    ]);

    return persona;
  }

  /**
   * Retorna la cantidad total de personas en MySQL
   * @returns {Promise<number>}
   */
  async count() {
    const [rows] = await this.db.query('SELECT COUNT(*) AS total FROM personas');
    return rows[0].total;
  }
}

// Instancia singleton
module.exports = new PersonaRepository();
