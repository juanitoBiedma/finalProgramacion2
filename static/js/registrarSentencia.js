// Call the functions when the page is ready
$(document).ready(function () {
    cargarDelitos();
    cargarJueces();
});

// Función para mostrar el modal de alerta
function mostrarModal(mensaje, callback) {
    document.getElementById('alertModalBodyRegistrarSentencia').innerText = mensaje;
    $('#alertModalRegistrarSentencia').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalRegistrarSentencia').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalRegistrarSentencia').on('hidden.bs.modal', function () {
        if (callback) {
            callback();
        }
    });
}

// Función para validar el formulario
function validarFormulario() {
    let esValido = true;
    const camposRequeridos = document.querySelectorAll('#formRegistrarSentencia [required]');

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

// Función para crear sentencia
async function crearSentencia() {
    if (!validarFormulario()) {
        return;
    }

    let datosSentencia = {};
    const tiempoSentencia = parseInt(document.getElementById('txtTiempoSentencia').value);
    datosSentencia.tiempoSentencia = tiempoSentencia;
    const idJuez = document.getElementById('txtJuezSentencia').value;
    const idDelito = document.getElementById('txtDelitoSentencia').value;

    if (datosSentencia.tiempoSentencia < 1) {
        mostrarModal("El tiempo de sentencia debe ser mayor a 0.");
        return;
    }

    datosSentencia.juez = {idJuez: idJuez};
    datosSentencia.delito = {idDelito: idDelito};

    const request = await fetch(`${window.env.BACKEND_URL}/api/sentencias`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosSentencia)
    });

    if (request.ok) {
        mostrarModal('Sentencia registrada con éxito!', function ()
        {
            window.location.href = 'sentencias.html';
        });
    } else {
        mostrarModal('Error al registrar la sentencia.', function ()
        {
            window.location.href = 'sentencias.html';
        });
    }
}

// Función para obtener delitos y cargarlos en el select
async function cargarDelitos() {
    const responseDelitos = await fetch(`${window.env.BACKEND_URL}/api/delitos`, {
        method: "GET",
        credentials: 'include',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        }
    });

    const responseSentencias = await fetch(`${window.env.BACKEND_URL}/api/sentencias`, {
        method: "GET",
        credentials: 'include',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        }
    });

    if (responseDelitos.ok && responseSentencias.ok) {
        const delitos = await responseDelitos.json();
        const sentencias = await responseSentencias.json();
        const selectDelitos = document.getElementById("txtDelitoSentencia");

        const delitosConSentencia = new Set(sentencias.map(sentencia => sentencia.delito.idDelito));

        if (delitos.length > 0) {
            delitos.forEach((delito) => {
                if (!delitosConSentencia.has(delito.idDelito)) {
                    const [year, month, day] = delito.fechaDelito.split('-');
                    const formattedDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
                    const option = document.createElement("option");
                    option.value = delito.idDelito;
                    option.text = `${delito.sucursal.entidad.nombreEntidad} - ${delito.sucursal.nombreSucursal} - ${formattedDate}`;
                    selectDelitos.appendChild(option);
                }
            });
        } else {
            mostrarModal("No hay delitos disponibles. No se puede registrar una sentencia.", function ()
        {
            window.location.href = 'sentencias.html';
        });
        }
    } else {
        mostrarModal("Error al cargar los delitos o sentencias.", function ()
        {
            window.location.href = 'sentencias.html';
        });
    }
}

// Función para obtener jueces y cargarlos en el select
async function cargarJueces() {
    const responseJueces = await fetch(`${window.env.BACKEND_URL}/api/jueces`, {
        method: "GET",
        credentials: 'include',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        }
    });

    if (responseJueces.ok) {
        const jueces = await responseJueces.json();
        const selectJueces = document.getElementById("txtJuezSentencia");
        if (jueces.length > 0) {
            jueces.forEach((juez) => {
                const option = document.createElement("option");
                option.value = juez.idJuez;
                option.text = `${juez.nombreJuez} ${juez.apellidoJuez}`;
                selectJueces.appendChild(option);
            });
        } else {
            mostrarModal("No hay jueces disponibles. No se puede registrar una sentencia.", function ()
        {
            window.location.href = 'sentencias.html';
        });
        }
    } else {
        mostrarModal("Error al cargar los jueces.", function ()
        {
            window.location.href = 'sentencias.html';
        });
    }
}