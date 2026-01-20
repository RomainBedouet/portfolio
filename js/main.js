/* ===============================================
   PORTFOLIO - MAIN JAVASCRIPT
   =============================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
});

/* ===============================================
   CAROUSSEL INFINI
   5 items visibles, centre mis en valeur, boucle infinie
   =============================================== */
function initCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  const items = Array.from(track.querySelectorAll('.carousel-item'));
  const totalItems = items.length;
  const visibleCount = 5;

  let currentIndex = 0;
  let isDragging = false;
  let startX = 0;
  let dragOffset = 0;

  // Seuil de drag pour changer de slide
  const dragThreshold = 50;

  // Fonction pour obtenir l'index avec boucle
  function getLoopedIndex(index) {
    return ((index % totalItems) + totalItems) % totalItems;
  }

  // Mettre à jour l'affichage du caroussel
  function updateCarousel() {
    // Cacher tous les items d'abord
    items.forEach(item => {
      item.style.display = 'none';
      item.classList.remove('active', 'adjacent');
    });

    // Afficher les 5 items visibles centrés sur currentIndex
    for (let i = -2; i <= 2; i++) {
      const itemIndex = getLoopedIndex(currentIndex + i);
      const item = items[itemIndex];

      item.style.display = 'block';
      item.style.order = i + 2; // Pour garder l'ordre visuel

      if (i === 0) {
        item.classList.add('active');
      } else if (i === -1 || i === 1) {
        item.classList.add('adjacent');
      }
    }
  }

  // Navigation
  function goTo(index) {
    currentIndex = getLoopedIndex(index);
    updateCarousel();
  }

  function next() {
    goTo(currentIndex + 1);
  }

  function prev() {
    goTo(currentIndex - 1);
  }

  // Gestion du drag - Souris
  function handleMouseDown(e) {
    isDragging = true;
    startX = e.pageX;
    dragOffset = 0;
    track.style.transition = 'none';
    track.parentElement.style.cursor = 'grabbing';
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    dragOffset = e.pageX - startX;
  }

  function handleMouseUp() {
    if (!isDragging) return;
    isDragging = false;

    track.style.transition = '';
    track.parentElement.style.cursor = 'grab';

    // Déterminer si on change de slide
    if (Math.abs(dragOffset) > dragThreshold) {
      if (dragOffset > 0) {
        prev(); // Drag vers la droite = item précédent
      } else {
        next(); // Drag vers la gauche = item suivant
      }
    }

    dragOffset = 0;
  }

  // Gestion du drag - Tactile
  function handleTouchStart(e) {
    isDragging = true;
    startX = e.touches[0].pageX;
    dragOffset = 0;
    track.style.transition = 'none';
  }

  function handleTouchMove(e) {
    if (!isDragging) return;
    dragOffset = e.touches[0].pageX - startX;
  }

  function handleTouchEnd() {
    if (!isDragging) return;
    isDragging = false;

    track.style.transition = '';

    // Déterminer si on change de slide
    if (Math.abs(dragOffset) > dragThreshold) {
      if (dragOffset > 0) {
        prev();
      } else {
        next();
      }
    }

    dragOffset = 0;
  }

  // Event listeners - Souris
  track.parentElement.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);

  // Event listeners - Tactile
  track.parentElement.addEventListener('touchstart', handleTouchStart, { passive: true });
  track.parentElement.addEventListener('touchmove', handleTouchMove, { passive: false });
  track.parentElement.addEventListener('touchend', handleTouchEnd);

  // Empêcher le drag des images
  track.querySelectorAll('img, .carousel-image').forEach(el => {
    el.addEventListener('dragstart', e => e.preventDefault());
  });

  // Clic sur un item pour le centrer
  items.forEach((item, index) => {
    item.addEventListener('click', () => {
      if (Math.abs(dragOffset) < 5) {
        goTo(index);
      }
    });
  });

  // Initialiser
  updateCarousel();
}
