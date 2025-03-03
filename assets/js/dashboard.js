/**
 * Espera a que el DOM esté completamente cargado antes de ejecutar el código.
 */
document.addEventListener("DOMContentLoaded", async function () {
  /** Oculta la sección de resultados de búsqueda al cargar la página */
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

  /** Redirige al usuario si no hay sesión activa */
  if (!userData) {
    window.location.href = "../index.html"; // Redirige si no hay datos de usuario
    return;
  }

  // =============================
  // CONFIGURACIÓN DE INACTIVIDAD Y SESIÓN
  // =============================

  /** Tiempo de inactividad permitido antes de cerrar sesión (en milisegundos) */
  const INACTIVITY_TIME = 1 * 60 * 1000;

  /** Variable para almacenar el temporizador de inactividad */
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

  /** Detectar actividad del usuario y reiniciar el temporizador */
  ["mousemove", "keypress", "click", "scroll", "touchstart"].forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
  });

  /** Iniciar el temporizador al cargar la página */
  resetInactivityTimer();

  // =============================
  // MOSTRAR INICIAL DEL USUARIO EN EL PERFIL
  // =============================

  /**
   * Extrae la inicial del nombre de usuario y la muestra en el perfil.
   * @param {Object} userData - Datos del usuario autenticado.
   */
  const initials = userData.username ? userData.username.charAt(0).toUpperCase() : "";
  const userInitialsElement = document.querySelector(".profile-initials");
  if (userInitialsElement) userInitialsElement.textContent = initials;

  // =============================
  // CONFIGURACIÓN DEL BOTÓN DE CIERRE DE SESIÓN
  // =============================
  
  /** Obtiene el botón de cierre de sesión */
  const logoutButton = document.querySelector("#logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("loggedUser");
      window.location.replace("../index.html");
    });
  }

  /** Clave de API y URL base para obtener datos de películas desde TMDB */
  const API_KEY = "7154c887e726b37b3d012f91ada2bf12";
  const API_BASE_URL = "https://api.themoviedb.org/3";

  /** URLs para obtener películas de diferentes categorías */
  const urls = {
    populares: `${API_BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`,
    estrenos: `${API_BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=es-ES&page=1`,
    vistas: `${API_BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=es-ES&page=1`,
  };

  /** Elementos del DOM seleccionados */
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

  /** @type {Object} - Almacena los géneros de películas con sus IDs */
  let generosMap = {};

  /** 
   * Obtiene la lista de géneros de películas desde la API y los almacena en `generosMap`. 
   * Se usa `fetch` para hacer la petición y los datos se procesan en formato JSON. 
   */
  await fetch(
    `${API_BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=es-ES`
  )
    .then((response) => response.json()) // Convierte la respuesta en JSON
    .then((data) => {
      // Almacena los géneros en el objeto `generosMap` con ID como clave y nombre como valor
      data.genres.forEach((genre) => {
        generosMap[genre.id] = genre.name;
      });
    })
    .catch((error) => console.error("Error al obtener géneros:", error)); // Manejo de errores en la petición

  /**
  * Obtiene la clasificación por edades de una película basada en certificaciones.
  * @param {Array<Object>} certifications - Lista de certificaciones de edad por país.
  * @returns {string} - Clasificación de edad en formato legible.
  */
  function getAgeRating(certifications) {
    // Filtra las certificaciones para encontrar las de EE.UU.
    const usCertifications = certifications.find((cert) => cert.iso_3166_1 === "US")?.release_dates || [];

    // Obtiene la clasificación de la primera certificación encontrada    
    const usRating = usCertifications[0]?.certification || "";

    // Mapeo de clasificaciones de EE.UU. a etiquetas más comprensibles
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

    // Retorna la clasificación traducida o "Desconocido" si no hay coincidencia
    return ratingMap[usRating] || "Desconocido";
  }

  /**
   * Agrega o quita la clase 'scrolled' al navbar según el desplazamiento de la página.
   * Esto se usa para cambiar el estilo del navbar cuando el usuario hace scroll.
   */
  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    });
  }

  /**
   * Obtiene y muestra una película en tendencia en la Hero Section.
   * La película se elige aleatoriamente de las tendencias semanales.
   */
  async function fetchTrendingMovie() {
    try {
      // Realiza la petición para obtener películas en tendencia de la semana
      const response = await fetch(`${API_BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=es-ES`);
      const data = await response.json();

      // Filtra las películas que tienen descripción e imagen de fondo
      let validMovies = data.results.filter((movie) => movie.overview && movie.backdrop_path);

      // Mezcla aleatoriamente las películas y selecciona una
      validMovies.sort(() => Math.random() - 0.5);
      const movie = validMovies[0];

      // Obtiene la clasificación por edad de la película
      const certificationResponse = await fetch(`${API_BASE_URL}/movie/${movie.id}/release_dates?api_key=${API_KEY}`);
      const certificationData = await certificationResponse.json();
      const ageLabel = getAgeRating(certificationData.results);

      // Crea un objeto de imagen para verificar su tamaño antes de aplicarla como fondo
      const img = new Image();
      img.src = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;

      // Ajusta el tamaño del fondo dependiendo de la relación de aspecto de la imagen
      img.onload = () => {
        heroSection.style.backgroundSize = img.width / img.height > 2 ? "contain" : "cover";
      };

      // Establece la imagen de fondo y el contenido del Hero Section
      heroSection.style.backgroundImage = `url(${img.src})`;
      heroTitle.textContent = movie.title;
      heroDescription.textContent = movie.overview.substring(0, 200) + "...";
      ageRating.textContent = ageLabel;
    } catch (error) {
      console.error("Error obteniendo película en tendencia:", error); // Manejo de errores en la petición
    }
  }

  /**
   * Obtiene y muestra películas en diferentes categorías.
   * Utiliza las URLs almacenadas en `urls` para hacer llamadas a la API de TMDB.
   */
  function cargarPeliculas() {
    Object.keys(urls).forEach((categoria) => {
      fetch(urls[categoria])
        .then((response) => response.json()) // Convierte la respuesta en JSON
        .then((data) => mostrarPeliculas(data.results, categoria)) // Llama a la función para mostrar películas
        .catch((error) => console.error(`Error al obtener ${categoria}:`, error)); // Manejo de errores en la petición
    });
  }

  /**
   * Muestra películas en una sección específica del dashboard.
   * Crea dinámicamente tarjetas de películas y las inserta en el DOM.
   * 
   * @param {Array<Object>} peliculas - Lista de películas obtenidas de la API.
   * @param {string} categoria - ID del contenedor donde se mostrarán las películas.
   */
  function mostrarPeliculas(peliculas, categoria) {
    const contenedor = document.getElementById(categoria);
    contenedor.innerHTML = ""; // Limpia el contenido previo antes de insertar nuevas películas

    peliculas.forEach((pelicula) => {
      // Crear la tarjeta de película
      const card = document.createElement("div");
      card.classList.add("card");

      // Crear y configurar la imagen de la película
      const img = document.createElement("img");
      img.src = `https://image.tmdb.org/t/p/w500${pelicula.poster_path}`;
      img.classList.add("card-img-top");

      // Contenedor del contenido de la tarjeta
      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body");

      // Agregar el título de la película
      const title = document.createElement("h6");
      title.classList.add("card-title");
      title.textContent = pelicula.title;

      // Contenedor de géneros de la película
      const genresContainer = document.createElement("ul");
      genresContainer.classList.add("genres", "d-flex", "my-2");

      // Agregar los géneros a la lista
      pelicula.genre_ids.forEach((genreId) => {
        if (generosMap[genreId]) {
          const genreItem = document.createElement("li");
          genreItem.textContent = generosMap[genreId];
          genresContainer.appendChild(genreItem);
        }
      });

      // Contenedor de los botones de interacción
      const iconsContainer = document.createElement("div");
      iconsContainer.classList.add("d-flex", "justify-content-between");

      // Contenedor izquierdo (favoritos)
      const leftIcons = document.createElement("div");

      // Crear botón de favoritos
      const favButton = document.createElement("button");
      favButton.type = "button";
      favButton.classList.add("btn", "fav-btn");
      favButton.setAttribute("data-id", pelicula.id);
      favButton.innerHTML = `<i class="bi bi-heart-fill"></i>`; // Ícono de favorito
      favButton.title = "Agregar a Favoritos";

      // Verificar si la película ya está en favoritos y actualizar el color del botón
      const favoritos = obtenerFavoritos();
      const estaEnFavoritos = favoritos.some((peli) => peli.id === pelicula.id);
      favButton.classList.toggle("btn-danger", estaEnFavoritos); // Si está en favoritos, se marca en rojo
      favButton.classList.toggle("btn-outline-secondary", !estaEnFavoritos); // Si no está, mantiene el estilo original

      // Evento para agregar/quitar favoritos
      favButton.addEventListener("click", () => {
        actualizarBotonFavoritos(
          pelicula.id,
          pelicula.title,
          pelicula.poster_path
        );
        mostrarFavoritos(); // Refrescar la lista de favoritos después de la acción
      });

      leftIcons.appendChild(favButton); // Agregar el botón de favoritos al contenedor izquierdo

      // Contenedor derecho (más información)
      const rightIcons = document.createElement("div");
      const infoButton = document.createElement("button");
      infoButton.type = "button";
      infoButton.classList.add("btn", "btn-outline-secondary", "info-btn");
      infoButton.setAttribute("data-id", pelicula.id);
      infoButton.innerHTML = `<i class="bi bi-arrow-down-circle-fill"></i>`; // Ícono de más información
      infoButton.title = "Más información";

      rightIcons.appendChild(infoButton);
      iconsContainer.appendChild(leftIcons);
      iconsContainer.appendChild(rightIcons);

      // Agregar elementos a la tarjeta de película
      cardBody.appendChild(title);
      cardBody.appendChild(genresContainer);
      cardBody.appendChild(iconsContainer);
      card.appendChild(img);
      card.appendChild(cardBody);
      contenedor.appendChild(card);
    });

    /**
     * Agregar evento a los botones de "Más información".
     * Al hacer clic en uno de estos botones, se obtiene la información detallada de la película.
     */
    document.querySelectorAll(".info-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const movieId = e.currentTarget.getAttribute("data-id");
        await mostrarInformacionPelicula(movieId);
      });
    });
  }

  /**
   * Obtiene y muestra la información detallada de una película en un modal.
   * Hace una petición a la API de TMDB para obtener detalles de la película seleccionada.
   *
   * @param {number} movieId - ID de la película a consultar.
   */
  async function mostrarInformacionPelicula(movieId) {
    const API_KEY = "7154c887e726b37b3d012f91ada2bf12";
    const API_BASE_URL = "https://api.themoviedb.org/3";

    try {
      // Realiza la petición a la API para obtener detalles de la película
      const response = await fetch(
        `${API_BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=es-ES`
      );
      const movie = await response.json(); // Convierte la respuesta en JSON

      // Actualiza el título de la película en el modal
      document.getElementById("movieTitle").textContent = movie.title;

      // Asigna la imagen de la película, si no tiene, usa una imagen por defecto
      document.getElementById("movieImage").src = `https://image.tmdb.org/t/p/original${
        movie.backdrop_path || "/assets/img/default-movie.jpg"
      }`;

      // Actualiza la descripción de la película
      document.getElementById("movieDescription").textContent = movie.overview;

      // Extrae el año de la fecha de lanzamiento y lo muestra
      document.getElementById("movieYear").textContent = movie.release_date.split("-")[0];

      // Muestra los géneros de la película en formato "Acción, Drama, Aventura"
      document.getElementById("movieGenre").textContent = movie.genres
        .map((g) => g.name)
        .join(", ");

      // Actualiza el estado del botón de favoritos en el modal
      actualizarBotonFavoritos(movieId, movie.title);

      // Obtiene el modal de Bootstrap y lo muestra
      const movieModal = new bootstrap.Modal(
        document.getElementById("movieModal")
      );
      movieModal.show();
    } catch (error) {
      console.error("Error obteniendo la información de la película:", error); // Manejo de errores en la petición
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
      searchResults.innerHTML = ""; // Limpia resultados anteriores
      searchResults.classList.remove("active"); // Oculta la lista de sugerencias
      return;
    }
    searchResults.innerHTML = ""; // Limpia los resultados previos
    movies.slice(0, 5).forEach((movie) => {
      const div = document.createElement("div");
      div.classList.add("search-item"); // Agrega una clase CSS para estilos
      div.dataset.id = movie.id; // Almacena el ID de la película en un atributo de datos
      div.textContent = movie.title; // Asigna el título de la película
      searchResults.appendChild(div); // Agrega la sugerencia al contenedor
    });
  }

  /**
   * Alterna la visibilidad del campo de búsqueda y ajusta la posición del menú de sugerencias.
   * Cuando el usuario hace clic en el botón de búsqueda, se muestra u oculta el campo de búsqueda.
   */
  searchToggle.addEventListener("click", () => {
    searchWrapper.classList.toggle("active"); // Alterna la visibilidad del campo de búsqueda

    if (searchWrapper.classList.contains("active")) {
      setTimeout(() => {
        searchInput.focus(); // Enfoca automáticamente el input al abrirse
        searchResults.style.width = `${searchInput.offsetWidth}px`; // Ajusta el ancho de la lista de sugerencias
        searchResults.style.left = `${searchInput.offsetLeft}px`; // Alinea la lista con el input de búsqueda
      }, 300); // Retardo para asegurar que el elemento está visible antes de calcular su tamaño
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
      event.preventDefault(); // Evita el envío automático del formulario
      const query = searchInput.value.trim(); // Obtiene el valor del input sin espacios extra
      if (query) {
        await fetchSearchResults(query); // Realiza la búsqueda

        // Desplazar la vista a la sección de resultados con una pequeña demora
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
      // Llamada a la API de TMDB para obtener películas que coincidan con la búsqueda
      const response = await fetch(
        `${API_BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${query}`
      );
      const data = await response.json();

      if (data.results.length > 0) {
        document.querySelector(".resultados-container").style.display = "block"; // Muestra la sección
        displaySearchResults(data.results); // Llama a la función para mostrar resultados

        // Desplazar a la sección de resultados con una pequeña demora
        setTimeout(() => {
          document.getElementById("resultados-busqueda").scrollIntoView({
            behavior: "smooth",
          });
        }, 300);
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error); // Manejo de errores
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
      // Crear la tarjeta de la película
      const card = document.createElement("div");
      card.classList.add("card", "position-relative");
    
      // Imagen de la película
      const img = document.createElement("img");
      img.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      img.classList.add("card-img-top");
    
      // Contenedor del contenido de la tarjeta
      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body");
    
      // Título de la película
      const title = document.createElement("h6");
      title.classList.add("card-title");
      title.textContent = movie.title;
    
      // Contenedor para los botones
      const buttonsContainer = document.createElement("div");
      buttonsContainer.classList.add("d-flex", "justify-content-between", "w-100");
    
      // Botón "Agregar a Favoritos"
      const favButton = document.createElement("button");
      favButton.type = "button";
      favButton.classList.add("btn", "btn-outline-secondary", "fav-btn");
      favButton.setAttribute("data-id", movie.id);
      favButton.innerHTML = `<i class="bi bi-heart-fill"></i>`; // Ícono de favorito
      favButton.title = "Agregar a Favoritos";
    
      // Verificar si la película ya está en favoritos y actualizar el color del botón
      const favoritos = obtenerFavoritos();
      const estaEnFavoritos = favoritos.some((peli) => peli.id === movie.id);
      favButton.classList.toggle("btn-danger", estaEnFavoritos); // Si está en favoritos, se marca en rojo
      favButton.classList.toggle("btn-outline-secondary", !estaEnFavoritos); // Si no está, mantiene el estilo original
    
      // Evento para agregar/quitar favoritos
      favButton.addEventListener("click", () => {actualizarBotonFavoritos(movie.id, movie.title, movie.poster_path);
        mostrarFavoritos(); // Refrescar la lista de favoritos después de la acción
      });
    
      // Botón "Más Información"
      const infoButton = document.createElement("button");
      infoButton.type = "button";
      infoButton.classList.add("btn", "btn-outline-secondary", "info-btn");
      infoButton.setAttribute("data-id", movie.id);
      infoButton.innerHTML = `<i class="bi bi-arrow-down-circle-fill"></i>`; // Ícono de más información
      infoButton.title = "Más información";
    
      // Evento para abrir el modal con la información de la película
      infoButton.addEventListener("click", async () => { 
        await mostrarInformacionPelicula(movie.id);
      });
    
      // Agregar botones al contenedor
      buttonsContainer.appendChild(favButton);
      buttonsContainer.appendChild(infoButton);
    
      // Agregar elementos al cardBody
      cardBody.appendChild(title);
      cardBody.appendChild(buttonsContainer);
      card.appendChild(img);
      card.appendChild(cardBody);
    
      // Agregar la tarjeta de película al contenedor de resultados
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
    // Verifica si el clic fue en un elemento de la lista de resultados
    if (e.target.classList.contains("search-item")) {

      // Redirige a la página de detalles de la película con su ID como parámetro
      window.location.href = `movie.html?id=${e.target.dataset.id}`;

      // Oculta y limpia la lista de sugerencias de búsqueda
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
      // Oculta y limpia la lista de sugerencias de búsqueda
      searchResults.classList.remove("active");
      searchResults.innerHTML = "";

      // Cierra el campo de búsqueda si estaba abierto
      searchWrapper.classList.remove("active");
    }
  });

  /**
   * Alterna la clase "menu-open" en el navbar al hacer clic en el botón de menú.
   */
  if (navbarToggler && navbar) {
    navbarToggler.addEventListener("click", () => {
      navbar.classList.toggle("menu-open"); // Abre o cierra el menú
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
        searchWrapper.classList.remove("active"); // Oculta la barra de búsqueda
        searchInput.value = ""; // Limpia el contenido del campo de búsqueda
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

    // Verifica si el menú de navegación está abierto y si el clic fue fuera del navbar y del botón de toggler
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
      const movieId = e.currentTarget.getAttribute("data-id"); // Obtiene el ID de la película
      await mostrarInformacionPelicula(movieId); // Muestra la información de la película en el modal
    });
  });

  // Cargar películas y contenido inicial
  fetchTrendingMovie();
  cargarPeliculas();
});

// ===============================
// FUNCIONES QUE NO DEPENDEN DEL DOM
// (Pueden ejecutarse en cualquier momento sin necesidad de que el DOM esté cargado)
// ===============================

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
  if (!usuario) return []; // Si no hay usuario autenticado, retorna una lista vacía.
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
  if (!usuario) return; // Si no hay usuario autenticado, no guarda nada.

  // Almacena la lista de favoritos en localStorage bajo la clave específica del usuario.
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
  if (!usuario) return; // Si no hay usuario autenticado, no realiza cambios.

  let favoritos = obtenerFavoritos(); // Obtiene la lista actual de favoritos.
  const existe = favoritos.some((peli) => peli.id === movieId); // Verifica si la película ya está en favoritos.

  if (existe) {
    // Si la película ya está en favoritos, la elimina.
    favoritos = favoritos.filter((peli) => peli.id !== movieId);
  } else {
    // Si la película no está en favoritos, la agrega.
    favoritos.push({ id: movieId, title: movieTitle, poster: moviePoster });
  }

  guardarFavoritos(favoritos); // Guarda la lista actualizada en localStorage.

  /**
   * Actualiza el color del botón de favoritos en todas las tarjetas de películas
   * para reflejar el estado actualizado (agregado o eliminado de favoritos).
   */
  document .querySelectorAll(`.fav-btn[data-id='${movieId}']`) .forEach((button) => {
      button.classList.toggle("btn-danger", !existe); // Si la película se agregó, cambia a color rojo.
      button.classList.toggle("btn-outline-secondary", existe); // Si se eliminó, regresa al color original.
    });
}












