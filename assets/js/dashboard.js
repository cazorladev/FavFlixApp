document.addEventListener("DOMContentLoaded", async function () {
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

  // Extraer inicial del nombre de usuario con validación
  const initials =
    typeof userData?.username === "string"
      ? userData.username.charAt(0).toUpperCase()
      : "";

  const userInitialsElement = document.querySelector(".profile-initials");

  if (userInitialsElement) {
    userInitialsElement.textContent = initials;
  } else {
    console.error(
      "No se encontró el elemento para mostrar las iniciales del usuario."
    );
  }

  // Obtener el botón de cerrar sesión
  const logoutButton = document.querySelector("#logout");

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("loggedUser"); // Elimina usuario almacenado
      window.location.replace("../index.html"); // Redirige a la página principal usando una ruta relativa
    });
  } else {
    console.error("No se encontró el botón de cerrar sesión.");
  }

  // Selección de elementos del DOM
  const navbar = document.getElementById("mainNav");
  const navbarToggler = document.querySelector(".navbar-toggler");
  const navbarContent = document.querySelector("#navbarContent");
  const heroTitle = document.querySelector(".hero-title");
  const heroDescription = document.querySelector(".hero-description");
  const ageRating = document.querySelector(".age-rating");
  const heroSection = document.querySelector(".hero-section");

  // API de TMDb
  const API_KEY = "7154c887e726b37b3d012f91ada2bf12";
  const TRENDING_URL = `https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}&language=es`;

  // Función para obtener la clasificación por edades
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

  // Función para obtener una película en tendencia
  async function fetchTrendingMovie() {
    try {
      // Obtener películas en tendencia
      const response = await fetch(TRENDING_URL);
      if (!response.ok)
        throw new Error(`Error en la solicitud: ${response.status}`);

      const data = await response.json();
      if (!data?.results || data.results.length === 0) {
        throw new Error("No se encontraron películas en tendencia.");
      }

      // Obtener clasificaciones por edades de todas las películas en una sola petición
      const moviesWithCertifications = await Promise.all(
        data.results.map(async (movie) => {
          if (!movie || !movie.id) return null;

          const certificationsResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}/release_dates?api_key=${API_KEY}&language=es`
          );

          if (!certificationsResponse.ok) return null;

          const certificationsData = await certificationsResponse.json();
          const ageLabel = getAgeRating(certificationsData.results);

          return {
            ...movie,
            ageLabel,
          };
        })
      );

      // Filtrar películas válidas
      const validMovies = moviesWithCertifications.filter(
        (movie) =>
          movie && movie.backdrop_path && movie.ageLabel !== "Desconocido"
      );

      if (validMovies.length === 0) {
        throw new Error("No se pudo encontrar una película válida.");
      }

      // Seleccionar una película aleatoria de las filtradas
      const movie = validMovies[Math.floor(Math.random() * validMovies.length)];

      // Verificar si los elementos existen antes de modificar sus propiedades
      if (heroTitle) heroTitle.textContent = movie.title;
      if (heroDescription) {
        heroDescription.textContent = movie.overview
          ? movie.overview.substring(0, 200) + "..."
          : "Descripción no disponible.";
      }
      if (ageRating) ageRating.textContent = movie.ageLabel;
      if (heroSection) {
        heroSection.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`;
      }
    } catch (error) {
      console.error("Error obteniendo película en tendencia:", error);

      if (heroTitle) heroTitle.textContent = "Error al cargar la película";
      if (heroDescription) {
        heroDescription.textContent =
          "No se pudo cargar la película en tendencia. Por favor, inténtalo de nuevo más tarde.";
      }
      if (ageRating) ageRating.textContent = "";
      if (heroSection) heroSection.style.backgroundImage = "";
    }
  }

  fetchTrendingMovie();

  // Cambio de color en la barra de navegación al hacer scroll
  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    });
  }

  // Búsqueda interactiva
  const searchWrapper = document.querySelector(".search-wrapper");
  const searchToggle = document.querySelector(".search-toggle");
  const searchInput = document.querySelector(".search-input");
  searchToggle.addEventListener("click", () => {
    searchWrapper.classList.toggle("active");
    if (searchWrapper.classList.contains("active")) {
      setTimeout(() => searchInput.focus(), 300); // Espera 300ms antes de aplicar focus
    }
  });

  document.addEventListener("click", (e) => {
    if (
      searchWrapper &&
      !searchWrapper.contains(e.target) &&
      searchWrapper.classList.contains("active") &&
      searchInput.value.trim() === ""
    ) {
      searchWrapper.classList.remove("active");
    }
  });

  // Botones de acción
  const playBtn = document.querySelector(".play-btn");
  const infoBtn = document.querySelector(".info-btn");

  if (playBtn) {
    playBtn.addEventListener("click", () => console.log("Play button clicked"));
  }
  if (infoBtn) {
    infoBtn.addEventListener("click", () =>
      console.log("More Info button clicked")
    );
  }

  // Manejo de dropdowns
  document.addEventListener("click", (event) => {
    document.querySelectorAll(".dropdown-menu.show").forEach((menu) => {
      if (
        !menu.contains(event.target) &&
        menu.previousElementSibling &&
        !menu.previousElementSibling.contains(event.target)
      ) {
        menu.classList.remove("show");
        menu.previousElementSibling.setAttribute("aria-expanded", "false");
      }
    });
  });

  // Manejar el clic en el botón de toggle del dropdown
  document.querySelectorAll(".dropdown-toggle").forEach((toggle) => {
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      const dropdownMenu = toggle.nextElementSibling;

      if (!dropdownMenu || !dropdownMenu.classList.contains("dropdown-menu")) {
        return;
      }

      dropdownMenu.classList.toggle("show");
      toggle.setAttribute(
        "aria-expanded",
        dropdownMenu.classList.contains("show")
      );
    });
  });

  // Menú en dispositivos móviles
  if (navbarToggler && navbar) {
    navbarToggler.addEventListener("click", () => {
      navbar.classList.toggle("menu-open");
    });
  }

  if (navbarToggler && navbarContent) {
    document.addEventListener("click", function (event) {
      if (
        navbarContent &&
        !navbarContent.contains(event.target) &&
        navbarToggler &&
        !navbarToggler.contains(event.target) &&
        navbarContent.classList.contains("show")
      ) {
        navbarToggler.click();
      }
    });
  }
});
