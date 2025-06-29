async function handleRegister(event) {
    event.preventDefault();
    const nombres = document.getElementById('registerNombre').value;
    const apellidos = document.getElementById('registerApellido').value;
    const email = document.getElementById('registerEmail').value;
    const telefono = document.getElementById('registerTelefono').value;
    const dni = document.getElementById('registerDNI').value;
    const password = document.getElementById('registerPassword').value;
    const fecha_nacimiento = document.getElementById('registerFechaNacimiento').value;
    const direccion = document.getElementById('registerDireccion').value;
    const estado_civil = document.getElementById('registerEstadoCivil').value;
    const dependientes = document.getElementById('registerDependientes').value;

    try {
        app.toggleLoading(true);
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombres,
                apellidos,
                email,
                telefono,
                dni,
                password,
                fecha_nacimiento,
                direccion,
                estado_civil,
                dependientes
            })
        });
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            app.showNotification('Registro exitoso');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            app.showNotification(data.message || 'Error en el registro', 'error');
        }
    } catch (error) {
        app.showNotification('Error al conectar con el servidor', 'error');
    } finally {
        app.toggleLoading(false);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    if (form) {
        form.addEventListener('submit', handleRegister);
    }
});

window.handleRegister = handleRegister; 