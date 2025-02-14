// Call the dataTables jQuery plugin
$(document).ready(function () {
    cargarSentencias();
    $('#sentencias').DataTable();
});

// Función para mostrar el modal de alerta
function mostrarModal(mensaje) {
    document.getElementById('alertModalBodySentencias').innerText = mensaje;
    $('#alertModalSentencias').modal('show');
}

async function obtenerUsuarioLogueado() {
    try {
        const response = await fetch(`${window.env.BACKEND_URL}/auth/usuario-logueado`, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });
        if (response.ok) {
            const data = await response.json();
            // Devuelve el id del rol
            return data.rolUsuario.id;
        }
        throw new Error("Error al obtener el usuario logueado");
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

async function cargarSentencias() {
    try {
        const rolUsuarioLogueado = await obtenerUsuarioLogueado();

        const response = await fetch(`${window.env.BACKEND_URL}/api/sentencias`, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        const sentencias = await response.json();
        const tableBody = document.querySelector('#sentencias tbody');
        let listadoHTML = '';

        sentencias.forEach((sentencia) => {
            // Mostrar/ocultar botones según el rol
            const botonEliminar = `<a href='#' onclick='confirmarEliminarSentencia(${sentencia.idSentencia})' class='btn btn-danger btn-circle col-sm-2 border' title='Eliminar Sentencia'>
                                        <i class='fas fa-trash'></i>
                                   </a>`;
            const botonEditarSentencia = `<a href='editarSentencia.html?idSentencia=${sentencia.idSentencia}' class='btn btn-warning btn-circle col-sm-2 border' title='Editar Sentencia'>
                                        <i class='fa-solid fa-pencil'></i>
                                    </a>`;

            // Asignación de botones solo para ADMINISTRADOR
            const accionesHTML = rolUsuarioLogueado === 1 ? `${botonEliminar} ${botonEditarSentencia}` : '';

            let delitoHTML = `${sentencia.delito.sucursal.entidad.nombreEntidad} - ${sentencia.delito.sucursal.nombreSucursal}`;
            const sentenciaHTML = `<tr>
                    <td>${sentencia.idSentencia}</td>
                    <td>${sentencia.tiempoSentencia} años</td>
                    <td>${delitoHTML}</td>
                    <td>${sentencia.juez.nombreJuez} ${sentencia.juez.apellidoJuez}</td>
                    <td>${accionesHTML}</td> <!-- La columna de acciones, visible solo para admin -->
                </tr>`;
            listadoHTML += sentenciaHTML;
        });

        tableBody.innerHTML = listadoHTML;

        // Si el usuario logueado es INVESTIGADOR, ocultar agregar usuario y toda la columna de acciones
        if (rolUsuarioLogueado === 2) {
            document.getElementById('btnAgregarSentencia').style.display = 'none';
            const actionsColumn = document.querySelectorAll('#sentencias th:nth-child(5), #sentencias td:nth-child(5)');
            actionsColumn.forEach((cell) => {
                cell.style.display = 'none';
            });
        }
    } catch (error) {
        console.error("Error al cargar las sentencias:", error);
        mostrarModal("Ocurrió un error al cargar las sentencias.");
    }
}

function confirmarEliminarSentencia(idSentencia) {
    $('#confirmarEliminarModalSentencia').modal('show');
    document.getElementById('confirmarEliminarSentencia').onclick = function () {
        eliminarSentencia(idSentencia);
    };
}

async function eliminarSentencia(idSentencia) {
    try {
        // Obtener la sentencia
        const responseSentencia = await fetch(`${window.env.BACKEND_URL}/api/sentencias/${idSentencia}`, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (responseSentencia.ok) {
            // Eliminar la sentencia
            const responseEliminarSentencia = await fetch(`${window.env.BACKEND_URL}/api/sentencias/${idSentencia}`, {
                method: "DELETE",
                credentials: 'include',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });

            if (!responseEliminarSentencia.ok) {
                mostrarModal("Error al eliminar la sentencia.");
                return;
            }

            location.reload();
        } else {
            mostrarModal("Error al obtener la sentencia.");
        }
    } catch (error) {
        console.error("Error al eliminar la sentencia:", error);
        mostrarModal("Ocurrió un error al intentar eliminar la sentencia.");
    }
}