document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch(`${window.env.BACKEND_URL}/auth/usuario-logueado`, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const usuarioLogueado = await response.json();

            const userNameElement = document.getElementById('userName');
            const userImageElement = document.getElementById('userImage');

            const fullName = `${usuarioLogueado.nombreUsuario} ${usuarioLogueado.apellidoUsuario}`;
            userNameElement.textContent = fullName;

            // Actualizar la imagen si es Diego
            if (fullName === 'Diego Corsi') {
                userImageElement.src = 'img/diego_corsi_profile.png';
            } else if (fullName === 'Tute Avalos') {
                userImageElement.src = 'img/tute_avalos_profile.png';
            } else {
                // Sino actualizar la imagen del usuario según su rol
                switch (usuarioLogueado.rolUsuario.rolEnum) {
                    case 'ADMINISTRADOR':
                        userImageElement.src = 'img/admin_profile.png';
                        break;
                    case 'INVESTIGADOR':
                        userImageElement.src = 'img/investigador_profile.png';
                        break;
                    case 'VIGILANTE':
                        userImageElement.src = 'img/vigilante_profile.png';
                        break;
                    default:
                        userImageElement.src = 'img/default_profile.svg';
                        break;
                }
            }
        } else {
            throw new Error("Error al obtener los datos del usuario logueado");
        }
    } catch (error) {
        console.error("Error:", error);
    }
});