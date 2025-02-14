// Call the dataTables jQuery plugin
$(document).ready(function () {
    cargarDatosDelito();
    cargarSucursales();
    limitarRangoFechas();
});

// Función para mostrar el modal de alerta
function mostrarModal(mensaje, callback) {
    document.getElementById('alertModalBodyEditarDelito').innerText = mensaje;
    $('#alertModalEditarDelito').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalEditarDelito').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalEditarDelito').on('hidden.bs.modal', function () {
        if (callback) {
            callback();
        }
    });
}

// Función para limitar el rango de fechas válidas
function limitarRangoFechas() {
    const fechaInput = document.getElementById('txtEditarFechaDelito');
    const hoy = new Date();
    const añoActual = hoy.getFullYear();
    const mesActual = String(hoy.getMonth() + 1).padStart(2, '0');
    const diaActual = String(hoy.getDate()).padStart(2, '0');

    // Establecer el rango de fechas válidas
    fechaInput.min = '2024-01-01';
    fechaInput.max = `${añoActual}-${mesActual}-${diaActual}`;
}

// Función para obtener parámetros de la URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Función para cargar los datos del delito y rellenar el formulario
async function cargarDatosDelito() {
    const idDelito = getQueryParam('idDelito'); // Obtener el ID de la URL
    if (!idDelito) {
        mostrarModal("No se ha proporcionado un ID de delito", function ()
        {
            window.location.href = 'delitos.html';
        });
    }

    try {
        const responseDelito = await fetch(`${window.env.BACKEND_URL}/api/delitos/${idDelito}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (responseDelito.ok) {
            const delito = await responseDelito.json();
            await cargarSucursales();

            // Formatear la fecha al formato yyyy-MM-dd para el input
            const [year, month, day] = delito.fechaDelito.split('-');
            const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // Rellenar los campos del formulario con los datos del delito
            document.getElementById('txtEditarFechaDelito').value = formattedDate;
            document.getElementById('txtEditarSucursalDelito').value = delito.sucursal.idSucursal;

        } else {
            mostrarModal('Error al cargar los datos del delito', function ()
        {
            window.location.href = 'delitos.html';
        });
        }
    } catch (error) {
        console.error('Error al cargar al delito:', error);
    }
}

// Función para validar el formulario
function validarFormulario() {
    let esValido = true;
    const camposRequeridos = document.querySelectorAll('#formEditarDelito [required]');

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

// Función para actualizar al delito
async function editarDelito() {
    if (!validarFormulario()) {
        return;
    }

    const idDelito = getQueryParam('idDelito'); // Obtener el ID de la URL

    const fechaDelito = document.getElementById('txtEditarFechaDelito').value;
    const idSucursal = document.getElementById('txtEditarSucursalDelito').value;

    // Validar que la fecha esté dentro del rango permitido
    const fechaMinima = new Date('2024-01-01');
    const fechaMaxima = new Date();
    const fechaSeleccionada = new Date(fechaDelito);

    if (fechaSeleccionada < fechaMinima || fechaSeleccionada > fechaMaxima) {
        mostrarModal("La fecha del delito debe estar entre el 1 de enero de 2024 y la fecha actual.");
        return;
    }

    const delitoEditado = {
        fechaDelito: fechaDelito,
        sucursal: {
            idSucursal: idSucursal // Capturar la sucursal seleccionada
        }
    };

    // Actualizar delito
    const responseDelito = await fetch(`${window.env.BACKEND_URL}/api/delitos/editarDelito/${idDelito}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(delitoEditado)
    });

    if (responseDelito.ok) {
        mostrarModal('Delito actualizado correctamente', function ()
        {
            window.location.href = 'delitos.html';
        });
    } else {
        mostrarModal('Error al actualizar el delito', function ()
        {
            window.location.href = 'delitos.html';
        });
    }
}

// Función para obtener sucursales y cargarlas en el select
async function cargarSucursales() {
    const response = await fetch(`${window.env.BACKEND_URL}/api/sucursales`, {
        method: "GET",
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const sucursales = await response.json();
        let select = document.getElementById('txtEditarSucursalDelito');

        // Limpiamos el select por si tiene opciones anteriores
        select.innerHTML = '<option value="" disabled selected>Seleccione la sucursal</option>';

        // Iteramos sobre las sucursales para crear las opciones
        sucursales.forEach(sucursal => {
            let option = document.createElement('option');
            option.value = sucursal.idSucursal; // Asignamos el id de la sucursal como valor
            option.text = sucursal.nombreSucursal; // Mostramos el nombre de la sucursal
            select.appendChild(option);
        });

    } else {
        mostrarModal("Error al cargar las sucursales.", function ()
        {
            window.location.href = 'delitos.html';
        });
    }
}