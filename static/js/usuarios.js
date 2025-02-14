// Call the dataTables jQuery plugin
$(document).ready(function () {
    cargarUsuarios();
    $("#usuarios").DataTable();
});

// Función para mostrar el modal de alerta
function mostrarModal(mensaje) {
    document.getElementById('alertModalBodyUsuarios').innerText = mensaje;
    $('#alertModalUsuarios').modal('show');
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

async function cargarUsuarios() {
    try {
        const rolUsuarioLogueado = await obtenerUsuarioLogueado();

        const response = await fetch(`${window.env.BACKEND_URL}/api/usuarios`, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        const usuarios = await response.json();
        const tableBody = document.querySelector("#usuarios tbody");
        let listadoHTML = "";

        usuarios.forEach((usuario) => {
            // Mostrar/ocultar botones según el rol
            const botonEliminar = `<a href="#" onclick="confirmarEliminarUsuario(${usuario.idUsuario})" class="btn btn-danger btn-circle col-sm-2 border" title="Eliminar usuario">
                                        <i class="fas fa-trash"></i>
                                   </a>`;
            const botonEditarUser = `<a href="editarUsuario.html?idUsuario=${usuario.idUsuario}" class="btn btn-warning btn-circle col-sm-2 border" title="Editar usuario">
                                        <i class="fa-solid fa-pencil"></i>
                                    </a>`;
            const botonEditarPassword = `<a href="editarContrasenia.html?idUsuario=${usuario.idUsuario}" class="btn btn-info btn-circle col-sm-2 border" title="Editar contraseña">
                                        <i class="fa-solid fa-key"></i>
                                    </a>`;

            // Asignación de botones solo para ADMINISTRADOR
            const accionesHTML = rolUsuarioLogueado === 1 ? `${botonEliminar} ${botonEditarUser} ${botonEditarPassword}` : "";

            const usuarioHTML = `<tr>
                    <td>${usuario.idUsuario}</td>
                    <td>${usuario.nombreUsuario} ${usuario.apellidoUsuario}</td>
                    <td>${usuario.username}</td>
                    <td>${usuario.rolUsuario.rolEnum}</td>
                    <td>${accionesHTML}</td> <!-- La columna de acciones, visible solo para admin -->
                </tr>`;
            listadoHTML += usuarioHTML;
        });

        if (tableBody) {
            tableBody.outerHTML = listadoHTML;
        }

        // Si el usuario logueado es INVESTIGADOR, ocultar agregar usuario y toda la columna de acciones
        if (rolUsuarioLogueado === 2) {
            document.getElementById("btnAgregarUsuario").style.display = "none";
            const actionsColumn = document.querySelectorAll("#usuarios th:nth-child(5), #usuarios td:nth-child(5)");
            actionsColumn.forEach((cell) => {
                cell.style.display = "none";
            });
        }
    } catch (error) {
        console.error("Error al cargar los usuarios:", error);
        mostrarModal("Ocurrió un error al cargar los usuarios.", function ()
        {
            window.location.href = 'usuarios.html';
        });
    }
}

function confirmarEliminarUsuario(idUsuario) {
    $('#confirmarEliminarModalUsuario').modal('show');
    document.getElementById('confirmarEliminarUsuario').onclick = function () {
        eliminarUsuario(idUsuario);
    };
}

async function eliminarUsuario(idUsuario) {
    try {
        const responseEliminarUsuario = await fetch(`${window.env.BACKEND_URL}/api/usuarios/eliminarCompleto/${idUsuario}`, {
            method: "DELETE",
            credentials: 'include',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (responseEliminarUsuario.ok) {
            location.reload();
        } else {
            mostrarModal("Error al eliminar el usuario.", function () {
                window.location.href = 'usuarios.html';
            });
        }
    } catch (error) {
        console.error("Error al eliminar el usuario y entidades asociadas:", error);
        mostrarModal("Ocurrió un error al intentar eliminar el usuario.", function () {
            window.location.href = 'usuarios.html';
        });
    }
}

