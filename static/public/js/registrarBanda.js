function validarFormulario() {
  let esValido = true;
  const camposRequeridos = document.querySelectorAll(
    "#formRegistrarBanda [required]"
  );

  camposRequeridos.forEach((campo) => {
    if (!campo.value.trim()) {
      campo.classList.add("is-invalid");
      esValido = false;
    } else {
      campo.classList.remove("is-invalid");
    }
  });
  return esValido;
}

function mostrarModal(mensaje, callback) {
  document.getElementById("alertModalBodyRegistrarBanda").innerText = mensaje;
  $("#alertModalRegistrarBanda").modal("show");

  $("#alertModalRegistrarBanda").off("hidden.bs.modal");
  $("#alertModalRegistrarBanda").on("hidden.bs.modal", function () {
    if (callback) {
      callback();
    }
  });
}

async function crearBanda() {
  if (!validarFormulario()) {
    return;
  }

  let datosBanda = {};

  datosBanda.nombreBanda = document.getElementById("txtNombreBanda").value;
  datosBanda.nMiembrosBanda =
    document.getElementById("txtNMiembrosBanda").value;

  if (datosBanda.nMiembrosBanda < 1) {
    mostrarModal("Por favor, ingrese un número válido de miembros.");
    return;
  }

  const request = await fetch(`${window.env.BACKEND_URL}/api/bandas`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datosBanda),
  });

  if (request.ok) {
    mostrarModal("Banda registrada con éxito.", function () {
      window.location.href = "bandas.html";
    });
  } else {
    mostrarModal("Error al registrar la banda.", function () {
      window.location.href = "bandas.html";
    });
  }
}
