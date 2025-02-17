$(document).ready(function () {
  cargarDatosDelincuente();
  cargarBandas();

  document
    .getElementById("txtEditarBandaDelincuente")
    .addEventListener("change", function () {
      bandaSeleccionada = this.value;
    });
});

function mostrarModal(mensaje, callback) {
  document.getElementById("alertModalBodyEditarDelincuente").innerText =
    mensaje;
  $("#alertModalEditarDelincuente").modal("show");

  $("#alertModalEditarDelincuente").off("hidden.bs.modal");
  $("#alertModalEditarDelincuente").on("hidden.bs.modal", function () {
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

async function cargarDatosDelincuente() {
  const idDelincuente = getQueryParam("idDelincuente"); // Obtener el ID de la URL
  if (!idDelincuente) {
    mostrarModal("No se ha proporcionado un ID de delincuente", function () {
      window.location.href = "delincuentes.html";
    });
  }

  try {
    const responseDelincuente = await fetch(
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

    if (responseDelincuente.ok) {
      const delincuente = await responseDelincuente.json();
      await cargarBandas();

      document.getElementById("txtEditarNombreDelincuente").value =
        delincuente.nombreDelincuente;
      document.getElementById("txtEditarApellidoDelincuente").value =
        delincuente.apellidoDelincuente;
      if (delincuente.banda) {
        document.getElementById("txtEditarBandaDelincuente").value =
          delincuente.banda.idBanda;
        bandaSeleccionada = delincuente.banda.idBanda;
      } else {
        bandaSeleccionada = null;
      }
    } else {
      mostrarModal("Error al cargar los datos del delincuente", function () {
        window.location.href = "delincuentes.html";
      });
    }
  } catch (error) {
    console.error("Error al cargar al delincuente:", error);
  }
}

function validarFormulario() {
  let esValido = true;
  const camposRequeridos = document.querySelectorAll(
    "#formEditarDelincuente [required]"
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

async function editarDelincuente() {
  if (!validarFormulario()) {
    return;
  }
  const idDelincuente = getQueryParam("idDelincuente"); // Obtener el ID de la URL
  if (!idDelincuente) {
    console.error("ID de delincuente no encontrado en la URL");
    return;
  }

  try {
    const responseDelincuente = await fetch(
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

    if (!responseDelincuente.ok) {
      mostrarModal(
        "Error al cargar los actuales datos del delincuente",
        function () {
          window.location.href = "delincuentes.html";
        }
      );
    }

    const delincuenteActual = await responseDelincuente.json();

    const delincuenteEditado = {
      nombreDelincuente: document.getElementById("txtEditarNombreDelincuente")
        .value,
      apellidoDelincuente: document.getElementById(
        "txtEditarApellidoDelincuente"
      ).value,
      delitos: delincuenteActual.delitos,
      banda: bandaSeleccionada
        ? { idBanda: bandaSeleccionada }
        : delincuenteActual.banda,
    };

    const responseDelincuenteEditado = await fetch(
      `${window.env.BACKEND_URL}/api/delincuentes/editarDelincuente/${idDelincuente}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(delincuenteEditado),
      }
    );

    if (responseDelincuenteEditado.ok) {
      mostrarModal("Delincuente actualizado correctamente", function () {
        window.location.href = "delincuentes.html";
      });
    } else {
      mostrarModal("Error al actualizar al delincuente", function () {
        window.location.href = "delincuentes.html";
      });
    }
  } catch (error) {
    mostrarModal("Error al actualizar el delincuente: " + error, function () {
      window.location.href = "delincuentes.html";
    });
  }
}

async function cargarBandas() {
  const response = await fetch(`${window.env.BACKEND_URL}/api/bandas`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const bandas = await response.json();
    let select = document.getElementById("txtEditarBandaDelincuente");

    select.innerHTML =
      '<option value="" disabled selected>Seleccione la banda</option>';

    if (bandas.length > 0) {
      bandas.forEach((banda) => {
        let option = document.createElement("option");
        option.value = banda.idBanda;
        option.text = banda.nombreBanda;
        select.appendChild(option);
      });
    }
  } else {
    mostrarModal("Error al cargar las bandas.", function () {
      window.location.href = "delincuentes.html";
    });
  }
}
