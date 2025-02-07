
// Función para validar el formulario
function validarFormulario() {
    let esValido = true;
    const camposRequeridos = document.querySelectorAll('#formRegistrarBanda [required]');
    
    camposRequeridos.forEach(campo => {
        if (!campo.value.trim()) {
            campo.classList.add('is-invalid');
            esValido = false;
        } else {
            campo.classList.remove('is-invalid');
        }
    });
    return esValido;
}


// Función para mostrar el modal de alerta
function mostrarModal(mensaje, callback) {
    document.getElementById('alertModalBodyRegistrarBanda').innerText = mensaje;
    $('#alertModalRegistrarBanda').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalRegistrarBanda').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalRegistrarBanda').on('hidden.bs.modal', function () {
        if (callback) {
            callback();
        }
    });
}


// Función para crear banda
async function crearBanda() {
    if (!validarFormulario()) {
        return;
    }

    let datosBanda = {};

    // Recoger datos de la banda
    datosBanda.nombreBanda = document.getElementById('txtNombreBanda').value;
    datosBanda.nMiembrosBanda = document.getElementById('txtNMiembrosBanda').value;

    // Validar que la cantidad de miembros sea mayor o igual a 1
    if (datosBanda.nMiembrosBanda < 1) {
        mostrarModal("Por favor, ingrese un número válido de miembros.");
        return;
    }

    const request = await fetch('/api/bandas', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosBanda)
    });

    if (request.ok) {
        mostrarModal("Banda registrada con éxito.", function ()
        {
            window.location.href = 'bandas.html';
        });
    } else {
        mostrarModal("Error al registrar la banda.", function ()
        {
            window.location.href = 'bandas.html';
        });
    }
}