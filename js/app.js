

document.addEventListener('DOMContentLoaded', function() {

    var paginasProtegidas = ['dashboard.html', 'conductores.html', 'vehiculos.html', 'rutas.html', 'viajes.html'];
    var paginaActual = window.location.pathname;
    
    var esPaginaProtegida = paginasProtegidas.some(function(p) {
        return paginaActual.includes(p);
    });
    
    if (esPaginaProtegida) {
        var token = localStorage.getItem('token');
        
        
        if (!token) {
            window.location.replace('index.html');
            return;
        }
        
  
        cargarNombreUsuario();
    }
});


function cargarNombreUsuario() {
    var nombre = localStorage.getItem('nombre') || 'Usuario';
    var elemento = document.getElementById('nombreUsuario');
    
    if (elemento) {
        elemento.textContent = nombre;
    }
}

function cerrarSesion() {
    if (confirm('¿Desea cerrar sesión?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('nombre');
        localStorage.removeItem('rol');
        window.location.href = 'index.html';
    }
}

function mostrarMensaje(elemento, mensaje, tipo) {
    elemento.textContent = mensaje;
    elemento.className = 'mensaje ' + tipo;
    elemento.style.display = 'block';
    
    if (tipo === 'exito') {
        setTimeout(function() {
            elemento.style.display = 'none';
        }, 3000);
    }
}