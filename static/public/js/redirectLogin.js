fetch(`${window.env.BACKEND_URL}/auth/usuario-logueado`, {
  credentials: "include",
})
  .then((response) => {
    if (!response.ok) {
      return null;
    }
    return response.json();
  })
  .then((data) => {
    if (!data) {
      window.location.href = "login.html";
    }
  })
  .catch((error) => {
    console.error("Error en la petición:", error);
    window.location.href = "login.html";
  });
