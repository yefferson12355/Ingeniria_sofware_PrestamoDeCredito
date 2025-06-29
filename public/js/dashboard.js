// Verificar autenticación y cargar datos del usuario
document.addEventListener('DOMContentLoaded', async () => {
    const user = app.checkAuth();
    if (!user) return;

    // Mostrar información del usuario
    document.getElementById('userName').textContent = `${user.nombres} ${user.apellidos}`;
    document.getElementById('userRole').textContent = user.tipo_usuario.charAt(0).toUpperCase() + user.tipo_usuario.slice(1);
    document.getElementById('userAvatar').textContent = user.nombres.charAt(0);

    // Mostrar/ocultar elementos según el tipo de usuario
    const evaluacionTab = document.getElementById('evaluacionTab');
    const adminTab = document.getElementById('adminTab');
    const reportesTab = document.getElementById('reportesTab');
    const actionEvaluacion = document.getElementById('actionEvaluacion');
    const actionAdmin = document.getElementById('actionAdmin');

    if (user.tipo_usuario === 'evaluador' || user.tipo_usuario === 'admin') {
        evaluacionTab.classList.remove('d-none');
        actionEvaluacion.classList.remove('d-none');
    }

    if (user.tipo_usuario === 'admin') {
        adminTab.classList.remove('d-none');
        reportesTab.classList.remove('d-none');
        actionAdmin.classList.remove('d-none');
    }

    // Cargar estadísticas
    await loadStats();
    // Cargar solicitudes recientes
    await loadRecentSolicitudes();
});

// Cargar estadísticas
async function loadStats() {
    try {
        app.toggleLoading(true);
        const response = await app.apiRequest('/estadisticas/usuario');
        
        if (response.success) {
            const stats = response.data;
            
            // Actualizar números en el dashboard
            document.getElementById('totalSolicitudes').textContent = stats.total_solicitudes;
            document.getElementById('solicitudesAprobadas').textContent = 
                stats.solicitudes_por_estado.find(s => s.estado === 'aprobada')?.cantidad || 0;
            document.getElementById('solicitudesPendientes').textContent = 
                stats.solicitudes_por_estado.find(s => s.estado === 'pendiente')?.cantidad || 0;
            document.getElementById('montoTotal').textContent = 
                app.formatCurrency(stats.monto_total_solicitado);
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        app.showNotification('Error al cargar estadísticas', 'error');
    } finally {
        app.toggleLoading(false);
    }
}

// Cargar solicitudes recientes
async function loadRecentSolicitudes() {
    try {
        const response = await app.apiRequest('/solicitudes/usuario?limit=5');
        
        if (response.success) {
            const solicitudes = response.data;
            const tbody = document.querySelector('#recentSolicitudes tbody');
            
            if (tbody) {
                tbody.innerHTML = solicitudes.map(solicitud => `
                    <tr>
                        <td>${solicitud.id}</td>
                        <td>${app.formatDate(solicitud.fecha_solicitud)}</td>
                        <td>${app.formatCurrency(solicitud.monto_solicitado)}</td>
                        <td>
                            <span class="badge badge-${getEstadoClass(solicitud.estado)}">
                                ${solicitud.estado}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="verSolicitud(${solicitud.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error al cargar solicitudes recientes:', error);
        app.showNotification('Error al cargar solicitudes recientes', 'error');
    }
}

// Función auxiliar para obtener la clase CSS según el estado
function getEstadoClass(estado) {
    const estados = {
        'pendiente': 'warning',
        'aprobada': 'success',
        'rechazada': 'danger',
        'en_revision': 'info'
    };
    return estados[estado] || 'secondary';
}

// Navegación
function irADashboard() {
    window.location.href = '/dashboard';
}

function irASolicitudes() {
    window.location.href = '/solicitudes';
}

function irANuevaSolicitud() {
    window.location.href = '/nueva-solicitud';
}

function irAEvaluacion() {
    window.location.href = '/evaluacion';
}

function irAAdmin() {
    window.location.href = '/admin';
}

// Logout
const btnLogout = document.getElementById('btnLogoutDashboard');
if (btnLogout) {
    btnLogout.addEventListener('click', function() {
        if (window.app && window.app.logout) window.app.logout();
    });
}

// Navegación de tabs
const tabButtons = document.querySelectorAll('.nav-tab');
tabButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        const section = btn.dataset.section || btn.textContent.trim().toLowerCase();
        showSection(section);
    });
});

function showSection(sectionId) {
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.classList.add('fade-in');
    }
}

function verSolicitud(id) {
    window.location.href = `/solicitudes?id=${id}`;
}

window.handleLogin = handleLogin;
window.showSection = showSection; 