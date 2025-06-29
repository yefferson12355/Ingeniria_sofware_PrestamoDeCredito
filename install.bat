@echo off
echo ========================================
echo    CREDITOSYS - INSTALADOR COMPLETO
echo ========================================
echo.

echo [1/6] Verificando requisitos del sistema...
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo.
    echo 📥 Descargando Node.js...
    echo Por favor, descarga e instala Node.js desde: https://nodejs.org/
    echo Selecciona la versión LTS (recomendada)
    echo.
    echo Después de instalar Node.js, ejecuta este script nuevamente.
    pause
    exit /b 1
) else (
    echo ✅ Node.js está instalado
    node --version
)

REM Verificar si MySQL está instalado
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MySQL no está instalado
    echo.
    echo 📥 Descargando MySQL...
    echo Por favor, descarga e instala MySQL desde: https://dev.mysql.com/downloads/mysql/
    echo O usa XAMPP: https://www.apachefriends.org/
    echo.
    echo Después de instalar MySQL, ejecuta este script nuevamente.
    pause
    exit /b 1
) else (
    echo ✅ MySQL está instalado
    mysql --version
)

echo.
echo [2/6] Instalando dependencias de Node.js...
echo.

REM Instalar dependencias principales
echo 📦 Instalando dependencias principales...
npm install express@^4.18.2 mysql2@^3.6.5 bcryptjs@^2.4.3 jsonwebtoken@^9.0.2 cors@^2.8.5 helmet@^7.1.0 express-rate-limit@^7.1.5 multer@^1.4.5-lts.1 express-validator@^7.0.1 dotenv@^16.3.1 compression@^1.7.4 morgan@^1.10.0

if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias principales
    pause
    exit /b 1
)

REM Instalar dependencias adicionales
echo 📦 Instalando dependencias adicionales...
npm install uuid@^9.0.1 moment@^2.29.4 lodash@^4.17.21 joi@^17.11.0 sanitize-html@^2.11.0 xss@^1.0.14 express-mongo-sanitize@^2.2.0 hpp@^0.2.3

if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias adicionales
    pause
    exit /b 1
)

REM Instalar dependencias de desarrollo
echo 📦 Instalando dependencias de desarrollo...
npm install --save-dev nodemon@^3.0.2 eslint@^8.55.0 prettier@^3.1.0

if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias de desarrollo
    pause
    exit /b 1
)

echo.
echo [3/6] Configurando base de datos...
echo.

REM Crear archivo de configuración si no existe
if not exist "config.env" (
    echo 📝 Creando archivo de configuración...
    (
        echo # Configuración de la Base de Datos
        echo DB_HOST=localhost
        echo DB_USER=root
        echo DB_PASSWORD=
        echo DB_NAME=creditosys
        echo DB_PORT=3306
        echo.
        echo # Configuración del Servidor
        echo PORT=3000
        echo NODE_ENV=development
        echo.
        echo # Configuración de JWT
        echo JWT_SECRET=tu_clave_secreta_super_segura_aqui
        echo JWT_EXPIRES_IN=24h
        echo.
        echo # Configuración de Archivos
        echo UPLOAD_PATH=./uploads
        echo MAX_FILE_SIZE=5242880
        echo.
        echo # Configuración de Seguridad
        echo RATE_LIMIT_WINDOW=15
        echo RATE_LIMIT_MAX=100
    ) > config.env
    echo ✅ Archivo config.env creado
) else (
    echo ✅ Archivo config.env ya existe
)

echo.
echo [4/6] Creando directorios necesarios...
echo.

REM Crear directorio de uploads si no existe
if not exist "uploads" (
    mkdir uploads
    echo ✅ Directorio uploads creado
) else (
    echo ✅ Directorio uploads ya existe
)

REM Crear directorio de logs si no existe
if not exist "logs" (
    mkdir logs
    echo ✅ Directorio logs creado
) else (
    echo ✅ Directorio logs ya existe
)

echo.
echo [5/6] Configurando base de datos MySQL...
echo.

echo 📊 Creando base de datos y tablas...
echo Por favor, asegúrate de que MySQL esté ejecutándose y que tengas acceso root.

REM Intentar crear la base de datos
mysql -u root -e "CREATE DATABASE IF NOT EXISTS creditosys CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  No se pudo crear la base de datos automáticamente
    echo Por favor, crea manualmente la base de datos 'creditosys' en MySQL
    echo.
    echo Comandos SQL:
    echo CREATE DATABASE creditosys CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    echo.
) else (
    echo ✅ Base de datos creditosys creada
)

REM Ejecutar script de esquema
echo 📋 Ejecutando script de esquema...
mysql -u root creditosys < database/schema.sql 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  No se pudo ejecutar el script de esquema automáticamente
    echo Por favor, ejecuta manualmente el archivo database/schema.sql en MySQL
    echo.
) else (
    echo ✅ Esquema de base de datos creado
)

echo.
echo [6/6] Verificando instalación...
echo.

REM Verificar que todos los archivos necesarios existen
echo 📁 Verificando archivos del proyecto...

set missing_files=0

if not exist "server.js" (
    echo ❌ server.js no encontrado
    set /a missing_files+=1
)

if not exist "config/database.js" (
    echo ❌ config/database.js no encontrado
    set /a missing_files+=1
)

if not exist "controllers/authController.js" (
    echo ❌ controllers/authController.js no encontrado
    set /a missing_files+=1
)

if not exist "middleware/auth.js" (
    echo ❌ middleware/auth.js no encontrado
    set /a missing_files+=1
)

if not exist "routes/api.js" (
    echo ❌ routes/api.js no encontrado
    set /a missing_files+=1
)

if not exist "public/index.html" (
    echo ❌ public/index.html no encontrado
    set /a missing_files+=1
)

if %missing_files% equ 0 (
    echo ✅ Todos los archivos principales están presentes
) else (
    echo ❌ Faltan %missing_files% archivos principales
    echo Por favor, asegúrate de que todos los archivos del proyecto estén presentes
)

echo.
echo ========================================
echo    INSTALACIÓN COMPLETADA
echo ========================================
echo.
echo 🎉 ¡CreditoSys ha sido instalado exitosamente!
echo.
echo 📋 PRÓXIMOS PASOS:
echo.
echo 1. Configura la base de datos en config.env
echo 2. Asegúrate de que MySQL esté ejecutándose
echo 3. Ejecuta: npm start
echo 4. Abre: http://localhost:3000
echo.
echo 📚 DOCUMENTACIÓN:
echo - Lee el archivo README.md para más información
echo - Consulta la documentación en la carpeta docs/
echo.
echo 🔧 COMANDOS ÚTILES:
echo - npm start          : Iniciar servidor
echo - npm run dev        : Iniciar en modo desarrollo
echo - npm test           : Ejecutar pruebas
echo.
echo 🆘 SOPORTE:
echo - Revisa los logs en la carpeta logs/
echo - Consulta la documentación técnica
echo.
echo Presiona cualquier tecla para continuar...
pause >nul 