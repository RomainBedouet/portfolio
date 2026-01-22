/* ===============================================
   CAPRIMAID PRO - JAVASCRIPT
   =============================================== */

document.addEventListener('DOMContentLoaded', () => {
  init3DModel();
  initScrollAnimations();
});

/* ===============================================
   MODÈLE 3D AVEC THREE.JS
   =============================================== */
function init3DModel() {
  const canvas = document.getElementById('canvas3d');
  if (!canvas) return;

  // Configuration Three.js
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // Éclairage
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  const directionalLight2 = new THREE.DirectionalLight(0x667eea, 0.5);
  directionalLight2.position.set(-5, 3, -5);
  scene.add(directionalLight2);

  // Variables pour le modèle et la rotation
  let model = null;
  let targetRotation = 0;
  let currentRotation = 0;

  // Charger le modèle GLTF
  const loader = new THREE.GLTFLoader();
  loader.load(
    'assets/scene.gltf',
    (gltf) => {
      model = gltf.scene;

      // Centrer et ajuster la taille du modèle
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Centrer le modèle
      model.position.x = -center.x;
      model.position.y = -center.y;
      model.position.z = -center.z;

      // Ajuster l'échelle pour qu'il rentre dans la vue
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2.5 / maxDim;
      model.scale.set(scale, scale, scale);

      scene.add(model);
      console.log('Modèle 3D chargé avec succès !');
    },
    (progress) => {
      console.log('Chargement:', (progress.loaded / progress.total * 100).toFixed(0) + '%');
    },
    (error) => {
      console.error('Erreur de chargement du modèle:', error);
    }
  );

  // Gestion du scroll pour la rotation
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroHeight = window.innerHeight;

    if (scrollY < heroHeight) {
      // Rotation proportionnelle au scroll (0 à 360 degrés)
      targetRotation = (scrollY / heroHeight) * Math.PI * 2;
    }
  });

  // Gestion du redimensionnement
  window.addEventListener('resize', () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  // Boucle d'animation
  function animate() {
    requestAnimationFrame(animate);

    // Interpolation douce de la rotation
    currentRotation += (targetRotation - currentRotation) * 0.08;

    // Appliquer la rotation au modèle
    if (model) {
      model.rotation.y = currentRotation;
    }

    renderer.render(scene, camera);
  }

  animate();
}

/* ===============================================
   ANIMATIONS AU SCROLL (FADE IN)
   =============================================== */
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  // Observer les sections pour le fade-in
  const sections = document.querySelectorAll('.feature-section, .stats-section, .specs-section, .price-section');
  sections.forEach(section => {
    section.classList.add('fade-in');
    observer.observe(section);
  });

  // Observer les cartes de specs individuellement
  const specCards = document.querySelectorAll('.spec-card');
  specCards.forEach((card, index) => {
    card.classList.add('fade-in');
    card.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(card);
  });

  // Observer les stats
  const statItems = document.querySelectorAll('.stat-item');
  statItems.forEach((item, index) => {
    item.classList.add('fade-in');
    item.style.transitionDelay = `${index * 0.15}s`;
    observer.observe(item);
  });
}

// Ajouter le CSS pour les animations fade-in via JS
const style = document.createElement('style');
style.textContent = `
  .fade-in {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }

  .fade-in.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .feature-section.fade-in,
  .stats-section.fade-in,
  .specs-section.fade-in,
  .price-section.fade-in {
    transform: none;
  }

  .feature-section.fade-in .feature-content,
  .stats-section.fade-in .stats-grid,
  .price-section.fade-in .price-content {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }

  .feature-section.visible .feature-content,
  .stats-section.visible .stats-grid,
  .price-section.visible .price-content {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(style);
