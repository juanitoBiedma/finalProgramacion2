fetch(`${window.env.BACKEND_URL}/auth/usuario-logueado`)
  .then((response) => {
    if (!response.ok) {
      // Si la respuesta no es OK, simplemente no se hace nada o se puede manejar el error.
      return null;
    }
    return response.json();
  })
  .then((data) => {
    if (data) {
      window.location.href = "/index.html";
    }
  })
  .catch((error) => {
    console.error('Error en la petición:', error);
  });
