const personaRepository = require('../models/PersonaRepository');
const Persona = require('../models/Persona');

/**
 * Controlador para la gestión de Personas (POO - Controlador MVC)
 */
class PersonaController {
  constructor(repository = personaRepository) {
    this.repository = repository;

    // Vincular contexto (this) a los métodos
    this.getAll = this.getAll.bind(this);
    this.getByNombre = this.getByNombre.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  /**
   * GET /personas o GET /personas?nombre=...
   */
  getAll(req, res) {
    const { nombre } = req.query;

    if (nombre) {
      const resultados = this.repository.findByNombre(nombre);
      return res.json({
        total: resultados.length,
        filtro: nombre,
        data: resultados
      });
    }

    const personas = this.repository.findAll();
    res.json({
      total: personas.length,
      data: personas
    });
  }

  /**
   * GET /personas/nombre/:nombre
   */
  getByNombre(req, res) {
    const { nombre } = req.params;
    const resultados = this.repository.findByNombre(nombre);

    if (resultados.length === 0) {
      return res.status(404).json({
        error: 'Sin coincidencias',
        mensaje: `No se encontraron personas con el nombre "${nombre}"`
      });
    }

    res.json({
      total: resultados.length,
      data: resultados
    });
  }

  /**
   * GET /personas/:identificacion
   */
  getById(req, res) {
    const { identificacion } = req.params;
    const persona = this.repository.findById(identificacion);

    if (!persona) {
      return res.status(404).json({
        error: 'Persona no encontrada',
        mensaje: `No se encontró ninguna persona con identificación ${identificacion}`
      });
    }

    res.json({ data: persona });
  }

  /**
   * POST /personas
   */
  create(req, res) {
    const validacion = Persona.validarCreacion(req.body);
    if (!validacion.valido) {
      return res.status(400).json({ error: validacion.error });
    }

    const { identificacion, nombre, edad } = req.body;
    const idNormalizada = String(identificacion).trim();

    if (this.repository.existsById(idNormalizada)) {
      return res.status(409).json({
        error: 'Identificación duplicada',
        mensaje: `Ya existe una persona registrada con la identificación ${idNormalizada}`
      });
    }

    const nuevaPersona = this.repository.create(idNormalizada, nombre, Number(edad));

    res.status(201).json({
      mensaje: 'Persona registrada exitosamente en memoria',
      data: nuevaPersona
    });
  }

  /**
   * PUT /personas/:identificacion
   */
  update(req, res) {
    const { identificacion } = req.params;
    const { nombre, edad } = req.body;

    const personaExistente = this.repository.findById(identificacion);
    if (!personaExistente) {
      return res.status(404).json({
        error: 'Persona no encontrada',
        mensaje: `No se encontró ninguna persona con identificación ${identificacion}`
      });
    }

    const datosActualizacion = {};

    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ error: 'El campo "nombre" no puede estar vacío' });
      }
      datosActualizacion.nombre = nombre.trim();
    }

    if (edad !== undefined) {
      const edadNumero = Number(edad);
      if (isNaN(edadNumero) || edadNumero < 0 || !Number.isInteger(edadNumero)) {
        return res.status(400).json({ error: 'El campo "edad" debe ser un número entero mayor o igual a 0' });
      }
      datosActualizacion.edad = edadNumero;
    }

    const personaActualizada = this.repository.update(identificacion, datosActualizacion);

    res.json({
      mensaje: 'Persona actualizada exitosamente',
      data: personaActualizada
    });
  }

  /**
   * DELETE /personas/:identificacion
   */
  delete(req, res) {
    const { identificacion } = req.params;
    const personaEliminada = this.repository.delete(identificacion);

    if (!personaEliminada) {
      return res.status(404).json({
        error: 'Persona no encontrada',
        mensaje: `No se encontró ninguna persona con identificación ${identificacion}`
      });
    }

    res.json({
      mensaje: 'Persona eliminada exitosamente de la memoria',
      data: personaEliminada
    });
  }
}

module.exports = new PersonaController();

