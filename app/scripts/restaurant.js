let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
let fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
let fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.srcset = DBHelper.imageSrcsetForRestaurant(restaurant);
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = `Photo from ${restaurant.name} restaurant`;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
let fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  const table = document.createElement('table');
  table.summary = 'Opening hours of the  restaurant';
  hours.appendChild(table);
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    day.classList.add('day');
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    time.classList.add('time');
    row.appendChild(time);

    table.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
let fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
let createReviewHTML = (review) => {
  const li = document.createElement('li');

  const top = document.createElement('h4');
  top.classList.add('top');

  const name = document.createElement('span');
  name.innerHTML = review.name;
  name.classList.add('name');
  top.appendChild(name);

  const date = document.createElement('span');
  date.innerHTML = review.date;
  date.classList.add('date');
  top.appendChild(date);

  li.appendChild(top);

  const rating = document.createElement('span');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.classList.add('rating');
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.classList.add('comment');
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
let fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementsByClassName('breadcrumb')[0];
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
let getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * Show snackbar to update service worker and cache
 */
let showSnackbar = (worker) => {
  const snackbarConfig = {
    text: 'New version available',
    backgroundColor: '#fff',
    textColor: '#0a0a0a',
    actionText: 'Refresh',
    actionTextColor: '#8C43FF',
    onActionClick: function (element) {
      worker.postMessage({ action: 'skipWaiting' });
      element.style.opacity = 0;
    },
    showSecondButton: true,
    secondButtonText: 'Dismiss',
    secondButtonTextColor: '#8C43FF',
    onSecondButtonClick: function (element) {
      element.style.opacity = 0;
    },
    duration: 0
  };

  Snackbar.show(snackbarConfig)
};