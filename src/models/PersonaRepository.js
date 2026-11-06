const Persona = require('./Persona');

/**
 * Repositorio de Personas (POO - Capa de Modelo / Persistencia en Memoria)
 */
class PersonaRepository {
  constructor() {
    /** @type {Persona[]} */
    this.personas = [];
  }

  /**
   * Obtiene todas las personas, opcionalmente filtradas por nombre
   * @param {string} [filtroNombre]
   * @returns {Persona[]}
   */
  findAll(filtroNombre) {
    if (filtroNombre) {
      const filtro = String(filtroNombre).toLowerCase().trim();
      return this.personas.filter((p) => p.nombre.toLowerCase().includes(filtro));
    }
    return [...this.personas];
  }

  /**
   * Busca una persona por identificación
   * @param {string} identificacion
   * @returns {Persona|undefined}
   */
  findById(identificacion) {
    const idNormalizada = String(identificacion).trim();
    return this.personas.find((p) => p.identificacion === idNormalizada);
  }

  /**
   * Filtra personas por nombre
   * @param {string} nombre
   * @returns {Persona[]}
   */
  findByNombre(nombre) {
    const filtro = String(nombre).toLowerCase().trim();
    return this.personas.filter((p) => p.nombre.toLowerCase().includes(filtro));
  }

  /**
   * Verifica si existe una persona por identificación
   * @param {string} identificacion
   * @returns {boolean}
   */
  existsById(identificacion) {
    const idNormalizada = String(identificacion).trim();
    return this.personas.some((p) => p.identificacion === idNormalizada);
  }

  /**
   * Agrega una nueva persona a la memoria
   * @param {string} identificacion
   * @param {string} nombre
   * @param {number} edad
   * @returns {Persona}
   */
  create(identificacion, nombre, edad) {
    const nuevaPersona = new Persona(identificacion, nombre, edad);
    this.personas.push(nuevaPersona);
    return nuevaPersona;
  }

  /**
   * Actualiza los datos de una persona existente
   * @param {string} identificacion
   * @param {{ nombre?: string, edad?: number }} datosActualizacion
   * @returns {Persona|null}
   */
  update(identificacion, datosActualizacion) {
    const persona = this.findById(identificacion);
    if (!persona) return null;

    if (datosActualizacion.nombre !== undefined) {
      persona.nombre = datosActualizacion.nombre;
    }

    if (datosActualizacion.edad !== undefined) {
      persona.edad = datosActualizacion.edad;
    }

    return persona;
  }

  /**
   * Elimina una persona por su identificación
   * @param {string} identificacion
   * @returns {Persona|null}
   */
  delete(identificacion) {
    const idNormalizada = String(identificacion).trim();
    const index = this.personas.findIndex((p) => p.identificacion === idNormalizada);
    if (index === -1) return null;

    const [eliminada] = this.personas.splice(index, 1);
    return eliminada;
  }

  /**
   * Retorna la cantidad total de personas
   * @returns {number}
   */
  count() {
    return this.personas.length;
  }
}

// Instancia singleton para compartir memoria entre peticiones
module.exports = new PersonaRepository();

