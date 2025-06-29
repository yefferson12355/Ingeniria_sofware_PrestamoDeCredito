document.addEventListener('DOMContentLoaded', function() {
    // Logout
    const btnLogout = document.getElementById('btnLogoutAdmin');
    if (btnLogout) {
        btnLogout.addEventListener('click', function() {
            if (window.app && window.app.logout) window.app.logout();
        });
    }

    // Navegación de tabs
    const tabButtons = document.querySelectorAll('.nav-tab');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const section = btn.textContent.trim().toLowerCase();
            showSection(section);
        });
    });

    // Botón crear usuario
    const btnCrearUsuario = document.querySelector('button.btn.btn-primary');
    if (btnCrearUsuario) {
        btnCrearUsuario.addEventListener('click', abrirModalUsuario);
    }

    // Aquí puedes enlazar más botones y acciones administrativas según los ids agregados en el HTML
    // Ejemplo para botones de acción en la tabla de usuarios:
    document.querySelectorAll('[data-action="editarUsuario"]').forEach(btn => {
        btn.addEventListener('click', function() {
            editarUsuario(btn.dataset.id);
        });
    });
    document.querySelectorAll('[data-action="eliminarUsuario"]').forEach(btn => {
        btn.addEventListener('click', function() {
            eliminarUsuario(btn.dataset.id);
        });
    });
    // ...y así para los demás botones de acción
});

// Funciones administrativas migradas desde el HTML
function abrirModalUsuario(id = null) {
    if (id) {
        document.getElementById('modalUsuarioTitulo').textContent = 'Editar Usuario';
        // Cargar datos del usuario
    } else {
        document.getElementById('modalUsuarioTitulo').textContent = 'Crear Usuario';
        document.getElementById('formUsuario').reset();
    }
    showModal('modalUsuario');
}

function editarUsuario(id) {
    abrirModalUsuario(id);
}

function cambiarEstado(id) {
    app.showNotification(`Cambiando estado del usuario ${id}`, 'info');
}

function eliminarUsuario(id) {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
        app.showNotification(`Usuario ${id} eliminado`, 'success');
    }
}

function guardarPoliticas() {
    app.showNotification('Políticas guardadas exitosamente', 'success');
}

function exportarAuditoria() {
    app.showNotification('Exportando logs de auditoría...', 'info');
}

function verDetalleAudit(id) {
    app.showNotification(`Mostrando detalle del evento ${id}`, 'info');
}

function generarReporte(tipo) {
    app.showNotification(`Generando reporte de ${tipo}...`, 'info');
}

function configurarAlertas() {
    app.showNotification('Alertas configuradas exitosamente', 'success');
}

function crearBackup() {
    app.showNotification('Iniciando backup manual...', 'info');
}

function restaurarSistema() {
    if (confirm('¿Está seguro de restaurar el sistema?')) {
        app.showNotification('Iniciando restauración del sistema...', 'warning');
    }
}

function exportarDatos() {
    const tipo = document.getElementById('tipoExportacion').value;
    const formato = document.getElementById('formatoExportacion').value;
    app.showNotification(`Exportando ${tipo} en formato ${formato}...`, 'info');
}

function probarConexiones() {
    app.showNotification('Probando conexiones externas...', 'info');
}

function guardarConfiguracion() {
    app.showNotification('Configuración guardada exitosamente', 'success');
}

function reiniciarSistema() {
    if (confirm('¿Está seguro de reiniciar el sistema? Esto afectará a todos los usuarios.')) {
        app.showNotification('Reiniciando sistema...', 'warning');
    }
}

function updatePonderacionesAdmin() {
    const elementos = ['Historial', 'Ingresos', 'Activos', 'Comportamiento'];
    let total = 0;
    elementos.forEach(elemento => {
        const valor = document.getElementById(`peso${elemento}Admin`).value;
        document.getElementById(`peso${elemento}AdminValue`).textContent = valor + '%';
        total += parseInt(valor);
    });
    document.getElementById('totalPonderacionAdmin').textContent = total + '%';
    // Cambiar color si no suma 100%
    const totalElement = document.getElementById('totalPonderacionAdmin');
    if (total === 100) {
        totalElement.parentElement.style.background = 'rgba(76, 175, 80, 0.1)';
    } else {
        totalElement.parentElement.style.background = 'rgba(255, 107, 107, 0.1)';
    }
}

function showSection(sectionName) {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    // Buscar el tab por el texto (puedes mejorar esto usando data-section)
    document.querySelectorAll('.nav-tab').forEach(tab => {
        if (tab.textContent.trim().toLowerCase() === sectionName) {
            tab.classList.add('active');
        }
    });
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.classList.add('fade-in');
    }
}

// Inicializar cuando se carga la página
window.addEventListener('load', function() {
    updatePonderacionesAdmin();
});

// Event listeners para las ponderaciones
['Historial', 'Ingresos', 'Activos', 'Comportamiento'].forEach(elemento => {
    const slider = document.getElementById(`peso${elemento}Admin`);
    if (slider) {
        slider.addEventListener('input', updatePonderacionesAdmin);
    }
});

// Exportar funciones globalmente si es necesario
window.abrirModalUsuario = abrirModalUsuario;
window.editarUsuario = editarUsuario;
window.cambiarEstado = cambiarEstado;
window.eliminarUsuario = eliminarUsuario;
window.guardarPoliticas = guardarPoliticas;
window.exportarAuditoria = exportarAuditoria;
window.verDetalleAudit = verDetalleAudit;
window.generarReporte = generarReporte;
window.configurarAlertas = configurarAlertas;
window.crearBackup = crearBackup;
window.restaurarSistema = restaurarSistema;
window.exportarDatos = exportarDatos;
window.probarConexiones = probarConexiones;
window.guardarConfiguracion = guardarConfiguracion;
window.reiniciarSistema = reiniciarSistema;
window.updatePonderacionesAdmin = updatePonderacionesAdmin;
window.showSection = showSection; 