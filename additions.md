//### תיעוד פיתוחים נוספים במידה ומממשים

//### יש לקרוא באינטרנט כיצד כותבים מסמך מסוג זה

//### ניתן ללמוד כיצד [בלחיצה על הקישור](https://www.markdownguide.org/cheat-sheet/)

# 🛠️ Additions to Rent-It

This document describes optional features implemented in our apartment rental system.

---

## 📍 1. Apartment Map (Leaflet.js)
Implemented in `index.html` using [Leaflet](https://leafletjs.com/).
- Displays apartment locations based on their latitude & longitude from `amsterdam.js`.
- Each marker shows a popup with name and price.

---

## 📆 2. Calendar Availability
Implemented in `rent.html` using `<input type="date">`.
- Validates that selected dates are not overlapping existing bookings (saved in `localStorage` under `bookings_<username>`).
- Uses helper: `isDateRangeOverlap(start1, end1, start2, end2)`.

---

## 💬 3. Reviews & Ratings
Also in `rent.html`:
- Allows users to submit a review (rating + comment).
- Reviews are saved per listing under `reviews_<listingId>`.
- Displayed dynamically below the form.