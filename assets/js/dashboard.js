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
  const initials = userData?.username ? userData.username.charAt(0).toUpperCase() : "";
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

  // Selección de elementos del DOM
  const heroTitle = document.querySelector(".hero-title");
  const heroDescription = document.querySelector(".hero-description");
  const ageRating = document.querySelector(".age-rating");
  const heroSection = document.querySelector(".hero-section");

  // Selección de elementos de la barra de navegación
  const navbar = document.getElementById("mainNav");
  const navbarToggler = document.querySelector(".navbar-toggler");
  const navbarContent = document.querySelector("#navbarContent");

  // API de TMDb
  const API_KEY = "7154c887e726b37b3d012f91ada2bf12";
  const API_BASE_URL = "https://api.themoviedb.org/3";

  // Endpoints para diferentes categorías de películas
  const ENDPOINTS = {
    trending: `${API_BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=es-ES`,
    trendingAction: `${API_BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28&sort_by=popularity.desc&language=es-ES`,
    popular: `${API_BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`,
    topRated: `${API_BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=es-ES&page=1`,
    nowPlaying: `${API_BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=es-ES&page=1`,
    upcoming: `${API_BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=es-ES&page=1`,
  };

  // Función para obtener la clasificación por edades
  function getAgeRating(certifications) {
    const usCertifications =
      certifications.find((cert) => cert.iso_3166_1 === "US")?.release_dates || [];
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

  let lastMovieId = null; // Variable para almacenar la última película mostrada

    // Función para obtener una película en tendencia para el Hero
    async function fetchTrendingMovie() {
      try {
        const response = await fetch(ENDPOINTS.trending);
        if (!response.ok) throw new Error(`Error en la solicitud: ${response.status}`);
  
        const data = await response.json();
        if (!data?.results || data.results.length === 0) {
          throw new Error("No se encontraron películas en tendencia.");
        }
  
        // Filtrar películas con backdrop válido
        let validMovies = data.results.filter(
          movie => movie.overview && movie.backdrop_path
        );
  
        if (validMovies.length === 0) {
          console.warn("No hay películas con imágenes válidas. Se omitirá el Hero.");
          return;
        }
  
        // Barajar la lista antes de elegir una película
        validMovies.sort(() => Math.random() - 0.5);
        const movie = validMovies[0];
  
        // Obtener clasificación por edades
        const certificationResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/release_dates?api_key=${API_KEY}`
        );
        const certificationData = await certificationResponse.json();
        const ageLabel = getAgeRating(certificationData.results);
  
        // Ajuste dinámico del tamaño de fondo según la proporción de la imagen
        const img = new Image();
        img.src = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          if (aspectRatio > 2) {
            heroSection.style.backgroundSize = "contain"; // Evita recortes en imágenes muy anchas
          } else {
            heroSection.style.backgroundSize = "cover"; // Ajusta bien imágenes más cuadradas
          }
        };
  
        // Aplicar la imagen de fondo al Hero
        heroSection.style.backgroundImage = `url(${img.src})`;
        heroSection.style.backgroundPosition = "center top";
  
        // Mostrar contenido en el Hero
        if (heroTitle) heroTitle.textContent = movie.title;
        if (heroDescription) heroDescription.textContent = movie.overview.substring(0, 200) + "...";
        if (ageRating) ageRating.textContent = ageLabel;
  
      } catch (error) {
        console.error("Error obteniendo película en tendencia:", error);
      }
    }
  
  

  // Función para obtener películas y mostrarlas en un carrusel
  async function fetchMoviesForCarousel(url, containerId) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      const movies = data.results.slice(0, 15);

      const carouselContainer = document.getElementById(containerId);
      if (!carouselContainer) {
        console.error(`No se encontró el contenedor: ${containerId}`);
        return;
      }

      carouselContainer.innerHTML = '';

      for (let i = 0; i < movies.length; i += 5) {
        const activeClass = i === 0 ? "active" : "";
        const group = movies.slice(i, i + 5).map(movie => `
          <div class="trend-item">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            
          </div>
        `).join("");

        carouselContainer.innerHTML += `
          <div class="carousel-item ${activeClass}">
            <div class="trend-group">${group}</div>
          </div>
        `;
      }
    } catch (error) {
      console.error(`Error al obtener las películas de ${containerId}:`, error);
    }
  }

  // Llamar a la función para cargar el Hero
  fetchTrendingMovie();

  // Llamadas a las funciones para llenar cada carrusel
  fetchMoviesForCarousel(ENDPOINTS.popular, "popular-carousel-container");
  fetchMoviesForCarousel(ENDPOINTS.topRated, "top-rated-carousel-container");
  fetchMoviesForCarousel(ENDPOINTS.trendingAction, "carousel-container");
  fetchMoviesForCarousel(ENDPOINTS.nowPlaying, "now-playing-carousel-container");
  fetchMoviesForCarousel(ENDPOINTS.upcoming, "upcoming-carousel-container");

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
      setTimeout(() => searchInput.focus(), 300);
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
