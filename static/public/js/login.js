// Función para mostrar el modal de alerta
function mostrarModal(mensaje) {
    document.getElementById('alertModalBodyLogin').innerText = mensaje;
    $('#alertModalLogin').modal('show');
}

// --- SIN USO ---

async function iniciarSesion() {

    const username = document.getElementById('txtUser').value;
    const password = document.getElementById('txtPass').value;

    const datos = {
        username: username,
        password: password
    };

    try {
        const request = await fetch(`${window.env.BACKEND_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        if (request.ok) {
            window.location.href = "index.html";
        } else {
            const errorMessage = await request.text();
            mostrarModal('Error: ' + errorMessage);
        }
    } catch (error) {
        console.error('Error al iniciar sesión: ', error);
        mostrarModal('Ocurrió un error al intentar iniciar sesión. Por favor intenta nuevamente');
    }
}