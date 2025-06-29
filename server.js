const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: './config.env' });

// Importar configuración de base de datos
const { testConnection } = require('./config/database');

// Importar rutas
const apiRoutes = require('./routes/api');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE DE SEGURIDAD
// ============================================================================

// Helmet para seguridad
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: {
        success: false,
        message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos'
    }
});
app.use('/api/', limiter);

// CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://tu-dominio.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// ============================================================================
// MIDDLEWARE DE PROCESAMIENTO
// ============================================================================

// Compresión
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Parse JSON
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// SERVIR ARCHIVOS ESTÁTICOS
// ============================================================================

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Servir archivos subidos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================================
// RUTAS DE LA API
// ============================================================================

// Prefijo de la API
app.use('/api', apiRoutes);

// ============================================================================
// RUTAS DEL FRONTEND
// ============================================================================

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rutas para las páginas del frontend
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/nueva-solicitud', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'nueva-solicitud.html'));
});

app.get('/solicitudes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'solicitudes.html'));
});

app.get('/evaluacion', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'evaluacion.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ============================================================================
// MANEJO DE ERRORES
// ============================================================================

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Middleware para manejar errores
app.use((error, req, res, next) => {
    console.error('Error:', error);
    
    res.status(error.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' 
            ? error.message 
            : 'Error interno del servidor'
    });
});

// ============================================================================
// INICIALIZACIÓN DEL SERVIDOR
// ============================================================================

async function startServer() {
    try {
        // Probar conexión a la base de datos
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ No se pudo conectar a la base de datos');
            process.exit(1);
        }

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('🚀 Servidor iniciado correctamente');
            console.log(`📡 Puerto: ${PORT}`);
            console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 URL: http://localhost:${PORT}`);
            console.log('✅ CreditoSys está listo para usar');
        });

    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

// Manejar señales de terminación
process.on('SIGTERM', () => {
    console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
    process.exit(0);
});

// Iniciar servidor
startServer(); 