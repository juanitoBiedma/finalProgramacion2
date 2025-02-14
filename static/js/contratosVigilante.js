document.addEventListener('DOMContentLoaded', function () {
    cargarVigilantes();
    mostrarContratos();

    fetch(`${window.env.BACKEND_URL}/auth/usuario-logueado`)
        .then(response => response.json())
        .then(data => {
            // 2 = Usuario investigador
            if (data.rolUsuario.id !== 2) {
                document.getElementById('btnAsignarContrato').classList.remove('d-none');
            }
        })
        .catch(error => console.error('Error al obtener el rol del usuario:', error));

    document.getElementById('btnAsignarContrato').addEventListener('click', function () {
        const urlParams = new URLSearchParams(window.location.search);
        const idVigilante = urlParams.get('idVigilante');
        if (idVigilante) {
            window.location.href = `registrarContrato.html?idVigilante=${idVigilante}`;
        } else {
            console.error('No se encontró el idVigilante en la URL');
        }
    });
    document.getElementById('confirmarAsignacionContratosVigilante').addEventListener('click', asignarContrato);
    $('#contratos').DataTable();
});

function mostrarModalConfirmacion() {
    $('#confirmarAsignacionModalContratosVigilante').modal('show');
}

async function obtenerUsuarioLogueado() {
    try {
        const response = await fetch(`${window.env.BACKEND_URL}/auth/usuario-logueado`, {
            method: "GET",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const data = await response.json();

            // Devuelve el id del rol
            return data.rolUsuario.id;
        }
        throw new Error('Error al obtener el usuario logueado');
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function cargarVigilantes() {
    const urlParams = new URLSearchParams(window.location.search);
    const idVigilante = urlParams.get('idVigilante');

    if (!idVigilante) {
        console.error('No se encontró el idVigilante en la URL');
        return;
    }

    try {
        const response = await fetch(`${window.env.BACKEND_URL}/api/vigilantes`, {
            method: "GET",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los datos de los vigilantes');
        }

        const vigilantes = await response.json();
        const vigilante = vigilantes.find(d => d.idVigilante == idVigilante);

        if (!vigilante) {
            console.error('No se encontró el vigilante con el id proporcionado');
            return;
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

async function asignarContrato() {
    const idContrato = document.getElementById('txtContratoVigilante').value;
    const urlParams = new URLSearchParams(window.location.search);
    const idVigilante = urlParams.get('idVigilante');

    if (!idContrato || !idVigilante) {
        console.error('No se encontró el idContrato o idVigilante');
        return;
    }

    try {
        const response = await fetch(`${window.env.BACKEND_URL}/api/vigilantes/${idVigilante}/asignarContrato`, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({idContrato})
        });

        if (!response.ok) {
            throw new Error('Error al asignar el contrato al vigilante');
        }

        const vigilanteActualizado = await response.json();
        $('#confirmarAsignacionModalContratosVigilante').modal('hide');
        window.location.reload();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function mostrarContratos() {
    const urlParams = new URLSearchParams(window.location.search);
    const idVigilante = urlParams.get('idVigilante');

    // Obtener todos los contratos
    const response = await fetch(`${window.env.BACKEND_URL}/api/contratos`, {
        method: "GET",
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });

    const contratos = await response.json();

    try {
        const rolUsuarioLogueado = await obtenerUsuarioLogueado();

        let listadoHTML = '';

        contratos.forEach(contrato => {
            const botonEliminar = `<a href="#" onclick="confirmarEliminarContrato(${contrato.idContrato})" class="btn btn-danger btn-circle col-sm-2 border" title="Eliminar contrato">
                                        <i class="fas fa-trash"></i>
                                    </a>`;

            const accionesHTML = (rolUsuarioLogueado === 1) ? `${botonEliminar}` : '';

            const [year, month, day] = contrato.fechaContrato.split('-');
            const fechaContrato = new Date(year, month - 1, day);
            const formattedDate = `${String(fechaContrato.getDate()).padStart(2, '0')}/${String(fechaContrato.getMonth() + 1).padStart(2, '0')}/${fechaContrato.getFullYear()}`;

            const contratoHTML =
                    `<tr>
                <td>${contrato.idContrato}</td>
                <td>${formattedDate}</td>
                <td>${contrato.sucursal.entidad.nombreEntidad} - ${contrato.sucursal.nombreSucursal}</td>
                <td>${contrato.tieneArmaContrato ? 'Sí' : 'No'}</td>
                <td>${accionesHTML}</td> <!-- La columna de acciones, visible solo para admin -->
            </tr>`;

            if (contrato.vigilante.idVigilante == idVigilante) {
                listadoHTML += contratoHTML;
            }
        });

        document.getElementById('tableBody').innerHTML = listadoHTML;

        // Si el usuario logueado es INVESTIGADOR, ocultar agregar usuario y toda la columna de acciones
        if (rolUsuarioLogueado === 2) {
            const actionsColumn = document.querySelectorAll('#contratos th:nth-child(5), #contratos td:nth-child(5)');
            actionsColumn.forEach(cell => {
                cell.style.display = 'none';
            });
        }
    } catch (error) {
        console.error("Error al cargar los contratos:", error);
    }
}

// Función para mostrar el modal de confirmación de eliminación de contrato
function confirmarEliminarContrato(idContrato) {
    $('#confirmarDesvincularModalContratosVigilante').modal('show');
    document.getElementById('confirmarEliminarContratosVigilante').onclick = function () {
        eliminarContrato(idContrato);
    };
}

// Función para eliminar un contrato
async function eliminarContrato(idContrato) {
    if (typeof idContrato !== 'string' && typeof idContrato !== 'number') {
        console.error('idContrato debe ser un string o un número');
        return;
    }

    try {
        const response = await fetch(`${window.env.BACKEND_URL}/api/contratos/${idContrato}`, {
            method: "DELETE",
            credentials: 'include',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Error al eliminar el contrato");
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            const idVigilante = urlParams.get('idVigilante');


            const responseContrato = await fetch(`${window.env.BACKEND_URL}/api/contratos`, {
                method: "GET",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            const contratos = await responseContrato.json();

            const responseVigilante = await fetch(`${window.env.BACKEND_URL}/api/vigilantes/${idVigilante}`, {
                method: "GET",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!responseVigilante.ok) {
                throw new Error('Error al obtener los datos de los vigilantes');
            } else {
                const vigilante = await responseVigilante.json();
                let flagEstaContratado = false;

                contratos.forEach((contrato) => {
                    if (contrato.vigilante.idVigilante == idVigilante) {
                        flagEstaContratado = true;
                    }
                });

                if (!flagEstaContratado) {
                    vigilante.estaContratadoVigilante = false;

                    const responsePatchVigilante = await fetch(`${window.env.BACKEND_URL}/api/vigilantes/editarVigilante/${idVigilante}`, {
                        method: "PATCH",
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(vigilante)
                    });

                    if (!responsePatchVigilante.ok) {
                        throw new Error("Ocurrió un error al intentar actualizar el vigilante.");
                    }
                }
            }
        }

        // Recargar la lista de contratos o actualizar la UI según sea necesario
        //window.location.reload();
    } catch (error) {
        mostrarModal("Ocurrió un error al intentar eliminar el contrato.", function () {
            window.location.href = 'vigilantes.html';
        });
    }
}

function mostrarModal(mensaje, callback) {
    document.getElementById('alertModalBodyContratoVigilante').innerText = mensaje;
    $('#alertModalContratoVigilante').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalContratoVigilante').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalContratoVigilante').on('hidden.bs.modal', function () {
        if (callback) {
            callback();
        }
    });
}