// Call the dataTables jQuery plugin
$(document).ready(function () {
    limitarRangoFechas();
    obtenerVigilantes();

    // Mostrar campos de Vigilante cuando se selecciona el rol 3
    const rolInput = document.getElementById("txtRol");
    if (rolInput) {
        document.getElementById("txtRol").addEventListener("change", function () {
            const vigilanteFields = document.getElementById("vigilanteFields");
            if (this.value === "3") {
                vigilanteFields.style.display = "block";
            } else {
                vigilanteFields.style.display = "none";
            }
        });
    }
    const estaContratadoVigilante = document.getElementById("txtEstaContratado");
    if (estaContratadoVigilante) {
        limitarRangoFechas();
        document.getElementById("txtEstaContratado").addEventListener("change", function () {
            cargarSucursales();
            const sucursalvigilanteFields = document.getElementById("sucursalvigilanteFields");
            const contratoFields = document.getElementById("contratoFields");
            if (this.checked === true) {
                sucursalvigilanteFields.style.display = "block";
                contratoFields.style.display = "block";
            } else {
                sucursalvigilanteFields.style.display = "none";
                contratoFields.style.display = "none";
            }
        });
    }

    const btnCrearUsuario = document.getElementById("btnRegistrarUsuario");
    if (btnCrearUsuario) {

        btnCrearUsuario.addEventListener("click", function () {
            crearUsuario();
        });
    }

});

// Función para limitar el rango de fechas válidas
function limitarRangoFechas() {
    const fechaInput = document.getElementById('txtFechaContratacion');
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
    document.getElementById('alertModalBodyRegistrarUsuario').innerText = mensaje;
    $('#alertModalRegistrarUsuario').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalRegistrarUsuario').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalRegistrarUsuario').on('hidden.bs.modal', function () {
        if (callback) {
            callback();
        }
    });
}

let vigilantesIds = [];

async function obtenerVigilantes() {
    try {
        const response = await fetch(`${window.env.BACKEND_URL}/api/vigilantes`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const vigilantes = await response.json();
            vigilantesIds = vigilantes.map(vigilante => vigilante.idVigilante);
        } else {
            console.error("Error al obtener los vigilantes");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Función para validar el formulario
function validarFormularioUsuario() {
    let esValido = true;
    const camposRequeridos = document.querySelectorAll('#formRegistrarUsuario [required]');

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

function validarFormularioVigilante() {
    let esValido = true;
    const camposRequeridos = document.querySelectorAll('#formRegistrarVigilante [required]');

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

function validarFormularioContrato() {
    let esValido = true;
    const camposRequeridos = document.querySelectorAll('#formRegistrarContrato [required]');

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

async function crearUsuario() {
    if (!validarFormularioUsuario()) {
        return;
    }

    let datosUsuario = {
        nombreUsuario: document.getElementById("txtNombre").value,
        apellidoUsuario: document.getElementById("txtApellido").value,
        username: document.getElementById("txtUser").value,
        password: document.getElementById("txtPass").value,
        rolUsuario: { id: document.getElementById("txtRol").value }
    };

    let repetirPasswordUsuario = document.getElementById("txtRepetirPass").value;
    if (repetirPasswordUsuario !== datosUsuario.password) {
        mostrarModal("La contraseña que escribiste es diferente.");
        return;
    }

    // Validar contraseña
    if (!validarContrasenia(datosUsuario.password)) {
        mostrarModal(
            "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial."
        );
        return;
    }

    let datosVigilante = {};
    let datosContrato = {};

    if (datosUsuario.rolUsuario.id === "3") {
        if (!validarFormularioVigilante()) {
            return;
        }

        datosVigilante = {
            idVigilante: document.getElementById("txtCodigo").value,
            edadVigilante: document.getElementById("txtEdad").value,
            estaContratadoVigilante: document.getElementById("txtEstaContratado").checked
        };

        const fechaContratoString = document.getElementById("txtFechaContratacion").value;
        const fechaContrato = new Date(fechaContratoString);

        if (datosVigilante.idVigilante < 1) {
            mostrarModal("Ingrese un código de vigilante válido.");
            return;
        }

        if (datosVigilante.edadVigilante < 18 || datosVigilante.edadVigilante > 65) {
            mostrarModal("Ingrese una edad válida.");
            return;
        }

        if (datosVigilante.estaContratadoVigilante) {
            if (!validarFormularioContrato()) {
                return;
            }

            limitarRangoFechas();

            if (fechaContrato < new Date('2024-01-01') || fechaContrato > new Date()) {
                mostrarModal("Fecha de contrato no válida. Debe estar entre 2024-01-01 y la fecha actual.");
                return;
            }
        }

        if (vigilantesIds.includes(Number(datosVigilante.idVigilante))) {
            mostrarModal("El código de vigilante ya existe.");
            return;
        }
    }

    try {
        const requestUsuario = await fetch(`${window.env.BACKEND_URL}/auth/alta`, {
            method: "POST",
            headers: {
                'Accept': "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosUsuario)
        });

        if (requestUsuario.ok) {
            const usuarioCreado = await requestUsuario.json();
            if (datosUsuario.rolUsuario.id === "3") {
                datosVigilante.usuario = usuarioCreado;

                const requestVigilante = await fetch(`${window.env.BACKEND_URL}/api/vigilantes`, {
                    method: "POST",
                    headers: {
                        'Accept': "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(datosVigilante)
                });

                if (requestVigilante.ok) {
                    const vigilanteCreado = await requestVigilante.json();

                    if (document.getElementById("txtEstaContratado").checked) {
                        const idSucursal = document.getElementById("txtSucursalVigilante").value;

                        datosContrato = {
                            fechaContrato: fechaContrato,
                            tieneArmaContrato: document.getElementById("txtTieneArma").checked,
                            vigilante: vigilanteCreado,
                            sucursal: { idSucursal: idSucursal }
                        };

                        const requestContrato = await fetch(`${window.env.BACKEND_URL}/api/contratos`, {
                            method: "POST",
                            headers: {
                                'Accept': "application/json",
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(datosContrato)
                        });

                        if (requestContrato.ok) {
                            mostrarModal("¡Vigilante creado con éxito!", function () {
                                window.location.href = 'usuarios.html';
                            });
                        } else {
                            mostrarModal("Error al crear el contrato.", function () {
                                window.location.href = 'usuarios.html';
                            });
                            await fetch(`${window.env.BACKEND_URL}/api/usuarios/${usuarioCreado.idUsuario}`, {
                                method: "DELETE",
                                headers: {
                                    'Accept': "application/json",
                                    "Content-Type": "application/json"
                                }
                            });
                            await fetch(`${window.env.BACKEND_URL}/api/vigilantes/${vigilanteCreado.idVigilante}`, {
                                method: "DELETE",
                                headers: {
                                    'Accept': "application/json",
                                    "Content-Type": "application/json"
                                }
                            });
                        }
                    } else {
                        mostrarModal("¡Vigilante creado con éxito!", function () {
                            window.location.href = 'usuarios.html';
                        });
                    }
                } else {
                    mostrarModal("Error al crear el vigilante.", function () {
                        window.location.href = 'usuarios.html';
                    });
                    await fetch(`${window.env.BACKEND_URL}/api/usuarios/${usuarioCreado.idUsuario}`, {
                        method: "DELETE",
                        headers: {
                            'Accept': "application/json",
                            "Content-Type": "application/json"
                        }
                    });
                }
            } else {
                mostrarModal("¡Usuario creado con éxito!", function () {
                    window.location.href = 'usuarios.html';
                });
            }
        } else {
            const errorText = await requestUsuario.text();
            console.error("Error:", errorText);
            mostrarModal("Error al crear el usuario.", function () {
                window.location.href = 'usuarios.html';
            });
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarModal("Error al registrar el usuario.", function () {
            window.location.href = 'usuarios.html';
        });
    }
}

async function cargarSucursales() {
    const response = await fetch(`${window.env.BACKEND_URL}/api/sucursales`, {
        method: "GET",
        headers: {
            'Accept': "application/json",
            "Content-Type": "application/json"
        }
    });

    if (response.ok) {
        const sucursales = await response.json();
        let select = document.getElementById("txtSucursalVigilante");

        // Limpiamos el select por si tiene opciones anteriores
        select.innerHTML =
            '<option value="" disabled selected>Seleccione la Sucursal</option>';

        if (sucursales.length > 0) {
            // Iteramos sobre las sucursales para crear las opciones
            sucursales.forEach((sucursal) => {
                let option = document.createElement("option");
                option.value = sucursal.idSucursal; // Asignamos el id de la sucursal como valor
                option.text = `${sucursal.entidad.nombreEntidad} - ${sucursal.nombreSucursal}`; // Mostramos el nombre de la sucursal
                select.appendChild(option);
            });
        } else {
            // Si no hay sucursales, deshabilitamos el botón de crear delincuente
            mostrarModal("No hay sucursales disponibles. No se puede registrar un vigilante con contrato.", function () {
                window.location.href = 'usuarios.html';
            });
        }
    } else {
        mostrarModal("Error al cargar las sucursales.", function () {
            window.location.href = 'usuarios.html';
        });
    }
}