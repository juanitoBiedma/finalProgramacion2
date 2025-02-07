// Call the dataTables jQuery plugin
$(document).ready(function () {
    cargarDatosSentencia();
    cargarDelitos();
    cargarJueces();
});

// Función para mostrar el modal de alerta
function mostrarModal(mensaje, callback) {
    document.getElementById('alertModalBodyEditarSentencia').innerText = mensaje;
    $('#alertModalEditarSentencia').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalEditarSentencia').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalEditarSentencia').on('hidden.bs.modal', function () {
        if (callback) {
            callback();
        }
    });
}

// Función para obtener parámetros de la URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Función para cargar los datos de la sentencia y rellenar el formulario
async function cargarDatosSentencia() {
    const idSentencia = getQueryParam('idSentencia'); // Obtener el ID de la URL
    if (!idSentencia) {
        mostrarModal('No se ha proporcionado un ID de sentencia', function ()
        {
            window.location.href = 'sentencias.html';
        });
    }

    try {
        const responseSentencia = await fetch(`/api/sentencias/${idSentencia}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (responseSentencia.ok) {
            const sentencia = await responseSentencia.json();
            // Rellenar los campos del formulario con los datos de la sentencia
            document.getElementById('txtEditarTiempoSentencia').value = sentencia.tiempoSentencia;
            document.getElementById('txtEditarDelitoSentencia').value = sentencia.delito.idDelito;
            document.getElementById('txtEditarJuezSentencia').value = sentencia.juez.idJuez;
        } else {
            mostrarModal('Error al cargar los datos de la sentencia', function ()
        {
            window.location.href = 'sentencias.html';
        });
        }
    } catch (error) {
        console.error('Error al cargar la sentencia:', error);
    }
}

// Función para validar el formulario
function validarFormulario() {
    let esValido = true;
    const camposRequeridos = document.querySelectorAll('#formEditarSentencia [required]');
    camposRequeridos.forEach(campo => {
        if (!campo.value) {
            campo.classList.add('is-invalid');
            esValido = false;
        } else {
            campo.classList.remove('is-invalid');
        }
    });
    return esValido;
}

// Función para actualizar la Sentencia
async function editarSentencia() {
    if (!validarFormulario()) {
        return;
    }

    const idSentencia = getQueryParam('idSentencia'); // Obtener el ID de la URL

    const sentenciaEditada = {
        tiempoSentencia: document.getElementById('txtEditarTiempoSentencia').value,
        juez: {idJuez: document.getElementById('txtEditarJuezSentencia').value},
        delito: {idDelito: document.getElementById('txtEditarDelitoSentencia').value}
    };
    if (sentenciaEditada.tiempoSentencia < 1) {
        mostrarModal("El tiempo de sentencia debe ser mayor a 0.");
        return;
    }

// Actualizar Sentencia
    const responseSentencia = await fetch(`/api/sentencias/editarSentencia/${idSentencia}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sentenciaEditada)
    });
    if (responseSentencia.ok) {
        mostrarModal('Sentencia actualizada correctamente', function ()
        {
            window.location.href = 'sentencias.html';
        });
    } else {
        mostrarModal('Error al actualizar la sentencia', function ()
        {
            window.location.href = 'sentencias.html';
        });
    }
}

// Función para obtener delitos y cargarlos en el select
async function cargarDelitos() {
    const responseDelitos = await fetch('/api/delitos', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    });
    if (responseDelitos.ok) {
        const delitos = await responseDelitos.json();
        let selectDelitos = document.getElementById('txtEditarDelitoSentencia');
        if (delitos.length > 0) {
            delitos.forEach((delito) => {
                const option = document.createElement('option');
                option.value = delito.idDelito;
                option.text = `${delito.idDelito} - ${delito.sucursal.entidad.nombreEntidad} - ${delito.sucursal.nombreSucursal}`; // Mostramos el nombre de la sucursal, entidad y fecha del delito
                selectDelitos.appendChild(option);
            });
        } else {
            mostrarModal("No hay delitos disponibles. No se puede registrar una sentencia.", function ()
        {
            window.location.href = 'sentencias.html';
        });
        }

    } else {
        mostrarModal("Error al cargar los delitos.", function ()
        {
            window.location.href = 'sentencias.html';
        });
    }
}

// Función para obtener jueces y cargarlos en el select
async function cargarJueces() {
    const responseJueces = await fetch('/api/jueces', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    });
    if (responseJueces.ok) {
        const jueces = await responseJueces.json();
        let selectJueces = document.getElementById('txtEditarJuezSentencia');
        if (jueces.length > 0) {
            jueces.forEach((juez) => {
                const option = document.createElement('option');
                option.value = juez.idJuez;
                option.text = `${juez.nombreJuez} ${juez.apellidoJuez}`;
                selectJueces.appendChild(option);
            });
        } else {
            mostrarModal("No hay jueces disponibles. No se puede registrar una sentencia.", function ()
        {
            window.location.href = 'sentencias.html';
        });
        }

    } else {
        mostrarModal("Error al cargar los jueces.", function ()
        {
            window.location.href = 'sentencias.html';
        });
    }
}