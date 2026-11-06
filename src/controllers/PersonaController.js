const personaRepository = require('../models/PersonaRepository');
const Persona = require('../models/Persona');

/**
 * Controlador para la gestión de Personas (POO - Controlador MVC con MySQL)
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
  async getAll(req, res) {
    try {
      const { nombre } = req.query;

      if (nombre) {
        const resultados = await this.repository.findByNombre(nombre);
        return res.json({
          total: resultados.length,
          filtro: nombre,
          data: resultados
        });
      }

      const personas = await this.repository.findAll();
      res.json({
        total: personas.length,
        data: personas
      });
    } catch (error) {
      console.error('Error en PersonaController.getAll:', error);
      res.status(500).json({ error: 'Error en el servidor al consultar personas', detalle: error.message });
    }
  }

  /**
   * GET /personas/nombre/:nombre
   */
  async getByNombre(req, res) {
    try {
      const { nombre } = req.params;
      const resultados = await this.repository.findByNombre(nombre);

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
    } catch (error) {
      console.error('Error en PersonaController.getByNombre:', error);
      res.status(500).json({ error: 'Error al filtrar por nombre', detalle: error.message });
    }
  }

  /**
   * GET /personas/:identificacion
   */
  async getById(req, res) {
    try {
      const { identificacion } = req.params;
      const persona = await this.repository.findById(identificacion);

      if (!persona) {
        return res.status(404).json({
          error: 'Persona no encontrada',
          mensaje: `No se encontró ninguna persona con identificación ${identificacion}`
        });
      }

      res.json({ data: persona });
    } catch (error) {
      console.error('Error en PersonaController.getById:', error);
      res.status(500).json({ error: 'Error al buscar persona', detalle: error.message });
    }
  }

  /**
   * POST /personas
   */
  async create(req, res) {
    try {
      const validacion = Persona.validarCreacion(req.body);
      if (!validacion.valido) {
        return res.status(400).json({ error: validacion.error });
      }

      const { identificacion, nombre, edad } = req.body;
      const idNormalizada = String(identificacion).trim();

      const existe = await this.repository.existsById(idNormalizada);
      if (existe) {
        return res.status(409).json({
          error: 'Identificación duplicada',
          mensaje: `Ya existe una persona registrada con la identificación ${idNormalizada}`
        });
      }

      const nuevaPersona = await this.repository.create(idNormalizada, nombre, Number(edad));

      res.status(201).json({
        mensaje: 'Persona registrada exitosamente en MySQL',
        data: nuevaPersona
      });
    } catch (error) {
      console.error('Error en PersonaController.create:', error);
      res.status(500).json({ error: 'Error al registrar persona en MySQL', detalle: error.message });
    }
  }

  /**
   * PUT /personas/:identificacion
   */
  async update(req, res) {
    try {
      const { identificacion } = req.params;
      const { nombre, edad } = req.body;

      const personaExistente = await this.repository.findById(identificacion);
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

      const personaActualizada = await this.repository.update(identificacion, datosActualizacion);

      res.json({
        mensaje: 'Persona actualizada exitosamente',
        data: personaActualizada
      });
    } catch (error) {
      console.error('Error en PersonaController.update:', error);
      res.status(500).json({ error: 'Error al actualizar persona en MySQL', detalle: error.message });
    }
  }

  /**
   * DELETE /personas/:identificacion
   */
  async delete(req, res) {
    try {
      const { identificacion } = req.params;
      const personaEliminada = await this.repository.delete(identificacion);

      if (!personaEliminada) {
        return res.status(404).json({
          error: 'Persona no encontrada',
          mensaje: `No se encontró ninguna persona con identificación ${identificacion}`
        });
      }

      res.json({
        mensaje: 'Persona eliminada exitosamente de la base de datos',
        data: personaEliminada
      });
    } catch (error) {
      console.error('Error en PersonaController.delete:', error);
      res.status(500).json({ error: 'Error al eliminar persona en MySQL', detalle: error.message });
    }
  }
}

module.exports = new PersonaController();
