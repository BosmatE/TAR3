//  הוספה/ביטול השכרות, לפי currentUser
document.addEventListener('DOMContentLoaded', async () => {
  const username = getCurrentUser();
  if (!username) return (window.location.href = 'login.html');

  document.getElementById('userGreeting').textContent = `Hello, ${username}`;
  window.logout = () => {
    clearCurrentUser();
    window.location.href = 'login.html';
  };

  await waitForAmsterdam();

  const bookings = getUserBookings(username);
  const container = document.getElementById('bookingsContainer');
  const today = new Date().toISOString().split('T')[0];

  if (!bookings.length) {
    container.innerHTML = '<p>You have no bookings yet.</p>';
    return;
  }

  bookings.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const futureContainer = document.createElement('div');
  const pastContainer = document.createElement('div');
  futureContainer.innerHTML = '<h4>🔜 Upcoming Rentals</h4>';
  pastContainer.innerHTML = '<h4>📜 Past Rentals</h4>';

  bookings.forEach((b, index) => {
    const apartment = amsterdam.find(a => a.listing_id === b.listingId);
    if (!apartment) return;

    const isFuture = b.startDate >= today;

    const card = document.createElement('div');
    card.className = `booking-card ${!isFuture ? 'past' : ''}`;
    card.innerHTML = `
      <div class="card h-100 shadow-sm p-3">
        <h5 class="card-title">${apartment.name}</h5>
        <img src="${apartment.picture_url}" alt="Apartment" class="card-img-top thumb mb-2" />
        <p class="card-text"><strong>From:</strong> ${b.startDate}</p>
        <p class="card-text"><strong>To:</strong> ${b.endDate}</p>
        <div class="d-flex justify-content-between align-items-center mt-3">
          <span class="badge ${isFuture ? 'badge-success' : 'badge-secondary'}">
            ${isFuture ? 'Upcoming' : 'Past'}
          </span>
          ${isFuture
            ? `<button onclick="cancelBooking(${index})" class="btn btn-danger btn-sm">Cancel</button>`
            : ''
          }
        </div>
      </div>
    `;

    if (isFuture) {
      futureContainer.appendChild(card);
    } else {
      pastContainer.appendChild(card);
    }
  });

  container.appendChild(futureContainer);
  container.appendChild(pastContainer);
});

function cancelBooking(index) {
  const username = getCurrentUser();
  const bookings = getUserBookings(username);
  bookings.splice(index, 1);
  saveUserBookings(username, bookings);
  location.reload();
}

function waitForAmsterdam() {
  return new Promise(resolve => {
    const check = () => {
      if (typeof amsterdam !== 'undefined') resolve();
      else setTimeout(check, 50);
    };
    check();
  });
}
