document.addEventListener('DOMContentLoaded', function() {

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', iniciarSesion);
    }
});

async function iniciarSesion(evento) {
    evento.preventDefault();
    
    const usuario = document.getElementById('usuario').value.trim();
    const contrasena = document.getElementById('contrasena').value.trim();
    const mensajeDiv = document.getElementById('mensaje');
    
    if (!usuario || !contrasena) {
        mostrarMensaje(mensajeDiv, 'Por favor complete todos los campos', 'error');
        return;
    }
    
    try {
        const respuesta = await fetch(`${API_URLS.auth}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario: usuario,
                contrasena: contrasena
            })
        });
        
        const datos = await respuesta.json();
        
        if (datos.exito) {
            localStorage.setItem('token', datos.datos.token);
            localStorage.setItem('nombre', datos.datos.nombre);
            localStorage.setItem('rol', datos.datos.rol);
            
   
            window.location.href = 'dashboard.html';
            
        } else {
            mostrarMensaje(mensajeDiv, datos.mensaje || 'Credenciales incorrectas', 'error');
        }
        
    } catch (error) {
        mostrarMensaje(mensajeDiv, 'Error de conexión con el servidor', 'error');
        console.error('Error:', error);
    }
}

async function cerrarSesion() {
    const token = localStorage.getItem('token');
    
    try {
        await fetch(`${API_URLS.auth}/logout`, {
            method: 'POST',
            headers: {
                'TOKEN': token,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    localStorage.removeItem('rol');
    
    window.location.replace('index.html');
}

function mostrarMensaje(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.className = 'mensaje ' + tipo;
    
    setTimeout(() => {
        elemento.className = 'mensaje';
    }, 5000);
}

async function verificarToken() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.replace('index.html');
        return false;
    }
    
    try {
        const respuesta = await fetch(`${API_URLS.auth}/validar`, {
            method: 'GET',
            headers: {
                'TOKEN': token
            }
        });
        
        const datos = await respuesta.json();
        
        if (!datos.exito) {
            localStorage.removeItem('token');
            localStorage.removeItem('nombre');
            localStorage.removeItem('rol');
            window.location.replace('index.html');
            return false;
        }
        
        return true;
        
    } catch (error) {
        console.error('Error al verificar token:', error);
        return false;
    }
}