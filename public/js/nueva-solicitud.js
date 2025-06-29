document.addEventListener('DOMContentLoaded', function() {
    // Logout
    const btnLogout = document.getElementById('btnLogoutNuevaSolicitud');
    if (btnLogout) {
        btnLogout.addEventListener('click', function() {
            if (window.app && window.app.logout) window.app.logout();
        });
    }
    // Navegación de pasos, subida de archivos, etc.
    // ...enlaza aquí los eventos de pasos, subida, etc.
});
// Aquí puedes definir y exportar funciones globales si es necesario. 