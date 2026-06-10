// ============================================
// 🔐 LogiTrans Express - Autenticación
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const paginaActual = window.location.pathname;
    
    // Si está en login y ya tiene token, redirigir a dashboard
    if (paginaActual.includes('index.html') && token) {
        window.location.replace('dashboard.html');
        return;
    }
    
    // Formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', iniciarSesion);
    }
});

// ============================================
// INICIAR SESIÓN
// ============================================
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
            // Guardar token y datos del usuario
            localStorage.setItem('token', datos.datos.token);
            localStorage.setItem('nombre', datos.datos.nombre);
            localStorage.setItem('rol', datos.datos.rol);
            
            // Mostrar mensaje de éxito con ENLACE (no botón) para evitar alerta de Chrome
            mensajeDiv.innerHTML = `
                <div style="text-align: center;">
                    <p style="margin-bottom: 15px;">✅ ¡Bienvenido ${datos.datos.nombre}!</p>
                    <a href="dashboard.html" style="
                        display: inline-block;
                        padding: 12px 24px;
                        background: #6b9080;
                        color: white;
                        text-decoration: none;
                        border-radius: 12px;
                        font-family: 'Poppins', sans-serif;
                        font-size: 15px;
                    ">Ir al Dashboard 🚀</a>
                </div>
            `;
            mensajeDiv.className = 'mensaje exito';
            mensajeDiv.style.display = 'block';
            
        } else {
            mostrarMensaje(mensajeDiv, datos.mensaje || 'Credenciales incorrectas', 'error');
        }
        
    } catch (error) {
        mostrarMensaje(mensajeDiv, 'Error de conexión con el servidor', 'error');
        console.error('Error:', error);
    }
}

// ============================================
// CERRAR SESIÓN
// ============================================
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

// ============================================
// MOSTRAR MENSAJE
// ============================================
function mostrarMensaje(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.className = 'mensaje ' + tipo;
    
    setTimeout(() => {
        elemento.className = 'mensaje';
    }, 5000);
}

// ============================================
// VERIFICAR TOKEN (para proteger páginas)
// ============================================
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