/* ============================================================================
   CREDITOSYS - JAVASCRIPT CENTRALIZADO ARREGLADO
   Sistema de Gestión de Créditos
   ============================================================================ */

// ============================================================================
// VARIABLES GLOBALES
// ============================================================================
let currentUser = null;
let isLoading = false;

// ============================================================================
// UTILIDADES GENERALES
// ============================================================================

// Mostrar notificación
function showNotification(message, type = 'info', duration = 4000) {
    const notification = document.getElementById('notification') || createNotification();
    const notificationText = notification.querySelector('#notificationText') || notification.querySelector('span');
    
    notificationText.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

// Crear elemento de notificación si no existe
function createNotification() {
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';
    notification.innerHTML = '<span id="notificationText"></span>';
    document.body.appendChild(notification);
    return notification;
}

// Mostrar loading
function showLoading() {
    isLoading = true;
    const loading = document.getElementById('loadingScreen') || createLoading();
    loading.classList.add('active');
}

// Ocultar loading
function hideLoading() {
    isLoading = false;
    const loading = document.getElementById('loadingScreen');
    if (loading) {
        loading.classList.remove('active');
    }
}

// Crear elemento de loading si no existe
function createLoading() {
    const loading = document.createElement('div');
    loading.id = 'loadingScreen';
    loading.className = 'loading';
    loading.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loading);
    return loading;
}

// Simular delay de API
function simulateApiCall(duration = 2000) {
    return new Promise(resolve => {
        setTimeout(resolve, duration);
    });
}

// ============================================================================
// GESTIÓN DE USUARIO Y SESIÓN
// ============================================================================

// Cargar datos del usuario
function loadUserData() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        console.log('Usuario cargado:', currentUser);
        updateUserInterface();
        return true;
    }
    return false;
}

// Actualizar interfaz con datos del usuario
function updateUserInterface() {
    if (!currentUser) return;
    
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');
    
    if (userName) userName.textContent = currentUser.name;
    if (userRole) {
        userRole.textContent = currentUser.type.charAt(0).toUpperCase() + currentUser.type.slice(1);
    }
    if (userAvatar) {
        const initials = currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2);
        userAvatar.textContent = initials;
    }
    
    // Mostrar/ocultar elementos según el rol
    updateRoleBasedUI();
}

// Actualizar UI basada en roles
function updateRoleBasedUI() {
    if (!currentUser) return;
    
    const evaluacionTab = document.getElementById('evaluacionTab');
    const adminTab = document.getElementById('adminTab');
    const reportesTab = document.getElementById('reportesTab');
    const actionEvaluacion = document.getElementById('actionEvaluacion');
    const actionAdmin = document.getElementById('actionAdmin');
    
    console.log('Actualizando UI para rol:', currentUser.type);
    
    // Mostrar elementos para EVALUADORES
    if (currentUser.type === 'evaluador') {
        if (evaluacionTab) {
            evaluacionTab.classList.remove('d-none');
            evaluacionTab.style.display = 'flex';
        }
        if (reportesTab) {
            reportesTab.classList.remove('d-none');
            reportesTab.style.display = 'flex';
        }
        if (actionEvaluacion) {
            actionEvaluacion.classList.remove('d-none');
            actionEvaluacion.style.display = 'block';
        }
    }
    
    // Mostrar elementos para ADMINISTRADORES
    if (currentUser.type === 'admin' || currentUser.type === 'administrador') {
        if (evaluacionTab) {
            evaluacionTab.classList.remove('d-none');
            evaluacionTab.style.display = 'flex';
        }
        if (adminTab) {
            adminTab.classList.remove('d-none');
            adminTab.style.display = 'flex';
        }
        if (reportesTab) {
            reportesTab.classList.remove('d-none');
            reportesTab.style.display = 'flex';
        }
        if (actionEvaluacion) {
            actionEvaluacion.classList.remove('d-none');
            actionEvaluacion.style.display = 'block';
        }
        if (actionAdmin) {
            actionAdmin.classList.remove('d-none');
            actionAdmin.style.display = 'block';
        }
    }
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showNotification('Sesión cerrada exitosamente', 'success');
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// ============================================================================
// NAVEGACIÓN Y PESTAÑAS
// ============================================================================

// Cambiar pestaña de formulario
function switchTab(tabName) {
    // Actualizar botones de pestaña
    document.querySelectorAll('.form-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Actualizar contenido
    document.querySelectorAll('.form-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const targetContent = document.getElementById(tabName + 'Form');
    if (targetContent) {
        targetContent.classList.add('active');
    }
}

// Mostrar sección
function showSection(sectionName) {
    // Actualizar pestañas de navegación
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Actualizar secciones de contenido
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.classList.add('fade-in');
    }
}

// Funciones de navegación entre páginas
function irADashboard() {
    if (window.location.pathname.includes('dashboard')) {
        showSection('dashboard');
    } else {
        window.location.href = 'dashboard.html';
    }
}

function irASolicitudes() {
    window.location.href = 'solicitudes.html';
}

function irANuevaSolicitud() {
    window.location.href = 'nueva-solicitud.html';
}

function irAEvaluacion() {
    window.location.href = 'evaluacion.html';
}

function irAAdmin() {
    window.location.href = 'admin.html';
}

// ============================================================================
// REDIRECCIÓN INTELIGENTE POR ROLES
// ============================================================================

function redirectToUserPage() {
    if (!currentUser) {
        console.log('No hay usuario, redirigiendo a login');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('Redirigiendo usuario:', currentUser.type);
    
    switch(currentUser.type) {
        case 'cliente':
            window.location.href = 'dashboard.html';
            break;
        case 'evaluador':
            window.location.href = 'evaluacion.html';
            break;
        case 'admin':
        case 'administrador':
            window.location.href = 'admin.html';
            break;
        default:
            console.log('Tipo de usuario desconocido:', currentUser.type);
            window.location.href = 'dashboard.html';
    }
}

// ============================================================================
// VALIDACIONES DE FORMULARIO
// ============================================================================

// Validar email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validar DNI
function validateDNI(dni) {
    return /^[0-9]{8}$/.test(dni);
}

// Validar teléfono
function validatePhone(phone) {
    return /^[0-9]{9}$/.test(phone);
}

// Validar contraseña
function validatePassword(password) {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[0-9]/.test(password);
}

// Mostrar/ocultar contraseña
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Verificar fortaleza de contraseña
function checkPasswordStrength(password) {
    const strengthBar = document.getElementById('passwordStrengthBar');
    const lengthReq = document.getElementById('lengthReq');
    const upperReq = document.getElementById('upperReq');
    const numberReq = document.getElementById('numberReq');
    
    if (!strengthBar) return;
    
    let score = 0;
    
    // Verificar longitud
    if (password.length >= 8) {
        if (lengthReq) {
            lengthReq.classList.remove('invalid');
            lengthReq.classList.add('valid');
            lengthReq.querySelector('i').className = 'fas fa-check';
        }
        score++;
    } else if (lengthReq) {
        lengthReq.classList.remove('valid');
        lengthReq.classList.add('invalid');
        lengthReq.querySelector('i').className = 'fas fa-times';
    }
    
    // Verificar mayúscula
    if (/[A-Z]/.test(password)) {
        if (upperReq) {
            upperReq.classList.remove('invalid');
            upperReq.classList.add('valid');
            upperReq.querySelector('i').className = 'fas fa-check';
        }
        score++;
    } else if (upperReq) {
        upperReq.classList.remove('valid');
        upperReq.classList.add('invalid');
        upperReq.querySelector('i').className = 'fas fa-times';
    }
    
    // Verificar número
    if (/[0-9]/.test(password)) {
        if (numberReq) {
            numberReq.classList.remove('invalid');
            numberReq.classList.add('valid');
            numberReq.querySelector('i').className = 'fas fa-check';
        }
        score++;
    } else if (numberReq) {
        numberReq.classList.remove('valid');
        numberReq.classList.add('invalid');
        numberReq.querySelector('i').className = 'fas fa-times';
    }
    
    // Actualizar barra de fortaleza
    strengthBar.className = 'password-strength-bar';
    if (score === 1) {
        strengthBar.classList.add('strength-weak');
    } else if (score === 2) {
        strengthBar.classList.add('strength-fair');
    } else if (score === 3) {
        strengthBar.classList.add('strength-strong');
    }
}

// Verificar coincidencia de contraseñas
function checkPasswordMatch() {
    const password = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const matchIcon = document.getElementById('passwordMatch');
    
    if (!password || !confirmPassword || !matchIcon) return;
    
    if (confirmPassword.value === '') {
        matchIcon.innerHTML = '';
        return;
    }
    
    if (password.value === confirmPassword.value) {
        matchIcon.innerHTML = '<i class="fas fa-check" style="color: #4caf50;"></i>';
    } else {
        matchIcon.innerHTML = '<i class="fas fa-times" style="color: #ff6b6b;"></i>';
    }
}

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

// Usuarios demo ACTUALIZADOS
const demoUsers = {
    'cliente@demo.com': { type: 'cliente', name: 'Juan Pérez', password: '123456' },
    'evaluador@demo.com': { type: 'evaluador', name: 'María García', password: '123456' },
    'admin@demo.com': { type: 'admin', name: 'Carlos López', password: '123456' }
};

// Manejar login CORREGIDO
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!validateEmail(email)) {
        showNotification('Email no válido', 'error');
        return;
    }
    
    showLoading();
    
    try {
        await simulateApiCall(1500);
        
        if (demoUsers[email] && demoUsers[email].password === password) {
            currentUser = {
                email: email,
                name: demoUsers[email].name,
                type: demoUsers[email].type
            };
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showNotification('¡Inicio de sesión exitoso!', 'success');
            
            console.log('Login exitoso, redirigiendo a:', currentUser.type);
            
            setTimeout(() => {
                // REDIRECCIÓN INTELIGENTE POR ROL
                redirectToUserPage();
            }, 1500);
        } else {
            showNotification('Email o contraseña incorrectos', 'error');
        }
    } catch (error) {
        showNotification('Error en el servidor', 'error');
    } finally {
        hideLoading();
    }
}

// Manejar registro
async function handleRegister(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('registerNombre').value;
    const apellido = document.getElementById('registerApellido').value;
    const email = document.getElementById('registerEmail').value;
    const telefono = document.getElementById('registerTelefono').value;
    const dni = document.getElementById('registerDni').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validaciones
    if (!validateEmail(email)) {
        showNotification('Email no válido', 'error');
        return;
    }
    
    if (!validateDNI(dni)) {
        showNotification('DNI debe tener 8 dígitos', 'error');
        return;
    }
    
    if (!validatePhone(telefono)) {
        showNotification('Teléfono debe tener 9 dígitos', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (!validatePassword(password)) {
        showNotification('La contraseña no cumple los requisitos', 'error');
        return;
    }
    
    showLoading();
    
    try {
        await simulateApiCall(2000);
        
        currentUser = {
            email: email,
            name: `${nombre} ${apellido}`,
            type: 'cliente', // Los nuevos usuarios siempre son clientes
            telefono: telefono,
            dni: dni
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showNotification('¡Cuenta creada exitosamente!', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html'; // Los nuevos van al dashboard
        }, 1500);
    } catch (error) {
        showNotification('Error al crear la cuenta', 'error');
    } finally {
        hideLoading();
    }
}

// Login demo
function demoLogin() {
    document.getElementById('loginEmail').value = 'cliente@demo.com';
    document.getElementById('loginPassword').value = '123456';
    showNotification('Datos de demo cargados', 'info');
}

// Llenar datos demo por tipo
function fillDemoData(userType) {
    const emails = {
        'cliente': 'cliente@demo.com',
        'evaluador': 'evaluador@demo.com',
        'admin': 'admin@demo.com'
    };
    
    document.getElementById('loginEmail').value = emails[userType] || 'cliente@demo.com';
    document.getElementById('loginPassword').value = '123456';
    showNotification(`Datos de ${userType} cargados`, 'info');
}

// ============================================================================
// VERIFICACIÓN DE SESIÓN
// ============================================================================

// Verificar acceso a páginas protegidas
function checkPageAccess() {
    const currentPage = window.location.pathname;
    
    // Si no hay usuario y no está en login/register
    if (!loadUserData() && !currentPage.includes('login') && !currentPage.includes('register')) {
        console.log('Sin sesión, redirigiendo a login');
        window.location.href = 'login.html';
        return false;
    }
    
    // Si hay usuario pero está en login/register
    if (loadUserData() && (currentPage.includes('login') || currentPage.includes('register'))) {
        console.log('Ya hay sesión, redirigiendo según rol');
        redirectToUserPage();
        return false;
    }
    
    // Verificar permisos de página
    if (currentUser) {
        if (currentPage.includes('evaluacion') && currentUser.type === 'cliente') {
            showNotification('No tienes permisos para acceder a esta página', 'error');
            window.location.href = 'dashboard.html';
            return false;
        }
        
        if (currentPage.includes('admin') && currentUser.type !== 'admin' && currentUser.type !== 'administrador') {
            showNotification('No tienes permisos para acceder a esta página', 'error');
            window.location.href = 'dashboard.html';
            return false;
        }
    }
    
    return true;
}

// ============================================================================
// MODALES
// ============================================================================

// Mostrar modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

// Cerrar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

// Configurar event listeners
function setupEventListeners() {
    // Cerrar modales con Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
    
    // Cerrar modales al hacer click fuera
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
    });
}

// Inicializar aplicación
function initApp() {
    // Verificar acceso a la página
    if (!checkPageAccess()) {
        return;
    }
    
    // Configurar event listeners
    setupEventListeners();
    
    // Actualizar interfaz si hay usuario
    if (currentUser) {
        updateUserInterface();
    }
}

// ============================================================================
// CARGA DE LA PÁGINA
// ============================================================================

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);

// Verificar sesión al cargar la ventana
window.addEventListener('load', function() {
    console.log('Página cargada:', window.location.pathname);
    
    // Verificar de nuevo después de que todo esté cargado
    setTimeout(() => {
        if (currentUser) {
            updateUserInterface();
        }
    }, 100);
});