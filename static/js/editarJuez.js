// Call the dataTables jQuery plugin
$(document).ready(function () {
    cargarDatosJuez();
});

// Función para mostrar el modal de alerta
function mostrarModal(mensaje, callback) {
    document.getElementById('alertModalBodyEditarJuez').innerText = mensaje;
    $('#alertModalEditarJuez').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalEditarJuez').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalEditarJuez').on('hidden.bs.modal', function () {
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

// Función para cargar los datos del juez y rellenar el formulario
async function cargarDatosJuez() {
    const idJuez = getQueryParam('idJuez'); // Obtener el ID de la URL
    if (!idJuez) {
        mostrarModal('No se ha proporcionado un ID de juez', function ()
        {
            window.location.href = 'jueces.html';
        });
    }

    try {
        const responseJuez = await fetch(`${window.env.BACKEND_URL}/api/jueces/${idJuez}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (responseJuez.ok) {
            const juez = await responseJuez.json();

            // Rellenar los campos del formulario con los datos del juez
            document.getElementById('txtEditarNombreJuez').value = juez.nombreJuez;
            document.getElementById('txtEditarApellidoJuez').value = juez.apellidoJuez;
            document.getElementById('txtEditarAniosServicioJuez').value = juez.aniosServicioJuez;

            if (juez.aniosServicioJuez < 1) {
                mostrarModal("Los años de servicio del juez deben ser mayor a 0.");
                return;
            }

        } else {
            mostrarModal('Error al cargar los datos del juez', function ()
        {
            window.location.href = 'jueces.html';
        });
        }
    } catch (error) {
        console.error('Error al cargar el juez:', error);
    }
}

// Función para validar el formulario
function validarFormulario() {
    let esValido = true;
    const camposRequeridos = document.querySelectorAll('#formEditarJuez [required]');

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

// Función para actualizar el Juez
async function editarJuez() {
    if (!validarFormulario()) {
        return;
    }

    const idJuez = getQueryParam('idJuez'); // Obtener el ID de la URL

    const juezEditado = {
        nombreJuez: document.getElementById('txtEditarNombreJuez').value,
        apellidoJuez: document.getElementById('txtEditarApellidoJuez').value,
        aniosServicioJuez: document.getElementById('txtEditarAniosServicioJuez').value
    };

    if (juezEditado.aniosServicioJuez < 1) {
        mostrarModal("Los años de servicio del juez deben ser mayor a 0.");
        return;
    }

    // Actualizar Juez
    const responseJuez = await fetch(`${window.env.BACKEND_URL}/api/jueces/editarJuez/${idJuez}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(juezEditado)
    });

    if (responseJuez.ok) {
        mostrarModal('Juez actualizado correctamente', function ()
        {
            window.location.href = 'jueces.html';
        });
    } else {
        mostrarModal('Error al actualizar el juez', function ()
        {
            window.location.href = 'jueces.html';
        });
    }
}