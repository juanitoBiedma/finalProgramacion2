// Call the dataTables jQuery plugin
$(document).ready(function () {
    cargarDatosUsuario();
});

// Función para mostrar el modal de alerta
function mostrarModal(mensaje, callback) {
    document.getElementById('alertModalBodyEditarVigilante').innerText = mensaje;
    $('#alertModalEditarVigilante').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalEditarVigilante').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalEditarVigilante').on('hidden.bs.modal', function () {
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
async function cargarDatosUsuario() {
    const idUsuario = getQueryParam("idUsuario"); // Obtener el ID de la URL
    if (!idUsuario) {
        mostrarModal("No se ha proporcionado un ID de usuario", function () {
            window.location.href = 'vigilantes.html';
        });
    }

    try {
        const responseUsuario = await fetch(`${window.env.BACKEND_URL}/api/usuarios/${idUsuario}`, {
            method: "GET",
            credentials: 'include',
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        });
        if (responseUsuario.ok) {
            const usuario = await responseUsuario.json();
            // Rellenar los campos del formulario con los datos del usuario
            document.getElementById("txtEditarNombreVigilante").value = usuario.nombreUsuario;
            document.getElementById("txtEditarApellidoVigilante").value = usuario.apellidoUsuario;
            document.getElementById("txtEditarUserVigilante").value = usuario.username;
            cargarDatosVigilante(idUsuario);
        } else {
            mostrarModal("Error al cargar los datos del Vigilante", function () {
                window.location.href = 'vigilantes.html';
            });
        }
    } catch (error) {
        console.error("Error al cargar el Vigilante:", error);
        mostrarModal("Error al cargar los datos del Vigilante", function () {
            window.location.href = 'vigilantes.html';
        });
    }
}

// Función para cargar los datos del vigilante
async function cargarDatosVigilante(idUsuario) {
    try {
        const responseVigilante = await fetch(`${window.env.BACKEND_URL}/api/vigilantes/usuario/${idUsuario}`, {
            method: "GET",
            credentials: 'include',
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        });
        if (responseVigilante.ok) {
            const vigilante = await responseVigilante.json();
            document.getElementById("txtEditarEdadVigilante").value = vigilante.edadVigilante;
        } else {
            mostrarModal("Error al cargar los datos del vigilante", function () {
                window.location.href = 'vigilantes.html';
            });
        }
    } catch (error) {
        console.error("Error al cargar el vigilante:", error);
        mostrarModal("Error al cargar los datos del Vigilante", function () {
            window.location.href = 'vigilantes.html';
        });
    }
}

// Función para validar el formulario
function validarFormulario() {
    let esValido = true;
    const camposRequeridos = document.querySelectorAll('#formEditarVigilante [required]');

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

// Función para actualizar el vigilante
async function editarVigilante() {
    if (!validarFormulario()) {
        return;
    }

    const idUsuario = getQueryParam("idUsuario"); // Obtener el ID de la URL
    let rolId = 3;
    const usuarioEditado = {
        nombreUsuario: document.getElementById("txtEditarNombreVigilante").value,
        apellidoUsuario: document.getElementById("txtEditarApellidoVigilante").value,
        username: document.getElementById("txtEditarUserVigilante").value,
        rolUsuario: { id: rolId }
    };

    // Validar contraseña
    const nuevaContrasenia = document.getElementById(
        "txtEditarContraseniaVigilante"
    ).value;
    if (!validarContrasenia(nuevaContrasenia)) {
        mostrarModal(
            "La nueva contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial."
        );
        return;
    }

    // Actualizar Usuario
    const responseUsuario = await fetch(`${window.env.BACKEND_URL}/api/usuarios/editarUsuario/${idUsuario}`, {
        method: "PATCH",
        credentials: 'include',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(usuarioEditado)
    });
    if (responseUsuario.ok) {
        const responseVigilante = await fetch(`${window.env.BACKEND_URL}/api/vigilantes/usuario/${idUsuario}`, {
            method: "GET",
            credentials: 'include',
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        });
        if (responseVigilante.ok) {
            const vigilante = await responseVigilante.json();
            vigilante.edadVigilante = document.getElementById("txtEditarEdadVigilante").value;

            // Validación de edad
            if (vigilante.edadVigilante < 18 || vigilante.edadVigilante > 65) {
                mostrarModal("Ingrese una edad válida.");
                return;
            }

            await fetch(`${window.env.BACKEND_URL}/api/vigilantes/editarVigilante/${vigilante.idVigilante}`, {
                method: "PATCH",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(vigilante)
            });

            mostrarModal("Vigilante actualizado correctamente", function () {
                window.location.href = 'vigilantes.html';
            });

        } else {
            mostrarModal("Error al actualizar el vigilante", function () {
                window.location.href = 'vigilantes.html';
            });
        }
    } else {
        mostrarModal("Error al actualizar el vigilante", function () {
            window.location.href = 'vigilantes.html';
        });
    }
}