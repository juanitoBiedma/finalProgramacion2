$(document).ready(function () {
  cargarDatosDelito();
  cargarSucursales();
  limitarRangoFechas();
});

function mostrarModal(mensaje, callback) {
  document.getElementById("alertModalBodyEditarDelito").innerText = mensaje;
  $("#alertModalEditarDelito").modal("show");

  $("#alertModalEditarDelito").off("hidden.bs.modal");
  $("#alertModalEditarDelito").on("hidden.bs.modal", function () {
    if (callback) {
      callback();
    }
  });
}

function limitarRangoFechas() {
  const fechaInput = document.getElementById("txtEditarFechaDelito");
  const hoy = new Date();
  const añoActual = hoy.getFullYear();
  const mesActual = String(hoy.getMonth() + 1).padStart(2, "0");
  const diaActual = String(hoy.getDate()).padStart(2, "0");

  fechaInput.min = "2024-01-01";
  fechaInput.max = `${añoActual}-${mesActual}-${diaActual}`;
}

// Función para obtener parámetros de la URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

async function cargarDatosDelito() {
  const idDelito = getQueryParam("idDelito"); // Obtener el ID de la URL
  if (!idDelito) {
    mostrarModal("No se ha proporcionado un ID de delito", function () {
      window.location.href = "delitos.html";
    });
  }

  try {
    const responseDelito = await fetch(
      `${window.env.BACKEND_URL}/api/delitos/${idDelito}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (responseDelito.ok) {
      const delito = await responseDelito.json();
      await cargarSucursales();

      const fechaDelito = new Date(delito.fechaDelito);
      const formattedDate = `${String(fechaDelito.getDate()).padStart(
        2,
        "0"
      )}/${String(fechaDelito.getMonth() + 1).padStart(
        2,
        "0"
      )}/${fechaDelito.getFullYear()}`;

      document.getElementById("txtEditarFechaDelito").value = formattedDate;
      document.getElementById("txtEditarSucursalDelito").value =
        delito.sucursal.idSucursal;
    } else {
      mostrarModal("Error al cargar los datos del delito", function () {
        window.location.href = "delitos.html";
      });
    }
  } catch (error) {
    console.error("Error al cargar al delito:", error);
  }
}

function validarFormulario() {
  let esValido = true;
  const camposRequeridos = document.querySelectorAll(
    "#formEditarDelito [required]"
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

async function editarDelito() {
  if (!validarFormulario()) {
    return;
  }

  const idDelito = getQueryParam("idDelito"); // Obtener el ID de la URL

  const fechaDelito = document.getElementById("txtEditarFechaDelito").value;
  const idSucursal = document.getElementById("txtEditarSucursalDelito").value;

  const fechaMinima = new Date("2024-01-01");
  const fechaMaxima = new Date();
  const fechaSeleccionada = new Date(fechaDelito);

  if (fechaSeleccionada < fechaMinima || fechaSeleccionada > fechaMaxima) {
    mostrarModal(
      "La fecha del delito debe estar entre el 1 de enero de 2024 y la fecha actual."
    );
    return;
  }

  const delitoEditado = {
    fechaDelito: fechaDelito,
    sucursal: {
      idSucursal: idSucursal,
    },
  };

  const responseDelito = await fetch(
    `${window.env.BACKEND_URL}/api/delitos/editarDelito/${idDelito}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(delitoEditado),
    }
  );

  if (responseDelito.ok) {
    mostrarModal("Delito actualizado correctamente", function () {
      window.location.href = "delitos.html";
    });
  } else {
    mostrarModal("Error al actualizar el delito", function () {
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
    let select = document.getElementById("txtEditarSucursalDelito");

    select.innerHTML =
      '<option value="" disabled selected>Seleccione la sucursal</option>';

    sucursales.forEach((sucursal) => {
      let option = document.createElement("option");
      option.value = sucursal.idSucursal;
      option.text = `${sucursal.entidad.nombreEntidad} - ${sucursal.nombreSucursal}`;
      select.appendChild(option);
    });
  } else {
    mostrarModal("Error al cargar las sucursales.", function () {
      window.location.href = "delitos.html";
    });
  }
}
