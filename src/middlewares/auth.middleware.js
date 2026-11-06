const jwt = require('jsonwebtoken');

/**
 * Middleware de Autenticación con JWT (POO)
 */
class AuthMiddleware {
  /**
   * @param {string} [secret]
   */
  constructor(secret = process.env.JWT_SECRET || 'secreto_super_seguro_para_jwt_token_2026') {
    this.secret = secret;
    this.autenticarToken = this.autenticarToken.bind(this);
  }

  /**
   * Middleware para verificar el token JWT en el encabezado Authorization
   */
  autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer <token>

    if (!token) {
      return res.status(401).json({
        error: 'Token no proporcionado',
        mensaje: 'Acceso no autorizado: debes incluir un token JWT en el encabezado Authorization'
      });
    }

    jwt.verify(token, this.secret, (err, usuario) => {
      if (err) {
        return res.status(403).json({
          error: 'Token inválido o expirado',
          mensaje: 'La sesión no es válida o ha caducado'
        });
      }
      req.usuario = usuario;
      next();
    });
  }
}

module.exports = new AuthMiddleware();

