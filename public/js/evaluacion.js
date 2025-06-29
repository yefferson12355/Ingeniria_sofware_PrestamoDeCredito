document.addEventListener('DOMContentLoaded', function() {
    // Logout
    const btnLogout = document.getElementById('btnLogoutEvaluacion');
    if (btnLogout) {
        btnLogout.addEventListener('click', function() {
            if (window.app && window.app.logout) window.app.logout();
        });
    }
    // Navegación y acciones de evaluación
    // ...enlaza aquí los eventos de tabs, acciones, etc.
});
// Aquí puedes definir y exportar funciones globales si es necesario. 