/* ===============================================
   PORTFOLIO - MAIN JAVASCRIPT
   =============================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
});

/* ===============================================
   CAROUSSEL FLUIDE AVEC DRAG
   =============================================== */
function initCarousel() {
  const container = document.querySelector('.carousel-container');
  const track = document.getElementById('carouselTrack');
  if (!track || !container) return;

  const items = Array.from(track.querySelectorAll('.carousel-item'));
  const totalItems = items.length;

  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationId = null;
  let currentIndex = 0;

  // Calculer les dimensions
  function getItemWidth() {
    const item = items[0];
    const style = window.getComputedStyle(item);
    const width = item.offsetWidth;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 24;
    return width + gap;
  }

  // Centrer le carousel sur un item
  function getTranslateForIndex(index) {
    const itemWidth = getItemWidth();
    const containerWidth = container.offsetWidth;
    const centerOffset = (containerWidth - items[0].offsetWidth) / 2;
    return -index * itemWidth + centerOffset;
  }

  // Mettre à jour la classe active
  function updateActiveClass() {
    items.forEach((item, index) => {
      item.classList.toggle('active', index === currentIndex);
    });
  }

  // Animation fluide
  function animate() {
    track.style.transform = `translateX(${currentTranslate}px)`;
    if (isDragging) {
      animationId = requestAnimationFrame(animate);
    }
  }

  // Snap vers l'item le plus proche
  function snapToClosest() {
    const itemWidth = getItemWidth();
    const containerWidth = container.offsetWidth;
    const centerOffset = (containerWidth - items[0].offsetWidth) / 2;

    // Calculer l'index le plus proche
    currentIndex = Math.round((-currentTranslate + centerOffset) / itemWidth);

    // Limiter aux bornes
    currentIndex = Math.max(0, Math.min(currentIndex, totalItems - 1));

    // Aller à cet index
    currentTranslate = getTranslateForIndex(currentIndex);
    prevTranslate = currentTranslate;

    track.style.transition = 'transform 0.3s ease-out';
    track.style.transform = `translateX(${currentTranslate}px)`;

    updateActiveClass();

    setTimeout(() => {
      track.style.transition = '';
    }, 300);
  }

  // Gestion du drag - Souris
  function handleMouseDown(e) {
    isDragging = true;
    startX = e.pageX;
    track.style.transition = '';
    container.style.cursor = 'grabbing';
    animationId = requestAnimationFrame(animate);
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.pageX;
    const diff = currentX - startX;
    currentTranslate = prevTranslate + diff;
  }

  function handleMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    cancelAnimationFrame(animationId);
    container.style.cursor = 'grab';
    prevTranslate = currentTranslate;
    snapToClosest();
  }

  // Gestion du drag - Tactile
  function handleTouchStart(e) {
    isDragging = true;
    startX = e.touches[0].pageX;
    track.style.transition = '';
    animationId = requestAnimationFrame(animate);
  }

  function handleTouchMove(e) {
    if (!isDragging) return;
    const currentX = e.touches[0].pageX;
    const diff = currentX - startX;
    currentTranslate = prevTranslate + diff;
  }

  function handleTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    cancelAnimationFrame(animationId);
    prevTranslate = currentTranslate;
    snapToClosest();
  }

  // Event listeners - Souris
  container.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('mouseleave', handleMouseUp);

  // Event listeners - Tactile
  container.addEventListener('touchstart', handleTouchStart, { passive: true });
  container.addEventListener('touchmove', handleTouchMove, { passive: false });
  container.addEventListener('touchend', handleTouchEnd);

  // Empêcher le drag des images
  track.querySelectorAll('img').forEach(img => {
    img.addEventListener('dragstart', e => e.preventDefault());
  });

  // Clic sur un item pour le centrer
  items.forEach((item, index) => {
    item.addEventListener('click', (e) => {
      if (Math.abs(currentTranslate - prevTranslate) < 5) {
        currentIndex = index;
        currentTranslate = getTranslateForIndex(index);
        prevTranslate = currentTranslate;
        track.style.transition = 'transform 0.3s ease-out';
        track.style.transform = `translateX(${currentTranslate}px)`;
        updateActiveClass();
        setTimeout(() => {
          track.style.transition = '';
        }, 300);
      }
    });
  });

  // Initialiser
  currentTranslate = getTranslateForIndex(0);
  prevTranslate = currentTranslate;
  track.style.transform = `translateX(${currentTranslate}px)`;
  updateActiveClass();

  // Recalculer au resize
  window.addEventListener('resize', () => {
    currentTranslate = getTranslateForIndex(currentIndex);
    prevTranslate = currentTranslate;
    track.style.transform = `translateX(${currentTranslate}px)`;
  });
}
