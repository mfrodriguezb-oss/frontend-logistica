// ============================================
// 👷 LogiTrans Express - Modulo Conductores
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    cargarConductores();
});

// ============================================
// CARGAR CONDUCTORES DESDE LA API
// ============================================
function cargarConductores() {
    var token = localStorage.getItem('token');
    var cuerpoTabla = document.getElementById('cuerpoTabla');
    
    cuerpoTabla.innerHTML = '<tr><td colspan="10" style="text-align: center;">Cargando conductores...</td></tr>';
    
    fetch(API_URLS.conductores + '/conductores', {
        method: 'GET',
        headers: {
            'TOKEN': token,
            'Content-Type': 'application/json'
        }
    })
    .then(function(respuesta) {
        return respuesta.json();
    })
    .then(function(datos) {
        if (datos.exito) {
            mostrarConductores(datos.lista); // CAMBIO: datos.lista en vez de datos.datos
        } else {
            cuerpoTabla.innerHTML = '<tr><td colspan="10" style="text-align: center; color: red;">Error: ' + datos.mensaje + '</td></tr>';
        }
    })
    .catch(function(error) {
        cuerpoTabla.innerHTML = '<tr><td colspan="10" style="text-align: center; color: red;">Error de conexion con el servidor</td></tr>';
    });
}

// ============================================
// MOSTRAR CONDUCTORES EN LA TABLA
// ============================================
function mostrarConductores(conductores) {
    var cuerpoTabla = document.getElementById('cuerpoTabla');
    
    if (conductores.length === 0) {
        cuerpoTabla.innerHTML = '<tr><td colspan="10" style="text-align: center;">No hay conductores registrados</td></tr>';
        return;
    }
    
    var html = '';
    
    for (var i = 0; i < conductores.length; i++) {
        var c = conductores[i];
        
        var claseEstado = 'disponible';
        if (c.estado === 'en_ruta') claseEstado = 'en_ruta';
        if (c.estado === 'inactivo') claseEstado = 'inactivo';
        
        html += '<tr>';
        html += '<td>' + c.id + '</td>';
        html += '<td>' + c.nombres + '</td>';
        html += '<td>' + c.apellidos + '</td>';
        html += '<td>' + c.documento + '</td>';
        html += '<td>' + c.telefono + '</td>';
        html += '<td>' + c.numero_licencia + '</td>';
        html += '<td>' + c.categoria_licencia + '</td>';
        html += '<td>' + c.fecha_vencimiento_licencia + '</td>';
        html += '<td><span class="estado ' + claseEstado + '">' + c.estado + '</span></td>';
        html += '<td>';
        html += '<button class="btn btn-warning" onclick="editarConductor(' + c.id + ')">Editar</button>';
        html += '<button class="btn btn-info" onclick="cambiarEstado(' + c.id + ')">Estado</button>';
        html += '</td>';
        html += '</tr>';
    }
    
    cuerpoTabla.innerHTML = html;
}

// ============================================
// PLACEHOLDERS
// ============================================
function mostrarFormularioCrear() {
    alert('Funcion crear conductor - se implementara despues');
}

function editarConductor(id) {
    alert('Editar conductor ID: ' + id);
}

function cambiarEstado(id) {
    alert('Cambiar estado del conductor ID: ' + id);
}