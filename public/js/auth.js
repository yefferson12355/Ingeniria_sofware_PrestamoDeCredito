// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
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
    loadingScreen.style.display = show ? 'flex' : 'none';
}

// Función para manejar el login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        app.toggleLoading(true);
        
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Guardar el token en localStorage
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            app.showNotification('Login exitoso');
            
            // Redirigir según el tipo de usuario
            setTimeout(() => {
                const user = data.data.user;
                if (user.tipo_usuario === 'admin') {
                    window.location.href = '/admin';
                } else if (user.tipo_usuario === 'evaluador') {
                    window.location.href = '/evaluacion';
                } else {
                    window.location.href = '/dashboard';
                }
            }, 1000);
        } else {
            app.showNotification(data.message || 'Error en el login', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        app.showNotification('Error al conectar con el servidor', 'error');
    } finally {
        app.toggleLoading(false);
    }
}

// Verificar si el usuario ya está autenticado
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (token && user) {
        // Redirigir según el tipo de usuario
        if (user.tipo_usuario === 'admin') {
            window.location.href = '/admin';
        } else if (user.tipo_usuario === 'evaluador') {
            window.location.href = '/evaluacion';
        } else {
            window.location.href = '/dashboard';
        }
    }
}

// Ejecutar verificación al cargar la página
document.addEventListener('DOMContentLoaded', checkAuth);

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', handleLogin);
    }
    const btnToggle = document.getElementById('btnTogglePasswordLogin');
    if (btnToggle) {
        btnToggle.addEventListener('click', function() {
            const input = document.getElementById('loginPassword');
            if (input.type === 'password') {
                input.type = 'text';
                btnToggle.querySelector('i').classList.remove('fa-eye');
                btnToggle.querySelector('i').classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                btnToggle.querySelector('i').classList.remove('fa-eye-slash');
                btnToggle.querySelector('i').classList.add('fa-eye');
            }
        });
    }
});

window.handleLogin = handleLogin; 