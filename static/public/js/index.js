document.addEventListener("DOMContentLoaded", function () {
  fetch(`${window.env.BACKEND_URL}/auth/usuario-logueado`, {
    credentials: "include",
  })
    .then((response) => {
      debugger;
      if (!response.ok) {
        throw new Error("No se pudo obtener la sesión del usuario");
      }
      return response.json();
    })
    .then((data) => {
      if (data.rolUsuario.id !== 3) {
        document
          .getElementById("accordionSidebar")
          .classList.remove("sidebar-hidden");
      }
    })
    .catch((error) =>
      console.error("Error al obtener el rol del usuario:", error)
    );
});
