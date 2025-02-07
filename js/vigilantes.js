// Call the dataTables jQuery plugin
$(document).ready(function () {
    cargarVigilantes();
    $('#vigilantes').DataTable();
});
// Función para mostrar el modal de alerta
function mostrarModal(mensaje) {
    document.getElementById('alertModalBodyVigilantes').innerText = mensaje;
    $('#alertModalVigilantes').modal('show');
}

async function obtenerUsuarioLogueado() {
    try {
        const response = await fetch("/auth/usuario-logueado", {
            method: "GET",
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
        throw new Error("Error al obtener el usuario logueado");
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

async function cargarVigilantes() {
    try {
        const rolUsuarioLogueado = await obtenerUsuarioLogueado();
        const response = await fetch("http://190.210.32.29:8080/api/vigilantes", {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });
        const vigilantes = await response.json();
        const tableBody = document.querySelector('#vigilantes tbody');
        let listadoHTML = '';
        vigilantes.forEach(vigilante => {
            // Mostrar/ocultar botones según el rol
            const botonEliminar = `<a href="#" onclick="confirmarEliminarVigilante(${vigilante.usuario.idUsuario})" class="btn btn-danger btn-circle col-sm-2 border" title="Eliminar vigilante">
                                        <i class="fas fa-trash"></i>
                                   </a>`;
            const botonEditarVigilante = `<a href="editarVigilante.html?idUsuario=${vigilante.usuario.idUsuario}" class="btn btn-warning btn-circle col-sm-2 border" title="Editar vigilante">
                                        <i class="fa-solid fa-pencil"></i>
                                    </a>`;
            const botonContratos = `<a href="contratosVigilante.html?idVigilante=${vigilante.idVigilante}" class="btn btn-info btn-circle col-sm-2 border" title="Contratos">
                                        <i class="fa-solid fa-file-lines"></i>
                                    </a>`;

            // Asignación de botones solo para ADMINISTRADOR
            const accionesHTML = (rolUsuarioLogueado === 1) ? `${botonEliminar} ${botonEditarVigilante} ${botonContratos}` : `${botonContratos}`;
            const vigilanteHTML =
                `<tr>
                    <td>${vigilante.idVigilante}</td>
                    <td>${vigilante.usuario.nombreUsuario} ${vigilante.usuario.apellidoUsuario}</td>
                    <td>${vigilante.usuario.username}</td>
                    <td>${vigilante.edadVigilante}</td>
                    <td>${vigilante.estaContratadoVigilante ? 'Sí' : 'No'}</td>
                    <td>${accionesHTML}</td> <!-- La columna de acciones, visible solo para admin -->
                </tr>`;
            listadoHTML += vigilanteHTML;
        });
        tableBody.outerHTML = listadoHTML;
        // Si el usuario logueado es INVESTIGADOR, ocultar agregar usuario y toda la columna de acciones
        if (rolUsuarioLogueado === 2) {
            document.getElementById('btnAgregarVigilante').style.display = 'none';
            /* 
            const actionsColumn = document.querySelectorAll('#vigilantes th:nth-child(6), #vigilantes td:nth-child(6)');
            actionsColumn.forEach(cell => {
                cell.style.display = 'none';
            });
             */
        }
    } catch (error) {
        console.error("Error al cargar los vigilantes:", error);
        mostrarModal("Ocurrió un error al cargar los vigilantes.", function ()
        {
            window.location.href = 'vigilantes.html';
        });
    }
}

function confirmarEliminarVigilante(idVigilante) {
    $('#confirmarEliminarModalVigilante').modal('show');
    document.getElementById('confirmarEliminarVigilante').onclick = function () {
        eliminarVigilante(idVigilante);
    };
}

async function eliminarVigilante(idUsuario) {
    try {
        // Llamada al backend para eliminar el vigilante, contrato y usuario
        const responseEliminarVigilante = await fetch(`http://190.210.32.29:8080/api/vigilantes/eliminarCompleto/${idUsuario}`, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (responseEliminarVigilante.ok) {
            location.reload();
        } else {
            mostrarModal("Error al eliminar el vigilante y entidades asociadas.", function () {
                window.location.href = 'vigilantes.html';
            });
        }
    } catch (error) {
        console.error("Error al eliminar el Vigilante y entidades asociadas:", error);
        mostrarModal("Ocurrió un error al intentar eliminar el Vigilante.", function () {
            window.location.href = 'vigilantes.html';
        });
    }
}