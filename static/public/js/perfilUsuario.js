function mostrarModal(mensaje, callback) {
  document.getElementById("alertModalBodyPerfilUsuario").innerText = mensaje;
  $("#alertModalPerfilUsuario").modal("show");

  $("#alertModalPerfilUsuario").off("hidden.bs.modal");
  $("#alertModalPerfilUsuario").on("hidden.bs.modal", function () {
    if (callback) {
      callback();
    }
  });
}

async function obtenerIdUsuario() {
  try {
    const response = await fetch(
      `${window.env.BACKEND_URL}/auth/usuario-logueado`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data.idUsuario;
    }
    throw new Error("Error al obtener el id del usuario");
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

async function cargarPerfil() {
  const idUsuarioLogueado = await obtenerIdUsuario();

  if (!idUsuarioLogueado) {
    mostrarModal("No se pudo obtener el ID del usuario logueado.", function () {
      window.location.href = "index.html";
    });
  }

  try {
    const responseUsuario = await fetch(
      `${window.env.BACKEND_URL}/api/usuarios/${idUsuarioLogueado}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    const opcionesPerfilUsuario = document.querySelector(
      "#opcionesPerfilUsuario"
    );
    const informacionUsuario = document.querySelector("#informacionUsuario");
    const informacionVigilante = document.querySelector(
      "#informacionVigilante"
    );
    const informacionContrato = document.querySelector("#informacionContrato");
    let opcionesPerfilAdminHTML = "";
    let opcionesPerfilNoAdminHTML = "";
    let informacionUsuarioHTML = "";
    let informacionVigilanteHTML = "";
    let informacionContratoHTML = "";
    if (responseUsuario.ok) {
      const usuario = await responseUsuario.json();
      opcionesPerfilAdminHTML = `
                <a href="index.html" class="btn btn-primary col-md-3 m-1" role="button" style="justify-content: flex-end">
                    <span class="text">Volver al inicio</span>
                </a>
                <a href="editarUsuario.html?idUsuario=${usuario.idUsuario}" class="btn btn-primary col-md-3 m-1" role="button" style="justify-content: flex-end">
                    <span class="text">Editar usuario</span>
                </a>
                <a href="editarContrasenia.html?idUsuario=${usuario.idUsuario}" class="btn btn-primary col-md-3 m-1" role="button" style="justify-content: flex-end">
                    <span class="text">Editar contraseña</span>
                </a>`;

      opcionesPerfilNoAdminHTML = `
                <a href="index.html" class="btn btn-primary col-md-5 m-1" role="button">
                    <span class="text">Volver al inicio</span>
                </a>`;

      if (usuario.rolUsuario.id == 1) {
        opcionesPerfilUsuario.innerHTML = opcionesPerfilAdminHTML;
      } else {
        opcionesPerfilUsuario.innerHTML = opcionesPerfilNoAdminHTML;
      }

      informacionUsuarioHTML = `
                <h4>Información general de usuario</h4>
                <p>Nombre: ${usuario.nombreUsuario}</p>
                <p>Apellido: ${usuario.apellidoUsuario}</p>
                <p>Nombre de usuario: ${usuario.username}</p>
                <p>Rol: ${usuario.rolUsuario.rolEnum}</p>`;
      informacionUsuario.innerHTML = informacionUsuarioHTML;

      if (usuario.rolUsuario.id == 3) {
        document.querySelector("#accordionSidebar").style.display = "none";
        const responseVigilante = await fetch(
          `${window.env.BACKEND_URL}/api/vigilantes/usuario/${idUsuarioLogueado}`,
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
          const responseText = await responseVigilante.text();
          if (responseText) {
            const vigilante = JSON.parse(responseText);
            if (vigilante) {
              informacionVigilanteHTML = `
                            <br/>
                            <h4>Información del usuario con rol de vigilante</h4>
                            <p>Código de vigilante: ${vigilante.idVigilante}</p>
                            <p>Edad: ${vigilante.edadVigilante}</p>`;
              informacionVigilante.innerHTML = informacionVigilanteHTML;

              if (vigilante.estaContratadoVigilante) {
                const responseContratoId = await fetch(
                  `${window.env.BACKEND_URL}/api/contratos/vigilante/${vigilante.idVigilante}`,
                  {
                    method: "GET",
                    credentials: "include",
                    headers: {
                      Accept: "application/json",
                      "Content-Type": "application/json",
                    },
                  }
                );

                if (responseContratoId.ok) {
                  const contratoId = await responseContratoId.json();
                  if (contratoId) {
                    const responseContrato = await fetch(
                      `${window.env.BACKEND_URL}/api/contratos/${contratoId.idContrato}`,
                      {
                        method: "GET",
                        credentials: "include",
                        headers: {
                          Accept: "application/json",
                          "Content-Type": "application/json",
                        },
                      }
                    );
                    if (responseContrato.ok) {
                      const contrato = await responseContrato.json();
                      if (contrato) {
                        informacionContratoHTML = `
                                                <br/>
                                                <h4>Información del contrato del vigilante</h4>
                                                <p>Fecha de contrato: ${new Date(
                                                  contrato.fechaContrato
                                                ).toLocaleDateString()}</p>
                                                <p>Contratado con arma: ${
                                                  contrato.tieneArmaContrato
                                                    ? "Sí"
                                                    : "No"
                                                }</p>`;
                        informacionContrato.innerHTML = informacionContratoHTML;
                      }
                    }
                  } else {
                    console.error("No se pudo encontrar idContrato...");
                  }
                } else {
                  mostrarModal(
                    "Error al obtener el contrato del vigilante.",
                    function () {
                      window.location.href = "index.html";
                    }
                  );
                }
              }
            }
          } else {
            console.error("Error: Respuesta vacía del servidor.");
          }
        } else {
          console.error(
            "Error al obtener la información del vigilante.",
            responseVigilante.statusText
          );
        }
      }
    } else {
      throw new Error("Error al obtener la información del usuario");
    }
  } catch (error) {
    console.error("Error al cargar el usuario:", error);
    mostrarModal(
      "Ocurrió un error al intentar cargar el usuario.",
      function () {
        window.location.href = "index.html";
      }
    );
  }
}

document.addEventListener("DOMContentLoaded", function () {
  cargarPerfil();
});
