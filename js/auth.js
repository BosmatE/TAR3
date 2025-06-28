//  הרשמה והתחברות (usersList, currentUser)
function login(e) {
  e.preventDefault();
  const name = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  const users = JSON.parse(localStorage.getItem('usersList')) || [];

  const found = users.find(u => u.username === name && u.password === password);

  if (!found) {
    alert('Invalid username or password');
    return;
  }

  localStorage.setItem('currentUser', name);
  window.location.href = 'index.html';
}

function register(e) {
  e.preventDefault();
  const name = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (password.length < 8) {
    alert('Password must be at least 8 characters long');
    return;
  }

  const users = JSON.parse(localStorage.getItem('usersList')) || [];

  if (users.find(u => u.username === name)) {
    alert('Username already exists');
    return;
  }

  users.push({ username: name, password });
  localStorage.setItem('usersList', JSON.stringify(users));
  localStorage.setItem('currentUser', name);

  window.location.href = 'index.html';
}

function checkLoggedIn() {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    window.location.href = 'login.html';
  }
}
