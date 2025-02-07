document.addEventListener('DOMContentLoaded', function () {
    // Petición al backend para obtener el rol del usuario logueado
    fetch('/auth/usuario-logueado')
            .then(response => response.json())
            .then(data => {
                // 3 = Usuario vigilante
                if (data.rolUsuario.id !== 3) {
                    document.getElementById('accordionSidebar').classList.remove('sidebar-hidden');
                }
            })
            .catch(error => console.error('Error al obtener el rol del usuario:', error));
});
