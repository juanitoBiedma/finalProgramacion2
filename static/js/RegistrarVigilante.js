// Call the dataTables jQuery plugin
$(document).ready(function () {
    limitarRangoFechas();
    obtenerVigilantes();

    const estaContratadoVigilante = document.getElementById("txtEstaContratadoVigilante");
    if (estaContratadoVigilante) {
        document.getElementById("txtEstaContratadoVigilante").addEventListener("change", function () {
            cargarSucursales();

            const sucursalvigilanteFieldsVigilante = document.getElementById("sucursalvigilanteFieldsVigilante");
            const contratoFieldsVigilante = document.getElementById("contratoFieldsVigilante");
            if (this.checked === true) {
                sucursalvigilanteFieldsVigilante.style.display = "block";
                contratoFieldsVigilante.style.display = "block";
            } else {
                sucursalvigilanteFieldsVigilante.style.display = "none";
                contratoFieldsVigilante.style.display = "none";
            }
        });
    }

    const btnRegistrarVigilante = document.getElementById("btnRegistrarVigilante");
    if (btnRegistrarVigilante) {
        btnRegistrarVigilante.addEventListener("click", function () {
            registrarVigilante();
        });
    }
});

// Función para limitar el rango de fechas válidas
function limitarRangoFechas() {
    const fechaInput = document.getElementById('txtFechaContratacionVigilante');
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
    document.getElementById('alertModalBodyRegistrarVigilante').innerText = mensaje;
    $('#alertModalRegistrarVigilante').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalRegistrarVigilante').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalRegistrarVigilante').on('hidden.bs.modal', function () {
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
            credentials: 'include',
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
function validarFormularioVigilante() {
    let esValido = true;
    const camposRequeridos = document.querySelectorAll('#formRegistrarVigilanteVigilante [required]');

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
    const camposRequeridos = document.querySelectorAll('#formRegistrarVigilanteContrato [required]');

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

// Función para crear el vigilante
async function registrarVigilante() {
    if (!validarFormularioVigilante()) {
        return;
    }

    let datosUsuario = {
        nombreUsuario: document.getElementById("txtNombreVigilante").value,
        apellidoUsuario: document.getElementById("txtApellidoVigilante").value,
        username: document.getElementById("txtUserVigilante").value,
        password: document.getElementById("txtPassVigilante").value,
        rolUsuario: {id: 3}
    };

    let repetirPasswordUsuarioVigilante = document.getElementById("txtRepetirPassVigilante").value;
    if (repetirPasswordUsuarioVigilante !== datosUsuario.password) {
        mostrarModal("La contraseña que escribiste es diferente.");
        return;
    }

    // Validar contraseña
    if (!validarContrasenia(datosUsuario.password)) {
        mostrarModal(
          "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial."
        );
       // return;
      }

    let datosVigilante = {
        idVigilante: document.getElementById("txtCodigoVigilante").value,
        edadVigilante: document.getElementById("txtEdadVigilante").value,
        estaContratadoVigilante: document.getElementById("txtEstaContratadoVigilante").checked
    };

    if (datosVigilante.idVigilante < 1) {
        mostrarModal("Ingrese un código de vigilante válido.");
        return;
    }

    if (datosVigilante.edadVigilante < 18 || datosVigilante.edadVigilante > 65) {
        mostrarModal("Ingrese una edad válida.");
        return;
    }

    const fechaContratoString = document.getElementById("txtFechaContratacionVigilante").value;
    const fechaContrato = new Date(fechaContratoString);
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
        mostrarModal("El código de vigilante ya existe. Por favor, ingrese un código diferente.");
        return;
    }

    try {
        const requestUsuario = await fetch(`${window.env.BACKEND_URL}/auth/alta`, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosUsuario)
        });

        if (requestUsuario.ok) {
            const usuarioCreado = await requestUsuario.json();
            datosVigilante.usuario = usuarioCreado;

            const requestVigilante = await fetch(`${window.env.BACKEND_URL}/api/vigilantes`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Accept': "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosVigilante)
            });

            if (requestVigilante.ok) {
                const vigilanteCreado = await requestVigilante.json();

                if (document.getElementById("txtEstaContratadoVigilante").checked) {
                    const idSucursal = document.getElementById("txtSucursalVigilanteVigilante").value;

                    let datosContrato = {
                        fechaContrato: fechaContrato,
                        tieneArmaContrato: document.getElementById("txtTieneArmaVigilante").checked,
                        vigilante: vigilanteCreado,
                        sucursal: {idSucursal: idSucursal}
                    };

                    const requestContrato = await fetch(`${window.env.BACKEND_URL}/api/contratos`, {
                        method: "POST",
                        credentials: 'include',
                        headers: {
                            'Accept': "application/json",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(datosContrato)
                    });

                    if (requestContrato.ok) {
                        mostrarModal("¡Vigilante creado con éxito!", function () {
                            window.location.href = 'vigilantes.html';
                        });
                    } else {
                        mostrarModal("Error al crear el contrato.", function () {
                            window.location.href = 'vigilantes.html';
                        });
                        await fetch(`${window.env.BACKEND_URL}/api/usuarios/${usuarioCreado.idUsuario}`, {
                            method: "DELETE",
                            credentials: 'include',
                            headers: {
                                'Accept': "application/json",
                                "Content-Type": "application/json"
                            }
                        });
                        await fetch(`${window.env.BACKEND_URL}/api/vigilantes/${vigilanteCreado.idVigilante}`, {
                            method: "DELETE",
                            credentials: 'include',
                            headers: {
                                'Accept': "application/json",
                                "Content-Type": "application/json"
                            }
                        });
                    }
                }
                mostrarModal("¡Vigilante creado con éxito!", function () {
                    window.location.href = 'vigilantes.html';
                });
            } else {
                mostrarModal("Error al crear el vigilante.", function () {
                    window.location.href = 'vigilantes.html';
                });
                await fetch(`${window.env.BACKEND_URL}/api/usuarios/${usuarioCreado.idUsuario}`, {
                    method: "DELETE",
                    credentials: 'include',
                    headers: {
                        'Accept': "application/json",
                        "Content-Type": "application/json"
                    }
                });
            }
        } else {
            mostrarModal("Error al crear el usuario.", function () {
                window.location.href = 'vigilantes.html';
            });
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarModal("Error al registrar el vigilante.", function () {
            window.location.href = 'vigilantes.html';
        });
    }
}

async function cargarSucursales() {
    const response = await fetch(`${window.env.BACKEND_URL}/api/sucursales`, {
        method: "GET",
        credentials: 'include',
        headers: {
            'Accept': "application/json",
            "Content-Type": "application/json"
        }
    });

    if (response.ok) {
        const sucursales = await response.json();
        let select = document.getElementById("txtSucursalVigilanteVigilante");

        // Limpiamos el select por si tiene opciones anteriores
        select.innerHTML = '<option value="" disabled selected>Seleccione la Sucursal</option>';

        if (sucursales.length > 0) {
            // Iteramos sobre las sucursales para crear las opciones
            sucursales.forEach((sucursal) => {
                let option = document.createElement("option");
                option.value = sucursal.idSucursal; // Asignamos el id de la sucursal como valor
                option.text = `${sucursal.entidad.nombreEntidad} - ${sucursal.nombreSucursal}`; // Mostramos el nombre de la sucursal
                select.appendChild(option);
            });
        } else {
            mostrarModal("No hay sucursales disponibles. No se puede registrar un vigilante con contrato.", function ()
            {
                window.location.href = 'vigilantes.html';
            });
        }
    } else {
        mostrarModal("Error al cargar las sucursales.", function ()
        {
            window.location.href = 'vigilantes.html';
        });
    }
}