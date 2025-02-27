// Clave de API y URLs base de The Movie Database (TMDB)
const API_KEY = "7154c887e726b37b3d012f91ada2bf12";
const BASE_URL = "https://api.themoviedb.org/3";
const TRENDING_URL = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=es-ES`;
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

/**
 * Obtiene las películas en tendencia desde la API de TMDB y las muestra en el carrusel.
 */
async function fetchTrendingMovies() {
  try {
    const response = await fetch(TRENDING_URL);
    const data = await response.json();
    const movies = data.results.slice(0, 10); // Obtiene solo las 10 primeras películas
    displayTrendingMovies(movies);
  } catch (error) {
    console.error("Error al obtener las películas:", error);
  }
}

/**
 * Muestra las películas obtenidas en el carrusel de la sección de tendencias.
 * @param {Array} movies - Lista de películas obtenidas de la API
 */
function displayTrendingMovies(movies) {
  const carouselContainer = document.getElementById("carousel-container");
  carouselContainer.innerHTML = ""; // Limpia el contenido previo

  for (let i = 0; i < movies.length; i += 5) {
    const activeClass = i === 0 ? 'active' : '';
    const group = movies.slice(i, i + 5).map((movie, index) => `
      <div class="trend-item" data-movie='${JSON.stringify(movie)}'>
          <img src="${IMAGE_BASE_URL}${movie.poster_path}" class="trend-img" alt="${movie.title}">
          <span class="trend-number">${i + index + 1}</span>
      </div>
    `).join('');

    carouselContainer.innerHTML += `
      <div class="carousel-item ${activeClass}">
          <div class="trend-group">${group}</div>
      </div>
    `;
}

  // Agrega eventos de clic a cada película para abrir el modal
  document.querySelectorAll(".trend-item").forEach((item) => {
    item.addEventListener("click", function () {
      const movie = JSON.parse(this.getAttribute("data-movie"));
      openMovieModal(movie);
    });
  });
}

/**
 * Muestra la información de una película en un modal emergente.
 * @param {Object} movie - Objeto con la información de la película seleccionada.
 */
function openMovieModal(movie) {
  document.getElementById('movieTitle').innerText = movie.title;
  document.getElementById('movieImage').src = `https://image.tmdb.org/t/p/original${movie.backdrop_path || '/assets/img/default-movie.jpg'}`;
  document.getElementById('movieYear').innerText = movie.release_date ? movie.release_date.split('-')[0] : 'Desconocido';
  document.getElementById('movieGenres').innerText = getGenreNames(movie.genre_ids);
  document.getElementById('movieOverview').innerText = truncateText(movie.overview, 150);
  new bootstrap.Modal(document.getElementById('movieModal')).show();
}

/**
 * Convierte una lista de IDs de género en nombres legibles.
 * @param {Array} genreIds - Lista de IDs de géneros de la película.
 * @returns {string} - Cadena de texto con los nombres de los géneros.
 */
function getGenreNames(genreIds) {
  const genres = {
      28: "Acción", 12: "Aventura", 16: "Animación", 35: "Comedia", 80: "Crimen",
      99: "Documental", 18: "Drama", 10751: "Familiar", 14: "Fantasía",
      36: "Historia", 27: "Terror", 10402: "Música", 9648: "Misterio",
      10749: "Romance", 878: "Ciencia Ficción", 10770: "TV Movie",
      53: "Suspenso", 10752: "Bélica", 37: "Western"
  };
  return genreIds.map(id => genres[id] || "Desconocido").join(", ");
}

/**
 * Corta un texto si supera la longitud máxima especificada.
 * @param {string} text - Texto a truncar.
 * @param {number} maxLength - Longitud máxima permitida.
 * @returns {string} - Texto truncado con '...' si supera la longitud.
 */
function truncateText(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

// Llama a la función para cargar las películas en tendencia cuando la página cargue completamente
document.addEventListener("DOMContentLoaded", fetchTrendingMovies);
