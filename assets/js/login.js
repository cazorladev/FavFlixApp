loginUser.addEventListener('submit', async (event) => {
    event.preventDefault();

    const loginInput = document.getElementById('loginInput').value.trim().toLowerCase();
    const password = document.getElementById('password').value.trim();
    const loginError = document.getElementById('loginError');

    loginError.textContent = "";

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userFound = users.find(user => user.email === loginInput || user.username === loginInput);

    if (!userFound) {
        loginError.textContent = "Usuario o correo no encontrado.";
        return;
    }

    // Cifrar la contraseña ingresada para compararla con la almacenada
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (userFound.password !== hashedPassword) {
        loginError.textContent = "Contraseña incorrecta.";
        return;
    }

    localStorage.setItem('loggedUser', JSON.stringify(userFound));

    alert("Inicio de sesión exitoso. Redirigiendo...");
    window.location.href = '/pages/dashboard.html';
});
