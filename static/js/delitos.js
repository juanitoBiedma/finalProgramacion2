// Call the dataTables jQuery plugin
$(document).ready(function () {
    cargarDelitos();
    $('#delitos').DataTable();
});

function mostrarModal(mensaje) {
    document.getElementById('alertModalBodyDelitos').innerText = mensaje;
    $('#alertModalDelitos').modal('show');
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

async function cargarDelitos() {
    try {
        const rolUsuarioLogueado = await obtenerUsuarioLogueado();

        const response = await fetch(`${window.env.BACKEND_URL}/api/delitos`, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        const delitos = await response.json();

        const tableBody = document.querySelector('#delitos tbody');

        let listadoHTML = '';

        delitos.forEach(delito => {
            // Mostrar/ocultar botones según el rol
            const botonEliminar = `<a href="#" onclick="confirmarEliminarDelito(${delito.idDelito})" class="btn btn-danger btn-circle col-sm-2 border" title="Eliminar delito">
                                        <i class="fas fa-trash"></i>
                                   </a>`;
            const botonEditarDelito = `<a href="editarDelito.html?idDelito=${delito.idDelito}" class="btn btn-warning btn-circle col-sm-2 border" title="Editar delito">
                                        <i class="fa-solid fa-pencil"></i>
                                    </a>`;

            // Asignación de botones solo para ADMINISTRADOR
            const accionesHTML = (rolUsuarioLogueado === 1) ? `${botonEliminar} ${botonEditarDelito}` : '';

            const [year, month, day] = delito.fechaDelito.split('-');
            const fechaDelito = new Date(year, month - 1, day);
            const formattedDate = `${String(fechaDelito.getDate()).padStart(2, '0')}/${String(fechaDelito.getMonth() + 1).padStart(2, '0')}/${fechaDelito.getFullYear()}`;

            const delitoHTML =
                    `<tr>
                    <td>${delito.idDelito}</td>
                    <td>${formattedDate}</td>
                    <td>${delito.sucursal.entidad.nombreEntidad}</td>
                    <td>${delito.sucursal.nombreSucursal}</td>
                    <td>${accionesHTML}</td> <!-- La columna de acciones, visible solo para admin -->
                </tr>`;
            listadoHTML += delitoHTML;
        });

        tableBody.innerHTML = listadoHTML;

        // Si el usuario logueado es INVESTIGADOR, ocultar agregar usuario y toda la columna de acciones
        if (rolUsuarioLogueado === 2) {
            document.getElementById('btnAgregarDelito').style.display = 'none';
            const actionsColumn = document.querySelectorAll('#delitos th:nth-child(5), #delitos td:nth-child(5)');
            actionsColumn.forEach(cell => {
                cell.style.display = 'none';
            });
        }
    } catch (error) {
        console.error("Error al cargar los delitos:", error);
    }
}

// Función para mostrar el modal de confirmación de eliminación
function confirmarEliminarDelito(idDelito) {
    $('#confirmarEliminarModal').modal('show');
    document.getElementById('confirmarEliminar').onclick = function () {
        eliminarDelito(idDelito);
    };
}

// Función para eliminar un delito
async function eliminarDelito(idDelito) {
    try {
        const response = await fetch(`${window.env.BACKEND_URL}/api/delitos/${idDelito}`, {
            method: "DELETE",
            credentials: 'include',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            mostrarModal("Error al eliminar el delito", function ()
        {
            window.location.href = 'delitos.html';
        });
        }

        // Recargar la lista de delitos o actualizar la UI según sea necesario
        location.reload();
    } catch (error) {
        console.error("Error al eliminar el delito:", error);
        mostrarModal("Ocurrió un error al intentar eliminar el delito.", function ()
        {
            window.location.href = 'delitos.html';
        });
    }
}