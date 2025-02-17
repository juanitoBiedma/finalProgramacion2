$(document).ready(function () {
  cargarjueces();
  $("#jueces").DataTable();
});

function mostrarModal(mensaje) {
  document.getElementById("alertModalBodyJueces").innerText = mensaje;
  $("#alertModalJueces").modal("show");
}

async function obtenerUsuarioLogueado() {
  try {
    const response = await fetch(
      `${window.env.BACKEND_URL}/auth/usuario-logueado`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    if (response.ok) {
      const data = await response.json();

      return data.rolUsuario.id;
    }
    throw new Error("Error al obtener el usuario logueado");
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

async function cargarjueces() {
  try {
    const rolUsuarioLogueado = await obtenerUsuarioLogueado();

    const response = await fetch(`${window.env.BACKEND_URL}/api/jueces`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const jueces = await response.json();
    const tableBody = document.querySelector("#jueces tbody");
    let listadoHTML = "";

    jueces.forEach((juez) => {
      // Mostrar/ocultar botones según el rol
      const botonEliminar = `<a href='#' onclick='confirmarEliminarJuez(${juez.idJuez})' class='btn btn-danger btn-circle col-sm-2 border' title='Eliminar Juez'>
                                        <i class='fas fa-trash'></i>
                                   </a>`;
      const botonEditarJuez = `<a href='editarJuez.html?idJuez=${juez.idJuez}' class='btn btn-warning btn-circle col-sm-2 border' title='Editar Juez'>
                                        <i class='fa-solid fa-pencil'></i>
                                    </a>`;
      const botonSentencias = `<a href="sentenciasJuez.html?idJuez=${juez.idJuez}" class="btn btn-info btn-circle col-sm-2 border" title="Sentencias">
                                        <i class="fa-solid fa-file-lines"></i>
                                    </a>`;

      // Asignación de botones solo para ADMINISTRADOR
      const accionesHTML =
        rolUsuarioLogueado === 1
          ? `${botonEliminar} ${botonEditarJuez} ${botonSentencias}`
          : `${botonSentencias}`;

      const juezHTML = `<tr>
                    <td>${juez.idJuez}</td>
                    <td>${juez.nombreJuez} ${juez.apellidoJuez}</td>
                    <td>${juez.aniosServicioJuez}</td>
                    <td>${accionesHTML}</td> <!-- La columna de acciones, visible solo para admin -->
                </tr>`;
      listadoHTML += juezHTML;
    });

    tableBody.outerHTML = listadoHTML;

    // Si el usuario logueado es INVESTIGADOR, ocultar agregar usuario y toda la columna de acciones

    if (rolUsuarioLogueado === 2) {
      document.getElementById("btnAgregarJuez").style.display = "none";
    }
  } catch (error) {
    console.error("Error al cargar los jueces:", error);
  }
}

function confirmarEliminarJuez(idJuez) {
  $("#confirmarEliminarModalJuez").modal("show");
  document.getElementById("confirmarEliminarJuez").onclick = function () {
    eliminarJuez(idJuez);
  };
}

async function eliminarJuez(idJuez) {
  try {
    const responseJuez = await fetch(
      `${window.env.BACKEND_URL}/api/jueces/${idJuez}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (responseJuez.ok) {
      const responseEliminarJuez = await fetch(
        `${window.env.BACKEND_URL}/api/jueces/${idJuez}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!responseEliminarJuez.ok) {
        mostrarModal("Error al eliminar el juez.");
        return;
      }

      location.reload();
    } else {
      mostrarModal("Error al obtener el juez.");
    }
  } catch (error) {
    console.error("Error al eliminar el juez:", error);
    mostrarModal("Ocurrió un error al intentar eliminar el juez.");
  }
}
