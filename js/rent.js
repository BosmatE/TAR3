//  ניהול תהליך השכרה של דירה אחת
/**
 * פונקציית עזר לבדיקת חפיפה בין שני טווחי תאריכים.
 * מחזירה true אם יש חפיפה, false אם אין.
 * @param {string} start1 - תאריך התחלה של הטווח הראשון (בפורמט 'YYYY-MM-DD')
 * @param {string} end1 - תאריך סיום של הטווח הראשון (בפורמט 'YYYY-MM-DD')
 * @param {string} start2 - תאריך התחלה של הטווח השני (בפורמט 'YYYY-MM-DD')
 * @param {string} end2 - תאריך סיום של הטווח השני (בפורמט 'YYYY-MM-DD')
 * @returns {boolean} - האם יש חפיפה בין הטווחים
 */
function isDateRangeOverlap(start1, end1, start2, end2) {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);
  return !(e1 < s2 || s1 > e2);
}

/**
 * בודק האם הטווח שהתבקש פנוי להשכרה בדירה מסוימת.
 * יש לממש את החלק של קריאת ההזמנות ב-localStorage והבדיקה בעזרת isDateRangeOverlap.
 * @param {string} listingId - מזהה הדירה
 * @param {string} startDate - תאריך התחלה שנבחר להשכרה
 * @param {string} endDate - תאריך סיום שנבחר להשכרה
 * @returns {boolean} - true אם הזמנים פנויים, false אם יש חפיפה
 */
function checkAvailability(listingId, startDate, endDate) {
  // TODO: לולאה על כל מפתחות ה-localStorage של המשתמשים
  // רמז - key.endsWith('_bookings')
  //      - קריאה לנתוני ההזמנות שלהם
  //      - חיפוש הזמנות עם listingId זה
  //      - שימוש ב-isDateRangeOverlap להשוואה בין טווחים
  // להחזיר false אם יש חפיפה, true אם פנוי
  const keys = Object.keys(localStorage).filter(k => k.startsWith('bookings_'));
  for (const key of keys) {
    const bookings = JSON.parse(localStorage.getItem(key));
    for (const booking of bookings) {
      if (
        String(booking.listingId) === String(listingId) &&
        isDateRangeOverlap(startDate, endDate, booking.startDate, booking.endDate)
      ) {
        return false;
      }
    }
  }
  return true;
}

// ריצה בעת טעינת העמוד
document.addEventListener('DOMContentLoaded', () => {
  const username = localStorage.getItem('currentUser');
  if (!username) return (window.location.href = 'login.html');
  document.getElementById('userGreeting').textContent = `Hello, ${username}`;

  window.logout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  };

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const apartment = window.amsterdam.find(a => a.listing_id === id);
  if (!apartment) {
    document.getElementById('apartmentDetails').innerHTML = '<p>Apartment not found.</p>';
    return;
  }

  // Render details
  document.getElementById('apartmentDetails').innerHTML = `
    <h2>${apartment.name}</h2>
    <img src="${apartment.picture_url}" alt="Apartment" />
    <p>${apartment.description}</p>
    <p><strong>Price:</strong> ${apartment.price}</p>
    <p><strong>Rating:</strong> ${apartment.review_scores_rating || 'N/A'}</p>
  `;

  // הגבלת שדות startDate ו־endDate לתאריכים מהיום והלאה
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('startDate').setAttribute('min', today);
  document.getElementById('endDate').setAttribute('min', today);

  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');

  startDateInput.addEventListener('change', () => {
    endDateInput.min = startDateInput.value;
    if (endDateInput.value && endDateInput.value < startDateInput.value) {
      endDateInput.value = startDateInput.value;
    }
  });

  endDateInput.addEventListener('change', () => {
    if (startDateInput.value && endDateInput.value < startDateInput.value) {
      startDateInput.value = endDateInput.value;
    }
  });

  // הגבלת שדה MM/YY לתאריך עתידי בלבד
  const expiryInputWrapper = document.getElementById('expiry');
  const expiryInput = expiryInputWrapper?.querySelector('input[type="month"]');
  if (expiryInput) {
    const yyyy = new Date().getFullYear();
    const mm = String(new Date().getMonth() + 1).padStart(2, '0');
    expiryInput.min = `${yyyy}-${mm}`;
    expiryInput.value = `${yyyy}-${mm}`;
  }

  // Handle booking form
  document.getElementById('bookingForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate || startDate > endDate) {
      alert('Please select valid start and end dates.');
      return;
    }

    if (!checkAvailability(id, startDate, endDate)) {
      alert('This apartment is already booked for the selected range.');
      return;
    }

    const key = `bookings_${username}`;
    const current = JSON.parse(localStorage.getItem(key)) || [];
    current.push({ listingId: id, startDate, endDate });
    localStorage.setItem(key, JSON.stringify(current));

    document.getElementById('bookingMessage').textContent = 'Rental confirmed!';
    this.reset();
  });

  // Handle reviews
  const reviewsKey = `reviews_${id}`;
  const reviewsList = document.getElementById('reviewsList');
  const renderReviews = () => {
    const reviews = JSON.parse(localStorage.getItem(reviewsKey)) || [];
    reviewsList.innerHTML = reviews.length
      ? reviews.map(r => `<div class='review'><strong>${r.rating}★</strong> ${r.text}</div>`).join('')
      : '<p>No reviews yet.</p>';
  };
  renderReviews();

  document.getElementById('reviewForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const rating = document.getElementById('rating').value;
    const text = document.getElementById('reviewText').value;
    if (!text) return;
    const reviews = JSON.parse(localStorage.getItem(reviewsKey)) || [];
    reviews.push({ rating, text });
    localStorage.setItem(reviewsKey, JSON.stringify(reviews));
    renderReviews();
    this.reset();
  });
});