const API_KEY = '7154c887e726b37b3d012f91ada2bf12';
const BASE_URL = 'https://api.themoviedb.org/3';
const HERO_SECTION = document.getElementById('hero');
const HERO_TITLE = document.getElementById('hero-title');
const HERO_DESCRIPTION = document.getElementById('hero-description');
const UPDATE_HERO_BTN = document.getElementById('update-hero');
const MI_LISTA_SECTION = document.getElementById('mi-lista');
const MI_LISTA_CONTENIDO = document.getElementById('mi-lista-contenido');
const NAV_MI_LISTA = document.getElementById('nav-mi-lista');

// Obtener película destacada
async function fetchFeaturedMovie() {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es`);
    const data = await response.json();
    const movie = data.results[Math.floor(Math.random() * data.results.length)];
    HERO_TITLE.textContent = movie.title;
    HERO_DESCRIPTION.textContent = movie.overview;
    HERO_SECTION.style.backgroundImage = `url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})`;
}

UPDATE_HERO_BTN.addEventListener('click', fetchFeaturedMovie);

document.addEventListener('DOMContentLoaded', () => {
    fetchFeaturedMovie();
    loadFavorites();
});

// Manejo de favoritos en LocalStorage
function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.length > 0) {
        MI_LISTA_SECTION.style.display = 'block';
        MI_LISTA_CONTENIDO.innerHTML = '';
        favorites.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('col-md-3');
            movieCard.innerHTML = `
                <div class="card">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="${movie.title}">
                    <div class="card-body">
                        <h5 class="card-title">${movie.title}</h5>
                        <button class="btn btn-danger" onclick="removeFromFavorites(${movie.id})">Eliminar</button>
                    </div>
                </div>
            `;
            MI_LISTA_CONTENIDO.appendChild(movieCard);
        });
    } else {
        MI_LISTA_SECTION.style.display = 'none';
    }
}

function removeFromFavorites(movieId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(movie => movie.id !== movieId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadFavorites();
}
