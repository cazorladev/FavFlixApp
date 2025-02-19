const loginUser = document.getElementById('loginUser');
loginUser.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const userFound = users.find(user => user.email === email);
    
    if (userFound && userFound.password === password) {
        if (document.getElementById('rememberMe').checked) {
            localStorage.setItem('loggedUser', JSON.stringify(userFound))
        }

        window.location.href = '/index.html';
    }else alert('Correo electrónico o contraseña incorrectos.');
});