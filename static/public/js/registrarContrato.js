$(document).ready(function () {
  cargarSucursales();
  obtenerContratos();
  limitarRangoFechas();
});

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("btnVolver").addEventListener("click", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const idVigilante = urlParams.get("idVigilante");
    if (idVigilante) {
      window.location.href = `contratosVigilante.html?idVigilante=${idVigilante}`;
    } else {
      console.error("No se encontró el idVigilante en la URL");
    }
  });
});

function limitarRangoFechas() {
  const fechaInput = document.getElementById("txtFechaContratacionVigilante");
  const hoy = new Date();
  const añoActual = hoy.getFullYear();
  const mesActual = String(hoy.getMonth() + 1).padStart(2, "0");
  const diaActual = String(hoy.getDate()).padStart(2, "0");

  fechaInput.min = "2024-01-01";
  fechaInput.max = `${añoActual}-${mesActual}-${diaActual}`;
}

function mostrarModal(mensaje, callback) {
  document.getElementById("alertModalBodyRegistrarContrato").innerText =
    mensaje;
  $("#alertModalRegistrarContrato").modal("show");

  $("#alertModalRegistrarContrato").off("hidden.bs.modal");
  $("#alertModalRegistrarContrato").on("hidden.bs.modal", function () {
    if (callback) {
      callback();
    }
  });
}

function validarFormulario() {
  let esValido = true;
  const camposRequeridos = document.querySelectorAll(
    "#formRegistrarContrato [required]"
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

let contratosFechas = [];

async function obtenerContratos() {
  try {
    const response = await fetch(`${window.env.BACKEND_URL}/api/contratos`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const contratos = await response.json();
      contratosFechas = contratos.map((contrato) => contrato.fechaContrato);
    } else {
      console.error("Error al obtener los contratos");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function crearContrato() {
  if (!validarFormulario()) {
    return;
  }

  let datosContrato = {};
  let vigilante = null;

  const urlParams = new URLSearchParams(window.location.search);
  const idVigilante = urlParams.get("idVigilante");

  const vigilanteResponse = await fetch(
    `${window.env.BACKEND_URL}/api/vigilantes/${idVigilante}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  if (vigilanteResponse.ok) {
    vigilante = await vigilanteResponse.json();
    datosContrato.vigilante = vigilante;
  } else {
    mostrarModal("Error al obtener los datos del vigilante.", function () {
      window.location.href = `contratosVigilante.html?idVigilante=${idVigilante}`;
    });
    return;
  }

  const idSucursal = document.getElementById("txtSucursalContrato").value;
  if (!idSucursal) {
    mostrarModal("Debe seleccionar una sucursal.", function () {});
    return;
  }

  datosContrato.sucursal = { idSucursal: idSucursal };

  let fechaContrato = document.getElementById(
    "txtFechaContratacionVigilante"
  ).value;
  let fechaDuplicada = false;

  if (fechaContrato) {
    contratosFechas.forEach((fecha) => {
      if (fecha === fechaContrato) {
        fechaDuplicada = true;
      }
    });
  }

  if (fechaDuplicada) {
    mostrarModal(
      "Ya hay un contrato registrado con la fecha ingresada.",
      function () {
        return;
      }
    );
  } else {
    datosContrato.fechaContrato = fechaContrato;
    datosContrato.tieneArmaContrato = document.getElementById(
      "txtTieneArmaVigilante"
    ).checked
      ? true
      : false;

    try {
      const request = await fetch(`${window.env.BACKEND_URL}/api/contratos`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosContrato),
      });

      if (request.ok) {
        vigilante.estaContratadoVigilante = true;
        await fetch(
          `${window.env.BACKEND_URL}/api/vigilantes/editarVigilante/${vigilante.idVigilante}`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(vigilante),
          }
        );

        mostrarModal("Contrato registrado con éxito.", function () {
          window.location.href = `contratosVigilante.html?idVigilante=${idVigilante}`;
        });
      } else {
        const errorText = await request.text();
        mostrarModal(
          "Error al registrar el contrato: " + errorText,
          function () {
            window.location.href = `contratosVigilante.html?idVigilante=${idVigilante}`;
          }
        );
      }
    } catch (error) {
      mostrarModal(
        "Error al registrar el contrato: " + error.message,
        function () {
          window.location.href = `contratosVigilante.html?idVigilante=${idVigilante}`;
        }
      );
    }
  }
}

async function cargarSucursales() {
  const urlParams = new URLSearchParams(window.location.search);
  const idVigilante = urlParams.get("idVigilante");

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
    let select = document.getElementById("txtSucursalContrato");

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
        "No hay sucursales disponibles. No se puede registrar un contrato.",
        function () {
          window.location.href = `contratosVigilante.html?idVigilante=${idVigilante}`;
        }
      );
    }
  } else {
    mostrarModal("Error al cargar las sucursales.", function () {
      window.location.href = `contratosVigilante.html?idVigilante=${idVigilante}`;
    });
  }
}
