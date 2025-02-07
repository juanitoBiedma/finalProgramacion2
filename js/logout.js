const confirmarLogOut = document.getElementById('confirmarLogOut');

confirmarLogOut.addEventListener('click', async function () {
    const request = await fetch("/logout", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    });


    if (request.status === 200) {
        window.location.href = "/login.html";
    }
});