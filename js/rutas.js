document.addEventListener('DOMContentLoaded', function() {
    cargarRutas();
    
    var formRuta = document.getElementById('formRuta');
    if (formRuta) {
        formRuta.addEventListener('submit', guardarRuta);
    }
});

function cargarRutas() {
    var token = localStorage.getItem('token');
    var cuerpoTabla = document.getElementById('cuerpoTabla');
    
    if (!cuerpoTabla) return;
    
    cuerpoTabla.innerHTML = '<tr><td colspan="7" class="texto-cargando">Cargando rutas...</td></tr>';
    
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
            mostrarRutas(datos.lista);
        } else {
            cuerpoTabla.innerHTML = '<tr><td colspan="7" class="texto-error">Error: ' + datos.mensaje + '</td></tr>';
        }
    })
    .catch(function(error) {
        cuerpoTabla.innerHTML = '<tr><td colspan="7" class="texto-error">Error de conexion con el servidor</td></tr>';
    });
}

function mostrarRutas(rutas) {
    var cuerpoTabla = document.getElementById('cuerpoTabla');
    
    if (!cuerpoTabla) return;
    
    if (rutas.length === 0) {
        cuerpoTabla.innerHTML = '<tr><td colspan="7" class="texto-vacio">No hay rutas registradas</td></tr>';
        return;
    }
    
    var html = '';
    
    for (var i = 0; i < rutas.length; i++) {
        var r = rutas[i];
        
        html += '<tr>';
        html += '<td>' + r.id + '</td>';
        html += '<td>' + r.ciudad_origen + '</td>';
        html += '<td>' + r.ciudad_destino + '</td>';
        html += '<td>' + r.distancia + '</td>';
        html += '<td>' + r.tiempo_estimado + '</td>';
        html += '<td>' + (r.observaciones || '-') + '</td>';
        html += '<td>';
        html += '<button class="btn btn-warning" onclick="editarRuta(' + r.id + ')">Editar</button>';
        html += '<button class="btn btn-info" onclick="verProgramacion(' + r.id + ')">Programacion</button>';
        html += '</td>';
        html += '</tr>';
    }
    
    cuerpoTabla.innerHTML = html;
}

function mostrarFormularioCrear() {
    var modalTitulo = document.getElementById('modalTitulo');
    if (modalTitulo) {
        modalTitulo.textContent = 'Nueva Ruta';
    }
    document.getElementById('rutaId').value = '';
    document.getElementById('formRuta').reset();
    document.getElementById('modalRuta').classList.add('active');
}

function editarRuta(id) {
    var token = localStorage.getItem('token');
    
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
            var ruta = datos.lista.find(function(r) {
                return r.id === id;
            });
            
            if (ruta) {
                var modalTitulo = document.getElementById('modalTitulo');
                if (modalTitulo) {
                    modalTitulo.textContent = 'Editar Ruta';
                }
                document.getElementById('rutaId').value = ruta.id;
                document.getElementById('ciudad_origen').value = ruta.ciudad_origen;
                document.getElementById('ciudad_destino').value = ruta.ciudad_destino;
                document.getElementById('distancia').value = ruta.distancia;
                document.getElementById('tiempo_estimado').value = ruta.tiempo_estimado;
                document.getElementById('observaciones').value = ruta.observaciones || '';
                
                document.getElementById('modalRuta').classList.add('active');
            }
        }
    });
}

function cerrarModal() {
    var modal = document.getElementById('modalRuta');
    if (modal) {
        modal.classList.remove('active');
    }
}

function buscarRutas() {
    var token = localStorage.getItem('token');
    var cuerpoTabla = document.getElementById('cuerpoTabla');
    var origen = document.getElementById('filtroOrigen').value;
    var destino = document.getElementById('filtroDestino').value;
    
    if (!cuerpoTabla) return;
    
    cuerpoTabla.innerHTML = '<tr><td colspan="7" class="texto-cargando">Buscando...</td></tr>';
    
    var url = API_URLS.rutas + '/rutas';
    var parametros = [];
    
    if (origen) parametros.push('ciudad=' + encodeURIComponent(origen));
    else if (destino) parametros.push('ciudad=' + encodeURIComponent(destino));
    
    if (parametros.length > 0) url += '?' + parametros.join('&');
    
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
            mostrarRutas(datos.lista);
        } else {
            cuerpoTabla.innerHTML = '<tr><td colspan="7" class="texto-error">Error: ' + datos.mensaje + '</td></tr>';
        }
    })
    .catch(function(error) {
        cuerpoTabla.innerHTML = '<tr><td colspan="7" class="texto-error">Error de conexion</td></tr>';
    });
}

function limpiarFiltros() {
    document.getElementById('filtroOrigen').value = '';
    document.getElementById('filtroDestino').value = '';
    cargarRutas();
}

function guardarRuta(evento) {
    evento.preventDefault();
    var token = localStorage.getItem('token');
    var id = document.getElementById('rutaId').value;
    
    var ciudad_origen = document.getElementById('ciudad_origen').value.trim();
    var ciudad_destino = document.getElementById('ciudad_destino').value.trim();
    var distancia = parseFloat(document.getElementById('distancia').value);
    var tiempo_estimado = parseFloat(document.getElementById('tiempo_estimado').value);
    var observaciones = document.getElementById('observaciones').value.trim();
    
    if (!ciudad_origen || !ciudad_destino || !distancia || !tiempo_estimado) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }
    
    if (distancia <= 0) {
        alert('La distancia debe ser mayor a cero');
        return;
    }
    
    if (tiempo_estimado <= 0) {
        alert('El tiempo estimado debe ser mayor a cero');
        return;
    }
    
    var datos = {
        ciudad_origen: ciudad_origen,
        ciudad_destino: ciudad_destino,
        distancia: distancia,
        tiempo_estimado: tiempo_estimado,
        observaciones: observaciones
    };
    
    var url = API_URLS.rutas + '/rutas';
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
            cargarRutas();
            alert(datos.mensaje);
        } else {
            alert('Error: ' + datos.mensaje);
        }
    })
    .catch(function(error) {
        alert('Error de conexion');
    });
}

function verProgramacion(id) {
    var token = localStorage.getItem('token');
    
    fetch(API_URLS.rutas + '/programaciones', {
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
            var programaciones = datos.lista.filter(function(p) {
                return p.ruta_id === id;
            });
            
            if (programaciones.length > 0) {
                var mensaje = 'Programaciones para la ruta ' + id + ':\n\n';
                for (var i = 0; i < programaciones.length; i++) {
                    var p = programaciones[i];
                    mensaje += 'ID: ' + p.id + ' | Conductor: ' + p.conductor_id + ' | Vehiculo: ' + p.vehiculo_id + '\n';
                    mensaje += 'Fecha: ' + p.fecha + ' | Hora: ' + p.hora + ' | Estado: ' + p.estado + '\n\n';
                }
                alert(mensaje);
            } else {
                alert('No hay programaciones para esta ruta');
            }
        } else {
            alert('Error al cargar programaciones');
        }
    });
}