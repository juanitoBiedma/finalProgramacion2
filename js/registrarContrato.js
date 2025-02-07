// Call the functions when the page is ready
$(document).ready(function () {
    cargarSucursales();
    obtenerContratos();
    limitarRangoFechas();
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btnVolver').addEventListener('click', function () {
        const urlParams = new URLSearchParams(window.location.search);
        const idVigilante = urlParams.get('idVigilante');
        if (idVigilante) {
            window.location.href = `contratosVigilante.html?idVigilante=${idVigilante}`;
        } else {
            console.error('No se encontró el idVigilante en la URL');
        }
    });
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
    document.getElementById('alertModalBodyRegistrarContrato').innerText = mensaje;
    $('#alertModalRegistrarContrato').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalRegistrarContrato').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalRegistrarContrato').on('hidden.bs.modal', function () {
        if (callback) {
            callback();
        }
    });
}

// Función para validar el formulario
function validarFormulario() {
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

let contratosFechas = [];

async function obtenerContratos() {
    try {
        const response = await fetch("/api/contratos", {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const contratos = await response.json();
            contratosFechas = contratos.map(contrato => contrato.fechaContrato);
        } else {
            console.error("Error al obtener los contratos");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Función para crear contrato
async function crearContrato() {
    if (!validarFormulario()) {
        return;
    }

    let datosContrato = {};
    let vigilante = null;

    const urlParams = new URLSearchParams(window.location.search);
    const idVigilante = urlParams.get('idVigilante');

    const vigilanteResponse = await fetch(`/api/vigilantes/${idVigilante}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    });

    if (vigilanteResponse.ok) {
        vigilante = await vigilanteResponse.json();
        datosContrato.vigilante = vigilante;
    } else {
        mostrarModal("Error al obtener los datos del vigilante.", function () {
            window.location.href = `contratosVigilante.html?idVigilante=${idVigilante}`;
        });
        return;
    }

    const idSucursal = document.getElementById('txtSucursalContrato').value;
    if (!idSucursal) {
        mostrarModal("Debe seleccionar una sucursal.", function () {});
        return;
    }

    // Enviar solo los id de la sucursal si está seleccionada
    datosContrato.sucursal = { idSucursal: idSucursal };

    let fechaContrato = document.getElementById('txtFechaContratacionVigilante').value;
    let fechaDuplicada = false;

    if (fechaContrato) {
        contratosFechas.forEach(fecha => {
            if (fecha === fechaContrato) {
                fechaDuplicada = true;
            }
        });
    }

    if (fechaDuplicada) {
        mostrarModal("Ya hay un contrato registrado con la fecha ingresada.", function () {
            return;
        });
    } else {
        datosContrato.fechaContrato = fechaContrato;
        datosContrato.tieneArmaContrato = document.getElementById("txtTieneArmaVigilante").checked ? true : false;

        try {
            const request = await fetch('/api/contratos', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosContrato)
            });

            if (request.ok) {
                // Actualizar el estado del vigilante
                vigilante.estaContratadoVigilante = true;
                await fetch(`/api/vigilantes/editarVigilante/${vigilante.idVigilante}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(vigilante)
                });

                mostrarModal("Contrato registrado con éxito.", function () {
                    window.location.href = `contratosVigilante.html?idVigilante=${idVigilante}`;
                });
            } else {
                const errorText = await request.text();
                mostrarModal("Error al registrar el contrato: " + errorText, function () {
                    window.location.href = `contratosVigilante.html?idVigilante=${idVigilante}`;
                });
            }
        } catch (error) {
            mostrarModal("Error al registrar el contrato: " + error.message, function () {
                window.location.href = `contratosVigilante.html?idVigilante=${idVigilante}`;
            });
        }
    }
}

// Función para cargar sucursales
async function cargarSucursales() {
    const urlParams = new URLSearchParams(window.location.search);
    const idVigilante = urlParams.get('idVigilante');

    const response = await fetch('/api/sucursales', {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const sucursales = await response.json();
        let select = document.getElementById('txtSucursalContrato');

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
            mostrarModal("No hay sucursales disponibles. No se puede registrar un contrato.", function () {
                window.location.href = `contratosVigilante.html?idVigilante=${idVigilante}`;
            });
        }
    } else {
        mostrarModal("Error al cargar las sucursales.", function () {
            window.location.href = `contratosVigilante.html?idVigilante=${idVigilante}`;
        });
    }
}