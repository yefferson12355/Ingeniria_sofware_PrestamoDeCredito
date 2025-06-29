const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token de acceso requerido' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar que el usuario existe en la base de datos
        const [user] = await query(
            'SELECT id, nombres, apellidos, email, tipo_usuario, estado FROM usuarios WHERE id = ?',
            [decoded.userId]
        );

        if (!user || user.estado !== 'activo') {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuario no válido o inactivo' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error en autenticación:', error);
        return res.status(403).json({ 
            success: false, 
            message: 'Token inválido o expirado' 
        });
    }
};

// Middleware para verificar roles específicos
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Autenticación requerida' 
            });
        }

        if (!roles.includes(req.user.tipo_usuario)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Acceso denegado. Permisos insuficientes.' 
            });
        }

        next();
    };
};

// Middleware para verificar si es cliente
const requireClient = authorizeRoles(['cliente']);

// Middleware para verificar si es evaluador
const requireEvaluator = authorizeRoles(['evaluador', 'admin']);

// Middleware para verificar si es administrador
const requireAdmin = authorizeRoles(['admin']);

module.exports = {
    authenticateToken,
    authorizeRoles,
    requireClient,
    requireEvaluator,
    requireAdmin
};
