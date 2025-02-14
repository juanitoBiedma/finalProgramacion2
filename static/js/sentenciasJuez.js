// Call the dataTables jQuery plugin
$(document).ready(function () {
    cargarSentencias();
    $('#sentencias').DataTable();
});

// Función para mostrar el modal de alerta
function mostrarModal(mensaje, callback) {
    document.getElementById('alertModalBodySentencias').innerText = mensaje;
    $('#alertModalSentencias').modal('show');

    // Agregar evento al botón de cerrar del modal
    $('#alertModalSentencias').off('hidden.bs.modal'); // Eliminar cualquier evento previo para evitar duplicados
    $('#alertModalSentencias').on('hidden.bs.modal', function () {
        if (callback) {
            callback();
        }
    });
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
        const urlParams = new URLSearchParams(window.location.search);
        const idJuez = urlParams.get('idJuez');
        // const rolUsuarioLogueado = await obtenerUsuarioLogueado();

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
            const [year, month, day] = sentencia.delito.fechaDelito.split('-');
            const fechaDelito = new Date(year, month - 1, day);
            const formattedDate = `${String(fechaDelito.getDate()).padStart(2, '0')}/${String(fechaDelito.getMonth() + 1).padStart(2, '0')}/${fechaDelito.getFullYear()}`;

            let delitoHTML = `${sentencia.delito.sucursal.entidad.nombreEntidad} - ${sentencia.delito.sucursal.nombreSucursal} - ${formattedDate}`;
            if (sentencia.juez.idJuez == idJuez) {
                const sentenciaHTML =
                        `<tr>
                    <td>${sentencia.idSentencia}</td>
                    <td>${delitoHTML}</td>
                    <td>${sentencia.tiempoSentencia} años</td>
                </tr>`;

                listadoHTML += sentenciaHTML;
            }

        });

        tableBody.innerHTML = listadoHTML;

    } catch (error) {
        console.error("Error al cargar las sentencias:", error);
        mostrarModal("Ocurrió un error al cargar las sentencias.", function ()
        {
            window.location.href = 'jueces.html';
        });
    }
}