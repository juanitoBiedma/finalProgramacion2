document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form.user");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      username: formData.get("username"),
      password: formData.get("password"),
    };

    fetch(`${window.env.BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    })
      .then((response) => {
        console.log(response);
        if (!response.ok) {
          throw new Error("Credenciales inválidas");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (data) {
          window.location.href = "index.html";
        } else {
          throw new Error("Error en el inicio de sesión");
        }
      })
      .catch((error) => {
        const modalBody = document.getElementById("alertModalBodyLogin");
        modalBody.textContent = "Usuario o contraseña incorrectos";
        $("#alertModalLogin").modal("show");
      });
  });
});
