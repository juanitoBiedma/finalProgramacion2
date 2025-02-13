// Call the functions when the page is ready
$(document).ready(function () {
    cargarSucursales();
    limitarRangoFechas();
});

// Función para limitar el rango de fechas válidas
function limitarRangoFechas() {
    const fechaInput = document.getElementById('txtFechaDelito');
    const hoy = new Date();
    const añoActual = hoy.getFullYear();
    const mesActual = String(hoy.getMonth() + 1).padStart(2, '0');
    const diaActual = String(hoy.getDate()).padStart(2, '0');

    // Establecer el rango de fechas válidas
    fechaInput.min = '2024-01-01';
    fechaInput.max = `${añoActual}-${mesActual}-${diaActual}`;
}

// Función para mostrar el modal de alerta
function mostrarModal(mensaje, callback) {
    document.getElementById('alertModalBodyRegistrarDelito').innerText = mensaje;
    $('#alertModalRegistrarDelito').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalRegistrarDelito').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalRegistrarDelito').on('hidden.bs.modal', function () {
        if (callback) {
            callback();
        }
    });
}

// Función para validar el formulario
function validarFormulario() {
    let esValido = true;
    const camposRequeridos = document.querySelectorAll('#formRegistrarDelito [required]');

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

// Función para crear delito
async function crearDelito() {
    if (!validarFormulario()) {
        return;
    }

    let datosDelito = {};

    let fechaDelito = document.getElementById('txtFechaDelito').value;
    if (fechaDelito) {
        // Enviar la fecha en formato yyyy-MM-dd
        datosDelito.fechaDelito = fechaDelito;
    }

    const idSucursal = document.getElementById('txtSucursalDelito').value;

    // Enviar solo los id de la sucursal si está seleccionada
    datosDelito.sucursal = {idSucursal: idSucursal};

    const request = await fetch('${window.env.BACKEND_URL}/api/delitos', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosDelito)
    });

    if (request.ok) {
        mostrarModal("Delito registrado con éxito.", function ()
        {
            window.location.href = 'delitos.html';
        });
    } else {
        mostrarModal("Error al registrar el delito.", function ()
        {
            window.location.href = 'delitos.html';
        });
    }
}

// Función para cargar sucursales
async function cargarSucursales() {
    const response = await fetch('${window.env.BACKEND_URL}/api/sucursales', {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const sucursales = await response.json();
        let select = document.getElementById('txtSucursalDelito');

        // Limpiamos el select por si tiene opciones anteriores
        select.innerHTML = '<option value="" disabled selected>Seleccione la sucursal</option>';

        if (sucursales.length > 0) {
            sucursales.forEach(sucursal => {
                let option = document.createElement('option');
                option.value = sucursal.idSucursal; // Asignamos el id de la sucursal como valor
                option.text = `${sucursal.entidad.nombreEntidad} - ${sucursal.nombreSucursal}`; // Mostramos el nombre de la entidad y la sucursal
                select.appendChild(option);
            });
        } else {
            mostrarModal("No hay sucursales disponibles. No se puede registrar un delito.", function ()
            {
                window.location.href = 'delitos.html';
            });
        }
    } else {
        mostrarModal("Error al cargar las sucursales.", function ()
        {
            window.location.href = 'delitos.html';
        });
    }
}