document.addEventListener("DOMContentLoaded", () => {
  const userData = JSON.parse(localStorage.getItem("loggedUser"));

  if (!userData) {
    window.location.href = "index.html";
    return;
  }

  // Extraer inicial del nombre de usuario
  const initials = userData.username.charAt(0).toUpperCase();
  const userInitialsElement = document.querySelector(".profile-initials");

  if (userInitialsElement) {
    userInitialsElement.textContent = initials;
  }

  // Obtener el botón de cerrar sesión
  const logoutButton = document.querySelector("#logout");

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("loggedUser"); // Elimina usuario almacenado
      window.location.replace("/index.html"); // Redirige a la página principal
    });
  } else {
    console.error("No se encontró el botón de cerrar sesión.");
  }
});

document.addEventListener("DOMContentLoaded", async function () {
  // Selección de elementos del DOM
  const navbar = document.getElementById("mainNav");
  const heroTitle = document.querySelector(".hero-title");
  const heroDescription = document.querySelector(".hero-description");
  const ageRating = document.querySelector(".age-rating");
  const heroSection = document.querySelector(".hero-section");

  // API de TMDb
  const API_KEY = "7154c887e726b37b3d012f91ada2bf12"; // Reemplázala con tu clave de API
  const TRENDING_URL = `https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}&language=es`;

  // Función para obtener la clasificación por edades
  function getAgeRating(certifications) {
    const usCertifications = certifications.find((cert) => cert.iso_3166_1 === "US")?.release_dates || [];
    const usRating = usCertifications[0]?.certification || "";
    const ratingMap = {
      "G": "Todos", "TV-Y": "Todos", "TV-G": "Todos",
      "PG": "7+", "TV-Y7": "7+",
      "PG-13": "13+", "TV-PG": "13+", "TV-14": "13+",
      "R": "16+",
      "NC-17": "18+", "TV-MA": "18+"
    };
    return ratingMap[usRating] || "Desconocido";
  }

  // Función para obtener una película en tendencia
  async function fetchTrendingMovie() {
    try {
      const response = await fetch(TRENDING_URL);
      const data = await response.json();
      
      if (data.results.length === 0) return;
      let movie, ageLabel, attempts = 0;
      
      do {
        const randomIndex = Math.floor(Math.random() * data.results.length);
        movie = data.results[randomIndex];
        const certificationsResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/release_dates?api_key=${API_KEY}&language=es`
        );
        const certificationsData = await certificationsResponse.json();
        ageLabel = getAgeRating(certificationsData.results);
        attempts++;
        if (attempts > 10) return;
      } while (!movie.backdrop_path || ageLabel === "Desconocido");
      
      heroTitle.textContent = movie.title;
      heroDescription.textContent = movie.overview?.substring(0, 200) + "..." || "Descripción no disponible.";
      ageRating.textContent = ageLabel;
      heroSection.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`;
    } catch (error) {
      console.error("Error obteniendo película en tendencia:", error);
    }
  }
  fetchTrendingMovie();

  // Cambio de color en la barra de navegación al hacer scroll
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  });

  // Búsqueda interactiva
  const searchWrapper = document.querySelector(".search-wrapper");
  const searchToggle = document.querySelector(".search-toggle");
  const searchInput = document.querySelector(".search-input");
  searchToggle.addEventListener("click", () => {
    searchWrapper.classList.toggle("active");
    if (searchWrapper.classList.contains("active")) searchInput.focus();
  });
  document.addEventListener("click", (e) => {
    if (!searchWrapper.contains(e.target) && searchWrapper.classList.contains("active")) {
      searchWrapper.classList.remove("active");
    }
  });

  // Botones de acción
  document.querySelector(".play-btn").addEventListener("click", () => console.log("Play button clicked"));
  document.querySelector(".info-btn").addEventListener("click", () => console.log("More Info button clicked"));

  // Manejo de dropdowns
  document.addEventListener("click", (event) => {
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
      if (!dropdown.contains(event.target)) {
        const dropdownMenu = dropdown.querySelector(".dropdown-menu");
        if (dropdownMenu.classList.contains("show")) {
          dropdown.querySelector(".dropdown-toggle").click();
        }
      }
    });
  });

  // Menú en dispositivos móviles
  const navbarToggler = document.querySelector(".navbar-toggler");
  const navbarContent = document.querySelector("#navbarContent");
  navbarToggler.addEventListener("click", () => {
    navbar.style.backgroundColor = navbarContent.classList.contains("show") ? "transparent" : "var(--netflix-black)";
  });
});


document.addEventListener("click", function (event) {
  const navbarToggler = document.querySelector(".navbar-toggler");
  const navbarContent = document.querySelector("#navbarContent");

  if (!navbarToggler || !navbarContent) return;

  if (
    !navbarContent.contains(event.target) &&
    !navbarToggler.contains(event.target) &&
    navbarContent.classList.contains("show")
  ) {
    navbarToggler.click();
  }
});

