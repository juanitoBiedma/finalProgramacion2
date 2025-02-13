// Función para mostrar el modal de alerta
function mostrarModal(mensaje, callback) {
    document.getElementById('alertModalBodyRegistrarEntidad').innerText = mensaje;
    $('#alertModalRegistrarEntidad').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalRegistrarEntidad').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalRegistrarEntidad').on('hidden.bs.modal', function () {
        if (callback) {
            callback();
        }
    });
}

// Función para validar el formulario
function validarFormulario() {
    let esValido = true;
    const camposRequeridos = document.querySelectorAll('#formRegistrarEntidad [required]');

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

// Función para crear entidad
async function crearEntidad() {
    if (!validarFormulario()) {
        return;
    }

    let datosEntidad = {};

    // Recoger datos de la entidad
    datosEntidad.nombreEntidad = document.getElementById('txtNombreEntidad').value;
    datosEntidad.domicilioEntidad = document.getElementById('txtDomicilioEntidad').value;

    const request = await fetch('${window.env.BACKEND_URL}/api/entidades', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosEntidad)
    });

    if (request.ok) {
        mostrarModal("Entidad registrada con éxito!", function () {
            window.location.href = 'entidades.html';
        });
    } else {
        mostrarModal("Error al registrar la entidad.", function () {
            window.location.href = 'entidades.html';
        });
    }
}