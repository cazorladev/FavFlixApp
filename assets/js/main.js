const API_KEY = '7154c887e726b37b3d012f91ada2bf12'; // Reemplázalo con tu clave de API de TMDB
const BASE_URL = 'https://api.themoviedb.org/3';
const TRENDING_URL = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=es-ES`;
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

async function fetchTrendingMovies() {
    try {
        const response = await fetch(TRENDING_URL);
        const data = await response.json();
        const movies = data.results.slice(0, 10); // Solo mostrar 10 películas
        displayTrendingMovies(movies);
    } catch (error) {
        console.error('Error al obtener las películas:', error);
    }
}

function displayTrendingMovies(movies) {
    const carouselContainer = document.getElementById('carousel-container');
    carouselContainer.innerHTML = ''; 

    // Dividir en grupos de 5 para hacer el carrusel más fluido
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

    // Agregar evento de clic a cada película
    document.querySelectorAll('.trend-item').forEach(item => {
        item.addEventListener('click', function() {
            const movie = JSON.parse(this.getAttribute('data-movie'));
            openMovieModal(movie);
        });
    });    
}

function openMovieModal(movie) {
    document.getElementById('movieTitle').innerText = movie.title;
    document.getElementById('movieImage').src = `https://image.tmdb.org/t/p/original${movie.backdrop_path || '/assets/img/default-movie.jpg'}`;
    document.getElementById('movieYear').innerText = movie.release_date ? movie.release_date.split('-')[0] : 'Desconocido';
    document.getElementById('movieGenres').innerText = getGenreNames(movie.genre_ids);
    document.getElementById('movieOverview').innerText = truncateText(movie.overview, 150);
    new bootstrap.Modal(document.getElementById('movieModal')).show();
}

// Función para convertir IDs de géneros a nombres reales
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

function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

// document.querySelector('.btn-netflix').addEventListener('click', function () {
//     window.location.href = 'registro.html'; // Cambia esto con la URL real de tu página de registro
// });



document.addEventListener('DOMContentLoaded', fetchTrendingMovies);
