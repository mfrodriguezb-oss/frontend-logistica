document.addEventListener('DOMContentLoaded', function() {
    cargarVehiculos();
    
    var formVehiculo = document.getElementById('formVehiculo');
    if (formVehiculo) {
        formVehiculo.addEventListener('submit', guardarVehiculo);
    }
});

function cargarVehiculos() {
    var token = localStorage.getItem('token');
    var cuerpoTabla = document.getElementById('cuerpoTabla');
    
    if (!cuerpoTabla) return;
    
    cuerpoTabla.innerHTML = '<tr><td colspan="8" class="texto-cargando">Cargando vehiculos...</td></tr>';
    
    fetch(API_URLS.vehiculos + '/vehiculos', {
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
            mostrarVehiculos(datos.lista);
        } else {
            cuerpoTabla.innerHTML = '<tr><td colspan="8" class="texto-error">Error: ' + datos.mensaje + '</td></tr>';
        }
    })
    .catch(function(error) {
        cuerpoTabla.innerHTML = '<tr><td colspan="8" class="texto-error">Error de conexion con el servidor</td></tr>';
    });
}

function buscarVehiculos() {
    var token = localStorage.getItem('token');
    var cuerpoTabla = document.getElementById('cuerpoTabla');
    var placa = document.getElementById('filtroPlaca').value;
    var tipo = document.getElementById('filtroTipo').value;
    var estado = document.getElementById('filtroEstado').value;
    
    if (!cuerpoTabla) return;
    
    cuerpoTabla.innerHTML = '<tr><td colspan="8" class="texto-cargando">Buscando...</td></tr>';
    
    var url = API_URLS.vehiculos + '/vehiculos?';
    var parametros = [];
    
    if (placa) parametros.push('placa=' + encodeURIComponent(placa));
    if (tipo) parametros.push('tipo=' + encodeURIComponent(tipo));
    if (estado) parametros.push('estado=' + encodeURIComponent(estado));
    
    url += parametros.join('&');
    
    fetch(url, {
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
            mostrarVehiculos(datos.lista);
        } else {
            cuerpoTabla.innerHTML = '<tr><td colspan="8" class="texto-error">Error: ' + datos.mensaje + '</td></tr>';
        }
    })
    .catch(function(error) {
        cuerpoTabla.innerHTML = '<tr><td colspan="8" class="texto-error">Error de conexion</td></tr>';
    });
}

function limpiarFiltros() {
    document.getElementById('filtroPlaca').value = '';
    document.getElementById('filtroTipo').value = '';
    document.getElementById('filtroEstado').value = '';
    cargarVehiculos();
}

function mostrarVehiculos(vehiculos) {
    var cuerpoTabla = document.getElementById('cuerpoTabla');
    
    if (!cuerpoTabla) return;
    
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
        html += '<button class="btn btn-info" onclick="mostrarCambiarEstado(' + v.id + ', \'' + v.estado + '\')">Estado</button>';
        html += '</td>';
        html += '</tr>';
    }
    
    cuerpoTabla.innerHTML = html;
}

function mostrarFormularioCrear() {
    var modalTitulo = document.getElementById('modalTitulo');
    if (modalTitulo) {
        modalTitulo.textContent = 'Nuevo Vehiculo';
    }
    document.getElementById('vehiculoId').value = '';
    document.getElementById('formVehiculo').reset();
    document.getElementById('modalVehiculo').classList.add('active');
}

function editarVehiculo(id) {
    var token = localStorage.getItem('token');
    
    fetch(API_URLS.vehiculos + '/vehiculos', {
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
            var vehiculo = datos.lista.find(function(v) {
                return v.id === id;
            });
            
            if (vehiculo) {
                var modalTitulo = document.getElementById('modalTitulo');
                if (modalTitulo) {
                    modalTitulo.textContent = 'Editar Vehiculo';
                }
                document.getElementById('vehiculoId').value = vehiculo.id;
                document.getElementById('placa').value = vehiculo.placa;
                document.getElementById('tipo_vehiculo').value = vehiculo.tipo_vehiculo;
                document.getElementById('capacidad_carga').value = vehiculo.capacidad_carga;
                document.getElementById('modelo').value = vehiculo.modelo;
                document.getElementById('marca').value = vehiculo.marca;
                
                document.getElementById('modalVehiculo').classList.add('active');
            }
        }
    });
}

function cerrarModal() {
    var modal = document.getElementById('modalVehiculo');
    if (modal) {
        modal.classList.remove('active');
    }
}

function guardarVehiculo(evento) {
    evento.preventDefault();
    var token = localStorage.getItem('token');
    var id = document.getElementById('vehiculoId').value;
    
    // Validaciones en el cliente
    var placa = document.getElementById('placa').value.trim().toUpperCase();
    var tipo_vehiculo = document.getElementById('tipo_vehiculo').value.trim();
    var capacidad_carga = parseFloat(document.getElementById('capacidad_carga').value);
    var modelo = document.getElementById('modelo').value.trim();
    var marca = document.getElementById('marca').value.trim();
    
    // Validar campos obligatorios
    if (!placa || !tipo_vehiculo || !capacidad_carga || !modelo || !marca) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }
    
    // Validar que capacidad sea mayor a 0
    if (capacidad_carga <= 0) {
        alert('La capacidad debe ser mayor a cero');
        return;
    }
    
    var datos = {
        placa: placa,
        tipo_vehiculo: tipo_vehiculo,
        capacidad_carga: capacidad_carga,
        modelo: modelo,
        marca: marca
    };
    
    var url = API_URLS.vehiculos + '/vehiculos';
    var metodo = 'POST';
    
    if (id) {
        url = url + '/' + id;
        metodo = 'PUT';
    }
    
    fetch(url, {
        method: metodo,
        headers: {
            'TOKEN': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(function(respuesta) {
        return respuesta.json();
    })
    .then(function(datos) {
        if (datos.exito) {
            cerrarModal();
            cargarVehiculos();
            alert(datos.mensaje);
        } else {
            alert('Error: ' + datos.mensaje);
        }
    })
    .catch(function(error) {
        alert('Error de conexion: ' + error.message);
    });
}

var vehiculoIdEstado = '';

function mostrarCambiarEstado(id, estadoActual) {
    vehiculoIdEstado = id;
    document.getElementById('nuevoEstado').value = estadoActual;
    document.getElementById('modalEstado').classList.add('active');
}

function cerrarModalEstado() {
    document.getElementById('modalEstado').classList.remove('active');
}

function guardarEstado() {
    var token = localStorage.getItem('token');
    var nuevoEstado = document.getElementById('nuevoEstado').value;
    
    fetch(API_URLS.vehiculos + '/vehiculos/' + vehiculoIdEstado + '/estado', {
        method: 'PATCH',
        headers: {
            'TOKEN': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            estado: nuevoEstado
        })
    })
    .then(function(respuesta) {
        return respuesta.json();
    })
    .then(function(datos) {
        if (datos.exito) {
            cerrarModalEstado();
            cargarVehiculos();
            alert(datos.mensaje);
        } else {
            alert('Error: ' + datos.mensaje);
        }
    })
    .catch(function(error) {
        alert('Error de conexion');
    });
}

function mostrarFormularioCrear() {
    document.getElementById('modalTitulo').textContent = 'Nuevo Vehiculo';
    document.getElementById('vehiculoId').value = '';
    document.getElementById('formVehiculo').reset();
    document.getElementById('modalVehiculo').classList.add('active');
}

function editarVehiculo(id) {
    var token = localStorage.getItem('token');
    
    fetch(API_URLS.vehiculos + '/vehiculos', {
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
            var vehiculo = datos.lista.find(function(v) {
                return v.id === id;
            });
            
            if (vehiculo) {
                document.getElementById('modalTitulo').textContent = 'Editar Vehiculo';
                document.getElementById('vehiculoId').value = vehiculo.id;
                document.getElementById('placa').value = vehiculo.placa;
                document.getElementById('tipo_vehiculo').value = vehiculo.tipo_vehiculo;
                document.getElementById('capacidad_carga').value = vehiculo.capacidad_carga;
                document.getElementById('modelo').value = vehiculo.modelo;
                document.getElementById('marca').value = vehiculo.marca;
                
                document.getElementById('modalVehiculo').classList.add('active');
            }
        }
    });
}

function cerrarModal() {
    document.getElementById('modalVehiculo').classList.remove('active');
}

document.getElementById('formVehiculo').addEventListener('submit', function(evento) {
    evento.preventDefault();
    guardarVehiculo();
});

function guardarVehiculo() {
    var token = localStorage.getItem('token');
    var id = document.getElementById('vehiculoId').value;
    
    var datos = {
        placa: document.getElementById('placa').value,
        tipo_vehiculo: document.getElementById('tipo_vehiculo').value,
        capacidad_carga: parseFloat(document.getElementById('capacidad_carga').value),
        modelo: document.getElementById('modelo').value,
        marca: document.getElementById('marca').value
    };
    
    var url = API_URLS.vehiculos + '/vehiculos';
    var metodo = 'POST';
    
    if (id) {
        url = url + '/' + id;
        metodo = 'PUT';
    }
    
    fetch(url, {
        method: metodo,
        headers: {
            'TOKEN': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(function(respuesta) {
        return respuesta.json();
    })
    .then(function(datos) {
        if (datos.exito) {
            cerrarModal();
            cargarVehiculos();
            alert(datos.mensaje);
        } else {
            alert('Error: ' + datos.mensaje);
        }
    })
    .catch(function(error) {
        alert('Error de conexion');
    });
}

var vehiculoIdEstado = '';

function mostrarCambiarEstado(id, estadoActual) {
    vehiculoIdEstado = id;
    document.getElementById('nuevoEstado').value = estadoActual;
    document.getElementById('modalEstado').classList.add('active');
}

function cerrarModalEstado() {
    document.getElementById('modalEstado').classList.remove('active');
}

function guardarEstado() {
    var token = localStorage.getItem('token');
    var nuevoEstado = document.getElementById('nuevoEstado').value;
    
    fetch(API_URLS.vehiculos + '/vehiculos/' + vehiculoIdEstado + '/estado', {
        method: 'PATCH',
        headers: {
            'TOKEN': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            estado: nuevoEstado
        })
    })
    .then(function(respuesta) {
        return respuesta.json();
    })
    .then(function(datos) {
        if (datos.exito) {
            cerrarModalEstado();
            cargarVehiculos();
            alert(datos.mensaje);
        } else {
            alert('Error: ' + datos.mensaje);
        }
    })
    .catch(function(error) {
        alert('Error de conexion');
    });
}