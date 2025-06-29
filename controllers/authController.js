const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { body, validationResult } = require('express-validator');

// Generar token JWT
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

// Login de usuario
const login = async (req, res) => {
    try {
        // Verificar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Buscar usuario por email
        const [user] = await query(
            'SELECT * FROM usuarios WHERE email = ? AND estado = "activo"',
            [email]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Generar token
        const token = generateToken(user.id);

        // Registrar en auditoría
        await query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, ip_address) VALUES (?, ?, ?, ?)',
            [user.id, 'LOGIN', 'usuarios', req.ip]
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                token,
                user: {
                    id: user.id,
                    nombres: user.nombres,
                    apellidos: user.apellidos,
                    email: user.email,
                    tipo_usuario: user.tipo_usuario,
                    score_crediticio: user.score_crediticio
                }
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Registro de usuario
const register = async (req, res) => {
    try {
        // Verificar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: errors.array()
            });
        }

        const {
            nombres,
            apellidos,
            email,
            password,
            dni,
            telefono,
            fecha_nacimiento,
            direccion,
            estado_civil,
            dependientes
        } = req.body;

        // Verificar si el email ya existe
        const [existingUser] = await query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Verificar si el DNI ya existe
        const [existingDNI] = await query(
            'SELECT id FROM usuarios WHERE dni = ?',
            [dni]
        );

        if (existingDNI) {
            return res.status(400).json({
                success: false,
                message: 'El DNI ya está registrado'
            });
        }

        // Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insertar nuevo usuario
        const result = await query(
            `INSERT INTO usuarios (
                nombres, apellidos, email, password, dni, telefono, 
                fecha_nacimiento, direccion, estado_civil, dependientes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nombres, apellidos, email, hashedPassword, dni, telefono,
                fecha_nacimiento, direccion, estado_civil, dependientes || 0
            ]
        );

        const userId = result.insertId;

        // Generar token
        const token = generateToken(userId);

        // Registrar en auditoría
        await query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, ip_address) VALUES (?, ?, ?, ?)',
            [userId, 'REGISTER', 'usuarios', req.ip]
        );

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                token,
                user: {
                    id: userId,
                    nombres,
                    apellidos,
                    email,
                    tipo_usuario: 'cliente',
                    score_crediticio: 0
                }
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener perfil del usuario
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const [user] = await query(
            `SELECT id, nombres, apellidos, email, dni, telefono, 
             fecha_nacimiento, direccion, estado_civil, dependientes, 
             tipo_usuario, score_crediticio, fecha_registro 
             FROM usuarios WHERE id = ?`,
            [userId]
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Actualizar perfil del usuario
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            nombres,
            apellidos,
            telefono,
            direccion,
            estado_civil,
            dependientes
        } = req.body;

        // Actualizar usuario
        await query(
            `UPDATE usuarios SET 
             nombres = ?, apellidos = ?, telefono = ?, 
             direccion = ?, estado_civil = ?, dependientes = ?,
             fecha_actualizacion = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [nombres, apellidos, telefono, direccion, estado_civil, dependientes, userId]
        );

        // Registrar en auditoría
        await query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, ip_address) VALUES (?, ?, ?, ?)',
            [userId, 'UPDATE_PROFILE', 'usuarios', req.ip]
        );

        res.json({
            success: true,
            message: 'Perfil actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener todos los usuarios (solo admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await query(
            `SELECT id, nombres, apellidos, email, dni, telefono, 
             tipo_usuario, estado, fecha_registro, score_crediticio 
             FROM usuarios 
             ORDER BY fecha_registro DESC`
        );

        res.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Validaciones para login
const loginValidation = [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
];

// Validaciones para registro
const registerValidation = [
    body('nombres').notEmpty().withMessage('Los nombres son requeridos'),
    body('apellidos').notEmpty().withMessage('Los apellidos son requeridos'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('dni').isLength({ min: 8, max: 8 }).withMessage('El DNI debe tener 8 dígitos'),
    body('telefono').optional().isLength({ min: 9, max: 9 }).withMessage('El teléfono debe tener 9 dígitos'),
    body('fecha_nacimiento').optional().isISO8601().withMessage('Fecha de nacimiento inválida')
];

module.exports = {
    login,
    register,
    getProfile,
    updateProfile,
    getAllUsers,
    loginValidation,
    registerValidation
}; 