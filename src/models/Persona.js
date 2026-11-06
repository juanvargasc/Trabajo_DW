/**
 * Modelo Persona (POO)
 * Representa la entidad Persona del dominio del negocio.
 */
class Persona {
  /**
   * @param {string} identificacion - Identificación única
   * @param {string} nombre - Nombre completo
   * @param {number} edad - Edad (entero >= 0)
   */
  constructor(identificacion, nombre, edad) {
    this._identificacion = String(identificacion).trim();
    this._nombre = String(nombre).trim();
    this._edad = Number(edad);
  }

  get identificacion() {
    return this._identificacion;
  }

  get nombre() {
    return this._nombre;
  }

  set nombre(nuevoNombre) {
    if (!nuevoNombre || typeof nuevoNombre !== 'string' || nuevoNombre.trim() === '') {
      throw new Error('El campo "nombre" no puede estar vacío');
    }
    this._nombre = nuevoNombre.trim();
  }

  get edad() {
    return this._edad;
  }

  set edad(nuevaEdad) {
    const edadNum = Number(nuevaEdad);
    if (isNaN(edadNum) || edadNum < 0 || !Number.isInteger(edadNum)) {
      throw new Error('El campo "edad" debe ser un número entero mayor o igual a 0');
    }
    this._edad = edadNum;
  }

  /**
   * Valida los datos requeridos para crear una Persona
   * @param {object} datos
   * @returns {{ valido: boolean, error?: string }}
   */
  static validarCreacion(datos) {
    const { identificacion, nombre, edad } = datos || {};

    if (identificacion === undefined || identificacion === null || String(identificacion).trim() === '') {
      return { valido: false, error: 'El campo "identificacion" es obligatorio' };
    }

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return { valido: false, error: 'El campo "nombre" es obligatorio y debe ser texto' };
    }

    const edadNum = Number(edad);
    if (edad === undefined || isNaN(edadNum) || edadNum < 0 || !Number.isInteger(edadNum)) {
      return { valido: false, error: 'El campo "edad" es obligatorio y debe ser un número entero mayor o igual a 0' };
    }

    return { valido: true };
  }

  /**
   * Serializa la instancia a un objeto plano
   */
  toJSON() {
    return {
      identificacion: this._identificacion,
      nombre: this._nombre,
      edad: this._edad
    };
  }
}

module.exports = Persona;

