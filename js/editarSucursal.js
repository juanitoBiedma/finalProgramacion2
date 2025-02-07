// Call the dataTables jQuery plugin
$(document).ready(function () {
    cargarDatosSucursal();
    cargarEntidades();
});


// Función para mostrar el modal de alerta
function mostrarModal(mensaje, callback) {
    document.getElementById('alertModalBodyEditarSucursal').innerText = mensaje;
    $('#alertModalEditarSucursal').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalEditarSucursal').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalEditarSucursal').on('hidden.bs.modal', function () {
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

// Función para cargar los datos de la Sucursalar el formulario
async function cargarDatosSucursal() {
    const idSucursal = getQueryParam('idSucursal'); // Obtener el ID de la URL
    if (!idSucursal) {
        mostrarModal("No se ha proporcionado un ID de sucursal", function ()
        {
            window.location.href = 'sucursales.html';
        });
    }

    try {
        const responseSucursal = await fetch(`http://190.210.32.29:8080/api/sucursales/${idSucursal}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (responseSucursal.ok) {
            const sucursal = await responseSucursal.json();

            // Rellenar los campos del formulario con los datos de la sucursal
            document.getElementById('txtEditarNombreSucursal').value = sucursal.nombreSucursal;
            document.getElementById('txtEditarDomicilioSucursal').value = sucursal.domicilioSucursal;
            document.getElementById('txtEditarNEmpleadosSucursal').value = sucursal.nEmpleadosSucursal;
            document.getElementById('txtEditarEntidadSucursal').value = sucursal.entidad.nombreEntidad;

        } else {
            mostrarModal('Error al cargar los datos de la sucursal', function ()
        {
            window.location.href = 'sucursales.html';
        });
        }
    } catch (error) {
        console.error('Error al cargar la sucursal:', error);
    }
}

// Función para validar el formulario
function validarFormulario() {
    let esValido = true;
    const camposRequeridos = document.querySelectorAll('#formEditarSucursal [required]');

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

// Función para actualizar la sucursal
async function editarSucursal() {
    if (!validarFormulario()) {
        return;
    }

    const idSucursal = getQueryParam('idSucursal'); // Obtener el ID de la URL

    const sucursalEditada = {
        nombreSucursal: document.getElementById('txtEditarNombreSucursal').value,
        domicilioSucursal: document.getElementById('txtEditarDomicilioSucursal').value,
        nEmpleadosSucursal: document.getElementById('txtEditarNEmpleadosSucursal').value,
        entidad: {
            idEntidad: document.getElementById('txtEditarEntidadSucursal').value // Capturar la entidad seleccionada
        }
    };

    if (sucursalEditada.nEmpleadosSucursal < 1) {
        mostrarModal("Por favor, ingrese un número válido de empleados.");
        return;
    }

    // Actualizar sucursal
    const responseSucursal = await fetch(`http://190.210.32.29:8080/api/sucursales/editarSucursal/${idSucursal}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sucursalEditada)
    });

    if (responseSucursal.ok) {
        mostrarModal('Sucursal actualizada correctamente', function ()
        {
            window.location.href = 'sucursales.html';
        });
    } else {
        mostrarModal('Error al actualizar la sucursal', function ()
        {
            window.location.href = 'sucursales.html';
        });
    }
}

// Función para obtener entidades y cargarlas en el select
async function cargarEntidades() {
    const response = await fetch('http://190.210.32.29:8080/api/entidades', {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const entidades = await response.json();
        let select = document.getElementById('txtEditarEntidadSucursal');

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
            window.location.href = 'sucursales.html';
        });
        }

    } else {
        mostrarModal("Error al cargar las entidades.", function ()
        {
            window.location.href = 'sucursales.html';
        });
    }
}