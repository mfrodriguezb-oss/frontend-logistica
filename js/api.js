
const API_BASE = 'http://localhost:8080/backend-logistica';

const API_URLS = {
    auth: `${API_BASE}/ms-auth/public/index.php`,
    conductores: `${API_BASE}/ms-conductores/public/index.php`,
    vehiculos: `${API_BASE}/ms-vehiculos/public/index.php`,
    rutas: `${API_BASE}/ms-rutas/public/index.php`,
    viajes: `${API_BASE}/ms-viajes/public/index.php`
};

// Función para obtener el token guardado
function obtenerToken() {
    return localStorage.getItem('token') || '';
}

// Función para hacer peticiones fetch con token
async function peticionAPI(url, opciones = {}) {
    const token = obtenerToken();
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'TOKEN': token
        },
        ...opciones
    };
    
    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }
    
    try {
        const respuesta = await fetch(url, config);
        const datos = await respuesta.json();
        return { ok: respuesta.ok, status: respuesta.status, datos };
    } catch (error) {
        return { ok: false, status: 0, datos: { exito: false, mensaje: 'Error de conexión' } };
    }
}