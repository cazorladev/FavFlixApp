document.getElementById("registerForm").addEventListener("submit", async function(event) {
  event.preventDefault();

  let username = document.getElementById("username").value.trim().toLowerCase();
  let email = document.getElementById("email").value.trim().toLowerCase();
  let password = document.getElementById("password").value.trim();
  let confirmPassword = document.getElementById("confirmPassword").value.trim();
  
  let emailError = document.getElementById("emailError");
  let passwordError = document.getElementById("passwordError");
  let confirmPasswordError = document.getElementById("confirmPasswordError");

  emailError.textContent = "";
  passwordError.textContent = "";
  confirmPasswordError.textContent = "";

  let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
      emailError.textContent = "Formato de correo inválido.";
      return;
  }

  let passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (!passwordRegex.test(password)) {
    passwordError.textContent = "La contraseña debe tener al menos 6 caracteres, una mayúscula y un número.";
    return;
  }

  if (password !== confirmPassword) {
    confirmPasswordError.textContent = "Las contraseñas no coinciden.";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.some(user => user.email === email)) {
      emailError.textContent = "Este correo ya está registrado. Intenta iniciar sesión.";
      return;
  }

  // Cifrar contraseña usando SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  users.push({ username, email, password: hashedPassword });
  localStorage.setItem("users", JSON.stringify(users));

  alert("Registro exitoso. Redirigiendo a login...");
  window.location.href = "/pages/login.html";
});
