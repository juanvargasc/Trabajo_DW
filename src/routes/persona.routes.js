const { Router } = require('express');
const personaController = require('../controllers/PersonaController');

const router = Router();

// Rutas de Personas
router.get('/', personaController.getAll);
router.get('/nombre/:nombre', personaController.getByNombre);
router.get('/:identificacion', personaController.getById);
router.post('/', personaController.create);
router.put('/:identificacion', personaController.update);
router.delete('/:identificacion', personaController.delete);

module.exports = router;

