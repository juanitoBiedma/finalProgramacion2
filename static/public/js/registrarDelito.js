$(document).ready(function () {
  cargarSucursales();
  limitarRangoFechas();
});

function limitarRangoFechas() {
  const fechaInput = document.getElementById("txtFechaDelito");
  const hoy = new Date();
  const añoActual = hoy.getFullYear();
  const mesActual = String(hoy.getMonth() + 1).padStart(2, "0");
  const diaActual = String(hoy.getDate()).padStart(2, "0");

  fechaInput.min = "2024-01-01";
  fechaInput.max = `${añoActual}-${mesActual}-${diaActual}`;
}

function mostrarModal(mensaje, callback) {
  document.getElementById("alertModalBodyRegistrarDelito").innerText = mensaje;
  $("#alertModalRegistrarDelito").modal("show");

  $("#alertModalRegistrarDelito").off("hidden.bs.modal");
  $("#alertModalRegistrarDelito").on("hidden.bs.modal", function () {
    if (callback) {
      callback();
    }
  });
}

function validarFormulario() {
  let esValido = true;
  const camposRequeridos = document.querySelectorAll(
    "#formRegistrarDelito [required]"
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

async function crearDelito() {
  if (!validarFormulario()) {
    return;
  }

  let datosDelito = {};

  let fechaDelito = document.getElementById("txtFechaDelito").value;
  if (fechaDelito) {
    datosDelito.fechaDelito = fechaDelito;
  }

  const idSucursal = document.getElementById("txtSucursalDelito").value;

  datosDelito.sucursal = { idSucursal: idSucursal };

  const request = await fetch(`${window.env.BACKEND_URL}/api/delitos`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datosDelito),
  });

  if (request.ok) {
    mostrarModal("Delito registrado con éxito.", function () {
      window.location.href = "delitos.html";
    });
  } else {
    mostrarModal("Error al registrar el delito.", function () {
      window.location.href = "delitos.html";
    });
  }
}

async function cargarSucursales() {
  const response = await fetch(`${window.env.BACKEND_URL}/api/sucursales`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const sucursales = await response.json();
    let select = document.getElementById("txtSucursalDelito");

    select.innerHTML =
      '<option value="" disabled selected>Seleccione la sucursal</option>';

    if (sucursales.length > 0) {
      sucursales.forEach((sucursal) => {
        let option = document.createElement("option");
        option.value = sucursal.idSucursal;
        option.text = `${sucursal.entidad.nombreEntidad} - ${sucursal.nombreSucursal}`;
        select.appendChild(option);
      });
    } else {
      mostrarModal(
        "No hay sucursales disponibles. No se puede registrar un delito.",
        function () {
          window.location.href = "delitos.html";
        }
      );
    }
  } else {
    mostrarModal("Error al cargar las sucursales.", function () {
      window.location.href = "delitos.html";
    });
  }
}
