const confirmarLogOut = document.getElementById('confirmarLogOut');

confirmarLogOut.addEventListener('click', async function () {
    const request = await fetch(`${window.env.BACKEND_URL}/logout`, {
        method: "POST",
        credentials: 'include',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    });

    if (request.status === 200) {
        window.location.href = "/login.html";
    }
});