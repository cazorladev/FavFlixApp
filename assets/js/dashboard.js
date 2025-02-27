/**
 * Espera a que el DOM esté completamente cargado antes de ejecutar el código.
 */
document.addEventListener("DOMContentLoaded", async function () {
  document.querySelector(".resultados-container").style.display = "none";

  /**
   * Obtiene los datos del usuario desde localStorage.
   * @returns {Object|null} - Datos del usuario o null si no está autenticado.
   */
  let userData = null;
  try {
    userData = JSON.parse(localStorage.getItem("loggedUser")) || null;
  } catch (error) {
    console.error("Error al acceder a localStorage:", error);
  }

  if (!userData) {
    window.location.href = "../index.html"; // Redirige si no hay datos de usuario
    return;
  }

  /**
   * Tiempo de inactividad en milisegundos (10 minutos).
   * @constant {number}
   */
  const INACTIVITY_TIME = 1 * 60 * 1000;
  let inactivityTimer;

  /**
   * Cierra la sesión del usuario por inactividad.
   */
  function logoutUser() {
    localStorage.removeItem("loggedUser");
    window.location.replace("../index.html");
  }

  /**
   * Reinicia el temporizador de inactividad cuando el usuario interactúa.
   */
  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(logoutUser, INACTIVITY_TIME);
  }

  // Detectar actividad del usuario y reiniciar el temporizador
  ["mousemove", "keypress", "click", "scroll", "touchstart"].forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
  });

  // Iniciar el temporizador al cargar la página
  resetInactivityTimer();

  /**
   * Extrae la inicial del nombre de usuario y la muestra en el perfil.
   */
  const initials = userData.username ? userData.username.charAt(0).toUpperCase() : "";
  const userInitialsElement = document.querySelector(".profile-initials");
  if (userInitialsElement) userInitialsElement.textContent = initials;

  // Configuración del botón de cerrar sesión
  const logoutButton = document.querySelector("#logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("loggedUser");
      window.location.replace("../index.html");
    });
  }

  // Configuración de la API de películas
  const API_KEY = "7154c887e726b37b3d012f91ada2bf12";
  const API_BASE_URL = "https://api.themoviedb.org/3";

  // URLs para obtener películas
  const urls = {
    populares: `${API_BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`,
    estrenos: `${API_BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=es-ES&page=1`,
    vistas: `${API_BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=es-ES&page=1`,
  };

  // Selección de elementos del DOM
  const heroTitle = document.querySelector(".hero-title");
  const heroDescription = document.querySelector(".hero-description");
  const ageRating = document.querySelector(".age-rating");
  const heroSection = document.querySelector(".hero-section");
  const navbar = document.getElementById("mainNav");
  const navbarToggler = document.querySelector(".navbar-toggler");
  const navbarContent = document.querySelector("#navbarContent");
  const searchInput = document.getElementById("searchInput");
  const searchWrapper = document.querySelector(".search-wrapper");
  const searchToggle = document.querySelector(".search-toggle");
  const searchResultsContainer = document.getElementById("resultados-busqueda");
  const searchResults = document.querySelector(".search-results");

  /**
   * Obtiene y almacena los géneros de películas en un objeto.
   * @returns {Promise<Object>} - Un objeto con los IDs de género como claves y nombres como valores.
   */
  let generosMap = {};
  await fetch(
    `${API_BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=es-ES`
  )
    .then((response) => response.json())
    .then((data) => {
      data.genres.forEach((genre) => {
        generosMap[genre.id] = genre.name;
      });
    })
    .catch((error) => console.error("Error al obtener géneros:", error));

   /**
   * Obtiene la clasificación por edades de una película basada en certificaciones.
   * @param {Array<Object>} certifications - Lista de certificaciones de edad por país.
   * @returns {string} - Clasificación de edad en formato legible.
   */
  function getAgeRating(certifications) {
    const usCertifications = certifications.find((cert) => cert.iso_3166_1 === "US")?.release_dates || [];
    const usRating = usCertifications[0]?.certification || "";
    const ratingMap = {
      G: "Todos",
      "TV-Y": "Todos",
      "TV-G": "Todos",
      PG: "7+",
      "TV-Y7": "7+",
      "PG-13": "13+",
      "TV-PG": "13+",
      "TV-14": "13+",
      R: "16+",
      "NC-17": "18+",
      "TV-MA": "18+",
    };
    return ratingMap[usRating] || "Desconocido";
  }

  /**
   * Agrega o quita la clase 'scrolled' al navbar según el desplazamiento de la página.
   */
  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    });
  }

  /**
   * Obtiene y muestra una película en tendencia en el Hero Section.
   */
  async function fetchTrendingMovie() {
    try {
      const response = await fetch(`${API_BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=es-ES`);
      const data = await response.json();
      let validMovies = data.results.filter((movie) => movie.overview && movie.backdrop_path);
      validMovies.sort(() => Math.random() - 0.5);
      const movie = validMovies[0];
      const certificationResponse = await fetch(`${API_BASE_URL}/movie/${movie.id}/release_dates?api_key=${API_KEY}`);
      const certificationData = await certificationResponse.json();
      const ageLabel = getAgeRating(certificationData.results);
      const img = new Image();
      img.src = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
      img.onload = () => {
        heroSection.style.backgroundSize = img.width / img.height > 2 ? "contain" : "cover";
      };
      heroSection.style.backgroundImage = `url(${img.src})`;
      heroTitle.textContent = movie.title;
      heroDescription.textContent = movie.overview.substring(0, 200) + "...";
      ageRating.textContent = ageLabel;
    } catch (error) {
      console.error("Error obteniendo película en tendencia:", error);
    }
  }

  /**
   * Obtiene y muestra películas en diferentes categorías.
   */
  function cargarPeliculas() {
    Object.keys(urls).forEach((categoria) => {
      fetch(urls[categoria])
        .then((response) => response.json())
        .then((data) => mostrarPeliculas(data.results, categoria))
        .catch((error) => console.error(`Error al obtener ${categoria}:`, error));
    });
  }

  /**
   * Muestra películas en una sección específica del dashboard.
   * @param {Array<Object>} peliculas - Lista de películas obtenidas de la API.
   * @param {string} categoria - ID del contenedor donde se mostrarán las películas.
   */
  function mostrarPeliculas(peliculas, categoria) {
    const contenedor = document.getElementById(categoria);
    contenedor.innerHTML = "";

    peliculas.forEach((pelicula) => {
      const card = document.createElement("div");
      card.classList.add("card");

      const img = document.createElement("img");
      img.src = `https://image.tmdb.org/t/p/w500${pelicula.poster_path}`;
      img.classList.add("card-img-top");

      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body");

      const title = document.createElement("h6");
      title.classList.add("card-title");
      title.textContent = pelicula.title;

      const genresContainer = document.createElement("ul");
      genresContainer.classList.add("genres", "d-flex", "my-2");

      pelicula.genre_ids.forEach((genreId) => {
        if (generosMap[genreId]) {
          const genreItem = document.createElement("li");
          genreItem.textContent = generosMap[genreId];
          genresContainer.appendChild(genreItem);
        }
      });

      const iconsContainer = document.createElement("div");
      iconsContainer.classList.add("d-flex", "justify-content-between");

      const leftIcons = document.createElement("div");

      // Crear botón de favoritos
      const favButton = document.createElement("button");
      favButton.type = "button";
      favButton.classList.add("btn", "fav-btn");
      favButton.setAttribute("data-id", pelicula.id);
      favButton.innerHTML = `<i class="bi bi-heart-fill"></i>`;
      favButton.title = "Agregar a Favoritos";

      // Verificar si la película ya está en favoritos y actualizar el color del botón
      const favoritos = obtenerFavoritos();
      const estaEnFavoritos = favoritos.some((peli) => peli.id === pelicula.id);
      favButton.classList.toggle("btn-danger", estaEnFavoritos);
      favButton.classList.toggle("btn-outline-secondary", !estaEnFavoritos);

      // Evento para agregar/quitar favoritos
      favButton.addEventListener("click", () => {
        actualizarBotonFavoritos(
          pelicula.id,
          pelicula.title,
          pelicula.poster_path
        );
        mostrarFavoritos(); // Refrescar la lista de favoritos
      });

      leftIcons.appendChild(favButton);

      const rightIcons = document.createElement("div");
      const infoButton = document.createElement("button");
      infoButton.type = "button";
      infoButton.classList.add("btn", "btn-outline-secondary", "info-btn");
      infoButton.setAttribute("data-id", pelicula.id);
      infoButton.innerHTML = `<i class="bi bi-arrow-down-circle-fill"></i>`;
      infoButton.title = "Más información";

      rightIcons.appendChild(infoButton);
      iconsContainer.appendChild(leftIcons);
      iconsContainer.appendChild(rightIcons);

      cardBody.appendChild(title);
      cardBody.appendChild(genresContainer);
      cardBody.appendChild(iconsContainer);
      card.appendChild(img);
      card.appendChild(cardBody);
      contenedor.appendChild(card);
    });

    // Agregar evento a los botones de "Más información"
    document.querySelectorAll(".info-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const movieId = e.currentTarget.getAttribute("data-id");
        await mostrarInformacionPelicula(movieId);
      });
    });
  }

  /**
   * Obtiene y muestra la información detallada de una película en un modal.
   * @param {number} movieId - ID de la película a consultar.
   */
  async function mostrarInformacionPelicula(movieId) {
    const API_KEY = "7154c887e726b37b3d012f91ada2bf12";
    const API_BASE_URL = "https://api.themoviedb.org/3";

    try {
      const response = await fetch(
        `${API_BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=es-ES`
      );
      const movie = await response.json();

      document.getElementById("movieTitle").textContent = movie.title;
      document.getElementById(
        "movieImage"
      ).src = `https://image.tmdb.org/t/p/original${
        movie.backdrop_path || "/assets/img/default-movie.jpg"
      }`;
      document.getElementById("movieDescription").textContent = movie.overview;
      document.getElementById("movieYear").textContent =
        movie.release_date.split("-")[0];
      document.getElementById("movieGenre").textContent = movie.genres
        .map((g) => g.name)
        .join(", ");

      actualizarBotonFavoritos(movieId, movie.title);

      const movieModal = new bootstrap.Modal(
        document.getElementById("movieModal")
      );
      movieModal.show();
    } catch (error) {
      console.error("Error obteniendo la información de la película:", error);
    }
  }

  /**
   * Muestra sugerencias de búsqueda en el menú desplegable basado en los resultados de la API.
   * Si no hay resultados, limpia el contenedor y oculta la lista de sugerencias.
   * 
   * @param {Array<Object>} movies - Lista de películas obtenidas de la búsqueda.
   */
  function displaySearchSuggestions(movies) {
    if (movies.length === 0) {
      searchResults.innerHTML = "";
      searchResults.classList.remove("active");
      return;
    }
    searchResults.innerHTML = "";
    movies.slice(0, 5).forEach((movie) => {
      const div = document.createElement("div");
      div.classList.add("search-item");
      div.dataset.id = movie.id;
      div.textContent = movie.title;
      searchResults.appendChild(div);
    });
  }

  /**
   * Alterna la visibilidad del campo de búsqueda y ajusta la posición del menú de sugerencias.
   */
  searchToggle.addEventListener("click", () => {
    searchWrapper.classList.toggle("active");
    if (searchWrapper.classList.contains("active")) {
      setTimeout(() => {
        searchInput.focus();
        searchResults.style.width = `${searchInput.offsetWidth}px`;
        searchResults.style.left = `${searchInput.offsetLeft}px`;
      }, 300);
    }
  });

  /**
  * Captura el evento de presionar "Enter" en el campo de búsqueda,
  * ejecuta la búsqueda de películas y desplaza la vista a los resultados.
  * 
  * @param {KeyboardEvent} event - Evento del teclado.
  */
  searchInput.addEventListener("keypress", async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        await fetchSearchResults(query);

        setTimeout(() => {
          document.getElementById("resultados-busqueda").scrollIntoView({
            behavior: "smooth",
          });
        }, 300); // Pequeño retraso para asegurar que los resultados se carguen antes
      }
    }
  });

  /**
  * Realiza una búsqueda de películas en la API de TMDB y muestra los resultados.
  * Si hay resultados, activa la sección de resultados y desplaza la vista hacia ella.
  * 
  * @async
  * @param {string} query - Término de búsqueda ingresado por el usuario.
  * @returns {Promise<void>} - No devuelve valor, pero actualiza la interfaz con los resultados de búsqueda.
  */
  async function fetchSearchResults(query) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${query}`
      );
      const data = await response.json();

      if (data.results.length > 0) {
        document.querySelector(".resultados-container").style.display = "block"; // Muestra la sección
        displaySearchResults(data.results);

        // Desplazar a la sección de resultados
        setTimeout(() => {
          document.getElementById("resultados-busqueda").scrollIntoView({
            behavior: "smooth",
          });
        }, 300);
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
    }
  }

  /**
   * Muestra los resultados de búsqueda en la interfaz, generando tarjetas de películas con opciones de favoritos e información detallada.
   * Si no se encuentran resultados, se muestra un mensaje indicándolo.
   *
   * @param {Array<Object>} movies - Lista de películas obtenidas de la API.
   */
  function displaySearchResults(movies) {
    searchResults.innerHTML = ""; // Limpia sugerencias anteriores
    searchResultsContainer.innerHTML = ""; // Limpia resultados anteriores

    if (movies.length === 0) {
      searchResultsContainer.innerHTML = "<p>No se encontraron resultados.</p>";
      return;
    }

    movies.forEach((movie) => {
      const card = document.createElement("div");
      card.classList.add("card", "position-relative");
    
      const img = document.createElement("img");
      img.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      img.classList.add("card-img-top");
    
      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body");
    
      const title = document.createElement("h6");
      title.classList.add("card-title");
      title.textContent = movie.title;
    
      // Contenedor para los botones alineados
      const buttonsContainer = document.createElement("div");
      buttonsContainer.classList.add("d-flex", "justify-content-between", "w-100");
    
      // Botón "Agregar a Favoritos"
      const favButton = document.createElement("button");
      favButton.type = "button";
      favButton.classList.add("btn", "btn-outline-secondary", "fav-btn");
      favButton.setAttribute("data-id", movie.id);
      favButton.innerHTML = `<i class="bi bi-heart-fill"></i>`;
      favButton.title = "Agregar a Favoritos";
    
      // Verificar si ya está en favoritos
      const favoritos = obtenerFavoritos();
      const estaEnFavoritos = favoritos.some((peli) => peli.id === movie.id);
      favButton.classList.toggle("btn-danger", estaEnFavoritos);
      favButton.classList.toggle("btn-outline-secondary", !estaEnFavoritos);
    
      // Evento para agregar/quitar favoritos
      favButton.addEventListener("click", () => {actualizarBotonFavoritos(movie.id, movie.title, movie.poster_path);
        mostrarFavoritos();
      });
    
      // Botón "Más Información"
      const infoButton = document.createElement("button");
      infoButton.type = "button";
      infoButton.classList.add("btn", "btn-outline-secondary", "info-btn");
      infoButton.setAttribute("data-id", movie.id);
      infoButton.innerHTML = `<i class="bi bi-arrow-down-circle-fill"></i>`;
      infoButton.title = "Más información";
    
      // Evento para abrir el modal con la información de la película
      infoButton.addEventListener("click", async () => { 
        await mostrarInformacionPelicula(movie.id);
      });
    
      // Agregar botones al contenedor alineado
      buttonsContainer.appendChild(favButton);
      buttonsContainer.appendChild(infoButton);
    
      // Agregar elementos al cardBody
      cardBody.appendChild(title);
      cardBody.appendChild(buttonsContainer);
      card.appendChild(img);
      card.appendChild(cardBody);
    
      searchResultsContainer.appendChild(card);
    });
    
  }

  /**
  * Maneja el clic en los resultados de búsqueda y redirige a la página de detalles de la película seleccionada.
  * 
  * @event click
  * @param {MouseEvent} e - Evento de clic en un elemento de la lista de resultados de búsqueda.
  */
  searchResults.addEventListener("click", (e) => {
    if (e.target.classList.contains("search-item")) {
      window.location.href = `movie.html?id=${e.target.dataset.id}`;
      searchResults.classList.remove("active");
      searchResults.innerHTML = "";
    }
  });

  /**
   * Cierra el menú de búsqueda al presionar la tecla "Escape".
   * 
   * @event keydown
   * @param {KeyboardEvent} e - Evento de teclado.
  */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchResults.classList.remove("active");
      searchResults.innerHTML = "";
      searchWrapper.classList.remove("active");
    }
  });

  /**
   * Alterna la clase "menu-open" en el navbar al hacer clic en el botón de menú.
   */
  if (navbarToggler && navbar) {
    navbarToggler.addEventListener("click", () => {
      navbar.classList.toggle("menu-open");
    });
  }

  /**
  * Cierra la barra de búsqueda si el usuario hace clic fuera de ella.
  * 
  * @event click
  * @param {MouseEvent} event - Evento de clic en el documento.
  */
  if (navbarToggler && navbarContent) {
    document.addEventListener("click", (event) => {
      const searchWrapper = document.querySelector(".search-wrapper");
      const searchInput = document.getElementById("searchInput");
      const searchToggle = document.querySelector(".search-toggle");

      // Verifica si el clic fue fuera de la barra de búsqueda y del botón de búsqueda
      if (
        searchWrapper.classList.contains("active") &&
        !searchWrapper.contains(event.target) &&
        !searchToggle.contains(event.target)
      ) {
        searchWrapper.classList.remove("active");
        searchInput.value = ""; // limpia la barra de búsqueda
      }
    });
  }

  /**
   * Cierra automáticamente el menú de navegación si el usuario hace clic fuera de él.
   * 
   * @event click
   * @param {MouseEvent} event - Evento de clic en el documento.
   */
  document.addEventListener("click", function (event) {
    const navbar = document.getElementById("navbarContent");
    const toggler = document.querySelector(".navbar-toggler");

    if (
      navbar.classList.contains("show") && // Verifica si el navbar está abierto
      !navbar.contains(event.target) && // Verifica si el clic fue fuera del navbar
      !toggler.contains(event.target) // Verifica si el clic no fue en el botón de toggler
    ) {
      toggler.click(); // Cierra el navbar
    }
  });

  /**
   * Agrega eventos a los botones de "Más información" para mostrar los detalles de la película.
   */
  document.querySelectorAll(".info-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const movieId = e.currentTarget.getAttribute("data-id");
      await mostrarInformacionPelicula(movieId);
    });
  });

  // Cargar películas y contenido inicial
  fetchTrendingMovie();
  cargarPeliculas();
});

// FUNCIONES QUE NO DEPENDEN DEL DOM (Pueden ejecutarse en cualquier momento)

/**
 * Obtiene el usuario actualmente autenticado desde localStorage.
 * 
 * @returns {Object|null} - Datos del usuario autenticado o null si no hay sesión activa.
 */
function obtenerUsuarioActual() {
  return JSON.parse(localStorage.getItem("loggedUser")) || null;
}

/**
 * Obtiene la lista de películas favoritas del usuario autenticado.
 * 
 * @returns {Array<Object>} - Lista de películas favoritas o un array vacío si no hay usuario.
 */
function obtenerFavoritos() {
  const usuario = obtenerUsuarioActual();
  if (!usuario) return [];
  return (
    JSON.parse(localStorage.getItem(`favoritos_${usuario.username}`)) || []
  );
}

/**
 * Guarda la lista de películas favoritas en localStorage para el usuario autenticado.
 * 
 * @param {Array<Object>} favoritos - Lista actualizada de películas favoritas.
 */
function guardarFavoritos(favoritos) {
  const usuario = obtenerUsuarioActual();
  if (!usuario) return;
  localStorage.setItem(
    `favoritos_${usuario.username}`,
    JSON.stringify(favoritos)
  );
}

/**
 * Agrega o elimina una película de la lista de favoritos del usuario y actualiza la interfaz.
 * 
 * @param {number} movieId - ID de la película a agregar o eliminar.
 * @param {string} movieTitle - Título de la película.
 * @param {string} moviePoster - URL del póster de la película.
 */
function actualizarBotonFavoritos(movieId, movieTitle, moviePoster) {
  const usuario = obtenerUsuarioActual();
  if (!usuario) return;

  let favoritos = obtenerFavoritos();
  const existe = favoritos.some((peli) => peli.id === movieId);

  if (existe) {
    favoritos = favoritos.filter((peli) => peli.id !== movieId);
  } else {
    favoritos.push({ id: movieId, title: movieTitle, poster: moviePoster });
  }

  guardarFavoritos(favoritos);

  // ACTUALIZAR COLOR DEL BOTÓN EN TODAS LAS TARJETAS
  document
    .querySelectorAll(`.fav-btn[data-id='${movieId}']`)
    .forEach((button) => {
      button.classList.toggle("btn-danger", !existe);
      button.classList.toggle("btn-outline-secondary", existe);
    });
}












