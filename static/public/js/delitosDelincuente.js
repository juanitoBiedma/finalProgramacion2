document.addEventListener("DOMContentLoaded", function () {
  cargarDelincuentes();
  cargarDelitos();
  document
    .getElementById("btnAsignarDelito")
    .addEventListener("click", mostrarModalConfirmacion);
  document
    .getElementById("confirmarAsignacionDelitosDelincuente")
    .addEventListener("click", asignarDelito);
  document
    .getElementById("confirmarDesvincularDelitosDelincuente")
    .addEventListener("click", desvincularDelito);
  $("#delitos").DataTable();
});

function mostrarModalConfirmacion() {
  $("#confirmarAsignacionModalDelitosDelincuente").modal("show");
}

function mostrarModal(mensaje, callback) {
  document.getElementById("alertModalBodyDelitosDelincuente").innerText =
    mensaje;
  $("#alertModalDelitosDelincuente").modal("show");

  $("#alertModalDelitosDelincuente").off("hidden.bs.modal");
  $("#alertModalDelitosDelincuente").on("hidden.bs.modal", function () {
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

async function cargarDelincuentes() {
  const urlParams = new URLSearchParams(window.location.search);
  const idDelincuente = urlParams.get("idDelincuente");

  if (!idDelincuente) {
    console.error("No se encontró el idDelincuente en la URL", function () {
      window.location.href = "delitosDelincuente.html";
    });
  }

  try {
    const response = await fetch(`${window.env.BACKEND_URL}/api/delincuentes`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener los datos de los delincuentes");
    }

    const delincuentes = await response.json();
    const delincuente = delincuentes.find(
      (d) => d.idDelincuente == idDelincuente
    );

    if (!delincuente) {
      console.error("No se encontró el delincuente con el id proporcionado");
      return;
    }

    await mostrarDelitos(delincuente.delitos);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function cargarDelitos() {
  const urlParams = new URLSearchParams(window.location.search);
  const idDelincuente = urlParams.get("idDelincuente");

  if (!idDelincuente) {
    console.error("No se encontró el idDelincuente en la URL", function () {
      window.location.href = "delitosDelincuente.html";
    });
  }

  try {
    const delincuenteResponse = await fetch(
      `${window.env.BACKEND_URL}/api/delincuentes/${idDelincuente}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!delincuenteResponse.ok) {
      throw new Error("Error al obtener los datos del delincuente");
    }

    const delincuente = await delincuenteResponse.json();
    const delitosDelincuente = delincuente.delitos.map(
      (delito) => delito.idDelito
    );

    const response = await fetch(`${window.env.BACKEND_URL}/api/delitos`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener los datos de los delitos");
    }

    const delitos = await response.json();
    let selectHTML =
      '<option value="" disabled selected>Seleccione el delito</option>';

    // Filtrar los delitos que ya están asignados al delincuente
    const delitosDisponibles = delitos.filter(
      (delito) => !delitosDelincuente.includes(delito.idDelito)
    );

    if (delitosDisponibles.length === 0) {
      selectHTML +=
        '<option value="" disabled>No hay delitos disponibles</option>';
    } else {
      delitosDisponibles.forEach((delito) => {
        const fechaDelito = new Date(delito.fechaDelito);
        const formattedDate = `${String(fechaDelito.getDate()).padStart(
          2,
          "0"
        )}/${String(fechaDelito.getMonth() + 1).padStart(
          2,
          "0"
        )}/${fechaDelito.getFullYear()}`;
        const optionHTML = `<option value="${delito.idDelito}">${delito.sucursal.entidad.nombreEntidad} - ${delito.sucursal.nombreSucursal} - ${formattedDate}</option>`;
        selectHTML += optionHTML;
      });
    }

    document.getElementById("txtDelitoDelincuente").innerHTML = selectHTML;
  } catch (error) {
    console.error("Error:", error);
  }
}

async function asignarDelito() {
  const idDelito = document.getElementById("txtDelitoDelincuente").value;
  const urlParams = new URLSearchParams(window.location.search);
  const idDelincuente = urlParams.get("idDelincuente");

  if (!idDelito || !idDelincuente) {
    console.error("No se encontró el idDelito o idDelincuente");
    return;
  }

  try {
    const response = await fetch(
      `${window.env.BACKEND_URL}/api/delincuentes/${idDelincuente}/asignarDelito`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idDelito }),
      }
    );

    if (!response.ok) {
      throw new Error("Error al asignar el delito al delincuente");
    }

    const delincuenteActualizado = await response.json();
    await mostrarDelitos(delincuenteActualizado.delitos);
    $("#confirmarAsignacionModalDelitosDelincuente").modal("hide");
    window.location.reload();
  } catch (error) {
    console.error("Error:", error);
  }
}

async function mostrarDelitos(delitos) {
  try {
    const rolUsuarioLogueado = await obtenerUsuarioLogueado();

    let listadoHTML = "";

    delitos.forEach((delito) => {
      const botonEliminar = `<a href="#" onclick="confirmarDesvincularDelito(${delito.idDelito})" class="btn btn-danger btn-circle col-sm-2 border" title="Desvincular delito">
                                        <i class="fas fa-trash"></i>
                                    </a>`;

      const accionesHTML = rolUsuarioLogueado === 1 ? `${botonEliminar}` : "";

      const fechaDelito = new Date(delito.fechaDelito);
      const formattedDate = `${String(fechaDelito.getDate()).padStart(
        2,
        "0"
      )}/${String(fechaDelito.getMonth() + 1).padStart(
        2,
        "0"
      )}/${fechaDelito.getFullYear()}`;

      const delitoHTML = `<tr>
                <td>${delito.idDelito}</td>
                <td>${formattedDate}</td>
                <td>${delito.sucursal.entidad.nombreEntidad}</td>
                <td>${delito.sucursal.nombreSucursal}</td>
                <td>${accionesHTML}</td> <!-- La columna de acciones, visible solo para admin -->
            </tr>`;
      listadoHTML += delitoHTML;
    });

    document.getElementById("tableBody").innerHTML = listadoHTML;

    // Si el usuario logueado es INVESTIGADOR, ocultar agregar usuario y toda la columna de acciones
    if (rolUsuarioLogueado === 2) {
      const actionsColumn = document.querySelectorAll(
        "#delitos th:nth-child(5), #delitos td:nth-child(5)"
      );
      actionsColumn.forEach((cell) => {
        cell.style.display = "none";
      });
    }
  } catch (error) {
    console.error("Error al cargar los delitos:", error);
  }
}

function confirmarDesvincularDelito(idDelito) {
  $("#confirmarDesvincularModalDelitosDelincuente").modal("show");
  document.getElementById("confirmarDesvincularDelitosDelincuente").onclick =
    function () {
      desvincularDelito(idDelito);
    };
}

async function desvincularDelito(idDelito) {
  const urlParams = new URLSearchParams(window.location.search);
  const idDelincuente = urlParams.get("idDelincuente");

  try {
    const response = await fetch(
      `${window.env.BACKEND_URL}/api/delincuentes/${idDelincuente}/${idDelito}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error al desvincular el delito");
    }

    window.location.reload();
  } catch (error) {
    mostrarModal(
      "Ocurrió un error al intentar desvincular al delincuente del delito.",
      function () {
        window.location.href = "delincuentes.html";
      }
    );
  }
}
