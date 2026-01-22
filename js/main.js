/* ===============================================
   PORTFOLIO - MAIN JAVASCRIPT
   =============================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
  initSmoothScroll();
  initFlipCards();
});

/* ===============================================
   FLIP CARDS - PROJETS FICTIFS
   =============================================== */
function initFlipCards() {
  const flipCards = document.querySelectorAll('.flip-card');

  flipCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Ne pas retourner si on clique sur le lien
      if (e.target.classList.contains('projet-link')) return;
      card.classList.toggle('flipped');
    });
  });
}

/* ===============================================
   SMOOTH SCROLL FLUIDE
   =============================================== */
function initSmoothScroll() {
  let currentScroll = window.scrollY;
  let targetScroll = window.scrollY;
  let isScrolling = false;

  // Écouter la molette
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    targetScroll += e.deltaY * 0.8; // Réduire la vitesse
    targetScroll = Math.max(0, Math.min(targetScroll, document.body.scrollHeight - window.innerHeight));

    if (!isScrolling) {
      isScrolling = true;
      smoothScroll();
    }
  }, { passive: false });

  function smoothScroll() {
    currentScroll += (targetScroll - currentScroll) * 0.1; // Interpolation douce

    if (Math.abs(targetScroll - currentScroll) > 0.5) {
      window.scrollTo(0, currentScroll);
      requestAnimationFrame(smoothScroll);
    } else {
      window.scrollTo(0, targetScroll);
      isScrolling = false;
    }
  }

  // Synchroniser avec le scroll natif (touch, scrollbar)
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      currentScroll = window.scrollY;
      targetScroll = window.scrollY;
    }
  });
}

/* ===============================================
   CAROUSSEL FLUIDE TYPE MAGAZINE (INFINI SANS CLONES)
   =============================================== */
function initCarousel() {
  const container = document.querySelector('.carousel-container');
  const track = document.getElementById('carouselTrack');
  if (!track || !container) return;

  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;

  // Obtenir les items actuels
  function getItems() {
    return Array.from(track.querySelectorAll('.carousel-item'));
  }

  // Calculer la largeur d'un item + gap
  function getItemWidth() {
    const items = getItems();
    const item = items[0];
    const width = item.offsetWidth;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 24;
    return width + gap;
  }

  // Mettre à jour la classe active (l'item le plus proche du centre)
  function updateActiveClass() {
    const items = getItems();
    const containerWidth = container.offsetWidth;
    const containerCenter = containerWidth / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    items.forEach((item, index) => {
      const itemLeft = item.offsetLeft + currentTranslate;
      const itemCenter = itemLeft + item.offsetWidth / 2;
      const distance = Math.abs(containerCenter - itemCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    items.forEach((item, index) => {
      item.classList.toggle('active', index === closestIndex);
    });
  }

  // Rotation: déplacer le premier élément à la fin
  function rotateRight() {
    const firstItem = track.firstElementChild;
    track.appendChild(firstItem);
    currentTranslate += getItemWidth();
    prevTranslate += getItemWidth();
  }

  // Rotation: déplacer le dernier élément au début
  function rotateLeft() {
    const lastItem = track.lastElementChild;
    track.insertBefore(lastItem, track.firstChild);
    currentTranslate -= getItemWidth();
    prevTranslate -= getItemWidth();
  }

  // Vérifier si on doit faire une rotation pour l'effet infini
  function checkRotation() {
    const containerWidth = container.offsetWidth;
    const itemWidth = getItemWidth();
    const totalItems = getItems().length;

    // Boucle pour gérer plusieurs rotations si drag rapide
    let iterations = 0;

    while (iterations < totalItems) {
      // Re-récupérer les items à chaque itération car l'ordre change
      const items = getItems();
      const firstItem = items[0];
      const lastItem = items[items.length - 1];

      // Position du premier item
      const firstItemLeft = firstItem.offsetLeft + currentTranslate;
      // Position du dernier item (bord droit)
      const lastItemRight = lastItem.offsetLeft + lastItem.offsetWidth + currentTranslate;

      // Si le premier item est trop à droite (on voit du vide à gauche)
      if (firstItemLeft > itemWidth) {
        rotateLeft();
        track.style.transform = `translateX(${currentTranslate}px)`;
      }
      // Si le dernier item est trop à gauche (on voit du vide à droite)
      else if (lastItemRight < containerWidth - itemWidth) {
        rotateRight();
        track.style.transform = `translateX(${currentTranslate}px)`;
      }
      else {
        break;
      }
      iterations++;
    }
  }

  // Appliquer le transform
  function setPosition() {
    track.style.transform = `translateX(${currentTranslate}px)`;
    checkRotation();
    updateActiveClass();
  }

  // Gestion du drag - Souris
  function handleMouseDown(e) {
    isDragging = true;
    startX = e.pageX;
    container.style.cursor = 'grabbing';
    track.style.transition = 'none';
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.pageX;
    const diff = currentX - startX;
    currentTranslate = prevTranslate + diff;
    setPosition();
  }

  function handleMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    container.style.cursor = 'grab';
    prevTranslate = currentTranslate;
  }

  // Gestion du drag - Tactile
  function handleTouchStart(e) {
    isDragging = true;
    startX = e.touches[0].pageX;
    track.style.transition = 'none';
  }

  function handleTouchMove(e) {
    if (!isDragging) return;
    const currentX = e.touches[0].pageX;
    const diff = currentX - startX;
    currentTranslate = prevTranslate + diff;
    setPosition();
  }

  function handleTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    prevTranslate = currentTranslate;
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
  track.addEventListener('click', (e) => {
    const clickedItem = e.target.closest('.carousel-item');
    if (!clickedItem) return;

    const containerWidth = container.offsetWidth;
    const containerCenter = containerWidth / 2;
    const itemCenter = clickedItem.offsetLeft + clickedItem.offsetWidth / 2;
    const offset = containerCenter - itemCenter;

    currentTranslate += offset;
    prevTranslate = currentTranslate;

    track.style.transition = 'transform 0.3s ease-out';
    track.style.transform = `translateX(${currentTranslate}px)`;

    setTimeout(() => {
      track.style.transition = 'none';
      checkRotation();
      updateActiveClass();
    }, 300);
  });

  // Initialiser - premier item à gauche de la page
  currentTranslate = 50; // 50px de marge à gauche
  prevTranslate = currentTranslate;
  track.style.transform = `translateX(${currentTranslate}px)`;
  updateActiveClass();

  // Recalculer au resize
  window.addEventListener('resize', () => {
    const containerWidth = container.offsetWidth;
    const items = getItems();
    const activeItem = items.find(item => item.classList.contains('active')) || items[0];
    const itemCenter = activeItem.offsetLeft + activeItem.offsetWidth / 2;
    currentTranslate = containerWidth / 2 - itemCenter + currentTranslate;
    prevTranslate = currentTranslate;
    track.style.transform = `translateX(${currentTranslate}px)`;
  });
}
