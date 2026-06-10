document.addEventListener('DOMContentLoaded', function() {
    alert('PAGINA VEHICULOS CARGADA');
    cargarVehiculos();
});

function cargarVehiculos() {
    var token = localStorage.getItem('token');
    var cuerpoTabla = document.getElementById('cuerpoTabla');
    
    alert('Token: ' + (token ? 'SI existe' : 'NO existe'));
    alert('cuerpoTabla: ' + (cuerpoTabla ? 'ENCONTRADO' : 'NO ENCONTRADO'));
    
    if (!cuerpoTabla) {
        alert('ERROR: No se encontro cuerpoTabla');
        return;
    }
    
    cuerpoTabla.innerHTML = '<tr><td colspan="8" class="texto-cargando">Cargando vehiculos...</td></tr>';
    
    alert('Enviando peticion a: ' + API_URLS.vehiculos + '/vehiculos');
    
    fetch(API_URLS.vehiculos + '/vehiculos', {
        method: 'GET',
        headers: {
            'TOKEN': token,
            'Content-Type': 'application/json'
        }
    })
    .then(function(respuesta) {
        alert('Respuesta recibida - Status: ' + respuesta.status);
        return respuesta.text();
    })
    .then(function(texto) {
        alert('Texto recibido: ' + texto.substring(0, 200));
        try {
            var datos = JSON.parse(texto);
            if (datos.exito) {
                mostrarVehiculos(datos.lista);
            } else {
                cuerpoTabla.innerHTML = '<tr><td colspan="8" class="texto-error">Error: ' + datos.mensaje + '</td></tr>';
            }
        } catch(e) {
            cuerpoTabla.innerHTML = '<tr><td colspan="8" class="texto-error">JSON invalido</td></tr>';
        }
    })
    .catch(function(error) {
        alert('ERROR: ' + error.message);
        cuerpoTabla.innerHTML = '<tr><td colspan="8" class="texto-error">Error: ' + error.message + '</td></tr>';
    });
}

function mostrarVehiculos(vehiculos) {
    var cuerpoTabla = document.getElementById('cuerpoTabla');
    
    alert('Mostrando ' + vehiculos.length + ' vehiculos');
    
    if (vehiculos.length === 0) {
        cuerpoTabla.innerHTML = '<tr><td colspan="8" class="texto-vacio">No hay vehiculos registrados</td></tr>';
        return;
    }
    
    var html = '';
    
    for (var i = 0; i < vehiculos.length; i++) {
        var v = vehiculos[i];
        
        var claseEstado = 'disponible';
        if (v.estado === 'en_ruta') claseEstado = 'en_ruta';
        if (v.estado === 'mantenimiento') claseEstado = 'mantenimiento';
        if (v.estado === 'inactivo') claseEstado = 'inactivo';
        
        html += '<tr>';
        html += '<td>' + v.id + '</td>';
        html += '<td>' + v.placa + '</td>';
        html += '<td>' + v.tipo_vehiculo + '</td>';
        html += '<td>' + v.capacidad_carga + '</td>';
        html += '<td>' + v.modelo + '</td>';
        html += '<td>' + v.marca + '</td>';
        html += '<td><span class="estado ' + claseEstado + '">' + v.estado + '</span></td>';
        html += '<td>';
        html += '<button class="btn btn-warning" onclick="editarVehiculo(' + v.id + ')">Editar</button>';
        html += '<button class="btn btn-info" onclick="cambiarEstado(' + v.id + ')">Estado</button>';
        html += '</td>';
        html += '</tr>';
    }
    
    cuerpoTabla.innerHTML = html;
    alert('Tabla actualizada');
}

function mostrarFormularioCrear() {
    alert('Funcion crear vehiculo - se implementara despues');
}

function editarVehiculo(id) {
    alert('Editar vehiculo ID: ' + id);
}

function cambiarEstado(id) {
    alert('Cambiar estado del vehiculo ID: ' + id);
}