// Call the dataTables jQuery plugin
$(document).ready(function () {
    cargarDelincuentes();
    cargarSentencias();
    $('#delincuentes').DataTable();
});

// Función para mostrar el modal de alerta
function mostrarModal(mensaje) {
    document.getElementById('alertModalBodyDelincuentes').innerText = mensaje;
    $('#alertModalDelincuentes').modal('show');
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

let sentencias = [];

async function cargarSentencias() {
    try {
        const response = await fetch(`${window.env.BACKEND_URL}/api/sentencias`, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            sentencias = await response.json();
        } else {
            console.error("Error al cargar las sentencias");
        }
    } catch (error) {
        console.error("Error al cargar las sentencias:", error);
    }
}

async function cargarDelincuentes() {
    try {
        const rolUsuarioLogueado = await obtenerUsuarioLogueado();

        const response = await fetch(`${window.env.BACKEND_URL}/api/delincuentes`, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            mostrarModal("Error al obtener los delincuentes", function () {
                window.location.href = 'delincuentes.html';
            });
        }

        const delincuentes = await response.json();
        const tableBody = document.querySelector('#delincuentes tbody');
        let listadoHTML = '';

        delincuentes.forEach(delincuente => {
            // Mostrar/ocultar botones según el rol
            const botonEliminar = `<a href="#" onclick="confirmarEliminarDelincuente(${delincuente.idDelincuente})" class="btn btn-danger btn-circle col-sm-2 border" title="Eliminar delincuente">
                                        <i class="fas fa-trash"></i>
                                   </a>`;
            const botonEditarDelincuente = `<a href="editarDelincuente.html?idDelincuente=${delincuente.idDelincuente}" class="btn btn-warning btn-circle col-sm-2 border" title="Editar delincuente">
                                        <i class="fa-solid fa-pencil"></i>
                                    </a>`;
            const botonDelitos = `<a href="delitosDelincuente.html?idDelincuente=${delincuente.idDelincuente}" class="btn btn-info btn-circle col-sm-2 border" title="Delitos">
                                        <i class="fa-solid fa-file-lines"></i>
                                    </a>`;
            // Asignación de botones solo para ADMINISTRADOR
            const accionesHTML = (rolUsuarioLogueado === 1) ? `${botonEliminar} ${botonEditarDelincuente} ${botonDelitos}` : '';

            // Concatenar la información de todos los delitos
            let delitosHTML = '';
            if (delincuente.delitos.length > 0) {
                delincuente.delitos.forEach(delito => {
                    const nombreEntidad = delito.sucursal.entidad.nombreEntidad;
                    const nombreSucursal = delito.sucursal.nombreSucursal;

                    const fechaDelito = new Date(delito.fechaDelito);
                    const formattedDate = `${String(fechaDelito.getDate()).padStart(2, '0')}/${String(fechaDelito.getMonth() + 1).padStart(2, '0')}/${fechaDelito.getFullYear()}`;

                    // Buscar la sentencia correspondiente al delito
                    const sentencia = sentencias.find(s => s.delito.idDelito === delito.idDelito);
                    const tiempoSentencia = sentencia ? `${sentencia.tiempoSentencia} años` : 'sin condena';

                    delitosHTML += `${nombreEntidad} - ${nombreSucursal} - ${formattedDate} (${tiempoSentencia})<br>`;

                });
            } else {
                delitosHTML = 'N/A';
            }

            const delincuenteHTML =
                `<tr>
                    <td>${delincuente.idDelincuente}</td>
                    <td>${delincuente.nombreDelincuente} ${delincuente.apellidoDelincuente}</td>
                    <td>${delincuente.banda ? delincuente.banda.nombreBanda : 'Sin banda'}</td>
                    <td>${delitosHTML}</td>
                    <td>${accionesHTML}</td> <!-- La columna de acciones, visible solo para admin -->
                </tr>`;
            listadoHTML += delincuenteHTML;
        });

        tableBody.innerHTML = listadoHTML;

        // Si el usuario logueado es INVESTIGADOR, ocultar agregar usuario y toda la columna de acciones
        if (rolUsuarioLogueado === 2) {
            document.getElementById('btnAgregarDelincuente').style.display = 'none';
            const actionsColumn = document.querySelectorAll('#delincuentes th:nth-child(5), #delincuentes td:nth-child(5)');
            actionsColumn.forEach(cell => {
                cell.style.display = 'none';
            });
        }
    } catch (error) {
        console.error("Error al cargar los delincuentes:", error);
    }

}

function confirmarEliminarDelincuente(idDelincuente) {
    $('#confirmarEliminarModalDelincuente').modal('show');
    document.getElementById('confirmarEliminarDelincuente').onclick = function () {
        eliminarDelincuente(idDelincuente);
    };
}

async function eliminarDelincuente(idDelincuente) {
    try {
        // Obtener al delincuente
        const responseDelincuente = await fetch(`${window.env.BACKEND_URL}/api/delincuentes/${idDelincuente}`, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (responseDelincuente.ok) {
            // Eliminar al delincuente
            const responseEliminarDelincuente = await fetch(`${window.env.BACKEND_URL}/api/delincuentes/${idDelincuente}`, {
                method: "DELETE",
                credentials: 'include',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });

            if (!responseEliminarDelincuente.ok) {
                mostrarModal("Error al eliminar al delincuente.", function () {
                    window.location.href = 'delincuentes.html';
                });
                return;
            }

            location.reload();
        } else {
            mostrarModal("Error al obtener el delincuente.", function () {
                window.location.href = 'delincuentes.html';
            });
        }
    } catch (error) {
        console.error("Error al eliminar al delincuente:", error);
        mostrarModal("Ocurrió un error al intentar eliminar al delincuente.", function () {
            window.location.href = 'delincuentes.html';
        });
    }
}