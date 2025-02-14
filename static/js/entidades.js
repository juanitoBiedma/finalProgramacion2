// Call the dataTables jQuery plugin
$(document).ready(function () {
    cargarEntidades();
    $('#entidades').DataTable();
});

// Función para mostrar el modal de alerta
function mostrarModal(mensaje) {
    document.getElementById('alertModalBodyEntidades').innerText = mensaje;
    $('#alertModalEntidades').modal('show');
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

async function cargarEntidades() {
    try {
        const rolUsuarioLogueado = await obtenerUsuarioLogueado();

        const response = await fetch(`${window.env.BACKEND_URL}/api/entidades`, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        const entidades = await response.json();
        const tableBody = document.querySelector('#entidades tbody');
        let listadoHTML = '';

        entidades.forEach(entidad => {
            // Mostrar/ocultar botones según el rol
            const botonEliminar = `<a href="#" onclick="confirmarEliminarEntidad(${entidad.idEntidad})" class="btn btn-danger btn-circle col-sm-2 border" title="Eliminar entidad">
                                        <i class="fas fa-trash"></i>
                                   </a>`;
            const botonEditarEntidad = `<a href="editarEntidad.html?idEntidad=${entidad.idEntidad}" class="btn btn-warning btn-circle col-sm-2 border" title="Editar entidad">
                                        <i class="fa-solid fa-pencil"></i>
                                    </a>`;

            // Asignación de botones solo para ADMINISTRADOR
            const accionesHTML = (rolUsuarioLogueado === 1) ? `${botonEliminar} ${botonEditarEntidad}` : '';

            const entidadHTML =
                    `<tr>
                    <td>${entidad.idEntidad}</td>
                    <td>${entidad.nombreEntidad}</td>
                    <td>${entidad.domicilioEntidad}</td>
                    <td>${accionesHTML}</td> <!-- La columna de acciones, visible solo para admin -->
                </tr>`;
            listadoHTML += entidadHTML;
        });

        tableBody.outerHTML = listadoHTML;

        // Si el usuario logueado es INVESTIGADOR, ocultar agregar usuario y toda la columna de acciones
        if (rolUsuarioLogueado === 2) {
            document.getElementById('btnAgregarEntidad').style.display = 'none';
            const actionsColumn = document.querySelectorAll('#entidades th:nth-child(4), #entidades td:nth-child(4)');
            actionsColumn.forEach(cell => {
                cell.style.display = 'none';
            });
        }
    } catch (error) {
        console.error("Error al cargar las entidades:", error);
    }
}

function confirmarEliminarEntidad(idEntidad) {
    $('#confirmarEliminarModalEntidad').modal('show');
    document.getElementById('confirmarEliminarEntidad').onclick = function () {
        eliminarEntidad(idEntidad);
    };
}

async function eliminarEntidad(idEntidad) {
    try {
        // Obtener la entidad
        const responseEntidad = await fetch(`${window.env.BACKEND_URL}/api/entidades/${idEntidad}`, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (responseEntidad.ok) {
            // Eliminar la entidad
            const responseEliminarEntidad = await fetch(`${window.env.BACKEND_URL}/api/entidades/${idEntidad}`, {
                method: "DELETE",
                credentials: 'include',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });

            if (!responseEliminarEntidad.ok) {
                mostrarModal("Error al eliminar la entidad.");
                return;
            }

            location.reload();
        } else {
            mostrarModal("Error al obtener la entidad.");
        }
    } catch (error) {
        console.error("Error al eliminar la entidad:", error);
        mostrarModal("Ocurrió un error al intentar eliminar la entidad.");
    }
}