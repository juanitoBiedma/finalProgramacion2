// Call the dataTables jQuery plugin
$(document).ready(function () {
    cargarDatosBanda();
    cargarEntidades();
});


// Función para mostrar el modal de alerta
function mostrarModal(mensaje, callback) {
    document.getElementById('alertModalBodyEditarBanda').innerText = mensaje;
    $('#alertModalEditarBanda').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalEditarBanda').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalEditarBanda').on('hidden.bs.modal', function () {
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

// Función para cargar los datos de la banda y rellenar el formulario
async function cargarDatosBanda() {
    const idBanda = getQueryParam('idBanda'); // Obtener el ID de la URL
    if (!idBanda) {
        mostrarModal("No se ha proporcionado un ID de banda", function ()
        {
            window.location.href = 'bandas.html';
        });
    }

    try {
        const responseBanda = await fetch(`/api/bandas/${idBanda}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (responseBanda.ok) {
            const banda = await responseBanda.json();

            // Rellenar los campos del formulario con los datos de la banda
            document.getElementById('txtEditarNombreBanda').value = banda.nombreBanda;
            document.getElementById('txtEditarNMiembrosBanda').value = banda.nMiembrosBanda;

        } else {
            mostrarModal('Error al cargar los datos de la banda', function ()
        {
            window.location.href = 'bandas.html';
        });
        }
    } catch (error) {
        console.error('Error al cargar la banda:', error);
    }
}

// Función para validar el formulario
function validarFormulario() {
    let esValido = true;
    const camposRequeridos = document.querySelectorAll('#formEditarBanda [required]');

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

// Función para actualizar la banda
async function editarBanda() {
    if (!validarFormulario()) {
        return;
    }

    const idBanda = getQueryParam('idBanda'); // Obtener el ID de la URL

    const bandaEditada = {
        nombreBanda: document.getElementById('txtEditarNombreBanda').value,
        nMiembrosBanda: document.getElementById('txtEditarNMiembrosBanda').value
    };

    if (bandaEditada.nMiembrosBanda < 1) {
        mostrarModal("Por favor, ingrese un número válido de miembros.");
        return;
    }

    // Actualizar banda
    const responseBanda = await fetch(`/api/bandas/editarBanda/${idBanda}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bandaEditada)
    });

    if (responseBanda.ok) {
        mostrarModal('Banda actualizada correctamente', function ()
        {
            window.location.href = 'bandas.html';
        });
    } else {
        mostrarModal('Error al actualizar la banda', function ()
        {
            window.location.href = 'bandas.html';
        });
    }
}

// Función para obtener entidades y cargarlas en el select
async function cargarEntidades() {
    const response = await fetch('/api/entidades', {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const entidades = await response.json();
        let select = document.getElementById('txtEditarEntidadSucursal');

        // Limpiamos el select por si tiene opciones anteriores
        select.innerHTML = '<option value="" disabled selected>Seleccione la Entidad</option>';

        if (entidades.length > 0) {
            // Iteramos sobre las entidades para crear las opciones
            entidades.forEach(entidad => {
                let option = document.createElement('option');
                option.value = entidad.idEntidad; // Asignamos el id de la entidad como valor
                option.text = entidad.nombreEntidad; // Mostramos el nombre de la entidad
                select.appendChild(option);
            });

        } else {
            mostrarModal("No hay entidades disponibles. No se puede registrar una sucursal.", function ()
        {
            window.location.href = 'bandas.html';
        });
        }

    } else {
        mostrarModal("Error al cargar las entidades.", function ()
        {
            window.location.href = 'bandas.html';
        });
    }
}