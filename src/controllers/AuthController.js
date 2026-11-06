const jwt = require('jsonwebtoken');
const usuarioRepository = require('../models/UsuarioRepository');
const Usuario = require('../models/Usuario');

/**
 * Controlador de Autenticación (POO - Controlador MVC)
 */
class AuthController {
  constructor(
    repository = usuarioRepository,
    secret = process.env.JWT_SECRET || 'secreto_super_seguro_para_jwt_token_2026'
  ) {
    this.repository = repository;
    this.secret = secret;

    // Vincular contexto (this) a los métodos
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }

  /**
   * POST /auth/register
   */
  async register(req, res) {
    try {
      const validacion = Usuario.validarRegistro(req.body);
      if (!validacion.valido) {
        return res.status(400).json({ error: validacion.error });
      }

      const { username, password } = req.body;
      const usernameNormalizado = username.trim().toLowerCase();

      if (this.repository.existsByUsername(usernameNormalizado)) {
        return res.status(409).json({
          error: 'Usuario ya registrado',
          mensaje: `El usuario "${usernameNormalizado}" ya existe`
        });
      }

      const passwordHash = await Usuario.hashPassword(password);
      const nuevoUsuario = this.repository.create(usernameNormalizado, passwordHash);

      res.status(201).json({
        mensaje: 'Usuario registrado exitosamente con contraseña encriptada',
        data: {
          id: nuevoUsuario.id,
          username: nuevoUsuario.username
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Error en el servidor al registrar usuario' });
    }
  }

  /**
   * POST /auth/login
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Debes enviar "username" y "password"' });
      }

      const usuario = this.repository.findByUsername(username);
      if (!usuario) {
        return res.status(401).json({
          error: 'Credenciales inválidas',
          mensaje: 'Usuario o contraseña incorrectos'
        });
      }

      const esValida = await usuario.verificarPassword(password);
      if (!esValida) {
        return res.status(401).json({
          error: 'Credenciales inválidas',
          mensaje: 'Usuario o contraseña incorrectos'
        });
      }

      const payload = {
        id: usuario.id,
        username: usuario.username
      };

      const token = jwt.sign(payload, this.secret, { expiresIn: '2h' });

      res.json({
        mensaje: 'Autenticación exitosa',
        token,
        usuario: {
          id: usuario.id,
          username: usuario.username
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Error en el servidor durante el login' });
    }
  }

  /**
   * GET /auth/perfil (Ruta protegida por JWT)
   */
  getProfile(req, res) {
    res.json({
      mensaje: 'Acceso autorizado con JWT válido',
      usuario: req.usuario
    });
  }
}

module.exports = new AuthController();

