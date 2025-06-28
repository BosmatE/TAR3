// פונקציות כלליות לעבודה עם localStorage
// --- Users ---
function getUsersList() {
  return JSON.parse(localStorage.getItem('usersList')) || [];
}

function saveUsersList(users) {
  localStorage.setItem('usersList', JSON.stringify(users));
}

// --- Current User ---
function getCurrentUser() {
  return localStorage.getItem('currentUser');
}

function setCurrentUser(username) {
  localStorage.setItem('currentUser', username);
}

function clearCurrentUser() {
  localStorage.removeItem('currentUser');
}

// --- Favorites ---
function getUserFavorites(username) {
  return JSON.parse(localStorage.getItem(`favorites_${username}`)) || [];
}

function saveUserFavorites(username, favorites) {
  localStorage.setItem(`favorites_${username}`, JSON.stringify(favorites));
}

// --- Bookings ---
function getUserBookings(username) {
  return JSON.parse(localStorage.getItem(`bookings_${username}`)) || [];
}

function saveUserBookings(username, bookings) {
  localStorage.setItem(`bookings_${username}`, JSON.stringify(bookings));
}

// --- General Helpers ---
function removeItem(key) {
  localStorage.removeItem(key);
}

function getAllStorageKeys() {
  return Object.keys(localStorage);
}