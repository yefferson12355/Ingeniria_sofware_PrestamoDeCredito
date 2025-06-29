const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { query } = require('../config/database');

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = process.env.UPLOAD_PATH || './uploads';
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
    }
});

// Subir documento
const subirDocumento = async (req, res) => {
    try {
        upload.single('documento')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se ha subido ningún archivo'
                });
            }

            const { solicitud_id, tipo_documento, comentarios } = req.body;
            const userId = req.user.id;

            // Verificar que la solicitud pertenece al usuario
            const [solicitud] = await query(
                'SELECT id FROM solicitudes WHERE id = ? AND usuario_id = ?',
                [solicitud_id, userId]
            );

            if (!solicitud) {
                // Eliminar archivo subido
                await fs.unlink(req.file.path);
                return res.status(404).json({
                    success: false,
                    message: 'Solicitud no encontrada'
                });
            }

            // Insertar documento en la base de datos
            const result = await query(
                `INSERT INTO documentos (
                    solicitud_id, tipo_documento, nombre_archivo, 
                    ruta_archivo, tamano_archivo, tipo_mime, comentarios
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    solicitud_id,
                    tipo_documento,
                    req.file.originalname,
                    req.file.path,
                    req.file.size,
                    req.file.mimetype,
                    comentarios || null
                ]
            );

            // Registrar en auditoría
            await query(
                'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, ip_address) VALUES (?, ?, ?, ?, ?)',
                [userId, 'UPLOAD_DOCUMENT', 'documentos', result.insertId, req.ip]
            );

            res.status(201).json({
                success: true,
                message: 'Documento subido exitosamente',
                data: {
                    id: result.insertId,
                    nombre: req.file.originalname,
                    tipo: tipo_documento,
                    tamano: req.file.size
                }
            });
        });
    } catch (error) {
        console.error('Error al subir documento:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener documentos de una solicitud
const obtenerDocumentos = async (req, res) => {
    try {
        const { solicitud_id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.tipo_usuario;

        // Verificar permisos
        let sql = `
            SELECT d.*, s.usuario_id 
            FROM documentos d
            JOIN solicitudes s ON d.solicitud_id = s.id
            WHERE d.solicitud_id = ?
        `;
        let params = [solicitud_id];

        // Si es cliente, verificar que la solicitud le pertenece
        if (userRole === 'cliente') {
            sql += ' AND s.usuario_id = ?';
            params.push(userId);
        }

        const documentos = await query(sql, params);

        res.json({
            success: true,
            data: documentos
        });

    } catch (error) {
        console.error('Error al obtener documentos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Descargar documento
const descargarDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.tipo_usuario;

        // Obtener documento con verificación de permisos
        let sql = `
            SELECT d.*, s.usuario_id 
            FROM documentos d
            JOIN solicitudes s ON d.solicitud_id = s.id
            WHERE d.id = ?
        `;
        let params = [id];

        if (userRole === 'cliente') {
            sql += ' AND s.usuario_id = ?';
            params.push(userId);
        }

        const [documento] = await query(sql, params);

        if (!documento) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }

        // Verificar que el archivo existe
        const fs = require('fs');
        if (!fs.existsSync(documento.ruta_archivo)) {
            return res.status(404).json({
                success: false,
                message: 'Archivo no encontrado'
            });
        }

        // Enviar archivo
        res.download(documento.ruta_archivo, documento.nombre_archivo);

    } catch (error) {
        console.error('Error al descargar documento:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Eliminar documento
const eliminarDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Obtener documento
        const [documento] = await query(
            `SELECT d.*, s.usuario_id 
             FROM documentos d
             JOIN solicitudes s ON d.solicitud_id = s.id
             WHERE d.id = ? AND s.usuario_id = ?`,
            [id, userId]
        );

        if (!documento) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }

        // Eliminar archivo físico
        try {
            await fs.unlink(documento.ruta_archivo);
        } catch (error) {
            console.error('Error al eliminar archivo físico:', error);
        }

        // Eliminar registro de la base de datos
        await query('DELETE FROM documentos WHERE id = ?', [id]);

        // Registrar en auditoría
        await query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, ip_address) VALUES (?, ?, ?, ?, ?)',
            [userId, 'DELETE_DOCUMENT', 'documentos', id, req.ip]
        );

        res.json({
            success: true,
            message: 'Documento eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar documento:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Validar documento (para evaluadores)
const validarDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, comentarios } = req.body;
        const evaluadorId = req.user.id;

        // Verificar que el usuario es evaluador
        if (req.user.tipo_usuario !== 'evaluador' && req.user.tipo_usuario !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para validar documentos'
            });
        }

        // Actualizar estado del documento
        await query(
            `UPDATE documentos SET 
             estado = ?, comentarios = ?, fecha_validacion = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [estado, comentarios, id]
        );

        // Registrar en auditoría
        await query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, ip_address) VALUES (?, ?, ?, ?, ?)',
            [evaluadorId, 'VALIDATE_DOCUMENT', 'documentos', id, req.ip]
        );

        res.json({
            success: true,
            message: 'Documento validado exitosamente'
        });

    } catch (error) {
        console.error('Error al validar documento:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    subirDocumento,
    obtenerDocumentos,
    descargarDocumento,
    eliminarDocumento,
    validarDocumento,
    upload
}; 