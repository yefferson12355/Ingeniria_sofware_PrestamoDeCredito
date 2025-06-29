document.addEventListener('DOMContentLoaded', function() {
    // Logout
    const btnLogout = document.getElementById('btnLogoutSolicitudes');
    if (btnLogout) {
        btnLogout.addEventListener('click', function() {
            if (window.app && window.app.logout) window.app.logout();
        });
    }
    // Filtros y acciones
    // ...enlaza aquí los eventos de filtro, exportar, actualizar, verDetalle, etc.
});
// Aquí puedes definir y exportar funciones globales si es necesario. 