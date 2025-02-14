document.addEventListener("DOMContentLoaded", function () {
  // Petición al backend para obtener el rol del usuario logueado
  fetch(`${window.env.BACKEND_URL}/auth/usuario-logueado`)
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        window.location.href = "/index.html";
      }
    })
    .catch();
});
