//animate-onScroll
document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll('.animate-on-scroll');

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);  // Stop observing once visible
      }
    });
  }, {
    threshold: 0.1
  });

  elements.forEach(el => observer.observe(el));
});

// Protect links that require login
document.addEventListener('DOMContentLoaded', () => {
  fetch('https://project-web-toio.onrender.com/check-auth')
    .then(res => res.json())
    .then(data => {
      if (data.loggedIn) {
        // Hide placeholder section and message
        document.querySelectorAll('.protected-section').forEach(el => el.style.display = 'none');

        // Show actual links
        document.querySelectorAll('.protected-content.actual-links').forEach(el => el.classList.remove('hidden'));
      } else {
        // Disable link clicks and show login prompt
        document.querySelectorAll('.auth-only').forEach(link => {
          link.addEventListener('click', e => {
            e.preventDefault();
            alert('Please log in to access this content.');
          });
          link.classList.add('locked');
        });
      }
    })
    .catch(err => {
      console.error('Auth check failed:', err);
    });
});
fetch('https://project-web-toio.onrender.com/check-auth')
  .then(res => res.json())
  .then(data => {
    if (data.loggedIn) {
      // Show actual links, hide login message
      document.querySelector('.actual-links').classList.remove('hidden');
      document.querySelector('.logged-out-message').classList.add('hidden');
    } else {
      // Still show login message, keep links hidden
      document.querySelector('.actual-links').classList.add('hidden');
      document.querySelector('.logged-out-message').classList.remove('hidden');
    }
  });

// Menu Toggle for Navbar
document.getElementById('menuToggle').addEventListener('click', function () {
  document.querySelector('.navbar').classList.toggle('active');
});

const menuToggle = document.getElementById('menuToggle');
const navbar = document.querySelector('.navbar');

menuToggle.addEventListener('click', () => {
  navbar.classList.toggle('open');
});
  // Highlight current menu link based on URL
  window.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.menu a');
    const currentPath = window.location.pathname.split('/').pop();

    links.forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
      }
    });
  });

// Search Engine with Lunr.js
document.addEventListener('DOMContentLoaded', () => {
  let idx;
  let searchData = [];

  // Fetch the search index JSON and build Lunr index
  fetch('https://project-web-toio.onrender.com/search-index.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      searchData = data;
      idx = lunr(function () {
        this.ref('id');
        this.field('title');
        this.field('content');

        data.forEach(doc => this.add(doc));
      });
      console.log('Lunr index built successfully');
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });

  // Set up search input listener
  const searchBox = document.getElementById('searchBox');
  const resultContainer = document.getElementById('results');

  if (!searchBox || !resultContainer) {
    console.error('Missing #searchBox or #results element in the HTML');
    return;
  }

  searchBox.addEventListener('input', function () {
    const query = this.value.trim();
    resultContainer.innerHTML = '';

    if (query.length < 2) {
      return; // Don't search if query too short
    }

    if (!idx) {
      console.log('Search index not ready yet');
      return;
    }

    const results = idx.search(query);
    if (results.length === 0) {
      resultContainer.innerHTML = '<li>No results found</li>';
      return;
    }

    results.forEach(result => {
      const item = searchData.find(d => d.id === result.ref);
      if (!item) return; // Safety check

      const li = document.createElement('li');
      li.innerHTML = `
        <strong><a href="${item.url}">${item.title}</a></strong><br>
        <p>${item.content}</p>
      `;
      resultContainer.appendChild(li);
    });
  });
});


//Autoslide/Manual banner
const backgrounds = [
  "url('images/hero1.jpg')",
  "url('images/hero2.jpg')",
  "url('images/hero3.jpg')"
];

let current = 0;
let interval;

const currentBg = document.querySelector('.hero-bg.current');
const nextBg = document.querySelector('.hero-bg.next');

function updateIndicators() {
  const indicators = document.querySelectorAll('.indicator');
  indicators.forEach((dot, index) => {
    dot.classList.toggle('active', index === current);
  });
}

function crossfadeTo(index) {
  nextBg.style.backgroundImage = `linear-gradient(rgba(0,3,4,0.3), rgba(2,5,46,0.7)), ${backgrounds[index]}`;
  nextBg.style.opacity = 1;

  setTimeout(() => {
    currentBg.style.backgroundImage = nextBg.style.backgroundImage;
    nextBg.style.opacity = 0;
    updateIndicators();
  }, 2000);
}

function nextSlide() {
  current = (current + 1) % backgrounds.length;
  crossfadeTo(current);
  resetInterval();
}

function prevSlide() {
  current = (current - 1 + backgrounds.length) % backgrounds.length;
  crossfadeTo(current);
  resetInterval();
}

function startInterval() {
  interval = setInterval(nextSlide, 5000);
}

function resetInterval() {
  clearInterval(interval);
  startInterval();
}

// Touch support
let startX = 0;
let endX = 0;

document.querySelector('.hero').addEventListener('touchstart', (e) => {
  startX = e.changedTouches[0].screenX;
});

document.querySelector('.hero').addEventListener('touchend', (e) => {
  endX = e.changedTouches[0].screenX;
  if (startX - endX > 50) nextSlide();
  else if (endX - startX > 50) prevSlide();
});

// Init
currentBg.style.backgroundImage = `linear-gradient(rgba(0,3,4,0.3), rgba(2,5,46,0.7)), ${backgrounds[current]}`;
startInterval();
updateIndicators();

//notification
const notifications = [
  "Admission for 2025 is now open!",
  "Elimentary Results has been declared.",
  "School will remain closed on May 15th.",
  "New Hostel Block inaugurated!",
  "HSLC/HSSLC Results are out."
];

const track = document.getElementById('notificationTrack');
let index = 0;

function showNotification() {
  // Set content and position it off-screen
  track.textContent = notifications[index];
  track.style.transition = 'none'; // Disable transition temporarily
  track.style.transform = 'translateX(100%)';
  track.style.opacity = '0';

  // Force reflow so browser registers the initial state
  void track.offsetWidth;

  // Slide in
  track.style.transition = 'transform 1.0s ease-in-out, opacity 0.6s ease-in-out';
  track.style.transform = 'translateX(0%)';
  track.style.opacity = '1';

  // After 2s, hide instantly
  setTimeout(() => {
    track.style.transition = 'opacity 0.2s ease-out';
    track.style.opacity = '0';
  }, 3000);

  // After total of 4s, show next
  setTimeout(() => {
    index = (index + 1) % notifications.length;
    showNotification();
  }, 5000);
}

showNotification();

// Array of testimonial objects
const testimonials = [
  {
    text: "Little Flower Higher Secondary School shaped me into the person I am today. The faculty’s dedication was incredible!",
    author: "Jane Doe, Class of 2018"
  },
  {
    text: "The school’s balanced focus on academics and extracurriculars helped me grow holistically.",
    author: "John Smith, Class of 2019"
  },
  {
    text: "I always felt supported and encouraged. Truly a nurturing environment for learning.",
    author: "Maria Lopez, Class of 2020"
  }
];

const testimonialTrack = document.getElementById('testimonialTrack');

let currentIndex = 0;
let cards = [];

function createTestimonialCard(t) {
  const card = document.createElement('div');
  card.className = 'testimonial-card';

  const textEl = document.createElement('p');
  textEl.className = 'testimonial-text';
  textEl.textContent = `"${t.text}"`;

  const authorEl = document.createElement('h4');
  authorEl.className = 'testimonial-author';
  authorEl.textContent = `- ${t.author}`;

  card.appendChild(textEl);
  card.appendChild(authorEl);

  return card;
}

// Add all testimonial cards but keep them hidden initially
testimonials.forEach(t => {
  const card = createTestimonialCard(t);
  testimonialTrack.appendChild(card);
  cards.push(card);
});

function showTestimonial(index) {
  // Hide all cards first
  cards.forEach(card => {
    card.style.transition = 'none';
    card.style.transform = 'translate(100%, -50%)';
    card.style.opacity = '0';
  });

  const card = cards[index];

  // Slide in
  card.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
  card.style.transform = 'translate(-50%, -50%)'; // centered
  card.style.opacity = '1';

  // After pause, slide out
  setTimeout(() => {
    card.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
    card.style.transform = 'translate(-150%, -50%)'; // offscreen left
    card.style.opacity = '0';
  }, 5000);

  // Schedule next testimonial
  setTimeout(() => {
    currentIndex = (currentIndex + 1) % cards.length;
    showTestimonial(currentIndex);
  }, 4600); // total cycle time (slide in + pause + slide out)
}

// Start cycling testimonials
showTestimonial(currentIndex);

//facilities
function animateOnScroll() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  const triggerBottom = window.innerHeight * 0.9;

  elements.forEach(el => {
    const boxTop = el.getBoundingClientRect().top;

    if (boxTop < triggerBottom) {
      el.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);
