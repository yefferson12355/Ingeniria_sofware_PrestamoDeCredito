const { query } = require('../config/database');

// Iniciar evaluación de solicitud
const iniciarEvaluacion = async (req, res) => {
    try {
        const { solicitud_id } = req.params;
        const evaluadorId = req.user.id;

        // Verificar que el usuario es evaluador
        if (req.user.tipo_usuario !== 'evaluador' && req.user.tipo_usuario !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para realizar evaluaciones'
            });
        }

        // Verificar que la solicitud existe y está pendiente
        const [solicitud] = await query(
            'SELECT * FROM solicitudes WHERE id = ? AND estado = "pendiente"',
            [solicitud_id]
        );

        if (!solicitud) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada o no está pendiente'
            });
        }

        // Verificar si ya existe una evaluación
        const [evaluacionExistente] = await query(
            'SELECT id FROM evaluaciones WHERE solicitud_id = ?',
            [solicitud_id]
        );

        if (evaluacionExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una evaluación para esta solicitud'
            });
        }

        // Crear nueva evaluación
        const result = await query(
            `INSERT INTO evaluaciones (
                solicitud_id, evaluador_id, fecha_inicio, estado
            ) VALUES (?, ?, CURRENT_TIMESTAMP, 'en_proceso')`,
            [solicitud_id, evaluadorId]
        );

        // Actualizar estado de la solicitud
        await query(
            'UPDATE solicitudes SET estado = "en_revision" WHERE id = ?',
            [solicitud_id]
        );

        // Registrar en auditoría
        await query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, ip_address) VALUES (?, ?, ?, ?, ?)',
            [evaluadorId, 'START_EVALUATION', 'evaluaciones', result.insertId, req.ip]
        );

        res.status(201).json({
            success: true,
            message: 'Evaluación iniciada exitosamente',
            data: {
                id: result.insertId,
                solicitud_id: solicitud_id
            }
        });

    } catch (error) {
        console.error('Error al iniciar evaluación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener evaluación
const obtenerEvaluacion = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.tipo_usuario;

        // Construir consulta según el rol
        let sql = `
            SELECT e.*, s.monto_solicitado, s.plazo_meses, s.proposito,
                   u.nombres as evaluador_nombres, u.apellidos as evaluador_apellidos
            FROM evaluaciones e
            JOIN solicitudes s ON e.solicitud_id = s.id
            LEFT JOIN usuarios u ON e.evaluador_id = u.id
            WHERE e.id = ?
        `;
        let params = [id];

        // Si es cliente, verificar que la solicitud le pertenece
        if (userRole === 'cliente') {
            sql += ' AND s.usuario_id = ?';
            params.push(userId);
        }

        const [evaluacion] = await query(sql, params);

        if (!evaluacion) {
            return res.status(404).json({
                success: false,
                message: 'Evaluación no encontrada'
            });
        }

        res.json({
            success: true,
            data: evaluacion
        });

    } catch (error) {
        console.error('Error al obtener evaluación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Actualizar evaluación
const actualizarEvaluacion = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            score_crediticio,
            capacidad_pago,
            historial_crediticio,
            estabilidad_laboral,
            garantias,
            riesgo_credito,
            recomendacion,
            comentarios,
            estado
        } = req.body;

        const evaluadorId = req.user.id;

        // Verificar que el usuario es evaluador
        if (req.user.tipo_usuario !== 'evaluador' && req.user.tipo_usuario !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para actualizar evaluaciones'
            });
        }

        // Verificar que la evaluación existe y le pertenece al evaluador
        const [evaluacion] = await query(
            'SELECT * FROM evaluaciones WHERE id = ? AND evaluador_id = ?',
            [id, evaluadorId]
        );

        if (!evaluacion) {
            return res.status(404).json({
                success: false,
                message: 'Evaluación no encontrada'
            });
        }

        // Calcular score crediticio automático si no se proporciona
        let scoreCalculado = score_crediticio;
        if (!score_crediticio) {
            scoreCalculado = calcularScoreAutomatico({
                capacidad_pago,
                historial_crediticio,
                estabilidad_laboral,
                garantias
            });
        }

        // Actualizar evaluación
        await query(
            `UPDATE evaluaciones SET 
             score_crediticio = ?, capacidad_pago = ?, historial_crediticio = ?,
             estabilidad_laboral = ?, garantias = ?, riesgo_credito = ?,
             recomendacion = ?, comentarios = ?, estado = ?, fecha_actualizacion = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
                scoreCalculado, capacidad_pago, historial_crediticio,
                estabilidad_laboral, garantias, riesgo_credito,
                recomendacion, comentarios, estado, id
            ]
        );

        // Si la evaluación está completada, actualizar la solicitud
        if (estado === 'completada') {
            const estadoSolicitud = recomendacion === 'aprobada' ? 'aprobada' : 'rechazada';
            
            await query(
                'UPDATE solicitudes SET estado = ?, score_crediticio = ? WHERE id = ?',
                [estadoSolicitud, scoreCalculado, evaluacion.solicitud_id]
            );

            // Actualizar score crediticio del usuario
            await query(
                'UPDATE usuarios SET score_crediticio = ? WHERE id = (SELECT usuario_id FROM solicitudes WHERE id = ?)',
                [scoreCalculado, evaluacion.solicitud_id]
            );
        }

        // Registrar en auditoría
        await query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, ip_address) VALUES (?, ?, ?, ?, ?)',
            [evaluadorId, 'UPDATE_EVALUATION', 'evaluaciones', id, req.ip]
        );

        res.json({
            success: true,
            message: 'Evaluación actualizada exitosamente',
            data: {
                id: id,
                score_crediticio: scoreCalculado,
                estado: estado
            }
        });

    } catch (error) {
        console.error('Error al actualizar evaluación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener evaluaciones por evaluador
const obtenerEvaluacionesEvaluador = async (req, res) => {
    try {
        const evaluadorId = req.user.id;
        const { estado, fecha_desde, fecha_hasta } = req.query;

        let sql = `
            SELECT e.*, s.monto_solicitado, s.plazo_meses, s.proposito,
                   CONCAT(u.nombres, ' ', u.apellidos) as solicitante_nombre
            FROM evaluaciones e
            JOIN solicitudes s ON e.solicitud_id = s.id
            JOIN usuarios u ON s.usuario_id = u.id
            WHERE e.evaluador_id = ?
        `;
        let params = [evaluadorId];

        if (estado) {
            sql += ' AND e.estado = ?';
            params.push(estado);
        }

        if (fecha_desde) {
            sql += ' AND DATE(e.fecha_inicio) >= ?';
            params.push(fecha_desde);
        }

        if (fecha_hasta) {
            sql += ' AND DATE(e.fecha_inicio) <= ?';
            params.push(fecha_hasta);
        }

        sql += ' ORDER BY e.fecha_inicio DESC';

        const evaluaciones = await query(sql, params);

        res.json({
            success: true,
            data: evaluaciones
        });

    } catch (error) {
        console.error('Error al obtener evaluaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener estadísticas de evaluaciones
const obtenerEstadisticasEvaluaciones = async (req, res) => {
    try {
        const evaluadorId = req.user.id;

        // Estadísticas generales
        const [stats] = await query(
            `SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN estado = 'completada' THEN 1 END) as completadas,
                COUNT(CASE WHEN estado = 'en_proceso' THEN 1 END) as en_proceso,
                AVG(CASE WHEN score_crediticio IS NOT NULL THEN score_crediticio END) as score_promedio
             FROM evaluaciones 
             WHERE evaluador_id = ?`,
            [evaluadorId]
        );

        // Evaluaciones por mes (últimos 6 meses)
        const evaluacionesPorMes = await query(
            `SELECT 
                DATE_FORMAT(fecha_inicio, '%Y-%m') as mes,
                COUNT(*) as cantidad
             FROM evaluaciones 
             WHERE evaluador_id = ? 
             AND fecha_inicio >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
             GROUP BY DATE_FORMAT(fecha_inicio, '%Y-%m')
             ORDER BY mes DESC`,
            [evaluadorId]
        );

        // Distribución de recomendaciones
        const recomendaciones = await query(
            `SELECT 
                recomendacion,
                COUNT(*) as cantidad
             FROM evaluaciones 
             WHERE evaluador_id = ? AND estado = 'completada'
             GROUP BY recomendacion`,
            [evaluadorId]
        );

        res.json({
            success: true,
            data: {
                estadisticas: stats,
                evaluaciones_por_mes: evaluacionesPorMes,
                recomendaciones: recomendaciones
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

// Calcular score automático
function calcularScoreAutomatico(factores) {
    let score = 0;
    
    // Capacidad de pago (0-25 puntos)
    if (factores.capacidad_pago === 'excelente') score += 25;
    else if (factores.capacidad_pago === 'buena') score += 20;
    else if (factores.capacidad_pago === 'regular') score += 15;
    else if (factores.capacidad_pago === 'baja') score += 5;

    // Historial crediticio (0-30 puntos)
    if (factores.historial_crediticio === 'excelente') score += 30;
    else if (factores.historial_crediticio === 'bueno') score += 25;
    else if (factores.historial_crediticio === 'regular') score += 15;
    else if (factores.historial_crediticio === 'malo') score += 0;

    // Estabilidad laboral (0-25 puntos)
    if (factores.estabilidad_laboral === 'alta') score += 25;
    else if (factores.estabilidad_laboral === 'media') score += 15;
    else if (factores.estabilidad_laboral === 'baja') score += 5;

    // Garantías (0-20 puntos)
    if (factores.garantias === 'excelentes') score += 20;
    else if (factores.garantias === 'buenas') score += 15;
    else if (factores.garantias === 'regulares') score += 10;
    else if (factores.garantias === 'ninguna') score += 0;

    return Math.min(100, Math.max(0, score));
}

// Obtener solicitudes pendientes de evaluación
const obtenerSolicitudesPendientes = async (req, res) => {
    try {
        const { evaluador_id } = req.query;
        const userId = req.user.id;

        // Verificar permisos
        if (req.user.tipo_usuario !== 'evaluador' && req.user.tipo_usuario !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver solicitudes pendientes'
            });
        }

        let sql = `
            SELECT s.*, CONCAT(u.nombres, ' ', u.apellidos) as nombre_completo,
                   u.email, u.telefono, u.dni
            FROM solicitudes s
            JOIN usuarios u ON s.usuario_id = u.id
            WHERE s.estado = 'pendiente'
        `;
        let params = [];

        // Si se especifica un evaluador específico
        if (evaluador_id && req.user.tipo_usuario === 'admin') {
            sql += ' AND s.evaluador_asignado = ?';
            params.push(evaluador_id);
        }

        sql += ' ORDER BY s.fecha_solicitud ASC';

        const solicitudes = await query(sql, params);

        res.json({
            success: true,
            data: solicitudes
        });

    } catch (error) {
        console.error('Error al obtener solicitudes pendientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    iniciarEvaluacion,
    obtenerEvaluacion,
    actualizarEvaluacion,
    obtenerEvaluacionesEvaluador,
    obtenerEstadisticasEvaluaciones,
    obtenerSolicitudesPendientes
}; 