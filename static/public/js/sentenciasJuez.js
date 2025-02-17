$(document).ready(function () {
  cargarSentencias();
  $("#sentencias").DataTable();
});

function mostrarModal(mensaje, callback) {
  document.getElementById("alertModalBodySentencias").innerText = mensaje;
  $("#alertModalSentencias").modal("show");

  $("#alertModalSentencias").off("hidden.bs.modal");
  $("#alertModalSentencias").on("hidden.bs.modal", function () {
    if (callback) {
      callback();
    }
  });
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

async function cargarSentencias() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const idJuez = urlParams.get("idJuez");

    const response = await fetch(`${window.env.BACKEND_URL}/api/sentencias`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const sentencias = await response.json();
    const tableBody = document.querySelector("#sentencias tbody");

    let listadoHTML = "";

    sentencias.forEach((sentencia) => {
      const fechaDelito = new Date(sentencia.delito.fechaDelito);
      const formattedDate = `${String(fechaDelito.getDate()).padStart(
        2,
        "0"
      )}/${String(fechaDelito.getMonth() + 1).padStart(
        2,
        "0"
      )}/${fechaDelito.getFullYear()}`;

      let delitoHTML = `${sentencia.delito.sucursal.entidad.nombreEntidad} - ${sentencia.delito.sucursal.nombreSucursal} - ${formattedDate}`;
      if (sentencia.juez.idJuez == idJuez) {
        const sentenciaHTML = `<tr>
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
    mostrarModal("Ocurrió un error al cargar las sentencias.", function () {
      window.location.href = "jueces.html";
    });
  }
}
