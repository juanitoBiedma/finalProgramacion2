$(document).ready(function () {
  cargarDatosSucursal();
  cargarEntidades();
});

function mostrarModal(mensaje, callback) {
  document.getElementById("alertModalBodyEditarSucursal").innerText = mensaje;
  $("#alertModalEditarSucursal").modal("show");

  $("#alertModalEditarSucursal").off("hidden.bs.modal");
  $("#alertModalEditarSucursal").on("hidden.bs.modal", function () {
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

async function cargarDatosSucursal() {
  const idSucursal = getQueryParam("idSucursal"); // Obtener el ID de la URL
  if (!idSucursal) {
    mostrarModal("No se ha proporcionado un ID de sucursal", function () {
      window.location.href = "sucursales.html";
    });
  }

  try {
    const responseSucursal = await fetch(
      `${window.env.BACKEND_URL}/api/sucursales/${idSucursal}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (responseSucursal.ok) {
      const sucursal = await responseSucursal.json();

      document.getElementById("txtEditarNombreSucursal").value =
        sucursal.nombreSucursal;
      document.getElementById("txtEditarDomicilioSucursal").value =
        sucursal.domicilioSucursal;
      document.getElementById("txtEditarNEmpleadosSucursal").value =
        sucursal.nEmpleadosSucursal;
      document.getElementById("txtEditarEntidadSucursal").value =
        sucursal.entidad.nombreEntidad;
    } else {
      mostrarModal("Error al cargar los datos de la sucursal", function () {
        window.location.href = "sucursales.html";
      });
    }
  } catch (error) {
    console.error("Error al cargar la sucursal:", error);
  }
}

function validarFormulario() {
  let esValido = true;
  const camposRequeridos = document.querySelectorAll(
    "#formEditarSucursal [required]"
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

async function editarSucursal() {
  if (!validarFormulario()) {
    return;
  }

  const idSucursal = getQueryParam("idSucursal"); // Obtener el ID de la URL

  const sucursalEditada = {
    nombreSucursal: document.getElementById("txtEditarNombreSucursal").value,
    domicilioSucursal: document.getElementById("txtEditarDomicilioSucursal")
      .value,
    nEmpleadosSucursal: document.getElementById("txtEditarNEmpleadosSucursal")
      .value,
    entidad: {
      idEntidad: document.getElementById("txtEditarEntidadSucursal").value,
    },
  };

  if (sucursalEditada.nEmpleadosSucursal < 1) {
    mostrarModal("Por favor, ingrese un número válido de empleados.");
    return;
  }

  const responseSucursal = await fetch(
    `${window.env.BACKEND_URL}/api/sucursales/editarSucursal/${idSucursal}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sucursalEditada),
    }
  );

  if (responseSucursal.ok) {
    mostrarModal("Sucursal actualizada correctamente", function () {
      window.location.href = "sucursales.html";
    });
  } else {
    mostrarModal("Error al actualizar la sucursal", function () {
      window.location.href = "sucursales.html";
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
          window.location.href = "sucursales.html";
        }
      );
    }
  } else {
    mostrarModal("Error al cargar las entidades.", function () {
      window.location.href = "sucursales.html";
    });
  }
}
