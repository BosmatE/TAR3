// ניהול מועדפים לפי currentUser
function waitForAmsterdam() {
    return new Promise(resolve => {
        const check = () => {
            if (typeof amsterdam !== 'undefined') {
                resolve();
            } else {
                setTimeout(check, 50);
            }
        };
        check();
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await waitForAmsterdam();

    const username = getCurrentUser();
    if (!username) return (window.location.href = 'login.html');
    document.getElementById('userGreeting').textContent = `Hello, ${username}`;

    window.logout = () => {
        clearCurrentUser();
        window.location.href = 'login.html';
    };

    const favorites = getUserFavorites(username);
    const container = document.getElementById('favoritesContainer');
    container.innerHTML = '';

    if (!favorites.length) {
        container.innerHTML = '<p>You have no favorites yet.</p>';
        return;
    }

    favorites.forEach((listingId, index) => {
        const apartment = amsterdam.find(a => a.listing_id == listingId); // השוואה גמישה כדי להתמודד גם עם string וגם עם number
        if (!apartment) return;

        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.innerHTML = `
      <h4>${apartment.name}</h4>
      <img src="${apartment.picture_url}" alt="Apartment" class="favorite-img" />
      <p>${apartment.description}</p>
      <button onclick="removeFavorite(${index})">Remove</button>
    `;
        container.appendChild(card);
    });
});

function removeFavorite(index) {
    const username = getCurrentUser();
    const favorites = getUserFavorites(username);
    favorites.splice(index, 1);
    saveUserFavorites(username, favorites);
    location.reload();
}