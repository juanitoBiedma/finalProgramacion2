$(document).ready(function () {
  cargarDelitos();
  cargarBandas();
});

function mostrarModal(mensaje, callback) {
  document.getElementById("alertModalBodyRegistrarDelincuente").innerText =
    mensaje;
  $("#alertModalRegistrarDelincuente").modal("show");

  $("#alertModalRegistrarDelincuente").off("hidden.bs.modal");
  $("#alertModalRegistrarDelincuente").on("hidden.bs.modal", function () {
    if (callback) {
      callback();
    }
  });
}

function validarFormulario() {
  let esValido = true;
  const camposRequeridos = document.querySelectorAll(
    "#formRegistrarDelincuente [required]"
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

async function crearDelincuente() {
  if (!validarFormulario()) {
    return;
  }

  let datosDelincuente = {};

  datosDelincuente.nombreDelincuente = document.getElementById(
    "txtNombreDelincuente"
  ).value;
  datosDelincuente.apellidoDelincuente = document.getElementById(
    "txtApellidoDelincuente"
  ).value;
  const idDelito = document.getElementById("txtDelitoDelincuente").value;
  const idBanda = document.getElementById("txtBandaDelincuente").value;

  // Si no se selecciona una banda, asignamos null
  datosDelincuente.banda = idBanda ? { idBanda: idBanda } : null;

  datosDelincuente.delitos = [{ idDelito: idDelito }];

  const request = await fetch(`${window.env.BACKEND_URL}/api/delincuentes`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datosDelincuente),
  });

  if (request.ok) {
    mostrarModal("Delincuente registrado con éxito!", function () {
      window.location.href = "delincuentes.html";
    });
  } else {
    mostrarModal("Error al registrar el delincuente.", function () {
      window.location.href = "delincuentes.html";
    });
  }
}

async function cargarDelitos() {
  const response = await fetch(`${window.env.BACKEND_URL}/api/delitos`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const delitos = await response.json();
    let select = document.getElementById("txtDelitoDelincuente");

    select.innerHTML =
      '<option value="" disabled selected>Seleccione el delito</option>';

    if (delitos.length > 0) {
      delitos.forEach((delito) => {
        const fechaDelito = new Date(delito.fechaDelito);
        const formattedDate = `${String(fechaDelito.getDate()).padStart(
          2,
          "0"
        )}/${String(fechaDelito.getMonth() + 1).padStart(
          2,
          "0"
        )}/${fechaDelito.getFullYear()}`;
        let option = document.createElement("option");
        option.value = delito.idDelito;
        option.text = `${delito.sucursal.entidad.nombreEntidad} - ${delito.sucursal.nombreSucursal} - ${formattedDate}`;

        select.appendChild(option);
      });
    } else {
      // Si no hay delitos, deshabilitamos el botón de crear delincuente
      mostrarModal(
        "No hay delitos disponibles. No se puede registrar un delincuente.",
        function () {
          window.location.href = "delincuentes.html";
        }
      );
    }
  } else {
    mostrarModal("Error al cargar los delitos.", function () {
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
    let select = document.getElementById("txtBandaDelincuente");

    select.innerHTML = '<option value="" selected>Sin Banda</option>'; // "Sin Banda" es una opción por defecto

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
