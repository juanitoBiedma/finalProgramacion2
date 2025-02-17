$(document).ready(function () {
  cargarDatosBanda();
  cargarEntidades();
});

function mostrarModal(mensaje, callback) {
  document.getElementById("alertModalBodyEditarBanda").innerText = mensaje;
  $("#alertModalEditarBanda").modal("show");

  $("#alertModalEditarBanda").off("hidden.bs.modal");
  $("#alertModalEditarBanda").on("hidden.bs.modal", function () {
    if (callback) {
      callback();
    }
  });
}

// Función para obtener parámetros de la URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

async function cargarDatosBanda() {
  const idBanda = getQueryParam("idBanda"); // Obtener el ID de la URL
  if (!idBanda) {
    mostrarModal("No se ha proporcionado un ID de banda", function () {
      window.location.href = "bandas.html";
    });
  }

  try {
    const responseBanda = await fetch(
      `${window.env.BACKEND_URL}/api/bandas/${idBanda}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (responseBanda.ok) {
      const banda = await responseBanda.json();

      document.getElementById("txtEditarNombreBanda").value = banda.nombreBanda;
      document.getElementById("txtEditarNMiembrosBanda").value =
        banda.nMiembrosBanda;
    } else {
      mostrarModal("Error al cargar los datos de la banda", function () {
        window.location.href = "bandas.html";
      });
    }
  } catch (error) {
    console.error("Error al cargar la banda:", error);
  }
}

function validarFormulario() {
  let esValido = true;
  const camposRequeridos = document.querySelectorAll(
    "#formEditarBanda [required]"
  );

  camposRequeridos.forEach((campo) => {
    if (!campo.value) {
      campo.classList.add("is-invalid");
      esValido = false;
    } else {
      campo.classList.remove("is-invalid");
    }
  });

  return esValido;
}

async function editarBanda() {
  if (!validarFormulario()) {
    return;
  }

  const idBanda = getQueryParam("idBanda"); // Obtener el ID de la URL

  const bandaEditada = {
    nombreBanda: document.getElementById("txtEditarNombreBanda").value,
    nMiembrosBanda: document.getElementById("txtEditarNMiembrosBanda").value,
  };

  if (bandaEditada.nMiembrosBanda < 1) {
    mostrarModal("Por favor, ingrese un número válido de miembros.");
    return;
  }

  const responseBanda = await fetch(
    `${window.env.BACKEND_URL}/api/bandas/editarBanda/${idBanda}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bandaEditada),
    }
  );

  if (responseBanda.ok) {
    mostrarModal("Banda actualizada correctamente", function () {
      window.location.href = "bandas.html";
    });
  } else {
    mostrarModal("Error al actualizar la banda", function () {
      window.location.href = "bandas.html";
    });
  }
}

async function cargarEntidades() {
  const response = await fetch(`${window.env.BACKEND_URL}/api/entidades`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const entidades = await response.json();
    let select = document.getElementById("txtEditarEntidadSucursal");

    select.innerHTML =
      '<option value="" disabled selected>Seleccione la Entidad</option>';

    if (entidades.length > 0) {
      entidades.forEach((entidad) => {
        let option = document.createElement("option");
        option.value = entidad.idEntidad;
        option.text = entidad.nombreEntidad;
        select.appendChild(option);
      });
    } else {
      mostrarModal(
        "No hay entidades disponibles. No se puede registrar una sucursal.",
        function () {
          window.location.href = "bandas.html";
        }
      );
    }
  } else {
    mostrarModal("Error al cargar las entidades.", function () {
      window.location.href = "bandas.html";
    });
  }
}
