// Función para mostrar el modal de alerta
function mostrarModal(mensaje, callback) {
    document.getElementById('alertModalBodyRegistrarJuez').innerText = mensaje;
    $('#alertModalRegistrarJuez').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalRegistrarJuez').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalRegistrarJuez').on('hidden.bs.modal', function () {
        if (callback) {
            callback();
        }
    });
}

// Función para validar el formulario
function validarFormulario() {
    let esValido = true;
    const camposRequeridos = document.querySelectorAll('#formRegistrarJuez [required]');

    camposRequeridos.forEach(campo => {
        if (!campo.value) {
            campo.classList.add('is-invalid');
            esValido = false;
        } else {
            ('is-invalid');
        }
    });

    return esValido;
}

// Función para crear juez
async function crearJuez() {
    if (!validarFormulario()) {
        return;
    }

    let datosJuez = {};

    // Recoger datos del juez
    datosJuez.nombreJuez = document.getElementById('txtNombreJuez').value;
    datosJuez.apellidoJuez = document.getElementById('txtApellidoJuez').value;
    datosJuez.aniosServicioJuez = document.getElementById('txtAniosServicioJuez').value;

    if (datosJuez.aniosServicioJuez < 1) {
        mostrarModal('Los años de servicio del juez deben ser mayor a 0.');
        return;
    }

    const request = await fetch(`${window.env.BACKEND_URL}/api/jueces`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosJuez)
    });

    if (request.ok) {
        mostrarModal('Juez registrado con éxito!', function ()
        {
            window.location.href = 'jueces.html';
        });
    } else {
        mostrarModal('Error al registrar el juez.', function ()
        {
            window.location.href = 'jueces.html';
        });
    }
}