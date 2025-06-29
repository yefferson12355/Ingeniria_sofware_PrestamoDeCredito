-- ============================================================================
-- CREDITOSYS - ESQUEMA DE BASE DE DATOS
-- Sistema de Gestión de Créditos
-- ============================================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS creditosys CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE creditosys;

-- ============================================================================
-- TABLA DE USUARIOS
-- ============================================================================
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    dni VARCHAR(8) UNIQUE NOT NULL,
    telefono VARCHAR(9),
    fecha_nacimiento DATE,
    direccion TEXT,
    estado_civil ENUM('soltero', 'casado', 'divorciado', 'viudo') DEFAULT 'soltero',
    dependientes INT DEFAULT 0,
    tipo_usuario ENUM('cliente', 'evaluador', 'admin') DEFAULT 'cliente',
    score_crediticio INT DEFAULT 0,
    estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_dni (dni),
    INDEX idx_tipo_usuario (tipo_usuario)
);

-- ============================================================================
-- TABLA DE SOLICITUDES DE CRÉDITO
-- ============================================================================
CREATE TABLE solicitudes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    monto_solicitado DECIMAL(12,2) NOT NULL,
    plazo_meses INT NOT NULL,
    proposito ENUM('vivienda', 'vehiculo', 'educacion', 'negocio', 'personal', 'consolidacion', 'medical', 'otro') NOT NULL,
    ingresos_mensuales DECIMAL(12,2),
    gastos_mensuales DECIMAL(12,2),
    empleo_actual VARCHAR(255),
    tiempo_empleo INT, -- en meses
    estado ENUM('pendiente', 'en_revision', 'aprobada', 'rechazada', 'cancelada') DEFAULT 'pendiente',
    score_final INT DEFAULT 0,
    monto_aprobado DECIMAL(12,2) DEFAULT 0,
    tasa_interes DECIMAL(5,2) DEFAULT 0,
    evaluador_id INT,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_evaluacion TIMESTAMP NULL,
    fecha_aprobacion TIMESTAMP NULL,
    comentarios_evaluador TEXT,
    motivo_rechazo TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluador_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_solicitud (fecha_solicitud)
);

-- ============================================================================
-- TABLA DE DOCUMENTOS
-- ============================================================================
CREATE TABLE documentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    solicitud_id INT NOT NULL,
    tipo_documento ENUM('dni', 'comprobante_ingresos', 'declaracion_jurada', 'otros') NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tamano_archivo INT NOT NULL, -- en bytes
    tipo_mime VARCHAR(100),
    estado ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_validacion TIMESTAMP NULL,
    comentarios TEXT,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    INDEX idx_solicitud (solicitud_id),
    INDEX idx_tipo (tipo_documento)
);

-- ============================================================================
-- TABLA DE EVALUACIONES
-- ============================================================================
CREATE TABLE evaluaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    solicitud_id INT NOT NULL,
    evaluador_id INT NOT NULL,
    score_ingresos INT DEFAULT 0,
    score_empleo INT DEFAULT 0,
    score_historial INT DEFAULT 0,
    score_documentos INT DEFAULT 0,
    score_final INT DEFAULT 0,
    recomendacion ENUM('aprobado', 'rechazado', 'revision_manual') NOT NULL,
    comentarios TEXT,
    fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluador_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_solicitud (solicitud_id),
    INDEX idx_evaluador (evaluador_id)
);

-- ============================================================================
-- TABLA DE POLÍTICAS DE CRÉDITO
-- ============================================================================
CREATE TABLE politicas_credito (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    monto_minimo DECIMAL(12,2) NOT NULL,
    monto_maximo DECIMAL(12,2) NOT NULL,
    plazo_minimo INT NOT NULL, -- en meses
    plazo_maximo INT NOT NULL, -- en meses
    tasa_interes_minima DECIMAL(5,2) NOT NULL,
    tasa_interes_maxima DECIMAL(5,2) NOT NULL,
    score_minimo INT NOT NULL,
    edad_minima INT DEFAULT 18,
    edad_maxima INT DEFAULT 65,
    ingresos_minimos DECIMAL(12,2),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLA DE AUDITORÍA
-- ============================================================================
CREATE TABLE auditoria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(100),
    registro_id INT,
    datos_anteriores JSON,
    datos_nuevos JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (fecha_accion),
    INDEX idx_accion (accion)
);

-- ============================================================================
-- TABLA DE NOTIFICACIONES
-- ============================================================================
CREATE TABLE notificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_leida (leida),
    INDEX idx_fecha (fecha_creacion)
);

-- ============================================================================
-- INSERCIÓN DE DATOS INICIALES
-- ============================================================================

-- Insertar políticas de crédito por defecto
INSERT INTO politicas_credito (nombre, descripcion, monto_minimo, monto_maximo, plazo_minimo, plazo_maximo, tasa_interes_minima, tasa_interes_maxima, score_minimo) VALUES
('Crédito Personal Básico', 'Crédito personal para necesidades básicas', 1000.00, 50000.00, 6, 60, 15.00, 25.00, 60),
('Crédito Personal Premium', 'Crédito personal con mejores condiciones', 5000.00, 200000.00, 12, 72, 12.00, 20.00, 75),
('Crédito Vivienda', 'Crédito para compra de vivienda', 50000.00, 1000000.00, 60, 360, 8.00, 15.00, 80),
('Crédito Vehículo', 'Crédito para compra de vehículo', 10000.00, 300000.00, 12, 84, 10.00, 18.00, 70);

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (nombres, apellidos, email, password, dni, telefono, tipo_usuario, score_crediticio) VALUES
    ('Administrador', 'Sistema', 'admin@creditosys.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '12345678', '999888777', 'admin', 100);

-- Insertar usuario evaluador por defecto
INSERT INTO usuarios (nombres, apellidos, email, password, dni, telefono, tipo_usuario, score_crediticio) VALUES
('Evaluador', 'Sistema', 'evaluador@creditosys.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '87654321', '999888776', 'evaluador', 100);

-- Insertar usuario cliente de prueba
INSERT INTO usuarios (nombres, apellidos, email, password, dni, telefono, fecha_nacimiento, direccion, tipo_usuario, score_crediticio) VALUES
('Juan', 'Pérez', 'juan.perez@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '11111111', '999888775', '1990-05-15', 'Av. Arequipa 123, Lima', 'cliente', 75); 