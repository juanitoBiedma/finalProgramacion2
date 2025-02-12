// Call the functions when the page is ready
$(document).ready(function () {
    cargarEntidades();
});

// Función para mostrar el modal de alerta
function mostrarModal(mensaje, callback) {
    document.getElementById('alertModalBodyRegistrarSucursal').innerText = mensaje;
    $('#alertModalRegistrarSucursal').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalRegistrarSucursal').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalRegistrarSucursal').on('hidden.bs.modal', function () {
        if (callback) {
            callback();
        }
    });
}

// Función para validar el formulario
function validarFormulario() {
    let esValido = true;
    const camposRequeridos = document.querySelectorAll('#formRegistrarSucursal [required]');
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

// Función para crear sucursal
async function crearSucursal() {
    if (!validarFormulario()) {
        return;
    }

    let datosSucursal = {};
    // Recoger datos de la sucursal
    datosSucursal.nombreSucursal = document.getElementById('txtNombreSucursal').value;
    datosSucursal.domicilioSucursal = document.getElementById('txtDomicilioSucursal').value;
    const nEmpleados = parseInt(document.getElementById('txtNEmpleadosSucursal').value);
    datosSucursal.nEmpleadosSucursal = nEmpleados;
    if (datosSucursal.nEmpleadosSucursal < 1) {
        mostrarModal("Por favor, ingrese un número válido de empleados.");
        return;
    }

    // Recoger solo el id de la entidad seleccionada
    const idEntidad = document.getElementById('txtEntidadSucursal').value;

    // Enviar solo el id de la entidad al backend
    datosSucursal.entidad = { idEntidad: idEntidad };
    const request = await fetch('${window.env.BACKEND_URL}/api/sucursales', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosSucursal)
    });
    if (request.ok) {
        mostrarModal("Sucursal registrada con éxito!", function ()
        {
            window.location.href = 'sucursales.html';
        });
    } else {
        mostrarModal("Error al registrar la sucursal.", function ()
        {
            window.location.href = 'sucursales.html';
        });
    }
}

// Función para obtener entidades y cargarlas en el select
async function cargarEntidades() {
    const response = await fetch('${window.env.BACKEND_URL}/api/entidades', {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const entidades = await response.json();
        let select = document.getElementById('txtEntidadSucursal');
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
            // Si no hay entidades disponibles, mostrar mensaje y redirigir
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
