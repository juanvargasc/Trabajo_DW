const { Router } = require('express');
const authController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/auth.middleware');

const router = Router();

// Rutas de Autenticación
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/perfil', authMiddleware.autenticarToken, authController.getProfile);

module.exports = router;

