// Call the dataTables jQuery plugin
$(document).ready(function () {
    cargarContraseniaUsuario();
});


// Función para mostrar el modal de alerta
function mostrarModal(mensaje, callback) {
    document.getElementById('alertModalBodyEditarContrasenia').innerText = mensaje;
    $('#alertModalEditarContrasenia').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalEditarContrasenia').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalEditarContrasenia').on('hidden.bs.modal', function () {
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

// Función para cargar los datos del usuario y rellenar el formulario
async function cargarContraseniaUsuario() {
    const idUsuario = getQueryParam('idUsuario'); // Obtener el ID de la URL
    if (!idUsuario) {
        mostrarModal("No se ha proporcionado un ID de usuario", function () {
            window.location.href = 'index.html';
        });
    }

    try {
        const response = await fetch(`${window.env.BACKEND_URL}/api/usuarios/${idUsuario}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const usuario = await response.json();
            contrasenia = usuario.password;

        } else {
            mostrarModal('Error al cargar los datos del usuario', function () {
                window.location.href = 'index.html';
            });

        }
    } catch (error) {
        console.error('Error al cargar el usuario:', error);
    }
}

// Función para validar el formulario
function validarFormulario() {
    let esValido = true;
    const camposRequeridos = document.querySelectorAll('#formEditarContrasenia [required]');

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

//Función para validar la contraseña
function validarContrasenia(contrasenia) {
    const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(contrasenia);
}

async function editarContrasenia() {
    if (!validarFormulario()) {
        return;
    }

    const idUsuario = getQueryParam('idUsuario'); // Obtener el ID de la URL
    const antiguaContrasenia = document.getElementById('txtEditarAntiguaPass').value;
    const nuevaContrasenia = document.getElementById('txtEditarNuevaPass').value;
    const repetirNuevaContrasenia = document.getElementById('txtRepetirNuevaPass').value;

    // Validar contraseña
    if (!validarContrasenia(nuevaContrasenia)) {
        mostrarModal(
            "La nueva contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial."
        );
        return;
    }

    const data = {
        antiguaContrasenia: antiguaContrasenia,
        nuevaContrasenia: nuevaContrasenia,
        repetirNuevaContrasenia: repetirNuevaContrasenia
    };

    try {
        const response = await fetch(`${window.env.BACKEND_URL}/api/usuarios/editarContrasenia/${idUsuario}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            mostrarModal('Contraseña actualizada correctamente', function () {
                window.location.href = 'index.html';
            });

        } else {
            const errorMessage = await response.text();
            mostrarModal('Error: ' + errorMessage, function () {
                window.location.href = 'index.html';
            });

        }
    } catch (error) {
        mostrarModal('Error al actualizar la contraseña', function () {
            window.location.href = 'index.html';
        });

    }
}