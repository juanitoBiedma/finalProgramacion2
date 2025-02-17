const confirmarLogOut = document.getElementById('confirmarLogOut');

confirmarLogOut.addEventListener('click', async function () {
    try {
        const response = await fetch(`${window.env.BACKEND_URL}/logout`, {
            method: "POST", 
            credentials: 'include',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest"
            }
        });

        if (response.ok) {
            window.location.reload();
        } else {
            console.error("Error en logout:", response.status);
        }
    } catch (error) {
        console.error("Error al realizar logout:", error);
    }
});
