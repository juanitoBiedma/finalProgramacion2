$(document).ready(function () {
  cargarDatosEntidad();
});

function mostrarModal(mensaje, callback) {
  document.getElementById("alertModalBodyEditarEntidad").innerText = mensaje;
  $("#alertModalEditarEntidad").modal("show");

  $("#alertModalEditarEntidad").off("hidden.bs.modal");
  $("#alertModalEditarEntidad").on("hidden.bs.modal", function () {
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

async function cargarDatosEntidad() {
  const idEntidad = getQueryParam("idEntidad"); // Obtener el ID de la URL
  if (!idEntidad) {
    mostrarModal("No se ha proporcionado un ID de entidad", function () {
      window.location.href = "entidades.html";
    });
  }

  try {
    const responseEntidad = await fetch(
      `${window.env.BACKEND_URL}/api/entidades/${idEntidad}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (responseEntidad.ok) {
      const entidad = await responseEntidad.json();

      document.getElementById("txtEditarNombreEntidad").value =
        entidad.nombreEntidad;
      document.getElementById("txtEditarDomicilioEntidad").value =
        entidad.domicilioEntidad;
    } else {
      mostrarModal("Error al cargar los datos de la entidad", function () {
        window.location.href = "entidades.html";
      });
    }
  } catch (error) {
    console.error("Error al cargar la entidad:", error);
  }
}

function validarFormulario() {
  let esValido = true;
  const camposRequeridos = document.querySelectorAll(
    "#formEditarEntidad [required]"
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

async function editarEntidad() {
  if (!validarFormulario()) {
    return;
  }

  const idEntidad = getQueryParam("idEntidad"); // Obtener el ID de la URL

  const entidadEditada = {
    nombreEntidad: document.getElementById("txtEditarNombreEntidad").value,
    domicilioEntidad: document.getElementById("txtEditarDomicilioEntidad")
      .value,
  };

  const responseEntidad = await fetch(
    `${window.env.BACKEND_URL}/api/entidades/editarEntidad/${idEntidad}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entidadEditada),
    }
  );

  if (responseEntidad.ok) {
    mostrarModal("Entidad actualizada correctamente", function () {
      window.location.href = "entidades.html";
    });
  } else {
    mostrarModal("Error al actualizar la entidad", function () {
      window.location.href = "entidades.html";
    });
  }
}
