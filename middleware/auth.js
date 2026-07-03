const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar JWT en cookies
 * Si el token es válido, añade el username a req.user
 * Si no, retorna un error 401
 */
const authMiddleware = (req, res, next) => {
  const authToken = req.cookies.authToken;

  if (!authToken) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'please_set_a_strong_jwt_secret';
    const decodedToken = jwt.verify(authToken, JWT_SECRET);
    req.user = decodedToken; // Agrega el usuario decodificado al request
    next();
  } catch (error) {
    console.error('Error al verificar el token JWT:', error);
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
