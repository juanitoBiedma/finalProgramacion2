// Call the functions when the page is ready
$(document).ready(function () {
    cargarDelitos();
    cargarBandas();
});

// Función para mostrar el modal de alerta
function mostrarModal(mensaje, callback) {
    document.getElementById('alertModalBodyRegistrarDelincuente').innerText = mensaje;
    $('#alertModalRegistrarDelincuente').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalRegistrarDelincuente').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalRegistrarDelincuente').on('hidden.bs.modal', function () {
        if (callback) {
            callback();
        }
    });
}

// Función para validar el formulario
function validarFormulario() {
    let esValido = true;
    const camposRequeridos = document.querySelectorAll('#formRegistrarDelincuente [required]');

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

// Función para crear delincuente
async function crearDelincuente() {
    if (!validarFormulario()) {
        return;
    }

    let datosDelincuente = {};

    // Recoger datos del delincuente
    datosDelincuente.nombreDelincuente = document.getElementById('txtNombreDelincuente').value;
    datosDelincuente.apellidoDelincuente = document.getElementById('txtApellidoDelincuente').value;
    const idDelito = document.getElementById('txtDelitoDelincuente').value;
    const idBanda = document.getElementById('txtBandaDelincuente').value;

    // Si no se selecciona una banda, asignamos null
    datosDelincuente.banda = idBanda ? {idBanda: idBanda} : null;

    // Asignar el delito seleccionado a la lista de delitos
    datosDelincuente.delitos = [{idDelito: idDelito}];

    const request = await fetch('/api/delincuentes', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosDelincuente)
    });

    if (request.ok) {
        mostrarModal("Delincuente registrado con éxito!", function ()
        {
            window.location.href = 'delincuentes.html';
        });
    } else {
        mostrarModal("Error al registrar el delincuente.", function ()
        {
            window.location.href = 'delincuentes.html';
        });
    }
}

// Función para obtener delitos y cargarlos en el select
async function cargarDelitos() {
    const response = await fetch('/api/delitos', {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const delitos = await response.json();
        let select = document.getElementById('txtDelitoDelincuente');

        // Limpiamos el select por si tiene opciones anteriores
        select.innerHTML = '<option value="" disabled selected>Seleccione el delito</option>';

        if (delitos.length > 0) {
            // Iteramos sobre los delitos para crear las opciones
            delitos.forEach(delito => {
                const [year, month, day] = delito.fechaDelito.split('-');
                const formattedDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
                let option = document.createElement('option');
                option.value = delito.idDelito; // Asignamos el id del delito como valor
                option.text = `${delito.sucursal.entidad.nombreEntidad} - ${delito.sucursal.nombreSucursal} - ${formattedDate}`; // Mostramos el nombre de la sucursal, entidad y fecha del delito

                select.appendChild(option);
            });

        } else {
            // Si no hay delitos, deshabilitamos el botón de crear delincuente
            mostrarModal("No hay delitos disponibles. No se puede registrar un delincuente.", function ()
        {
            window.location.href = 'delincuentes.html';
        });
        }

    } else {
        mostrarModal("Error al cargar los delitos.", function ()
        {
            window.location.href = 'delincuentes.html';
        });
    }
}

// Función para obtener bandas y cargarlas en el select
async function cargarBandas() {
    const response = await fetch('/api/bandas', {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const bandas = await response.json();
        let select = document.getElementById('txtBandaDelincuente');

        // Limpiamos el select por si tiene opciones anteriores
        select.innerHTML = '<option value="" selected>Sin Banda</option>'; // "Sin Banda" es una opción por defecto

        if (bandas.length > 0) {
            // Iteramos sobre las bandas para crear las opciones
            bandas.forEach(banda => {
                let option = document.createElement('option');
                option.value = banda.idBanda; // Asignamos el id de la entidad como valor
                option.text = banda.nombreBanda; // Mostramos el nombre de la entidad
                select.appendChild(option);
            });
        }

    } else {
        mostrarModal("Error al cargar las bandas.", function ()
        {
            window.location.href = 'delincuentes.html';
        });
    }
}