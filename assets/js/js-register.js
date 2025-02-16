const form = document.getElementById('registerForm');

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;

    if (!document.getElementById('terms').checked) {
        alert('Debes aceptar los términos y condiciones.');
        return;
    }

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (password != confirmPassword) {
        alert ('Las contraseñas no coinciden.');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.find(user => user.email === email)) {
        alert('Este correo electrónico ya está registrado.');
        return;
    }

    const newUser = {
        name: document.getElementById('name').value,
        email: email,
        password: password
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registro completado.');
    form.reset();
});