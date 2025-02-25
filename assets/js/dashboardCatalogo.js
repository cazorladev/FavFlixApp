const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0M2JmMzUxODgwYzkxMGY0Y2M2NWI5MDZlMTJmYjc4OCIsIm5iZiI6MTc0MDE5OTcyMi4xOTIsInN1YiI6IjY3Yjk1NzJhOWIwNjIzZTNiMWJlYTFkZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.pyWARg_ngbv7hFt4N3yzVOuKQ72KJSeE5xj3T29fk5M'
  }
};

const urlGeneros = 'https://api.themoviedb.org/3/genre/movie/list?language=es-ES';

// Objeto para almacenar los géneros en español
let generosMap = {};


// Obtenemos la lista de géneros antes de cargar las películas**
fetch(urlGeneros, options)
  .then(response => response.json())
  .then(data => {
      // Guardamos los géneros en generosMap
      data.genres.forEach(genre => {
      generosMap[genre.id] = genre.name;
      });

      console.log("✅ Géneros obtenidos correctamente:", generosMap);
      
      // Llamamos la función para cargar películas SOLO cuando los géneros están listos
      cargarPeliculas();
  })
  .catch(error => console.error('❌ Error al obtener géneros:', error));

const urls = [
  'https://api.themoviedb.org/3/movie/popular?language=es-ES&page=1',
  'https://api.themoviedb.org/3/movie/now_playing?language=es-ES&page=1',
  'https://api.themoviedb.org/3/movie/top_rated?language=es-ES&page=1'
];

window.addEventListener('DOMContentLoaded', () =>{
  const peticiones = urls.map(peticion=>fetch(peticion, options));
  Promise.all(peticiones).then(values=>{
      return Promise.all(values.map(r=>r.json()));
  }).then(catalogos => {
      const [catalogoUno, catalogoDos, catalogoTres] = catalogos;
      // Catalogo uno
      const populares = document.getElementById('populares');
      catalogoUno.results.forEach(pelicula => {
          console.log(pelicula.genre_ids);
          const card = document.createElement('div');
          card.classList.add('card');
          const img = document.createElement('img');
          img.src = 'https://image.tmdb.org/t/p/w780' + pelicula.backdrop_path;
          img.classList.add('card-item-top');
          // Evento para abrir el modal al hacer clic en la imagen
            img.addEventListener("click", () => {
                mostrarModal(pelicula);
            });
          const cardBody = document.createElement('div');
          cardBody.classList.add('card-body');
          const iconsConteiner = document.createElement('div');
          iconsConteiner.classList.add('d-flex', 'justify-content-between')
          const leftIcons = document.createElement('div');
          leftIcons.classList.add('icons');
          leftIcons.innerHTML = `
              <button type="button" class="btn btn-outline-secondary"><i class="bi bi-play-circle-fill"></i></button>
              <button type="button" class="btn btn-outline-secondary" title="Agregar a favoritos"><i class="bi bi-heart-fill"></i></button>
              <button type="button" class="btn btn-outline-secondary" title="Me gusta"> <i class="bi bi-hand-thumbs-up"></i></button>
          `;
          const rightIcons = document.createElement('div');
          rightIcons.classList.add('icons');
          rightIcons.innerHTML = `<button type="button" class="btn btn-outline-secondary"><i class="bi bi-arrow-down-circle-fill"></i></button>`
          rightIcons.title = "Más información"
          const genresContainer = document.createElement('ul');
          genresContainer.classList.add('genres', 'd-flex', 'my-2', 'justify-content-start');
          if (pelicula.genre_ids) {
              pelicula.genre_ids.forEach(genreId => {
                  if (generosMap[genreId]) { // Verifica si el ID existe en el mapa
                      const genreItem = document.createElement('li');
                      genreItem.textContent = generosMap[genreId]; // Obtener el nombre en español
                      genresContainer.appendChild(genreItem);
                  }
              });
          }
          populares.appendChild(card);
          card.appendChild(img);
          card.appendChild(cardBody);
          cardBody.appendChild(iconsConteiner);
          iconsConteiner.appendChild(leftIcons);
          iconsConteiner.appendChild(rightIcons);
          cardBody.appendChild(genresContainer);
      });

      const estrenos = document.getElementById('estrenos');
      catalogoDos.results.forEach(pelicula => {
          console.log(pelicula.genre_ids);
          const card = document.createElement('div');
          card.classList.add('card');
          const img = document.createElement('img');
          img.src = 'https://image.tmdb.org/t/p/w780' + pelicula.backdrop_path;
          img.classList.add('card-item-top');

          // Evento para abrir el modal al hacer clic en la imagen
          img.addEventListener("click", () => {
            mostrarModal(pelicula);
        });
          const cardBody = document.createElement('div');
          cardBody.classList.add('card-body');
          const iconsConteiner = document.createElement('div');
          iconsConteiner.classList.add('d-flex', 'justify-content-between')
          const leftIcons = document.createElement('div');
          leftIcons.classList.add('icons');
          leftIcons.innerHTML = `
              <button type="button" class="btn btn-outline-secondary"><i class="bi bi-play-circle-fill"></i></button>
              <button type="button" class="btn btn-outline-secondary" title="Agregar a favoritos"><i class="bi bi-heart-fill"></i></button>
              <button type="button" class="btn btn-outline-secondary" title="Me gusta"> <i class="bi bi-hand-thumbs-up"></i></button>
          `;
          const rightIcons = document.createElement('div');
          rightIcons.classList.add('icons');
          rightIcons.innerHTML = `<button type="button" class="btn btn-outline-secondary"><i class="bi bi-arrow-down-circle-fill"></i></button>`
          rightIcons.title = "Más información"
          const genresContainer = document.createElement('ul');
          genresContainer.classList.add('genres', 'd-flex', 'my-2', 'justify-content-start');
          if (pelicula.genre_ids) {
              pelicula.genre_ids.forEach(genreId => {
                  if (generosMap[genreId]) { // Verifica si el ID existe en el mapa
                      const genreItem = document.createElement('li');
                      genreItem.textContent = generosMap[genreId]; // Obtener el nombre en español
                      genresContainer.appendChild(genreItem);
                  }
              });
          }
          estrenos.appendChild(card);
          card.appendChild(img);
          card.appendChild(cardBody);
          cardBody.appendChild(iconsConteiner);
          iconsConteiner.appendChild(leftIcons);
          iconsConteiner.appendChild(rightIcons);
          cardBody.appendChild(genresContainer);
      });

      const vistas = document.getElementById('vistas');
      catalogoTres.results.forEach(pelicula => {
          console.log(pelicula.genre_ids);
          const card = document.createElement('div');
          card.classList.add('card');
          const img = document.createElement('img');
          img.src = 'https://image.tmdb.org/t/p/w780' + pelicula.backdrop_path;
          img.classList.add('card-item-top');
          // Evento para abrir el modal al hacer clic en la imagen
          img.addEventListener("click", () => {
            mostrarModal(pelicula);
        });
          const cardBody = document.createElement('div');
          cardBody.classList.add('card-body');
          const iconsConteiner = document.createElement('div');
          iconsConteiner.classList.add('d-flex', 'justify-content-between')
          const leftIcons = document.createElement('div');
          leftIcons.classList.add('icons');
          leftIcons.innerHTML = `
              <button type="button" class="btn btn-outline-secondary"><i class="bi bi-play-circle-fill"></i></button>
              <button type="button" class="btn btn-outline-secondary" title="Agregar a favoritos"><i class="bi bi-heart-fill"></i></button>
              <button type="button" class="btn btn-outline-secondary" title="Me gusta"> <i class="bi bi-hand-thumbs-up"></i></button>
          `;
          const rightIcons = document.createElement('div');
          rightIcons.classList.add('icons');
          rightIcons.innerHTML = `<button type="button" class="btn btn-outline-secondary"><i class="bi bi-arrow-down-circle-fill"></i></button>`
          rightIcons.title = "Más información"
          const genresContainer = document.createElement('ul');
          genresContainer.classList.add('genres', 'd-flex', 'my-2', 'justify-content-start');
          if (pelicula.genre_ids) {
              pelicula.genre_ids.forEach(genreId => {
                  if (generosMap[genreId]) { // Verifica si el ID existe en el mapa
                      const genreItem = document.createElement('li');
                      genreItem.textContent = generosMap[genreId]; // Obtener el nombre en español
                      genresContainer.appendChild(genreItem);
                  }
              });
          }
          vistas.appendChild(card);
          card.appendChild(img);
          card.appendChild(cardBody);
          cardBody.appendChild(genresContainer);
          cardBody.appendChild(iconsConteiner);
          iconsConteiner.appendChild(leftIcons);
          iconsConteiner.appendChild(rightIcons);
          
      });
  });
});

function mostrarModal(pelicula) {
    const userData = JSON.parse(localStorage.getItem("loggedUser"));
    if (!userData) {
      alert("Debes iniciar sesión para gestionar favoritos.");
      return;
    }
  
    document.getElementById("movieTitle").textContent = pelicula.title;
    document.getElementById("movieImage").src = `https://image.tmdb.org/t/p/w500${pelicula.poster_path}`;
    document.getElementById("movieDescription").textContent = pelicula.overview || "Sin descripción disponible.";
    document.getElementById("movieYear").textContent = pelicula.release_date ? pelicula.release_date.split("-")[0] : "Desconocido";
    document.getElementById("movieGenre").textContent = pelicula.genre_ids.map(id => generosMap[id]).join(", ") || "Desconocido";
  
    // Obtener lista de favoritos del usuario
    let favoritos = JSON.parse(localStorage.getItem(`favoritos_${userData.username}`)) || [];
    const esFavorito = favoritos.some(fav => fav.id === pelicula.id);
  
    const favoriteButton = document.getElementById("favoriteButton");
    favoriteButton.textContent = esFavorito ? "Quitar de Favoritos" : "Agregar a Favoritos";
    favoriteButton.classList.toggle("btn-outline-danger", esFavorito);
    favoriteButton.classList.toggle("btn-danger", !esFavorito);
  
    favoriteButton.onclick = () => {
      toggleFavorito(pelicula, userData.username);
    };
  
    // Mostrar el modal
    const movieModal = new bootstrap.Modal(document.getElementById("movieModal"));
    movieModal.show();
  }
  
  function toggleFavorito(pelicula, username) {
    let favoritos = JSON.parse(localStorage.getItem(`favoritos_${username}`)) || [];
  
    const index = favoritos.findIndex(fav => fav.id === pelicula.id);
    if (index === -1) {
      favoritos.push({
        id: pelicula.id,
        title: pelicula.title,
        poster_path: pelicula.poster_path,
        release_date: pelicula.release_date,
        genre_ids: pelicula.genre_ids,
        overview: pelicula.overview
      });
    } else {
      favoritos.splice(index, 1);
    }
  
    localStorage.setItem(`favoritos_${username}`, JSON.stringify(favoritos));
    mostrarModal(pelicula);
  }
