/**
 * Espera a que el DOM esté completamente cargado antes de ejecutar el código.
 * Llama a la función `init()` para inicializar la página.
 */
document.addEventListener("DOMContentLoaded", init);

/**
 * Inicializa la página cargando el perfil del usuario,
 * mostrando las películas favoritas y configurando el botón de cierre de sesión.
 */
function init() {
  manejarPerfilUsuario(); // Muestra la inicial del usuario autenticado
  mostrarPeliculasFavoritas(); // Carga y muestra las películas favoritas
  configurarLogout(); // Configura el botón de cierre de sesión
}

/**
 * Obtiene el usuario autenticado y muestra la inicial en el perfil.
 */
function manejarPerfilUsuario() {
  const usuario = JSON.parse(localStorage.getItem("loggedUser")); // Obtiene el usuario del localStorage
  const userInitialsElement = document.querySelector(".profile-initials"); // Selecciona el elemento donde se mostrará la inicial

  if (usuario && userInitialsElement) {
    // Si hay usuario autenticado, se obtiene la primera letra del nombre y se muestra
    userInitialsElement.textContent = usuario.username
      ? usuario.username.charAt(0).toUpperCase()
      : "?"; // Si el nombre está vacío, muestra "?"
  }
}

/**
 * Muestra las películas favoritas almacenadas en localStorage.
 * Si no hay películas favoritas, muestra un mensaje informativo.
 */
function mostrarPeliculasFavoritas() {
  const usuario = JSON.parse(localStorage.getItem("loggedUser")); // Obtiene el usuario del localStorage
  const contenedorFavoritos = document.getElementById("favoritos-container"); // Selecciona el contenedor donde se mostrarán las películas

  if (!usuario) return; // Si no hay usuario autenticado, no se ejecuta nada

  // Obtiene la lista de películas favoritas del usuario o un array vacío si no hay ninguna
  let favoritos =
    JSON.parse(localStorage.getItem(`favoritos_${usuario.username}`)) || [];

  // Si el usuario no tiene películas favoritas, se muestra un mensaje
  if (favoritos.length === 0) {
    contenedorFavoritos.innerHTML =
      "<p class='text-center fs-4'>No tienes películas favoritas aún.</p>";
    return;
  }

  contenedorFavoritos.innerHTML = ""; // Limpia el contenedor antes de agregar las películas

  favoritos.forEach((movie) => {
    // Crear la estructura de la tarjeta de la película
    const card = document.createElement("div");
    card.classList.add(
      "col-12",
      "col-sm-6",
      "col-md-4",
      "col-lg-3",
      "d-flex",
      "justify-content-center"
    );

    const cardContainer = document.createElement("div");
    cardContainer.classList.add("card", "position-relative", "movie-card");

    // Imagen de la película
    const img = document.createElement("img");
    img.src = `https://image.tmdb.org/t/p/w500${movie.poster}`;
    img.classList.add("card-img-top", "movie-img");

    // Contenedor del título y botones
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body", "text-center");

    // Título de la película
    const title = document.createElement("h6");
    title.classList.add("card-title");
    title.textContent = movie.title;

    // Contenedor de los botones de acción
    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("movie-actions");

    // Botón para eliminar de favoritos
    const favButton = document.createElement("button");
    favButton.type = "button";
    favButton.classList.add("btn", "fav-btn", "btn-danger");
    favButton.setAttribute("data-id", movie.id);
    favButton.innerHTML = `<i class="bi bi-heart-fill"></i>`; // Ícono de favorito
    favButton.title = "Quitar de favoritos";

    // Evento para eliminar la película de favoritos
    favButton.addEventListener("click", (event) => {
      eliminarDeFavoritos(
        movie.id,
        event.target.closest(".col-12, .col-sm-6, .col-md-4, .col-lg-3") // Encuentra la tarjeta completa
      );
    });

    // Botón para ver más información de la película
    const infoButton = document.createElement("button");
    infoButton.type = "button";
    infoButton.classList.add("btn", "btn-outline-secondary", "info-btn");
    infoButton.setAttribute("data-id", movie.id);
    infoButton.innerHTML = `<i class="bi bi-arrow-down-circle-fill"></i>`; // Ícono de información
    infoButton.title = "Más información";

    // Evento para abrir el modal con la información de la película
    infoButton.addEventListener("click", async () => {
      await cargarInformacionPelicula(movie.id);
    });

    // Agregar los botones al contenedor
    buttonsContainer.appendChild(favButton);
    buttonsContainer.appendChild(infoButton);
    cardBody.appendChild(title);
    cardBody.appendChild(buttonsContainer);

    // Ensamblar la tarjeta completa
    cardContainer.appendChild(img);
    cardContainer.appendChild(cardBody);
    card.appendChild(cardContainer);
    contenedorFavoritos.appendChild(card); // Agregar la tarjeta al contenedor
  });
}

/**
 * Configura el botón de cierre de sesión eliminando los datos del usuario del localStorage
 * y redirigiendo a la página de inicio de sesión.
 */
function configurarLogout() {
  const logoutButton = document.getElementById("logout"); // Selecciona el botón de cierre de sesión

  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      localStorage.removeItem("loggedUser"); // Elimina los datos del usuario autenticado
      window.location.href = "../index.html"; // Redirige a la página principal
    });
  }
}

/**
 * Carga la información detallada de una película desde la API y la muestra en un modal.
 * Obtiene detalles como el título, descripción, género, año de estreno y el tráiler (si está disponible).
 * 
 * @param {number} movieId - ID de la película a cargar.
 */
function cargarInformacionPelicula(movieId) {
  const API_KEY = "7154c887e726b37b3d012f91ada2bf12"; // Clave de la API de TMDB

  // Realiza la petición a la API para obtener detalles de la película
  fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=es-ES&append_to_response=videos`
  )
    .then((response) => response.json()) // Convierte la respuesta en JSON
    .then((data) => {
      // Actualiza el contenido del modal con la información de la película
      document.getElementById("modalTitulo").textContent = data.title;
      document.getElementById("modalDescripcion").textContent = data.overview;
      document.getElementById("modalGenero").textContent = data.genres
        .map((g) => g.name)
        .join(", "); // Convierte la lista de géneros en un string separado por comas
      document.getElementById("modalAnio").textContent =
        data.release_date.split("-")[0]; // Extrae solo el año de la fecha de estreno

      // Busca un tráiler en la lista de videos de la película
      const trailer = data.videos.results.find(
        (video) => video.type === "Trailer"
      );
      document.getElementById("modalTrailer").src = trailer
        ? `https://www.youtube.com/embed/${trailer.key}`
        : ""; // Si no hay tráiler disponible, deja el campo vacío

      // Muestra el modal con los detalles de la película
      new bootstrap.Modal(document.getElementById("modalPelicula")).show();
    })
    .catch((error) => console.error("Error al cargar la película:", error)); // Manejo de errores en la petición
}

/**
 * Elimina una película de la lista de favoritos sin recargar la página.
 * La película se quita del localStorage y se elimina visualmente de la interfaz con una animación.
 * 
 * @param {number} movieId - ID de la película a eliminar.
 * @param {HTMLElement} cardElement - Elemento de la tarjeta en el DOM (para eliminarlo visualmente).
 */
function eliminarDeFavoritos(movieId, cardElement) {
  const usuario = JSON.parse(localStorage.getItem("loggedUser")); // Obtiene el usuario autenticado

  if (!usuario) return; // Si no hay usuario, no se hace nada

  // Obtiene la lista de películas favoritas del usuario
  let favoritos = JSON.parse(localStorage.getItem(`favoritos_${usuario.username}`)) || []; 

  console.log("Lista de favoritos antes de eliminar:", favoritos); // Log para depuración

  // Filtra la lista eliminando la película con el ID seleccionado
  favoritos = favoritos.filter((movie) => movie.id !== movieId);

  console.log("Lista de favoritos después de eliminar:", favoritos); // Log para depuración

  // Guarda la lista actualizada de favoritos en el localStorage
  localStorage.setItem(
    `favoritos_${usuario.username}`,
    JSON.stringify(favoritos)
  );

  // Si se proporcionó el elemento de la tarjeta, se elimina visualmente con una animación
  if (cardElement) {
    cardElement.style.transition = "opacity 0.5s ease-out"; // Agrega una transición de desvanecimiento
    cardElement.style.opacity = "0"; // Reduce la opacidad a 0
    setTimeout(() => cardElement.remove(), 500); // Elimina el elemento después de la animación
  }

  // Si ya no quedan películas favoritas, muestra un mensaje en el contenedor
  const contenedorFavoritos = document.getElementById("favoritos-container");
  if (favoritos.length === 0) {
    contenedorFavoritos.innerHTML =
      "<p class='text-center fs-4'>No tienes películas favoritas aún.</p>";
  }
}
