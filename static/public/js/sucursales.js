// Call the dataTables jQuery plugin
$(document).ready(function () {
    cargarSucursales();
    $('#sucursales').DataTable();
});

// Función para mostrar el modal de alerta
function mostrarModal(mensaje) {
    document.getElementById('alertModalBodySucursales').innerText = mensaje;
    $('#alertModalSucursales').modal('show');
}

async function obtenerUsuarioLogueado() {
    try {
        const response = await fetch(`${window.env.BACKEND_URL}/auth/usuario-logueado`, {
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

async function cargarSucursales() {
    try {
        const rolUsuarioLogueado = await obtenerUsuarioLogueado();

        const response = await fetch(`${window.env.BACKEND_URL}/api/sucursales`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        const sucursales = await response.json();
        const tableBody = document.querySelector('#sucursales tbody');
        let listadoHTML = '';

        sucursales.forEach(sucursal => {
            // Mostrar/ocultar botones según el rol
            const botonEliminar = `<a href="#" onclick="confirmarEliminarSucursal(${sucursal.idSucursal})" class="btn btn-danger btn-circle col-sm-2 border" title="Eliminar sucursal">
                                        <i class="fas fa-trash"></i>
                                   </a>`;
            const botonEditarSucursal = `<a href="editarSucursal.html?idSucursal=${sucursal.idSucursal}" class="btn btn-warning btn-circle col-sm-2 border" title="Editar sucursal">
                                        <i class="fa-solid fa-pencil"></i>
                                    </a>`;

            // Asignación de botones solo para ADMINISTRADOR
            const accionesHTML = (rolUsuarioLogueado === 1) ? `${botonEliminar} ${botonEditarSucursal}` : '';

            const sucursalHTML =
                    `<tr>
                    <td>${sucursal.idSucursal}</td>
                    <td>${sucursal.nombreSucursal}</td>
                    <td>${sucursal.domicilioSucursal}</td>
                    <td>${sucursal.nEmpleadosSucursal}</td>
                    <td>${sucursal.entidad.nombreEntidad}</td>                    
                    <td>${accionesHTML}</td> <!-- La columna de acciones, visible solo para admin -->
                </tr>`;
            listadoHTML += sucursalHTML;
        });

        tableBody.outerHTML = listadoHTML;

        // Si el usuario logueado es INVESTIGADOR, ocultar agregar usuario y toda la columna de acciones
        if (rolUsuarioLogueado === 2) {
            document.getElementById('btnAgregarSucursal').style.display = 'none';
            const actionsColumn = document.querySelectorAll('#sucursales th:nth-child(6), #sucursales td:nth-child(6)');
            actionsColumn.forEach(cell => {
                cell.style.display = 'none';
            });
        }
    } catch (error) {
        console.error("Error al cargar las sucursales:", error);
        mostrarModal("Ocurrió un error al cargar las sucursales.");
    }
}

function confirmarEliminarSucursal(idSucursal) {
    $('#confirmarEliminarModalSucursal').modal('show');
    document.getElementById('confirmarEliminarSucursal').onclick = function () {
        eliminarSucursal(idSucursal);
    };
}

async function eliminarSucursal(idSucursal) {
    try {
        // Obtener la sucursal
        const responseSucursal = await fetch(`${window.env.BACKEND_URL}/api/sucursales/${idSucursal}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (responseSucursal.ok) {
            // Eliminar la sucursal
            const responseEliminarSucursal = await fetch(`${window.env.BACKEND_URL}/api/sucursales/${idSucursal}`, {
                method: "DELETE",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });

            if (!responseEliminarSucursal.ok) {
                mostrarModal("Error al eliminar la sucursal.");
                return;
            }

            location.reload();
        } else {
            mostrarModal("Error al obtener la sucursal.");
        }
    } catch (error) {
        console.error("Error al eliminar la sucursal:", error);
        mostrarModal("Ocurrió un error al intentar eliminar la sucursal.");
    }
}