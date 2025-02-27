/**
 * Espera a que el DOM esté completamente cargado antes de ejecutar el código.
 */
document.addEventListener("DOMContentLoaded", init);

/**
 * Inicializa la página cargando el perfil del usuario,
 * mostrando las películas favoritas y configurando el botón de cierre de sesión.
 */
function init() {
  manejarPerfilUsuario();
  mostrarPeliculasFavoritas();
  configurarLogout();
}

/**
 * Obtiene el usuario autenticado y muestra la inicial en el perfil.
 */
function manejarPerfilUsuario() {
  const usuario = JSON.parse(localStorage.getItem("loggedUser"));
  const userInitialsElement = document.querySelector(".profile-initials");

  if (usuario && userInitialsElement) {
    userInitialsElement.textContent = usuario.username
      ? usuario.username.charAt(0).toUpperCase()
      : "?";
  }
}

/**
 * Muestra las películas favoritas almacenadas en localStorage.
 * Si no hay películas, muestra un mensaje informativo.
 * @param {Array} favoritos - Lista de películas favoritas obtenidas del localStorage.
 */
function mostrarPeliculasFavoritas() {
  const usuario = JSON.parse(localStorage.getItem("loggedUser"));
  const contenedorFavoritos = document.getElementById("favoritos-container");

  if (!usuario) return;

  let favoritos =
    JSON.parse(localStorage.getItem(`favoritos_${usuario.username}`)) || [];

  if (favoritos.length === 0) {
    contenedorFavoritos.innerHTML =
      "<p class='text-center fs-4'>No tienes películas favoritas aún.</p>";
    return;
  }

  contenedorFavoritos.innerHTML = "";

  favoritos.forEach((movie) => {
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

    const img = document.createElement("img");
    img.src = `https://image.tmdb.org/t/p/w500${movie.poster}`;
    img.classList.add("card-img-top", "movie-img");

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body", "text-center");

    const title = document.createElement("h6");
    title.classList.add("card-title");
    title.textContent = movie.title;

    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("movie-actions");

    // Botón para eliminar de favoritos
    const favButton = document.createElement("button");
    favButton.type = "button";
    favButton.classList.add("btn", "fav-btn", "btn-danger");
    favButton.setAttribute("data-id", movie.id);
    favButton.innerHTML = `<i class="bi bi-heart-fill"></i>`;
    favButton.title = "Quitar de favoritos";
    favButton.addEventListener("click", (event) => {
      eliminarDeFavoritos(
        movie.id,
        event.target.closest(".col-12, .col-sm-6, .col-md-4, .col-lg-3")
      );
    });

    // Botón para ver más información de la película
    const infoButton = document.createElement("button");
    infoButton.type = "button";
    infoButton.classList.add("btn", "btn-outline-secondary", "info-btn");
    infoButton.setAttribute("data-id", movie.id);
    infoButton.innerHTML = `<i class="bi bi-arrow-down-circle-fill"></i>`;
    infoButton.title = "Más información";
    infoButton.addEventListener("click", async () => {
      await cargarInformacionPelicula(movie.id);
    });

    buttonsContainer.appendChild(favButton);
    buttonsContainer.appendChild(infoButton);
    cardBody.appendChild(title);
    cardBody.appendChild(buttonsContainer);
    cardContainer.appendChild(img);
    cardContainer.appendChild(cardBody);
    card.appendChild(cardContainer);
    contenedorFavoritos.appendChild(card);
  });
}

/**
 * Configura el botón de cierre de sesión eliminando los datos del usuario.
 */
function configurarLogout() {
  const logoutButton = document.getElementById("logout");

  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      localStorage.removeItem("loggedUser");
      window.location.href = "../index.html";
    });
  }
}

/**
 * Carga la información detallada de una película desde la API.
 * @param {number} movieId - ID de la película a cargar.
 */
function cargarInformacionPelicula(movieId) {
  const API_KEY = "7154c887e726b37b3d012f91ada2bf12";

  fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=es-ES&append_to_response=videos`
  )
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("modalTitulo").textContent = data.title;
      document.getElementById("modalDescripcion").textContent = data.overview;
      document.getElementById("modalGenero").textContent = data.genres
        .map((g) => g.name)
        .join(", ");
      document.getElementById("modalAnio").textContent =
        data.release_date.split("-")[0];

      const trailer = data.videos.results.find(
        (video) => video.type === "Trailer"
      );
      document.getElementById("modalTrailer").src = trailer
        ? `https://www.youtube.com/embed/${trailer.key}`
        : "";

      new bootstrap.Modal(document.getElementById("modalPelicula")).show();
    })
    .catch((error) => console.error("Error al cargar la película:", error));
}

/**
 * Elimina una película de la lista de favoritos sin recargar la página.
 * @param {number} movieId - ID de la película a eliminar.
 * @param {HTMLElement} cardElement - Elemento de la tarjeta en el DOM.
 */
function eliminarDeFavoritos(movieId, cardElement) {
  const usuario = JSON.parse(localStorage.getItem("loggedUser"));
  if (!usuario) return;

  let favoritos =
    JSON.parse(localStorage.getItem(`favoritos_${usuario.username}`)) || [];

  console.log("Lista de favoritos antes de eliminar:", favoritos);

  favoritos = favoritos.filter((movie) => movie.id !== movieId);

  console.log("Lista de favoritos después de eliminar:", favoritos);

  localStorage.setItem(
    `favoritos_${usuario.username}`,
    JSON.stringify(favoritos)
  );

  if (cardElement) {
    cardElement.style.transition = "opacity 0.5s ease-out";
    cardElement.style.opacity = "0";
    setTimeout(() => cardElement.remove(), 500);
  }

  const contenedorFavoritos = document.getElementById("favoritos-container");
  if (favoritos.length === 0) {
    contenedorFavoritos.innerHTML =
      "<p class='text-center fs-4'>No tienes películas favoritas aún.</p>";
  }
}
