// Call the dataTables jQuery plugin
$(document).ready(function () {
    cargarBandas();
    $("#bandas").DataTable();
});

// Función para mostrar el modal de alerta
function mostrarModal(mensaje) {
    document.getElementById('alertModalBodyBandas').innerText = mensaje;
    $('#alertModalBandas').modal('show');
}

async function obtenerUsuarioLogueado() {
    try {
        const response = await fetch("/auth/usuario-logueado", {
            method: "GET",
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

async function cargarBandas() {
    try {
        const rolUsuarioLogueado = await obtenerUsuarioLogueado();

        const response = await fetch("http://190.210.32.29:8080/api/bandas", {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        const bandas = await response.json();
        const tableBody = document.querySelector("#bandas tbody");
        let listadoHTML = "";

        bandas.forEach((banda) => {
            // Mostrar/ocultar botones según el rol
            const botonEliminar = `<a href="#" onclick="confirmarEliminarBanda(${banda.idBanda})" class="btn btn-danger btn-circle col-sm-2 border" title="Eliminar banda">
                                        <i class="fas fa-trash"></i>
                                   </a>`;
            const botonEditarBanda = `<a href="editarBanda.html?idBanda=${banda.idBanda}" class="btn btn-warning btn-circle col-sm-2 border" title="Editar banda">
                                        <i class="fa-solid fa-pencil"></i>
                                    </a>`;

            // Asignación de botones solo para ADMINISTRADOR
            const accionesHTML =
                rolUsuarioLogueado === 1 ? `${botonEliminar} ${botonEditarBanda}` : "";

            const bandaHTML = `<tr>
                    <td>${banda.idBanda}</td>
                    <td>${banda.nombreBanda}</td>
                    <td>${banda.nMiembrosBanda}</td>
                    <td>${accionesHTML}</td> <!-- La columna de acciones, visible solo para admin -->
                </tr>`;
            listadoHTML += bandaHTML;
        });

        tableBody.outerHTML = listadoHTML;

        // Si el usuario logueado es INVESTIGADOR, ocultar agregar usuario y toda la columna de acciones
        if (rolUsuarioLogueado === 2) {
            document.getElementById("btnAgregarBanda").style.display = "none";
            const actionsColumn = document.querySelectorAll(
                "#bandas th:nth-child(4), #bandas td:nth-child(4)"
            );
            actionsColumn.forEach((cell) => {
                cell.style.display = "none";
            });
        }
    } catch (error) {
        console.error("Error al cargar las bandas:", error);
    }
}

function confirmarEliminarBanda(idBanda) {
    $('#confirmarEliminarModalBanda').modal('show');
    document.getElementById('confirmarEliminarBanda').onclick = function () {
        eliminarBanda(idBanda);
    };
}

async function eliminarBanda(idBanda) {
    try {
        // Obtener la banda
        const responseBanda = await fetch(`http://190.210.32.29:8080/api/bandas/${idBanda}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (responseBanda.ok) {
            // Eliminar la banda
            const responseEliminarBanda = await fetch(`http://190.210.32.29:8080/api/bandas/${idBanda}`, {
                method: "DELETE",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });

            if (!responseEliminarBanda.ok) {
                mostrarModal("Error al eliminar la banda.", function () {
                    window.location.href = 'bandas.html';
                });
            }
        } else {
            mostrarModal("Error al obtener la banda.", function () {
                window.location.href = 'bandas.html';
            });
        }
        window.location.href = 'bandas.html';
    } catch (error) {
        console.error("Error al eliminar la banda:", error);
        mostrarModal("Ocurrió un error al intentar eliminar la banda.", function () {
            window.location.href = 'bandas.html';
        });
    }
}