const express = require('express');
const router = express.Router();

// Importar controladores
const authController = require('../controllers/authController');
const solicitudController = require('../controllers/solicitudController');
const documentoController = require('../controllers/documentoController');
const evaluacionController = require('../controllers/evaluacionController');

// Importar middleware
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// ============================================================================
// RUTAS DE AUTENTICACIÓN
// ============================================================================

router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/profile', authenticateToken, authController.getProfile);
router.put('/auth/profile', authenticateToken, authController.updateProfile);

// ============================================================================
// RUTAS DE SOLICITUDES (CLIENTES)
// ============================================================================

router.post('/solicitudes', authenticateToken, authorizeRoles(['cliente']), solicitudController.solicitudValidation, solicitudController.crearSolicitud);
router.get('/solicitudes/usuario', authenticateToken, authorizeRoles(['cliente']), solicitudController.obtenerSolicitudesUsuario);
router.get('/solicitudes/:id', authenticateToken, authorizeRoles(['cliente']), solicitudController.obtenerSolicitudPorId);

// ============================================================================
// RUTAS DE SOLICITUDES (EVALUADORES Y ADMIN)
// ============================================================================

router.get('/solicitudes/admin', authenticateToken, authorizeRoles(['admin', 'evaluador']), solicitudController.obtenerTodasSolicitudes);
router.get('/solicitudes/:id/detalle', authenticateToken, authorizeRoles(['admin', 'evaluador']), solicitudController.obtenerSolicitudPorId);

// ============================================================================
// RUTAS DE ESTADÍSTICAS
// ============================================================================

router.get('/estadisticas/usuario', authenticateToken, solicitudController.getUserStats);

// ============================================================================
// RUTAS DE DOCUMENTOS
// ============================================================================

router.post('/documentos', authenticateToken, authorizeRoles(['cliente']), documentoController.subirDocumento);
router.get('/solicitudes/:solicitud_id/documentos', authenticateToken, documentoController.obtenerDocumentos);

// ============================================================================
// RUTAS DE EVALUACIÓN
// ============================================================================

router.post('/solicitudes/:solicitud_id/evaluar', authenticateToken, authorizeRoles(['evaluador', 'admin']), evaluacionController.iniciarEvaluacion);

// ============================================================================
// RUTAS DE ADMINISTRACIÓN
// ============================================================================

router.get('/admin/usuarios', authenticateToken, authorizeRoles(['admin']), authController.getAllUsers);
router.get('/admin/politicas', authenticateToken, authorizeRoles(['admin']), (req, res) => {
    res.json({
        success: true,
        data: []
    });
});

// ============================================================================
// RUTAS DE NOTIFICACIONES
// ============================================================================

router.get('/notificaciones', authenticateToken, async (req, res) => {
    try {
        const { query } = require('../config/database');
        const userId = req.user.id;

        const notificaciones = await query(`
            SELECT * FROM notificaciones 
            WHERE usuario_id = ? 
            ORDER BY fecha_creacion DESC 
            LIMIT 50
        `, [userId]);

        res.json({
            success: true,
            data: notificaciones
        });

    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

router.put('/notificaciones/:id/leer', authenticateToken, async (req, res) => {
    try {
        const { query } = require('../config/database');
        const { id } = req.params;
        const userId = req.user.id;

        await query(`
            UPDATE notificaciones 
            SET leida = 1, fecha_lectura = CURRENT_TIMESTAMP 
            WHERE id = ? AND usuario_id = ?
        `, [id, userId]);

        res.json({
            success: true,
            message: 'Notificación marcada como leída'
        });

    } catch (error) {
        console.error('Error al marcar notificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// ============================================================================
// RUTAS DE POLÍTICAS DE CRÉDITO
// ============================================================================

router.get('/politicas', authenticateToken, async (req, res) => {
    try {
        const { query } = require('../config/database');

        const politicas = await query(`
            SELECT * FROM politicas_credito 
            WHERE activa = 1 
            ORDER BY fecha_creacion DESC
        `);

        res.json({
            success: true,
            data: politicas
        });

    } catch (error) {
        console.error('Error al obtener políticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

router.post('/politicas', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
    try {
        const { query } = require('../config/database');
        const { nombre, descripcion, monto_minimo, monto_maximo, plazo_minimo, plazo_maximo, tasa_interes, requisitos } = req.body;
        const adminId = req.user.id;

        const result = await query(`
            INSERT INTO politicas_credito (
                nombre, descripcion, monto_minimo, monto_maximo, 
                plazo_minimo, plazo_maximo, tasa_interes, requisitos, 
                creado_por, activa
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `, [nombre, descripcion, monto_minimo, monto_maximo, plazo_minimo, plazo_maximo, tasa_interes, requisitos, adminId]);

        await query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, ip_address) VALUES (?, ?, ?, ?, ?)',
            [adminId, 'CREATE_POLICY', 'politicas_credito', result.insertId, req.ip]
        );

        res.status(201).json({
            success: true,
            message: 'Política creada exitosamente',
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error('Error al crear política:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// ============================================================================
// RUTAS DE REPORTES
// ============================================================================

router.get('/reportes/solicitudes', authenticateToken, authorizeRoles(['admin', 'evaluador']), async (req, res) => {
    try {
        const { query } = require('../config/database');
        const { fecha_desde, fecha_hasta, estado, evaluador_id } = req.query;

        let sql = `
            SELECT 
                s.*, CONCAT(u.nombres, ' ', u.apellidos) as solicitante_nombre,
                u.email, u.telefono, u.dni,
                CONCAT(e.nombres, ' ', e.apellidos) as evaluador_nombre
            FROM solicitudes s
            JOIN usuarios u ON s.usuario_id = u.id
            LEFT JOIN usuarios e ON s.evaluador_asignado = e.id
            WHERE 1=1
        `;
        let params = [];

        if (fecha_desde) {
            sql += ' AND DATE(s.fecha_solicitud) >= ?';
            params.push(fecha_desde);
        }

        if (fecha_hasta) {
            sql += ' AND DATE(s.fecha_solicitud) <= ?';
            params.push(fecha_hasta);
        }

        if (estado) {
            sql += ' AND s.estado = ?';
            params.push(estado);
        }

        if (evaluador_id) {
            sql += ' AND s.evaluador_asignado = ?';
            params.push(evaluador_id);
        }

        sql += ' ORDER BY s.fecha_solicitud DESC';

        const solicitudes = await query(sql, params);

        res.json({
            success: true,
            data: solicitudes
        });

    } catch (error) {
        console.error('Error al generar reporte:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// ============================================================================
// RUTAS DE UTILIDADES
// ============================================================================

router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

router.get('/system/info', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
    try {
        const { query } = require('../config/database');
        const os = require('os');

        const systemInfo = {
            platform: os.platform(),
            arch: os.arch(),
            nodeVersion: process.version,
            uptime: os.uptime(),
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            cpuCount: os.cpus().length
        };

        const [dbStats] = await query(`
            SELECT 
                (SELECT COUNT(*) FROM usuarios) as total_usuarios,
                (SELECT COUNT(*) FROM solicitudes) as total_solicitudes,
                (SELECT COUNT(*) FROM evaluaciones) as total_evaluaciones,
                (SELECT COUNT(*) FROM documentos) as total_documentos
        `);

        res.json({
            success: true,
            data: {
                system: systemInfo,
                database: dbStats
            }
        });

    } catch (error) {
        console.error('Error al obtener información del sistema:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;
