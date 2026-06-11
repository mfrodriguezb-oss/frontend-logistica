document.addEventListener('DOMContentLoaded', function() {
    cargarConductores();
    
    var formConductor = document.getElementById('formConductor');
    if (formConductor) {
        formConductor.addEventListener('submit', guardarConductor);
    }
    
    // Agregar eventos a los filtros para búsqueda en tiempo real
    var filtroDocumento = document.getElementById('filtroDocumento');
    var filtroLicencia = document.getElementById('filtroLicencia');
    var filtroEstado = document.getElementById('filtroEstado');
    
    if (filtroDocumento) {
        filtroDocumento.addEventListener('keyup', function() {
            if (this.value === '') cargarConductores();
        });
    }
});

function cargarConductores() {
    var token = localStorage.getItem('token');
    var cuerpoTabla = document.getElementById('cuerpoTabla');
    
    if (!cuerpoTabla) return;
    
    cuerpoTabla.innerHTML = '<tr><td colspan="10" class="texto-cargando">Cargando conductores...</td></tr>';
    
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
            mostrarConductores(datos.lista);
        } else {
            cuerpoTabla.innerHTML = '<tr><td colspan="10" class="texto-error">Error: ' + datos.mensaje + '</td></tr>';
        }
    })
    .catch(function(error) {
        cuerpoTabla.innerHTML = '<tr><td colspan="10" class="texto-error">Error de conexion con el servidor</td></tr>';
    });
}

function buscarConductores() {
    var token = localStorage.getItem('token');
    var cuerpoTabla = document.getElementById('cuerpoTabla');
    var documento = document.getElementById('filtroDocumento').value;
    var licencia = document.getElementById('filtroLicencia').value;
    var estado = document.getElementById('filtroEstado').value;
    
    if (!cuerpoTabla) return;
    
    cuerpoTabla.innerHTML = '<tr><td colspan="10" class="texto-cargando">Buscando...</td></tr>';
    
    var url = API_URLS.conductores + '/conductores?';
    var parametros = [];
    
    if (documento) parametros.push('documento=' + encodeURIComponent(documento));
    if (licencia) parametros.push('licencia=' + encodeURIComponent(licencia));
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
            mostrarConductores(datos.lista);
        } else {
            cuerpoTabla.innerHTML = '<tr><td colspan="10" class="texto-error">Error: ' + datos.mensaje + '</td></tr>';
        }
    })
    .catch(function(error) {
        cuerpoTabla.innerHTML = '<tr><td colspan="10" class="texto-error">Error de conexion</td></tr>';
    });
}

function limpiarFiltros() {
    document.getElementById('filtroDocumento').value = '';
    document.getElementById('filtroLicencia').value = '';
    document.getElementById('filtroEstado').value = '';
    cargarConductores();
}

function mostrarConductores(conductores) {
    var cuerpoTabla = document.getElementById('cuerpoTabla');
    
    if (!cuerpoTabla) return;
    
    if (conductores.length === 0) {
        cuerpoTabla.innerHTML = '<tr><td colspan="10" class="texto-vacio">No hay conductores registrados</td></tr>';
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
        html += '<button class="btn btn-info" onclick="mostrarCambiarEstado(' + c.id + ', \'' + c.estado + '\')">Estado</button>';
        html += '</td>';
        html += '</tr>';
    }
    
    cuerpoTabla.innerHTML = html;
}

function mostrarFormularioCrear() {
    var modalTitulo = document.getElementById('modalTitulo');
    if (modalTitulo) {
        modalTitulo.textContent = 'Nuevo Conductor';
    }
    document.getElementById('conductorId').value = '';
    document.getElementById('formConductor').reset();
    document.getElementById('modalConductor').classList.add('active');
}

function editarConductor(id) {
    var token = localStorage.getItem('token');
    
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
            var conductor = datos.lista.find(function(c) {
                return c.id === id;
            });
            
            if (conductor) {
                var modalTitulo = document.getElementById('modalTitulo');
                if (modalTitulo) {
                    modalTitulo.textContent = 'Editar Conductor';
                }
                document.getElementById('conductorId').value = conductor.id;
                document.getElementById('nombres').value = conductor.nombres;
                document.getElementById('apellidos').value = conductor.apellidos;
                document.getElementById('documento').value = conductor.documento;
                document.getElementById('telefono').value = conductor.telefono || '';
                document.getElementById('correo').value = conductor.correo || '';
                document.getElementById('numero_licencia').value = conductor.numero_licencia;
                document.getElementById('categoria_licencia').value = conductor.categoria_licencia || '';
                document.getElementById('fecha_vencimiento_licencia').value = conductor.fecha_vencimiento_licencia;
                
                document.getElementById('modalConductor').classList.add('active');
            }
        }
    });
}

function cerrarModal() {
    var modal = document.getElementById('modalConductor');
    if (modal) {
        modal.classList.remove('active');
    }
}

function guardarConductor(evento) {
    evento.preventDefault();
    var token = localStorage.getItem('token');
    var id = document.getElementById('conductorId').value;
    
    // Validaciones en el cliente
    var nombres = document.getElementById('nombres').value.trim();
    var apellidos = document.getElementById('apellidos').value.trim();
    var documento = document.getElementById('documento').value.trim();
    var telefono = document.getElementById('telefono').value.trim();
    var correo = document.getElementById('correo').value.trim();
    var numero_licencia = document.getElementById('numero_licencia').value.trim();
    var categoria_licencia = document.getElementById('categoria_licencia').value.trim();
    var fecha_vencimiento = document.getElementById('fecha_vencimiento_licencia').value;
    
    // Validar campos obligatorios
    if (!nombres || !apellidos || !documento || !numero_licencia || !fecha_vencimiento) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }
    
    // Validar que la fecha sea futura
    var fechaVencimiento = new Date(fecha_vencimiento);
    var hoy = new Date();
    if (fechaVencimiento <= hoy) {
        alert('La fecha de vencimiento debe ser en el futuro');
        return;
    }
    
    // Validar correo si está completo
    if (correo && !validarEmail(correo)) {
        alert('Por favor ingresa un correo válido');
        return;
    }
    
    var datos = {
        nombres: nombres,
        apellidos: apellidos,
        documento: documento,
        telefono: telefono,
        correo: correo,
        numero_licencia: numero_licencia,
        categoria_licencia: categoria_licencia,
        fecha_vencimiento_licencia: fecha_vencimiento
    };
    
    var url = API_URLS.conductores + '/conductores';
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
            cargarConductores();
            alert(datos.mensaje);
        } else {
            alert('Error: ' + datos.mensaje);
        }
    })
    .catch(function(error) {
        alert('Error de conexion: ' + error.message);
    });
}

var conductorIdEstado = '';

function mostrarCambiarEstado(id, estadoActual) {
    conductorIdEstado = id;
    document.getElementById('nuevoEstado').value = estadoActual;
    document.getElementById('modalEstado').classList.add('active');
}

function cerrarModalEstado() {
    document.getElementById('modalEstado').classList.remove('active');
}

function guardarEstado() {
    var token = localStorage.getItem('token');
    var nuevoEstado = document.getElementById('nuevoEstado').value;
    
    fetch(API_URLS.conductores + '/conductores/' + conductorIdEstado + '/estado', {
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
            cargarConductores();
            alert(datos.mensaje);
        } else {
            alert('Error: ' + datos.mensaje);
        }
    })
    .catch(function(error) {
        alert('Error de conexion');
    });
}

// Función auxiliar para validar email
function validarEmail(email) {
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}