document.addEventListener('DOMContentLoaded', async function () {
  const navbar = document.getElementById('mainNav');
  const heroTitle = document.querySelector('.hero-title');
  const heroDescription = document.querySelector('.hero-description');
  const ageRating = document.querySelector('.age-rating');
  const heroSection = document.querySelector('.hero-section');

  const API_KEY = '7154c887e726b37b3d012f91ada2bf12'; // Reemplaza con tu clave de API de TMDb
  const TRENDING_URL = `https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}&language=es`;

  // Función para mapear certificaciones a etiquetas de edad
  function getAgeRating(certifications) {
    const usCertifications = certifications.find(cert => cert.iso_3166_1 === 'US')?.release_dates || [];
    const usRating = usCertifications[0]?.certification || '';

    // Mapeo de certificaciones a etiquetas
    if (['G', 'TV-Y', 'TV-G'].includes(usRating)) {
      return 'Todos';
    } else if (['PG', 'TV-Y7'].includes(usRating)) {
      return '7+';
    } else if (['PG-13', 'TV-PG', 'TV-14'].includes(usRating)) {
      return '13+';
    } else if (['R', 'TV-14'].includes(usRating)) {
      return '16+';
    } else if (['NC-17', 'TV-MA'].includes(usRating)) {
      return '18+';
    } else {
      return 'Desconocido'; // Se mantiene "Desconocido" para detección
    }
  }

  // Función para obtener la película en tendencia
  async function fetchTrendingMovie() {
    try {
      const response = await fetch(TRENDING_URL);
      const data = await response.json();

      if (data.results.length > 0) {
        let movie;
        let ageLabel;
        let attempts = 0;

        // Buscar una película válida
        do {
          const randomIndex = Math.floor(Math.random() * data.results.length);
          movie = data.results[randomIndex];

          // Obtener certificaciones de la película
          const certificationsResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}/release_dates?api_key=${API_KEY}&language=es`
          );
          const certificationsData = await certificationsResponse.json();
          ageLabel = getAgeRating(certificationsData.results);

          attempts++;

          // Si no se encuentra una película válida después de varios intentos, salir del bucle
          if (attempts > 10) {
            console.warn('No se encontró una película válida después de varios intentos.');
            return;
          }
        } while (!movie.backdrop_path || ageLabel === 'Desconocido'); // Rechaza películas sin imagen o con certificación desconocida

        // Truncar la sinopsis si es muy larga
        const maxLength = 200;
        const shortOverview = movie.overview && movie.overview.length > maxLength
          ? movie.overview.substring(0, maxLength) + '...'
          : movie.overview || 'Descripción no disponible.';

        // Actualizar la interfaz
        heroTitle.textContent = movie.title;
        heroDescription.textContent = shortOverview;
        ageRating.textContent = ageLabel;
        heroSection.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`;
      }
    } catch (error) {
      console.error('Error fetching trending movie:', error);
    }
  }

  fetchTrendingMovie();

  // Resto del código (scroll, search, dropdown, etc.)
  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);

  const searchWrapper = document.querySelector('.search-wrapper');
  const searchToggle = document.querySelector('.search-toggle');
  const searchInput = document.querySelector('.search-input');

  searchToggle.addEventListener('click', () => {
    searchWrapper.classList.toggle('active');
    if (searchWrapper.classList.contains('active')) {
      searchInput.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!searchWrapper.contains(event.target) && searchWrapper.classList.contains('active')) {
      searchWrapper.classList.remove('active');
    }
  });

  const playButton = document.querySelector('.play-btn');
  playButton.addEventListener('click', () => {
    console.log('Play button clicked');
  });

  const infoButton = document.querySelector('.info-btn');
  infoButton.addEventListener('click', () => {
    console.log('More Info button clicked');
  });

  const dropdowns = document.querySelectorAll('.dropdown');
  document.addEventListener('click', (event) => {
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(event.target)) {
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');
        if (dropdownMenu.classList.contains('show')) {
          dropdown.querySelector('.dropdown-toggle').click();
        }
      }
    });
  });

  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarContent = document.querySelector('#navbarContent');

  navbarToggler.addEventListener('click', () => {
    if (navbarContent.classList.contains('show')) {
      navbar.style.backgroundColor = 'transparent';
    } else {
      navbar.style.backgroundColor = 'var(--netflix-black)';
    }
  });
});

document.addEventListener("click", function (event) {
  const navbarToggler = document.querySelector(".navbar-toggler");
  const navbarContent = document.querySelector("#navbarContent");

  // Verifica si el clic ocurrió fuera del menú y del botón de la hamburguesa
  if (
    !navbarContent.contains(event.target) &&
    !navbarToggler.contains(event.target) &&
    navbarContent.classList.contains("show")
  ) {
    navbarToggler.click(); // Cierra el menú
  }
});
