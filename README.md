# 🏦 CreditoSys - Sistema de Gestión de Créditos

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)](https://www.mysql.com/)
[![Express](https://img.shields.io/badge/Express-4.18+-black.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Descripción

**CreditoSys** es un sistema completo de gestión de créditos desarrollado con tecnologías modernas. Permite a las instituciones financieras gestionar solicitudes de crédito, evaluar clientes, y administrar todo el proceso crediticio de manera eficiente y segura.

### ✨ Características Principales

- 🎨 **Interfaz Elegante**: Diseño moderno con gradientes y animaciones suaves
- 🔐 **Autenticación Segura**: JWT con roles y permisos granulares
- 📊 **Dashboard Interactivo**: Estadísticas en tiempo real y gráficos
- 📝 **Gestión de Solicitudes**: Proceso completo de solicitud a aprobación
- 🔍 **Sistema de Evaluación**: Cálculo automático de score crediticio
- 📁 **Gestión de Documentos**: Subida y validación de documentos
- 📈 **Reportes Avanzados**: Exportación y análisis de datos
- 🔔 **Notificaciones**: Sistema de alertas en tiempo real
- 📱 **Responsive**: Compatible con dispositivos móviles

## 🏗️ Arquitectura del Sistema

```
CreditoSys/
├── 📁 public/                 # Frontend estático
│   ├── 📄 index.html         # Página principal
│   ├── 📄 login.html         # Página de login
│   ├── 📄 register.html      # Página de registro
│   ├── 📄 dashboard.html     # Dashboard principal
│   ├── 📄 solicitudes.html   # Gestión de solicitudes
│   ├── 📄 evaluacion.html    # Panel de evaluación
│   ├── 📄 admin.html         # Panel administrativo
│   ├── 📄 styles.css         # Estilos elegantes
│   └── 📄 script.js          # JavaScript funcional
├── 📁 controllers/           # Controladores de la API
│   ├── 📄 authController.js  # Autenticación
│   ├── 📄 solicitudController.js # Solicitudes
│   ├── 📄 documentoController.js # Documentos
│   └── 📄 evaluacionController.js # Evaluaciones
├── 📁 middleware/            # Middleware personalizado
│   └── 📄 auth.js           # Autenticación y autorización
├── 📁 routes/               # Rutas de la API
│   └── 📄 api.js           # Endpoints principales
├── 📁 config/              # Configuración
│   └── 📄 database.js      # Conexión a base de datos
├── 📁 database/            # Esquemas de base de datos
│   └── 📄 schema.sql       # Estructura completa
├── 📁 uploads/             # Archivos subidos
├── 📄 server.js            # Servidor principal
├── 📄 package.json         # Dependencias
├── 📄 config.env           # Variables de entorno
├── 📄 install.bat          # Instalador automático
└── 📄 README.md            # Documentación
```

## 🚀 Instalación Rápida

### Requisitos Previos

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **MySQL** 8.0+ ([Descargar](https://dev.mysql.com/downloads/mysql/))
- **Git** ([Descargar](https://git-scm.com/))

### Instalación Automática (Windows)

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/creditosys/creditosys.git
   cd creditosys
   ```

2. **Ejecutar instalador automático:**
   ```bash
   install.bat
   ```

3. **Configurar base de datos:**
   - Editar `config.env` con tus credenciales de MySQL
   - Asegurar que MySQL esté ejecutándose

4. **Iniciar el sistema:**
   ```bash
   npm start
   ```

5. **Acceder al sistema:**
   - URL: http://localhost:3000
   - Usuario admin: `admin@creditosys.com` / `password`

### Instalación Manual

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp config.env.example config.env
   # Editar config.env con tus configuraciones
   ```

3. **Configurar base de datos:**
   ```sql
   CREATE DATABASE creditosys CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   mysql -u root -p creditosys < database/schema.sql
   ```

4. **Iniciar servidor:**
   ```bash
   npm start
   ```

## 🎯 Roles y Permisos

### 👤 Cliente
- Registro y autenticación
- Crear solicitudes de crédito
- Subir documentos
- Ver estado de solicitudes
- Consultar score crediticio

### 🔍 Evaluador
- Ver solicitudes pendientes
- Realizar evaluaciones
- Validar documentos
- Calcular score crediticio
- Generar reportes

### 👨‍💼 Administrador
- Gestión de usuarios
- Configuración del sistema
- Políticas de crédito
- Reportes globales
- Auditoría del sistema

## 📊 Funcionalidades del Sistema

### 🏠 Dashboard Principal
- Estadísticas en tiempo real
- Gráficos interactivos
- Notificaciones
- Acceso rápido a funciones

### 📝 Gestión de Solicitudes
- Formulario completo de solicitud
- Validación automática
- Seguimiento de estado
- Historial de solicitudes

### 🔍 Sistema de Evaluación
- Cálculo automático de score
- Criterios personalizables
- Evaluación manual
- Recomendaciones automáticas

### 📁 Gestión de Documentos
- Subida segura de archivos
- Validación de documentos
- Previsualización
- Control de versiones

### 📈 Reportes y Analytics
- Reportes personalizables
- Exportación a Excel/PDF
- Gráficos estadísticos
- Análisis de tendencias

## 🎨 Diseño y UX

### Paleta de Colores Elegante
```css
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--accent-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--success-gradient: linear-gradient(135deg, #10b981, #059669);
--error-gradient: linear-gradient(135deg, #ef4444, #dc2626);
```

### Características de Diseño
- **Gradientes Modernos**: Efectos visuales atractivos
- **Animaciones Suaves**: Transiciones fluidas
- **Sombras Elegantes**: Profundidad visual
- **Tipografía Clara**: Inter font family
- **Responsive Design**: Adaptable a todos los dispositivos

## 🔧 Configuración Avanzada

### Variables de Entorno

```env
# Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=creditosys
DB_PORT=3306

# Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=24h

# Archivos
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Seguridad
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Configuración de Base de Datos

El sistema incluye un esquema completo con:

- **Usuarios**: Gestión de usuarios y roles
- **Solicitudes**: Proceso completo de créditos
- **Documentos**: Almacenamiento y validación
- **Evaluaciones**: Sistema de scoring
- **Políticas**: Configuración de créditos
- **Auditoría**: Logs de seguridad
- **Notificaciones**: Sistema de alertas

## 🚀 Comandos Útiles

```bash
# Iniciar servidor
npm start

# Modo desarrollo (con nodemon)
npm run dev

# Ejecutar pruebas
npm test

# Instalar dependencias
npm install

# Verificar sintaxis
npm run lint

# Formatear código
npm run format
```

## 📱 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Perfil del usuario
- `POST /api/auth/logout` - Cerrar sesión

### Solicitudes
- `GET /api/solicitudes` - Listar solicitudes
- `POST /api/solicitudes` - Crear solicitud
- `GET /api/solicitudes/:id` - Obtener solicitud
- `PUT /api/solicitudes/:id` - Actualizar solicitud

### Evaluaciones
- `POST /api/solicitudes/:id/evaluar` - Iniciar evaluación
- `PUT /api/evaluaciones/:id` - Actualizar evaluación
- `GET /api/evaluaciones` - Listar evaluaciones

### Documentos
- `POST /api/documentos` - Subir documento
- `GET /api/documentos/:id/descargar` - Descargar documento
- `DELETE /api/documentos/:id` - Eliminar documento

## 🔒 Seguridad

### Características de Seguridad
- **JWT Tokens**: Autenticación segura
- **Rate Limiting**: Protección contra ataques
- **Helmet**: Headers de seguridad
- **CORS**: Control de acceso
- **Validación**: Sanitización de datos
- **Auditoría**: Logs de seguridad

### Mejores Prácticas
- Contraseñas hasheadas con bcrypt
- Tokens JWT con expiración
- Validación de entrada
- Sanitización de datos
- Logs de auditoría

## 📊 Base de Datos

### Estructura Principal

```sql
-- Usuarios
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('cliente', 'evaluador', 'admin') DEFAULT 'cliente',
    score_crediticio INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Solicitudes
CREATE TABLE solicitudes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    monto_solicitado DECIMAL(15,2) NOT NULL,
    plazo_meses INT NOT NULL,
    proposito ENUM('vivienda', 'vehiculo', 'educacion', 'negocio', 'personal') NOT NULL,
    estado ENUM('pendiente', 'en_revision', 'aprobada', 'rechazada') DEFAULT 'pendiente',
    score_crediticio INT,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evaluaciones
CREATE TABLE evaluaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    solicitud_id INT NOT NULL,
    evaluador_id INT NOT NULL,
    score_crediticio INT,
    capacidad_pago ENUM('excelente', 'buena', 'regular', 'baja'),
    historial_crediticio ENUM('excelente', 'bueno', 'regular', 'malo'),
    recomendacion ENUM('aprobada', 'rechazada', 'condicionada'),
    estado ENUM('en_proceso', 'completada', 'cancelada') DEFAULT 'en_proceso',
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error de conexión a MySQL**
   - Verificar que MySQL esté ejecutándose
   - Comprobar credenciales en `config.env`
   - Asegurar que la base de datos existe

2. **Error de puerto en uso**
   - Cambiar puerto en `config.env`
   - Verificar que no haya otro servicio usando el puerto

3. **Error de dependencias**
   - Eliminar `node_modules` y `package-lock.json`
   - Ejecutar `npm install` nuevamente

4. **Error de permisos**
   - Verificar permisos de escritura en carpeta `uploads`
   - Ejecutar como administrador si es necesario

### Logs y Debugging

```bash
# Ver logs del servidor
tail -f logs/server.log

# Modo debug
NODE_ENV=development npm start

# Verificar estado de la base de datos
mysql -u root -p -e "SHOW DATABASES;"
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

- 📧 Email: soporte@creditosys.com
- 📱 WhatsApp: +51 999 888 777
- 🌐 Web: https://creditosys.com
- 📖 Documentación: https://docs.creditosys.com

## 🙏 Agradecimientos

- **Font Awesome** por los iconos
- **Inter Font** por la tipografía
- **Express.js** por el framework
- **MySQL** por la base de datos
- **Comunidad Open Source** por las librerías

---

**CreditoSys** - Transformando la gestión de créditos con tecnología moderna y diseño elegante. 🚀 