/* ===============================================
   PORTFOLIO - MAIN JAVASCRIPT
   =============================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
});

/* ===============================================
   CAROUSSEL INFINI FLUIDE AVEC DRAG
   =============================================== */
function initCarousel() {
  const container = document.querySelector('.carousel-container');
  const track = document.getElementById('carouselTrack');
  if (!track || !container) return;

  const originalItems = Array.from(track.querySelectorAll('.carousel-item'));
  const totalOriginal = originalItems.length;

  // Cloner les items pour créer l'effet infini
  // On clone tous les éléments au début et à la fin
  originalItems.forEach(item => {
    const cloneEnd = item.cloneNode(true);
    cloneEnd.classList.add('clone');
    track.appendChild(cloneEnd);
  });
  originalItems.forEach(item => {
    const cloneStart = item.cloneNode(true);
    cloneStart.classList.add('clone');
    track.insertBefore(cloneStart, track.firstChild);
  });

  // Maintenant on a: [clones du début] [originaux] [clones de fin]
  const allItems = Array.from(track.querySelectorAll('.carousel-item'));

  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationId = null;
  let currentIndex = totalOriginal; // Commencer au premier item original (après les clones)

  // Variables pour le momentum
  let lastX = 0;
  let lastTime = 0;
  let velocity = 0;

  // Calculer les dimensions
  function getItemWidth() {
    const item = allItems[0];
    const width = item.offsetWidth;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 24;
    return width + gap;
  }

  // Centrer le carousel sur un item
  function getTranslateForIndex(index) {
    const itemWidth = getItemWidth();
    const containerWidth = container.offsetWidth;
    const centerOffset = (containerWidth - allItems[0].offsetWidth) / 2;
    return -index * itemWidth + centerOffset;
  }

  // Mettre à jour la classe active
  function updateActiveClass() {
    allItems.forEach((item, index) => {
      // L'index réel dans le tableau d'originaux
      const realIndex = ((index - totalOriginal) % totalOriginal + totalOriginal) % totalOriginal;
      const isActive = index === currentIndex;
      item.classList.toggle('active', isActive);
    });
  }

  // Vérifier et corriger la position pour l'effet infini (pendant le drag)
  function checkInfiniteLoopDuringDrag() {
    const itemWidth = getItemWidth();
    const totalWidth = itemWidth * totalOriginal;

    // Téléporter dès qu'on approche des bords de la zone originale
    // Position du premier item original
    const firstOriginalPos = getTranslateForIndex(totalOriginal);
    // Position du dernier item original
    const lastOriginalPos = getTranslateForIndex(totalOriginal * 2 - 1);

    // Si on va trop à droite (currentTranslate augmente = on voit les clones de début)
    if (currentTranslate > firstOriginalPos + itemWidth / 2) {
      currentTranslate -= totalWidth;
      prevTranslate -= totalWidth;
    }
    // Si on va trop à gauche (currentTranslate diminue = on voit les clones de fin)
    else if (currentTranslate < lastOriginalPos - itemWidth / 2) {
      currentTranslate += totalWidth;
      prevTranslate += totalWidth;
    }
  }

  // Animation fluide
  function animate() {
    checkInfiniteLoopDuringDrag();
    track.style.transform = `translateX(${currentTranslate}px)`;
    if (isDragging) {
      animationId = requestAnimationFrame(animate);
    }
  }

  // Vérifier et corriger la position pour l'effet infini (après snap)
  function checkInfiniteLoop() {
    const itemWidth = getItemWidth();

    // Si on est sur les clones de fin (après les originaux)
    if (currentIndex >= totalOriginal * 2) {
      currentIndex = currentIndex - totalOriginal;
      currentTranslate = getTranslateForIndex(currentIndex);
      prevTranslate = currentTranslate;
      track.style.transition = 'none';
      track.style.transform = `translateX(${currentTranslate}px)`;
      track.offsetHeight;
    }
    // Si on est sur les clones de début (avant les originaux)
    else if (currentIndex < totalOriginal) {
      currentIndex = currentIndex + totalOriginal;
      currentTranslate = getTranslateForIndex(currentIndex);
      prevTranslate = currentTranslate;
      track.style.transition = 'none';
      track.style.transform = `translateX(${currentTranslate}px)`;
      track.offsetHeight;
    }
  }

  // Snap vers l'item avec momentum
  function snapWithMomentum() {
    const itemWidth = getItemWidth();
    const containerWidth = container.offsetWidth;
    const centerOffset = (containerWidth - allItems[0].offsetWidth) / 2;

    // Calculer combien d'items on doit sauter basé sur la vélocité
    // Plus la vélocité est grande, plus on saute d'items
    const momentumDistance = velocity * 0.15; // Facteur de momentum
    const targetTranslate = currentTranslate + momentumDistance;

    // Calculer l'index cible
    currentIndex = Math.round((-targetTranslate + centerOffset) / itemWidth);

    // Aller à cet index
    currentTranslate = getTranslateForIndex(currentIndex);
    prevTranslate = currentTranslate;

    // Durée de transition proportionnelle à la distance
    const distance = Math.abs(momentumDistance);
    const duration = Math.min(0.6, Math.max(0.3, distance / 1000));

    track.style.transition = `transform ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    track.style.transform = `translateX(${currentTranslate}px)`;

    updateActiveClass();

    setTimeout(() => {
      track.style.transition = '';
      checkInfiniteLoop();
    }, duration * 1000);
  }

  // Gestion du drag - Souris
  function handleMouseDown(e) {
    isDragging = true;
    startX = e.pageX;
    lastX = e.pageX;
    lastTime = Date.now();
    velocity = 0;
    track.style.transition = '';
    container.style.cursor = 'grabbing';
    animationId = requestAnimationFrame(animate);
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.pageX;
    const currentTime = Date.now();
    const diff = currentX - startX;

    // Calculer la vélocité
    const timeDiff = currentTime - lastTime;
    if (timeDiff > 0) {
      velocity = (currentX - lastX) / timeDiff * 16; // Normaliser à ~60fps
    }

    lastX = currentX;
    lastTime = currentTime;
    currentTranslate = prevTranslate + diff;
  }

  function handleMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    cancelAnimationFrame(animationId);
    container.style.cursor = 'grab';
    prevTranslate = currentTranslate;
    snapWithMomentum();
  }

  // Gestion du drag - Tactile
  function handleTouchStart(e) {
    isDragging = true;
    startX = e.touches[0].pageX;
    lastX = e.touches[0].pageX;
    lastTime = Date.now();
    velocity = 0;
    track.style.transition = '';
    animationId = requestAnimationFrame(animate);
  }

  function handleTouchMove(e) {
    if (!isDragging) return;
    const currentX = e.touches[0].pageX;
    const currentTime = Date.now();
    const diff = currentX - startX;

    // Calculer la vélocité
    const timeDiff = currentTime - lastTime;
    if (timeDiff > 0) {
      velocity = (currentX - lastX) / timeDiff * 16; // Normaliser à ~60fps
    }

    lastX = currentX;
    lastTime = currentTime;
    currentTranslate = prevTranslate + diff;
  }

  function handleTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    cancelAnimationFrame(animationId);
    prevTranslate = currentTranslate;
    snapWithMomentum();
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

  // Clic sur un item pour le centrer (naviguer vers l'item cliqué)
  allItems.forEach((item, index) => {
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
          checkInfiniteLoop();
        }, 300);
      }
    });
  });

  // Initialiser - commencer au premier item original (index = totalOriginal)
  currentIndex = totalOriginal;
  currentTranslate = getTranslateForIndex(currentIndex);
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
