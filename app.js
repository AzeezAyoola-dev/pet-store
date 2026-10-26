document.addEventListener('DOMContentLoaded', () => {
  // 1. Live Countdown Timer for Flash Sale
  const hourEl = document.getElementById('timer-hours');
  const minEl = document.getElementById('timer-mins');
  const secEl = document.getElementById('timer-secs');

  let remainingSeconds = 1 * 3600 + 5 * 60 + 42; // 1 hour, 5 mins, 42 secs

  function updateTimer() {
    if (remainingSeconds <= 0) {
      remainingSeconds = 2 * 3600; // Reset loop
    }
    remainingSeconds--;

    const h = Math.floor(remainingSeconds / 3600);
    const m = Math.floor((remainingSeconds % 3600) / 60);
    const s = remainingSeconds % 60;

    if (hourEl) hourEl.textContent = h.toString();
    if (minEl) minEl.textContent = m.toString();
    if (secEl) secEl.textContent = (s < 10 ? '0' : '') + s.toString().slice(-1);
  }

  setInterval(updateTimer, 1000);

  // 2. Interactive Favorite Buttons
  const favButtons = document.querySelectorAll('.favorite-btn');
  favButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const svg = btn.querySelector('svg');
      if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        svg.style.transform = 'scale(1)';
        svg.style.fill = 'var(--semantic-color-cta-primary)';
      } else {
        btn.classList.add('active');
        svg.style.transform = 'scale(1.25)';
        svg.style.fill = 'var(--semantic-color-cta-primary)';
      }
    });
  });

  // 3. Carousel Navigation
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const productsGrid = document.querySelector('.products-grid');

  if (prevBtn && nextBtn && productsGrid) {
    prevBtn.addEventListener('click', () => {
      productsGrid.style.transition = 'transform 0.3s ease';
      productsGrid.style.transform = 'translateX(4px)';
      setTimeout(() => {
        productsGrid.style.transform = 'translateX(0)';
      }, 150);
    });

    nextBtn.addEventListener('click', () => {
      productsGrid.style.transition = 'transform 0.3s ease';
      productsGrid.style.transform = 'translateX(-4px)';
      setTimeout(() => {
        productsGrid.style.transform = 'translateX(0)';
      }, 150);
    });
  }

  // 4. Search Form Interaction
  const searchForm = document.querySelector('.hero-search-wrapper');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = searchForm.querySelector('.search-input-field');
      if (input && input.value.trim()) {
        const query = input.value.trim();
        const btn = searchForm.querySelector('.search-submit-btn');
        const origText = btn.textContent;
        btn.textContent = 'Searching...';
        setTimeout(() => {
          btn.textContent = origText;
          input.value = '';
        }, 600);
      }
    });
  }
});
