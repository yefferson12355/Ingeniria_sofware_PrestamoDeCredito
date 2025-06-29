// Función para verificar la autenticación
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!token || !user) {
        window.location.href = '/login';
        return null;
    }
    
    return user;
}

// Función para hacer peticiones a la API
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    try {
        const response = await fetch(`/api${endpoint}`, { ...defaultOptions, ...options });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición');
        }
        
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    if (!notification || !notificationText) {
        console.error('Elementos de notificación no encontrados');
        return;
    }
    
    notificationText.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Función para mostrar/ocultar loading
function toggleLoading(show) {
    const loadingScreen = document.getElementById('loadingScreen');
    
    if (!loadingScreen) {
        console.error('Elemento de loading no encontrado');
        return;
    }
    
    loadingScreen.style.display = show ? 'flex' : 'none';
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// Función para formatear fechas
function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Función para formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'PEN'
    }).format(amount);
}

// Función para validar email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Función para validar DNI
function isValidDNI(dni) {
    const re = /^\d{8}$/;
    return re.test(dni);
}

// Función para validar teléfono
function isValidPhone(phone) {
    const re = /^\d{9}$/;
    return re.test(phone);
}

// Exportar funciones
window.app = {
    checkAuth,
    apiRequest,
    showNotification,
    toggleLoading,
    logout,
    formatDate,
    formatCurrency,
    isValidEmail,
    isValidDNI,
    isValidPhone
}; 