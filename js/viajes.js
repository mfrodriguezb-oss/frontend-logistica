document.addEventListener('DOMContentLoaded', function() {
    cargarProgramaciones();
    
    var formSeguimiento = document.getElementById('formSeguimiento');
    if (formSeguimiento) {
        formSeguimiento.addEventListener('submit', guardarSeguimiento);
    }

    var formProgramacion = document.getElementById('formProgramacion');
    if (formProgramacion) {
        formProgramacion.addEventListener('submit', guardarProgramacion);
    }
});

// ==================== MANEJO DE TABS ====================
function cambiarTab(tab) {
    var tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(function(el) {
        el.classList.remove('active');
    });
    
    var botones = document.querySelectorAll('.tab-button');
    botones.forEach(function(el) {
        el.classList.remove('active');
    });
    
    var tabElement = document.getElementById('tab-' + tab);
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    event.target.classList.add('active');
    
    if (tab === 'programacion') {
        cargarProgramaciones();
    } else if (tab === 'seguimiento') {
        cargarSeguimientos();
    }
}

// ==================== CARGAR COMBOS (conductores, vehiculos, rutas) ====================
function cargarCombos() {
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
            var combo = document.getElementById('conductor_id');
            if (combo) {
                var html = '<option value="">Seleccionar conductor...</option>';
                for (var i = 0; i < datos.lista.length; i++) {
                    var c = datos.lista[i];
                    if (c.estado !== 'inactivo') {
                        html += '<option value="' + c.id + '">' + c.nombres + ' ' + c.apellidos + ' (Doc: ' + c.documento + ')</option>';
                    }
                }
                combo.innerHTML = html;
            }
        }
    })
    .catch(function(error) {
        console.error('Error cargando conductores');
    });
    
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
            var combo = document.getElementById('vehiculo_id');
            if (combo) {
                var html = '<option value="">Seleccionar vehiculo...</option>';
                for (var i = 0; i < datos.lista.length; i++) {
                    var v = datos.lista[i];
                    if (v.estado !== 'mantenimiento' && v.estado !== 'inactivo') {
                        html += '<option value="' + v.id + '">' + v.placa + ' (' + v.tipo_vehiculo + ')</option>';
                    }
                }
                combo.innerHTML = html;
            }
        }
    })
    .catch(function(error) {
        console.error('Error cargando vehiculos');
    });
    
    fetch(API_URLS.rutas + '/rutas', {
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
            var combo = document.getElementById('ruta_id');
            if (combo) {
                var html = '<option value="">Seleccionar ruta...</option>';
                for (var i = 0; i < datos.lista.length; i++) {
                    var r = datos.lista[i];
                    html += '<option value="' + r.id + '">' + r.ciudad_origen + ' -> ' + r.ciudad_destino + ' (' + r.distancia + ' km)</option>';
                }
                combo.innerHTML = html;
            }
        }
    })
    .catch(function(error) {
        console.error('Error cargando rutas');
    });
}

// ==================== PROGRAMACIONES DE VIAJES ====================
function cargarProgramaciones() {
    var token = localStorage.getItem('token');
    var cuerpoProgramaciones = document.getElementById('cuerpoProgramaciones');
    
    if (!cuerpoProgramaciones) return;
    
    cuerpoProgramaciones.innerHTML = '<tr><td colspan="8" class="texto-cargando">Cargando programaciones...</td></tr>';
    
    var url = API_URLS.viajes + '/seguimientos';
    
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
            mostrarProgramaciones(datos.lista);
        } else {
            cuerpoProgramaciones.innerHTML = '<tr><td colspan="8" class="texto-error">Error: ' + (datos.mensaje || 'Desconocido') + '</td></tr>';
        }
    })
    .catch(function(error) {
        cuerpoProgramaciones.innerHTML = '<tr><td colspan="8" class="texto-error">Error de conexion: ' + error.message + '</td></tr>';
    });
}

function mostrarProgramaciones(programaciones) {
    var cuerpoProgramaciones = document.getElementById('cuerpoProgramaciones');
    
    if (!cuerpoProgramaciones) return;
    
    if (programaciones.length === 0) {
        cuerpoProgramaciones.innerHTML = '<tr><td colspan="8" class="texto-vacio">No hay programaciones registradas</td></tr>';
        return;
    }
    
    var html = '';
    
    for (var i = 0; i < programaciones.length; i++) {
        var p = programaciones[i];
        
        var claseEstado = 'programado';
        if (p.estado === 'en_transito') claseEstado = 'en_transito';
        if (p.estado === 'retrasado') claseEstado = 'retrasado';
        if (p.estado === 'finalizado') claseEstado = 'finalizado';
        if (p.estado === 'cancelado') claseEstado = 'cancelado';
        
        var fecha = p.fecha ? p.fecha : '-';
        var hora = p.hora ? p.hora.substring(0, 5) : '-';
        
        html += '<tr>';
        html += '<td>' + p.id + '</td>';
        html += '<td>' + (p.programacion_viaje_id || '-') + '</td>';
        html += '<td>' + fecha + '</td>';
        html += '<td>' + hora + '</td>';
        html += '<td><span class="estado ' + claseEstado + '">' + p.estado + '</span></td>';
        html += '<td>' + (p.novedad || '-') + '</td>';
        html += '<td>';
        html += '<button class="btn btn-warning" onclick="editarSeguimiento(' + p.id + ')">Editar</button>';
        html += '<button class="btn btn-info" onclick="verDetalle(' + p.id + ')">Detalle</button>';
        html += '</td>';
        html += '</tr>';
    }
    
    cuerpoProgramaciones.innerHTML = html;
}

function buscarProgramaciones() {
    var token = localStorage.getItem('token');
    var cuerpoProgramaciones = document.getElementById('cuerpoProgramaciones');
    var conductor = document.getElementById('filtroProgramacionConductor').value;
    var vehiculo = document.getElementById('filtroProgramacionVehiculo').value;
    var estado = document.getElementById('filtroProgramacionEstado').value;
    
    if (!cuerpoProgramaciones) return;
    
    cuerpoProgramaciones.innerHTML = '<tr><td colspan="8" class="texto-cargando">Buscando...</td></tr>';
    
    var url = API_URLS.viajes + '/seguimientos?';
    var parametros = [];
    
    if (conductor) parametros.push('conductor=' + encodeURIComponent(conductor));
    if (vehiculo) parametros.push('vehiculo=' + encodeURIComponent(vehiculo));
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
            mostrarProgramaciones(datos.lista);
        } else {
            cuerpoProgramaciones.innerHTML = '<tr><td colspan="8" class="texto-error">Error: ' + datos.mensaje + '</td></tr>';
        }
    })
    .catch(function(error) {
        cuerpoProgramaciones.innerHTML = '<tr><td colspan="8" class="texto-error">Error de conexion</td></tr>';
    });
}

function limpiarFiltrosProgramaciones() {
    document.getElementById('filtroProgramacionConductor').value = '';
    document.getElementById('filtroProgramacionVehiculo').value = '';
    document.getElementById('filtroProgramacionEstado').value = '';
    cargarProgramaciones();
}

function mostrarFormularioProgramacion() {
    var modalTitulo = document.getElementById('modalTituloSeguimiento');
    if (modalTitulo) {
        modalTitulo.textContent = 'Nuevo Seguimiento de Viaje';
    }
    document.getElementById('seguimientoId').value = '';
    document.getElementById('formSeguimiento').reset();
    document.getElementById('modalSeguimiento').classList.add('active');
}

function editarProgramacion(id) {
    editarSeguimiento(id);
}

function cerrarModalProgramacion() {
    cerrarModalSeguimiento();
}

function guardarProgramacion(evento) {
    guardarSeguimiento(evento);
}

function reprogramarViaje(id) {
    editarSeguimiento(id);
}

// ==================== SEGUIMIENTO DE VIAJES ====================
function cargarSeguimientos() {
    var token = localStorage.getItem('token');
    var cuerpoSeguimientos = document.getElementById('cuerpoSeguimientos');
    
    if (!cuerpoSeguimientos) return;
    
    cuerpoSeguimientos.innerHTML = '<tr><td colspan="7" class="texto-cargando">Cargando seguimientos...</td></tr>';
    
    fetch(API_URLS.viajes + '/seguimientos', {
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
            mostrarSeguimientos(datos.lista);
        } else {
            cuerpoSeguimientos.innerHTML = '<tr><td colspan="7" class="texto-error">Error: ' + datos.mensaje + '</td></tr>';
        }
    })
    .catch(function(error) {
        cuerpoSeguimientos.innerHTML = '<tr><td colspan="7" class="texto-error">Error de conexion</td></tr>';
    });
}

function mostrarSeguimientos(seguimientos) {
    var cuerpoSeguimientos = document.getElementById('cuerpoSeguimientos');
    
    if (!cuerpoSeguimientos) return;
    
    if (seguimientos.length === 0) {
        cuerpoSeguimientos.innerHTML = '<tr><td colspan="7" class="texto-vacio">No hay seguimientos registrados</td></tr>';
        return;
    }
    
    var html = '';
    
    for (var i = 0; i < seguimientos.length; i++) {
        var s = seguimientos[i];
        
        var claseEstado = 'programado';
        if (s.estado === 'en_transito') claseEstado = 'en_transito';
        if (s.estado === 'retrasado') claseEstado = 'retrasado';
        if (s.estado === 'finalizado') claseEstado = 'finalizado';
        if (s.estado === 'cancelado') claseEstado = 'cancelado';
        
        html += '<tr>';
        html += '<td>' + s.id + '</td>';
        html += '<td>' + s.programacion_viaje_id + '</td>';
        html += '<td>' + s.fecha + '</td>';
        html += '<td>' + s.hora + '</td>';
        html += '<td><span class="estado ' + claseEstado + '">' + s.estado + '</span></td>';
        html += '<td>' + (s.novedad || '-') + '</td>';
        html += '<td>';
        html += '<button class="btn btn-warning" onclick="editarSeguimiento(' + s.id + ')">Editar</button>';
        html += '<button class="btn btn-info" onclick="verDetalle(' + s.id + ')">Detalle</button>';
        html += '</td>';
        html += '</tr>';
    }
    
    cuerpoSeguimientos.innerHTML = html;
}

function buscarSeguimientos() {
    var token = localStorage.getItem('token');
    var cuerpoSeguimientos = document.getElementById('cuerpoSeguimientos');
    var fecha = document.getElementById('filtroSeguimientoFecha').value;
    var estado = document.getElementById('filtroSeguimientoEstado').value;
    
    if (!cuerpoSeguimientos) return;
    
    cuerpoSeguimientos.innerHTML = '<tr><td colspan="7" class="texto-cargando">Buscando...</td></tr>';
    
    var url = API_URLS.viajes + '/seguimientos?';
    var parametros = [];
    
    if (fecha) parametros.push('fecha=' + encodeURIComponent(fecha));
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
            mostrarSeguimientos(datos.lista);
        } else {
            cuerpoSeguimientos.innerHTML = '<tr><td colspan="7" class="texto-error">Error: ' + datos.mensaje + '</td></tr>';
        }
    })
    .catch(function(error) {
        cuerpoSeguimientos.innerHTML = '<tr><td colspan="7" class="texto-error">Error de conexion</td></tr>';
    });
}

function limpiarFiltrosSeguimientos() {
    document.getElementById('filtroSeguimientoFecha').value = '';
    document.getElementById('filtroSeguimientoEstado').value = '';
    cargarSeguimientos();
}

function mostrarFormularioSeguimiento() {
    var modalTitulo = document.getElementById('modalTituloSeguimiento');
    if (modalTitulo) {
        modalTitulo.textContent = 'Nuevo Seguimiento';
    }
    document.getElementById('seguimientoId').value = '';
    document.getElementById('formSeguimiento').reset();
    document.getElementById('modalSeguimiento').classList.add('active');
}

function editarSeguimiento(id) {
    var token = localStorage.getItem('token');
    
    fetch(API_URLS.viajes + '/seguimientos', {
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
            var seguimiento = datos.lista.find(function(s) {
                return s.id === id;
            });
            
            if (seguimiento) {
                var modalTitulo = document.getElementById('modalTituloSeguimiento');
                if (modalTitulo) {
                    modalTitulo.textContent = 'Editar Seguimiento';
                }
                document.getElementById('seguimientoId').value = seguimiento.id;
                document.getElementById('programacion_viaje_id').value = seguimiento.programacion_viaje_id;
                document.getElementById('fecha_seguimiento').value = seguimiento.fecha;
                document.getElementById('hora_seguimiento').value = seguimiento.hora;
                document.getElementById('estado_seguimiento').value = seguimiento.estado;
                document.getElementById('novedad').value = seguimiento.novedad || '';
                
                document.getElementById('modalSeguimiento').classList.add('active');
            }
        }
    });
}

function cerrarModalSeguimiento() {
    var modal = document.getElementById('modalSeguimiento');
    if (modal) {
        modal.classList.remove('active');
    }
}

function guardarSeguimiento(evento) {
    evento.preventDefault();
    var token = localStorage.getItem('token');
    var id = document.getElementById('seguimientoId').value;
    
    var programacion_viaje_id = parseInt(document.getElementById('programacion_viaje_id').value);
    var fecha_seguimiento = document.getElementById('fecha_seguimiento').value;
    var hora_seguimiento = document.getElementById('hora_seguimiento').value;
    var estado_seguimiento = document.getElementById('estado_seguimiento').value;
    var novedad = document.getElementById('novedad').value.trim();
    
    if (!programacion_viaje_id || !fecha_seguimiento || !hora_seguimiento || !estado_seguimiento) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }
    
    if (programacion_viaje_id <= 0) {
        alert('El ID de programacion debe ser valido');
        return;
    }
    
    var datos = {
        programacion_viaje_id: programacion_viaje_id,
        fecha: fecha_seguimiento,
        hora: hora_seguimiento,
        estado: estado_seguimiento,
        novedad: novedad
    };
    
    var url = API_URLS.viajes + '/seguimientos';
    var metodo = 'POST';
    
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
            cerrarModalSeguimiento();
            cargarSeguimientos();
            alert(datos.mensaje);
        } else {
            alert('Error: ' + datos.mensaje);
        }
    })
    .catch(function(error) {
        alert('Error de conexion');
    });
}

function verDetalle(id) {
    var token = localStorage.getItem('token');
    
    fetch(API_URLS.viajes + '/seguimientos/historial/' + id, {
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
            var historial = datos.lista;
            var mensaje = 'Historial del Seguimiento ' + id + ':\n\n';
            
            for (var i = 0; i < historial.length; i++) {
                var h = historial[i];
                mensaje += 'Fecha: ' + h.fecha + ' | Hora: ' + h.hora + '\n';
                mensaje += 'Estado: ' + h.estado + '\n';
                if (h.novedad) {
                    mensaje += 'Novedad: ' + h.novedad + '\n';
                }
                mensaje += '---\n';
            }
            alert(mensaje);
        } else {
            alert('Error al cargar historial: ' + datos.mensaje);
        }
    })
    .catch(function(error) {
        alert('Error de conexion');
    });
}