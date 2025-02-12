// Call the dataTables jQuery plugin
$(document).ready(function () {
    cargarDatosEntidad();
});

// Función para mostrar el modal de alerta
function mostrarModal(mensaje, callback) {
    document.getElementById('alertModalBodyEditarEntidad').innerText = mensaje;
    $('#alertModalEditarEntidad').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalEditarEntidad').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalEditarEntidad').on('hidden.bs.modal', function () {
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

// Función para cargar los datos de la entidad y rellenar el formulario
async function cargarDatosEntidad() {
    const idEntidad = getQueryParam('idEntidad'); // Obtener el ID de la URL
    if (!idEntidad) {
        mostrarModal("No se ha proporcionado un ID de entidad", function ()
        {
            window.location.href = 'entidades.html';
        });
    }

    try {
        const responseEntidad = await fetch(`${window.env.BACKEND_URL}/api/entidades/${idEntidad}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (responseEntidad.ok) {
            const entidad = await responseEntidad.json();

            // Rellenar los campos del formulario con los datos de la entidad
            document.getElementById('txtEditarNombreEntidad').value = entidad.nombreEntidad;
            document.getElementById('txtEditarDomicilioEntidad').value = entidad.domicilioEntidad;

        } else {
            mostrarModal('Error al cargar los datos de la entidad', function ()
        {
            window.location.href = 'entidades.html';
        });
        }
    } catch (error) {
        console.error('Error al cargar la entidad:', error);
    }
}

// Función para validar el formulario
function validarFormulario() {
    let esValido = true;
    const camposRequeridos = document.querySelectorAll('#formEditarEntidad [required]');

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

// Función para actualizar la entidad
async function editarEntidad() {
    if (!validarFormulario()) {
        return;
    }

    const idEntidad = getQueryParam('idEntidad'); // Obtener el ID de la URL

    const entidadEditada = {
        nombreEntidad: document.getElementById('txtEditarNombreEntidad').value,
        domicilioEntidad: document.getElementById('txtEditarDomicilioEntidad').value
    };

    // Actualizar Entidad
    const responseEntidad = await fetch(`${window.env.BACKEND_URL}/api/entidades/editarEntidad/${idEntidad}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(entidadEditada)
    });

    if (responseEntidad.ok) {
        mostrarModal('Entidad actualizada correctamente', function ()
        {
            window.location.href = 'entidades.html';
        });
    } else {
        mostrarModal('Error al actualizar la entidad', function ()
        {
            window.location.href = 'entidades.html';
        });
    }
}