$(document).ready(function () {
  cargarEntidades();
});

function mostrarModal(mensaje, callback) {
  document.getElementById("alertModalBodyRegistrarSucursal").innerText =
    mensaje;
  $("#alertModalRegistrarSucursal").modal("show");

  $("#alertModalRegistrarSucursal").off("hidden.bs.modal");
  $("#alertModalRegistrarSucursal").on("hidden.bs.modal", function () {
    if (callback) {
      callback();
    }
  });
}

function validarFormulario() {
  let esValido = true;
  const camposRequeridos = document.querySelectorAll(
    "#formRegistrarSucursal [required]"
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

async function crearSucursal() {
  if (!validarFormulario()) {
    return;
  }

  let datosSucursal = {};
  datosSucursal.nombreSucursal =
    document.getElementById("txtNombreSucursal").value;
  datosSucursal.domicilioSucursal = document.getElementById(
    "txtDomicilioSucursal"
  ).value;
  const nEmpleados = parseInt(
    document.getElementById("txtNEmpleadosSucursal").value
  );
  datosSucursal.nEmpleadosSucursal = nEmpleados;
  if (datosSucursal.nEmpleadosSucursal < 1) {
    mostrarModal("Por favor, ingrese un número válido de empleados.");
    return;
  }

  const idEntidad = document.getElementById("txtEntidadSucursal").value;

  datosSucursal.entidad = { idEntidad: idEntidad };
  const request = await fetch(`${window.env.BACKEND_URL}/api/sucursales`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datosSucursal),
  });
  if (request.ok) {
    mostrarModal("Sucursal registrada con éxito!", function () {
      window.location.href = "sucursales.html";
    });
  } else {
    mostrarModal("Error al registrar la sucursal.", function () {
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
    let select = document.getElementById("txtEntidadSucursal");
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
      // Si no hay entidades disponibles, mostrar mensaje y redirigir
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
