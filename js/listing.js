// שליפת דירות, סינון, חיפוש
let currentPage = 1;
const pageSize = 9;
let filteredList = null;
let selectedStars = 0;

function getStarIcons(score) {
  score = parseFloat(score) || 0;
  const fullStars = Math.floor(score);
  const halfStar = (score % 1) >= 0.25 && (score % 1) < 0.75;

  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      html += `<i class="fas fa-star text-warning"></i>`;
    } else if (halfStar && i === fullStars + 1) {
      html += `<i class="fas fa-star-half-alt text-warning"></i>`;
    } else {
      html += `<i class="far fa-star text-warning"></i>`;
    }
  }
  return html;
}

function resetFilter() {
  document.getElementById('filterForm').reset();
  filteredList = null;
  currentPage = 1;
  selectedStars = 0;
  updateStarFilterUI();

  document.getElementById('priceRange').value = 1000;
  document.getElementById('priceRange').dispatchEvent(new Event('input'));

  renderListings(amsterdam);
  initMap(amsterdam);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStarFilterUI() {
  const stars = document.querySelectorAll('#starFilter i');
  stars.forEach((star, i) => {
    const isActive = i < selectedStars;
    star.classList.toggle('active', isActive);
    star.classList.toggle('fas', isActive);
    star.classList.toggle('far', !isActive);
  });
}

function renderListings(listingsArray) {
  const username = localStorage.getItem('currentUser');
  document.getElementById('totalListings').textContent = `Showing ${listingsArray.length} apartments`;

  const container = document.getElementById('listingCards');
  container.innerHTML = '';

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageListings = listingsArray.slice(start, end);

  pageListings.forEach(listing => {
    const favorites = JSON.parse(localStorage.getItem(`favorites_${username}`)) || [];
    const isFav = favorites.includes(listing.listing_id);
    const heartClass = isFav ? 'favorite-btn active' : 'favorite-btn';

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
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <button class="btn btn-sm btn-outline-primary" onclick="goToRent(${listing.listing_id})">Rent</button>
            <button class="${heartClass}" onclick="toggleFavorite(${listing.listing_id}, this)">
              <i class="fas fa-heart"></i>
            </button>
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

function initMap(data) {
  const container = document.getElementById('map');
  container.innerHTML = '';
  container.style.height = '400px';
  if (L.DomUtil.get('map')?._leaflet_id) {
    L.DomUtil.get('map')._leaflet_id = null;
  }
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

function goToRent(listingId) {
  window.location.href = `rent.html?id=${listingId}`;
}

function toggleFavorite(listingId, button) {
  const username = localStorage.getItem('currentUser');
  if (!username) return;

  const key = `favorites_${username}`;
  let current = JSON.parse(localStorage.getItem(key)) || [];

  if (current.includes(listingId)) {
    current = current.filter(id => id !== listingId);
    button.classList.remove('active');
  } else {
    current.push(listingId);
    button.classList.add('active');
  }

  localStorage.setItem(key, JSON.stringify(current));
}

function scrollToMap() {
  const mapElement = document.getElementById('map');
  if (mapElement) {
    mapElement.scrollIntoView({ behavior: 'smooth' });
  }
}

const starFilter = document.getElementById('starFilter');
for (let i = 1; i <= 5; i++) {
  const star = document.createElement('i');
  star.className = 'fas fa-star';
  star.dataset.value = i;
  starFilter.appendChild(star);
}

starFilter.addEventListener('click', (e) => {
  if (e.target.tagName === 'I') {
    const value = parseInt(e.target.dataset.value);
    const stars = starFilter.querySelectorAll('i');
    stars.forEach((star, index) => {
      star.classList.toggle('active', index < value);
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const username = localStorage.getItem('currentUser');
  if (!username) return (window.location.href = 'login.html');

  const roomsSelect = document.getElementById('rooms');
  const bedroomCounts = [...new Set(amsterdam.map(l => parseInt(l.bedrooms)).filter(n => !isNaN(n)))].sort((a, b) => a - b);

  roomsSelect.innerHTML = '<option value="">כל כמות</option>';
  bedroomCounts.forEach(num => {
    const opt = document.createElement('option');
    opt.value = num;
    opt.textContent = num;
    roomsSelect.appendChild(opt);
  });

  document.getElementById('userGreeting').textContent = `Hello, ${username}`;

  const priceRange = document.getElementById('priceRange');
  const priceRangeValue = document.getElementById('priceRangeValue');

  priceRange.addEventListener('input', () => {
    priceRangeValue.textContent = `Up to $${Number(priceRange.value).toLocaleString()}`;
  });

  window.logout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  };

  renderListings(amsterdam);
  initMap(amsterdam);

  const starIcons = document.querySelectorAll('#starFilter i');
  starIcons.forEach((star, i) => {
    star.addEventListener('click', () => {
      selectedStars = i + 1;
      updateStarFilterUI();
    });
  });

  document.getElementById('filterForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const minPrice = 0;
    const maxPrice = parseFloat(document.getElementById('priceRange').value) || Infinity;

    const roomsValue = document.getElementById('rooms').value;
    const minRating = selectedStars > 0 ? selectedStars : 0;

    filteredList = amsterdam.filter(listing => {
      const priceStr = (listing.price || '').replace(/[^0-9.]/g, '');
      const price = parseFloat(priceStr) || 0;
      const bedrooms = parseInt(listing.bedrooms) || 0;
      const rating = parseFloat(listing.review_scores_rating) || 0;

      const isRoomsMatch = roomsValue
        ? bedrooms === parseInt(roomsValue)
        : true;

      return (
        rating >= minRating &&
        price >= minPrice &&
        price <= maxPrice &&
        isRoomsMatch
      );
    });

    currentPage = 1;
    renderListings(filteredList);
    initMap(filteredList);
  });
});