// ============================================
// 🚛 LogiTrans Express - App Principal
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Verificar que el usuario esté autenticado (solo verificar que exista token en localStorage)
    var paginasProtegidas = ['dashboard.html', 'conductores.html', 'vehiculos.html', 'rutas.html', 'viajes.html'];
    var paginaActual = window.location.pathname;
    
    var esPaginaProtegida = paginasProtegidas.some(function(p) {
        return paginaActual.includes(p);
    });
    
    if (esPaginaProtegida) {
        var token = localStorage.getItem('token');
        
        // Si no hay token, redirigir al login
        if (!token) {
            window.location.replace('index.html');
            return;
        }
        
        // Si hay token, cargar nombre del usuario
        cargarNombreUsuario();
    }
});

// ============================================
// CARGAR NOMBRE DE USUARIO
// ============================================
function cargarNombreUsuario() {
    var nombre = localStorage.getItem('nombre') || 'Usuario';
    var elemento = document.getElementById('nombreUsuario');
    
    if (elemento) {
        elemento.textContent = nombre;
    }
}