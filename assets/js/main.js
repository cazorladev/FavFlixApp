const API_KEY = '7154c887e726b37b3d012f91ada2bf12'; // Reemplázalo con tu clave de API de TMDB
const BASE_URL = 'https://api.themoviedb.org/3';
const TRENDING_URL = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`;
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // Base para las imágenes

async function fetchTrendingMovies() {
    try {
        const response = await fetch(TRENDING_URL);
        const data = await response.json();
        displayTrendingMovies(data.results);
    } catch (error) {
        console.error('Error al obtener las películas:', error);
    }
}

function displayTrendingMovies(movies) {
    const carouselContainer = document.getElementById('carousel-container');
    carouselContainer.innerHTML = ''; // Limpiar contenido previo

    movies.slice(0, 5).forEach((movie, index) => { // Solo mostramos las primeras 5
        const isActive = index === 0 ? 'active' : ''; // La primera imagen debe estar activa
        const movieElement = `
            <div class="carousel-item ${isActive}">
                <div class="trend-item">
                    <img src="${IMAGE_BASE_URL}${movie.poster_path}" class="d-block w-100" alt="${movie.title}">
                    <span class="trend-number">${index + 1}</span>
                </div>
            </div>
        `;
        carouselContainer.innerHTML += movieElement;
    });
}

// Llamamos a la función al cargar la página
document.addEventListener('DOMContentLoaded', fetchTrendingMovies);
