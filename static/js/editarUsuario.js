// Call the dataTables jQuery plugin
$(document).ready(function () {
  cargarDatosUsuario();

  // Mostrar campos de Vigilante cuando se selecciona el rol 3
  const rolInput = document.getElementById("txtEditarRol");
  if (rolInput) {
    document
      .getElementById("txtEditarRol")
      .addEventListener("change", function () {
        const vigilanteFieldsEditar = document.getElementById(
          "vigilanteFieldsEditar"
        );
        if (this.value === "3") {
          vigilanteFieldsEditar.style.display = "block";
        } else {
          vigilanteFieldsEditar.style.display = "none";
        }
      });
  }
});

// Función para mostrar el modal de alerta
function mostrarModal(mensaje, callback) {
  document.getElementById("alertModalBodyEditarUsuario").innerText = mensaje;
  $("#alertModalEditarUsuario").modal("show");

  // Agregar evento al botón de cerrar del modal
  $("#alertModalEditarUsuario").off("hidden.bs.modal"); // Eliminar cualquier evento previo para evitar duplicados
  $("#alertModalEditarUsuario").on("hidden.bs.modal", function () {
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

// Función para cargar los datos del usuario y rellenar el formulario
async function cargarDatosUsuario() {
  const idUsuario = getQueryParam("idUsuario"); // Obtener el ID de la URL

  try {
    const responseUsuario = await fetch(
      `${window.env.BACKEND_URL}/api/usuarios/${idUsuario}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    if (responseUsuario.ok) {
      const usuario = await responseUsuario.json();
      // Rellenar los campos del formulario con los datos del usuario
      document.getElementById("txtEditarNombre").value = usuario.nombreUsuario;
      document.getElementById("txtEditarApellido").value =
        usuario.apellidoUsuario;
      document.getElementById("txtEditarUser").value = usuario.username;
      document.getElementById("txtEditarRol").value = usuario.rolUsuario.id;
      if (usuario.rolUsuario.id === 3) {
        // Comparar con el ID del rol
        cargarDatosVigilante(idUsuario);
      }
    } else {
      mostrarModal("Error al cargar los datos del usuario", function () {
        window.location.href = "usuarios.html";
      });
    }
  } catch (error) {
    console.error("Error al cargar el usuario:", error);
  }
}

// Función para cargar los datos del vigilante
async function cargarDatosVigilante(idUsuario) {
  try {
    const responseVigilante = await fetch(
      `${window.env.BACKEND_URL}/api/vigilantes/usuario/${idUsuario}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    if (responseVigilante.ok) {
      const vigilante = await responseVigilante.json();
      const rolSelect = document.getElementById("txtEditarRol");
      const codigoInput = document.getElementById("txtEditarCodigo");

      if (rolSelect && codigoInput) {
        // Deshabilitar en lugar de reemplazar
        rolSelect.disabled = true;
        codigoInput.disabled = true;

        // Mostrar valores en labels sin eliminar los inputs originales
        codigoInput.value = vigilante.idVigilante;
      }
      document.getElementById("txtEditarEdad").value = vigilante.edadVigilante;
    } else {
      mostrarModal("Error al cargar los datos del vigilante", function () {
        window.location.href = "usuarios.html";
      });
    }
  } catch (error) {
    console.error("Error al cargar el vigilante:", error);
  }
}

// Función para validar el formulario
function validarFormularioUsuario() {
  let esValido = true;
  const camposRequeridos = document.querySelectorAll(
    "#formEditarUsuario [required]"
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

function validarFormularioVigilante() {
  let esValido = true;
  const camposRequeridos = document.querySelectorAll(
    "#vigilanteFieldsEditar [required]"
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

// Función para actualizar el usuario
async function editarUsuario() {
  if (!validarFormularioUsuario()) {
    return;
  }

  const idUsuario = getQueryParam("idUsuario"); // Obtener el ID de la URL
  let rolId = document.getElementById("txtEditarRol").value;
  const usuarioEditado = {
    nombreUsuario: document.getElementById("txtEditarNombre").value,
    apellidoUsuario: document.getElementById("txtEditarApellido").value,
    username: document.getElementById("txtEditarUser").value,
    rolUsuario: { id: rolId },
  };

  // Actualizar Usuario
  const responseUsuario = await fetch(
    `${window.env.BACKEND_URL}/api/usuarios/editarUsuario/${idUsuario}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(usuarioEditado),
    }
  );
  if (responseUsuario.ok) {
    if (rolId === "3") {
      const responseVigilante = await fetch(
        `${window.env.BACKEND_URL}/api/vigilantes/usuario/${idUsuario}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (responseVigilante.ok) {
        if (!validarFormularioVigilante()) {
          return;
        }
        const vigilante = await responseVigilante.json();
        vigilante.edadVigilante =
          document.getElementById("txtEditarEdad").value;

        // Validación de edad
        if (vigilante.edadVigilante < 18 || vigilante.edadVigilante > 65) {
          mostrarModal("Ingrese una edad válida.");
          return;
        }

        // Actualizar Vigilante si el rol es 3
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
      } else {
        mostrarModal("Error al actualizar el usuario", function () {
          window.location.href = "usuarios.html";
        });
      }
    } else {
      mostrarModal("Usuario actualizado correctamente", function () {
        window.location.href = "usuarios.html";
      });
    }
  } else {
    mostrarModal("Error al actualizar el usuario", function () {
      window.location.href = "usuarios.html";
    });
  }
}
