const API_BASE = 'http://127.0.0.1';

const API_URLS = {
    auth: `${API_BASE}:9001`,
    conductores: `${API_BASE}:9002`,
    vehiculos: `${API_BASE}:9003`,
    rutas: `${API_BASE}:9004`,
    viajes: `${API_BASE}:9005`
};


function obtenerToken() {
    return localStorage.getItem('token') || '';
}


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