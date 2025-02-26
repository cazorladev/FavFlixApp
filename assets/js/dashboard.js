document.addEventListener("DOMContentLoaded", async function () {
  document.querySelector(".resultados-container").style.display = "none";
  // Obtener datos del usuario desde localStorage
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

  // Tiempo de inactividad en milisegundos (15 minutos)
  const INACTIVITY_TIME = 10 * 60 * 1000;
  let inactivityTimer;

  // Función para cerrar sesión automáticamente
  function logoutUser() {
    localStorage.removeItem("loggedUser");
    window.location.replace("../index.html");
  }

  // Reiniciar el temporizador de inactividad
  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(logoutUser, INACTIVITY_TIME);
  }

  // Eventos que reinician el temporizador cuando el usuario interactúa
  document.addEventListener("mousemove", resetInactivityTimer);
  document.addEventListener("keypress", resetInactivityTimer);
  document.addEventListener("click", resetInactivityTimer);
  document.addEventListener("scroll", resetInactivityTimer);
  document.addEventListener("touchstart", resetInactivityTimer);

  // Iniciar el temporizador al cargar la página
  resetInactivityTimer();

  // Extraer inicial del nombre de usuario con validación
  const initials = userData?.username
    ? userData.username.charAt(0).toUpperCase()
    : "";
  const userInitialsElement = document.querySelector(".profile-initials");

  if (userInitialsElement) userInitialsElement.textContent = initials;

  // Botón de cerrar sesión
  const logoutButton = document.querySelector("#logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("loggedUser");
      window.location.replace("../index.html");
    });
  }

  // API Configuración
  const API_KEY = "7154c887e726b37b3d012f91ada2bf12";
  const API_BASE_URL = "https://api.themoviedb.org/3";

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

  // URLs para las secciones de películas
  const urls = {
    populares: `${API_BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`,
    estrenos: `${API_BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=es-ES&page=1`,
    vistas: `${API_BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=es-ES&page=1`,
  };

  // Obtener lista de géneros
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
    .catch((error) => console.error("❌ Error al obtener géneros:", error));

  // Función para obtener clasificación por edades
  function getAgeRating(certifications) {
    const usCertifications =
      certifications.find((cert) => cert.iso_3166_1 === "US")?.release_dates ||
      [];
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

  // Función para obtener una película en tendencia para el Hero
  async function fetchTrendingMovie() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=es-ES`
      );
      const data = await response.json();
      let validMovies = data.results.filter(
        (movie) => movie.overview && movie.backdrop_path
      );
      validMovies.sort(() => Math.random() - 0.5);
      const movie = validMovies[0];

      const certificationResponse = await fetch(
        `${API_BASE_URL}/movie/${movie.id}/release_dates?api_key=${API_KEY}`
      );
      const certificationData = await certificationResponse.json();
      const ageLabel = getAgeRating(certificationData.results);

      const img = new Image();
      img.src = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
      img.onload = () => {
        heroSection.style.backgroundSize =
          img.width / img.height > 2 ? "contain" : "cover";
      };
      heroSection.style.backgroundImage = `url(${img.src})`;
      heroTitle.textContent = movie.title;
      heroDescription.textContent = movie.overview.substring(0, 200) + "...";
      ageRating.textContent = ageLabel;
    } catch (error) {
      console.error("Error obteniendo película en tendencia:", error);
    }
  }

  // Función para obtener y mostrar películas en cada sección
  function cargarPeliculas() {
    Object.keys(urls).forEach((categoria) => {
      fetch(urls[categoria])
        .then((response) => response.json())
        .then((data) => mostrarPeliculas(data.results, categoria))
        .catch((error) =>
          console.error(`Error al obtener ${categoria}:`, error)
        );
    });
  }

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

      // 🔴 Verificar si la película ya está en favoritos y actualizar el color del botón
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

  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    });
  }

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

  // CAMBIOI HOY
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
      favButton.addEventListener("click", () => {
        actualizarBotonFavoritos(movie.id, movie.title, movie.poster_path);
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

  searchResults.addEventListener("click", (e) => {
    if (e.target.classList.contains("search-item")) {
      window.location.href = `movie.html?id=${e.target.dataset.id}`;
      searchResults.classList.remove("active");
      searchResults.innerHTML = "";
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchResults.classList.remove("active");
      searchResults.innerHTML = "";
      searchWrapper.classList.remove("active");
    }
  });

  if (navbarToggler && navbar) {
    navbarToggler.addEventListener("click", () => {
      navbar.classList.toggle("menu-open");
    });
  }

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
        searchInput.value = ""; // Opcional: limpiar la barra de búsqueda
      }
    });
  }

  // Cierre automático del navbar en móviles
  document.addEventListener("click", function (event) {
    const navbar = document.getElementById("navbarContent");
    const toggler = document.querySelector(".navbar-toggler");

    if (
      navbar.classList.contains("show") &&
      !navbar.contains(event.target) &&
      !toggler.contains(event.target)
    ) {
      toggler.click();
    }
  });

  fetchTrendingMovie();
  cargarPeliculas();
  // mostrarFavoritos();
});

// Agregar evento para abrir el modal con la información de la película
document.querySelectorAll(".info-btn").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    const movieId = e.currentTarget.getAttribute("data-id");
    await mostrarInformacionPelicula(movieId);
  });
});

// FUNCIONES QUE NO DEPENDEN DEL DOM (Pueden estar fuera de DOMContentLoaded)
function obtenerUsuarioActual() {
  return JSON.parse(localStorage.getItem("loggedUser")) || null;
}
//FUNCIONES QUE NO DEPENDEN DEL DOM (Pueden estar fuera de DOMContentLoaded)
function obtenerFavoritos() {
  const usuario = obtenerUsuarioActual();
  if (!usuario) return [];
  return (
    JSON.parse(localStorage.getItem(`favoritos_${usuario.username}`)) || []
  );
}
function guardarFavoritos(favoritos) {
  const usuario = obtenerUsuarioActual();
  if (!usuario) return;
  localStorage.setItem(
    `favoritos_${usuario.username}`,
    JSON.stringify(favoritos)
  );
}

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

function mostrarFavoritos() {
  const contenedor = document.getElementById("favoritos");
  contenedor.innerHTML = ""; // Limpia la lista antes de actualizar

  const favoritos = obtenerFavoritos();

  if (favoritos.length === 0) {
    contenedor.innerHTML =
      "<p class='text-white'>No tienes películas favoritas aún.</p>";
    return;
  }

  favoritos.forEach((pelicula) => {
    const card = document.createElement("div");
    card.classList.add("trend-item");
    card.setAttribute("data-id", pelicula.id);

    const img = document.createElement("img");
    img.src = `https://image.tmdb.org/t/p/w500${pelicula.poster}`;
    img.alt = pelicula.title;

    // Botón para eliminar de favoritos
    const removeFavButton = document.createElement("button");
    removeFavButton.type = "button";
    removeFavButton.classList.add(
      "btn",
      "btn-outline-secondary",
      "remove-favorite"
    );
    removeFavButton.title = "Eliminar de favoritos";
    removeFavButton.innerHTML = `<i class="bi bi-heart-fill text-danger"></i>`;

    removeFavButton.addEventListener("click", () => {
      const nuevosFavoritos = obtenerFavoritos().filter(
        (peli) => peli.id !== pelicula.id
      );
      guardarFavoritos(nuevosFavoritos);
      mostrarFavoritos();
    });

    card.appendChild(img);
    card.appendChild(removeFavButton);
    contenedor.appendChild(card);
  });
}
