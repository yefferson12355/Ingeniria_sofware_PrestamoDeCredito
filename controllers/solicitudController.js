const { query } = require('../config/database');
const { body, validationResult } = require('express-validator');

// Crear nueva solicitud de crédito
const crearSolicitud = async (req, res) => {
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

        const userId = req.user.id;
        const {
            monto_solicitado,
            plazo_meses,
            proposito,
            ingresos_mensuales,
            gastos_mensuales,
            empleo_actual,
            tiempo_empleo
        } = req.body;

        // Verificar si el usuario ya tiene una solicitud pendiente
        const [existingSolicitud] = await query(
            'SELECT id FROM solicitudes WHERE usuario_id = ? AND estado IN ("pendiente", "en_revision")',
            [userId]
        );

        if (existingSolicitud) {
            return res.status(400).json({
                success: false,
                message: 'Ya tienes una solicitud en proceso'
            });
        }

        // Insertar nueva solicitud
        const result = await query(
            `INSERT INTO solicitudes (
                usuario_id, monto_solicitado, plazo_meses, proposito,
                ingresos_mensuales, gastos_mensuales, empleo_actual, tiempo_empleo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, monto_solicitado, plazo_meses, proposito,
                ingresos_mensuales, gastos_mensuales, empleo_actual, tiempo_empleo
            ]
        );

        const solicitudId = result.insertId;

        // Registrar en auditoría
        await query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, ip_address) VALUES (?, ?, ?, ?, ?)',
            [userId, 'CREATE_SOLICITUD', 'solicitudes', solicitudId, req.ip]
        );

        res.status(201).json({
            success: true,
            message: 'Solicitud creada exitosamente',
            data: {
                id: solicitudId,
                estado: 'pendiente'
            }
        });

    } catch (error) {
        console.error('Error al crear solicitud:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener solicitudes del usuario
const obtenerSolicitudesUsuario = async (req, res) => {
    try {
        const userId = req.user.id;
        const { estado, fecha_desde, fecha_hasta, buscar } = req.query;

        let sql = `
            SELECT s.*, 
                   CONCAT(u.nombres, ' ', u.apellidos) as nombre_completo,
                   u.score_crediticio
            FROM solicitudes s
            JOIN usuarios u ON s.usuario_id = u.id
            WHERE s.usuario_id = ?
        `;
        let params = [userId];

        // Aplicar filtros
        if (estado) {
            sql += ' AND s.estado = ?';
            params.push(estado);
        }

        if (fecha_desde) {
            sql += ' AND DATE(s.fecha_solicitud) >= ?';
            params.push(fecha_desde);
        }

        if (fecha_hasta) {
            sql += ' AND DATE(s.fecha_solicitud) <= ?';
            params.push(fecha_hasta);
        }

        if (buscar) {
            sql += ' AND (s.id LIKE ? OR s.monto_solicitado LIKE ?)';
            params.push(`%${buscar}%`, `%${buscar}%`);
        }

        sql += ' ORDER BY s.fecha_solicitud DESC';

        const solicitudes = await query(sql, params);

        res.json({
            success: true,
            data: solicitudes
        });

    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener todas las solicitudes (para evaluadores y admin)
const obtenerTodasSolicitudes = async (req, res) => {
    try {
        const { estado, fecha_desde, fecha_hasta, buscar, evaluador_id } = req.query;

        let sql = `
            SELECT s.*, 
                   CONCAT(u.nombres, ' ', u.apellidos) as nombre_completo,
                   u.score_crediticio,
                   CONCAT(e.nombres, ' ', e.apellidos) as evaluador_nombre
            FROM solicitudes s
            JOIN usuarios u ON s.usuario_id = u.id
            LEFT JOIN usuarios e ON s.evaluador_id = e.id
            WHERE 1=1
        `;
        let params = [];

        // Aplicar filtros
        if (estado) {
            sql += ' AND s.estado = ?';
            params.push(estado);
        }

        if (fecha_desde) {
            sql += ' AND DATE(s.fecha_solicitud) >= ?';
            params.push(fecha_desde);
        }

        if (fecha_hasta) {
            sql += ' AND DATE(s.fecha_solicitud) <= ?';
            params.push(fecha_hasta);
        }

        if (buscar) {
            sql += ' AND (s.id LIKE ? OR CONCAT(u.nombres, " ", u.apellidos) LIKE ? OR s.monto_solicitado LIKE ?)';
            params.push(`%${buscar}%`, `%${buscar}%`, `%${buscar}%`);
        }

        if (evaluador_id) {
            sql += ' AND s.evaluador_id = ?';
            params.push(evaluador_id);
        }

        sql += ' ORDER BY s.fecha_solicitud DESC';

        const solicitudes = await query(sql, params);

        res.json({
            success: true,
            data: solicitudes
        });

    } catch (error) {
        console.error('Error al obtener todas las solicitudes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener solicitud por ID
const obtenerSolicitudPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.tipo_usuario;

        let sql = `
            SELECT s.*, 
                   CONCAT(u.nombres, ' ', u.apellidos) as nombre_completo,
                   u.score_crediticio,
                   CONCAT(e.nombres, ' ', e.apellidos) as evaluador_nombre
            FROM solicitudes s
            JOIN usuarios u ON s.usuario_id = u.id
            LEFT JOIN usuarios e ON s.evaluador_id = e.id
            WHERE s.id = ?
        `;
        let params = [id];

        // Si es cliente, verificar que la solicitud le pertenece
        if (userRole === 'cliente') {
            sql += ' AND s.usuario_id = ?';
            params.push(userId);
        }

        const [solicitud] = await query(sql, params);

        if (!solicitud) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada'
            });
        }

        // Obtener documentos de la solicitud
        const documentos = await query(
            'SELECT * FROM documentos WHERE solicitud_id = ?',
            [id]
        );

        // Obtener evaluación si existe
        const [evaluacion] = await query(
            'SELECT * FROM evaluaciones WHERE solicitud_id = ? ORDER BY fecha_evaluacion DESC LIMIT 1',
            [id]
        );

        res.json({
            success: true,
            data: {
                ...solicitud,
                documentos,
                evaluacion
            }
        });

    } catch (error) {
        console.error('Error al obtener solicitud:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener estadísticas de solicitudes
const obtenerEstadisticas = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.tipo_usuario;

        let whereClause = '';
        let params = [];

        if (userRole === 'cliente') {
            whereClause = 'WHERE usuario_id = ?';
            params = [userId];
        }

        // Estadísticas generales
        const [stats] = await query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'aprobada' THEN 1 ELSE 0 END) as aprobadas,
                SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN estado = 'rechazada' THEN 1 ELSE 0 END) as rechazadas,
                SUM(CASE WHEN estado = 'en_revision' THEN 1 ELSE 0 END) as en_revision,
                SUM(CASE WHEN estado = 'aprobada' THEN monto_aprobado ELSE 0 END) as monto_total_aprobado
            FROM solicitudes ${whereClause}`,
            params
        );

        // Solicitudes recientes
        const solicitudesRecientes = await query(
            `SELECT s.id, s.fecha_solicitud, s.monto_solicitado, s.estado,
                    CONCAT(u.nombres, ' ', u.apellidos) as nombre_completo
             FROM solicitudes s
             JOIN usuarios u ON s.usuario_id = u.id
             ${whereClause}
             ORDER BY s.fecha_solicitud DESC
             LIMIT 5`,
            params
        );

        res.json({
            success: true,
            data: {
                estadisticas: stats,
                solicitudes_recientes: solicitudesRecientes
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener estadísticas del usuario
const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Obtener total de solicitudes
        const [totalSolicitudes] = await query(
            'SELECT COUNT(*) as total FROM solicitudes WHERE usuario_id = ?',
            [userId]
        );

        // Obtener solicitudes por estado
        const solicitudesPorEstado = await query(
            `SELECT estado, COUNT(*) as cantidad 
             FROM solicitudes 
             WHERE usuario_id = ? 
             GROUP BY estado`,
            [userId]
        );

        // Obtener monto total solicitado
        const [montoTotal] = await query(
            'SELECT SUM(monto_solicitado) as total FROM solicitudes WHERE usuario_id = ?',
            [userId]
        );

        // Obtener última solicitud
        const [ultimaSolicitud] = await query(
            `SELECT * FROM solicitudes 
             WHERE usuario_id = ? 
             ORDER BY fecha_solicitud DESC 
             LIMIT 1`,
            [userId]
        );

        res.json({
            success: true,
            data: {
                total_solicitudes: totalSolicitudes.total || 0,
                solicitudes_por_estado: solicitudesPorEstado,
                monto_total_solicitado: montoTotal.total || 0,
                ultima_solicitud: ultimaSolicitud || null
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Validaciones para crear solicitud
const solicitudValidation = [
    body('monto_solicitado').isFloat({ min: 1000 }).withMessage('El monto mínimo es S/ 1,000'),
    body('plazo_meses').isInt({ min: 6, max: 360 }).withMessage('El plazo debe estar entre 6 y 360 meses'),
    body('proposito').isIn(['vivienda', 'vehiculo', 'educacion', 'negocio', 'personal', 'consolidacion', 'medical', 'otro']).withMessage('Propósito inválido'),
    body('ingresos_mensuales').optional().isFloat({ min: 0 }).withMessage('Los ingresos deben ser un número positivo'),
    body('gastos_mensuales').optional().isFloat({ min: 0 }).withMessage('Los gastos deben ser un número positivo'),
    body('tiempo_empleo').optional().isInt({ min: 0 }).withMessage('El tiempo de empleo debe ser un número entero')
];

module.exports = {
    crearSolicitud,
    obtenerSolicitudesUsuario,
    obtenerTodasSolicitudes,
    obtenerSolicitudPorId,
    obtenerEstadisticas,
    getUserStats,
    solicitudValidation
}; 