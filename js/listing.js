// שליפת דירות, סינון, חיפוש
let currentPage = 1;
    const pageSize = 9;
    let filteredList = null;

    document.addEventListener('DOMContentLoaded', () => {
      const username = localStorage.getItem('currentUser');
      if (!username) return (window.location.href = 'login.html');

      document.getElementById('userGreeting').textContent = `Hello, ${username}`;

      window.logout = () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
      };

      renderListings(amsterdam);
      initMap(amsterdam);

      document.getElementById('filterForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const minRating = parseInt(document.getElementById('minRating').value) || 0;
        const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
        const minRooms = parseInt(document.getElementById('rooms').value) || 0;
        const typeQuery = document.getElementById('searchType').value.toLowerCase();

        filteredList = amsterdam.filter(listing =>
          (listing.review_scores_rating || 0) >= minRating &&
          parseFloat(listing.price.replace(/[^\d.]/g, '')) <= maxPrice &&
          parseInt(listing.bedrooms) >= minRooms &&
          listing.room_type.toLowerCase().includes(typeQuery)
        );

        currentPage = 1;
        renderListings(filteredList);
        initMap(filteredList);
      });
    });

    function resetFilter() {
      document.getElementById('filterForm').reset();
      filteredList = null;
      currentPage = 1;
      renderListings(amsterdam);
      initMap(amsterdam);
    }

    function renderListings(listingsArray) {
      const container = document.getElementById('listingCards');
      container.innerHTML = '';

      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      const pageListings = listingsArray.slice(start, end);

      pageListings.forEach(listing => {
        const card = document.createElement('div');
        card.className = 'col-sm-6 col-md-4 mb-4';
        card.innerHTML = `
          <div class="card h-100 shadow-sm">
            <img src="${listing.picture_url}" class="card-img-top" alt="Image">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${listing.name}</h5>
              <small>ID: ${listing.listing_id}</small><br/>
              <a href="${listing.listing_url}" target="_blank">View on Airbnb</a>
              <p class="card-text mt-2">${listing.description || 'No description available'}</p>
              <small>Rating: ${listing.review_scores_rating || 'N/A'}</small>
              <div class="mt-auto d-flex justify-content-between align-items-center">
                <button class="btn btn-sm btn-outline-primary" onclick="goToRent(${listing.listing_id})">Rent</button>
                <button class="btn btn-sm btn-outline-danger" onclick="toggleFavorite(${listing.listing_id})">♥</button>
              </div>
            </div>
          </div>`;
        container.appendChild(card);
      });

      renderPagination(listingsArray.length);
    }

    function renderPagination(totalItems) {
      const totalPages = Math.ceil(totalItems / pageSize);
      const paginationContainer = document.getElementById('pagination');
      paginationContainer.innerHTML = '';

      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'btn btn-sm btn-outline-primary m-1';
        if (i === currentPage) btn.classList.add('active');
        btn.onclick = () => {
          currentPage = i;
          renderListings(filteredList || amsterdam);
        };
        paginationContainer.appendChild(btn);
      }
    }

    function goToRent(listingId) {
      window.location.href = `rent.html?id=${listingId}`;
    }

    function toggleFavorite(listingId) {
      const username = localStorage.getItem('currentUser');
      if (!username) return;

      const key = `favorites_${username}`;
      const current = JSON.parse(localStorage.getItem(key)) || [];

      if (current.includes(listingId)) {
        const updated = current.filter(id => id !== listingId);
        localStorage.setItem(key, JSON.stringify(updated));
      } else {
        current.push(listingId);
        localStorage.setItem(key, JSON.stringify(current));
      }

      alert('Favorites updated!');
    }

    function initMap(data) {
      const container = document.getElementById('map');
      container.innerHTML = '';
      container.style.height = '400px';
      const map = L.map('map').setView([52.37, 4.89], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      data.forEach(listing => {
        const lat = parseFloat(listing.latitude);
        const lon = parseFloat(listing.longitude);
        if (!isNaN(lat) && !isNaN(lon)) {
          L.marker([lat, lon])
            .addTo(map)
            .bindPopup(`<b>${listing.name}</b><br>${listing.price}`);
        }
      });
    }