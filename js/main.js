(function initReveal() {
  const els = document.querySelectorAll('.reveal-text');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

(function initNavHighlight() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section[id]');
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('is-active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('is-active');
          }
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
})();

(function initGalleryDrag() {
  const strip = document.querySelector('.gallery-strip');
  if (!strip) return;

  let isDragging  = false;
  let startX      = 0;
  let scrollStart = 0;
  let velocity    = 0;
  let prevX       = 0;
  let rafId       = null;

  strip.addEventListener('mousedown', (e) => {
    isDragging  = true;
    startX      = e.clientX;
    scrollStart = strip.scrollLeft;
    prevX       = e.clientX;
    velocity    = 0;
    strip.classList.add('is-grabbing');
    cancelAnimationFrame(rafId);
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    velocity = e.clientX - prevX;
    prevX    = e.clientX;
    strip.scrollLeft = scrollStart - dx;
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    strip.classList.remove('is-grabbing');
    let v = velocity;
    (function momentum() {
      if (Math.abs(v) < 0.6) return;
      strip.scrollLeft -= v;
      v *= 0.93;
      rafId = requestAnimationFrame(momentum);
    })();
  });

  let touchStartX      = 0;
  let touchScrollStart = 0;
  let touchPrev        = 0;
  let touchVel         = 0;

  strip.addEventListener('touchstart', (e) => {
    touchStartX      = e.touches[0].clientX;
    touchScrollStart = strip.scrollLeft;
    touchPrev        = e.touches[0].clientX;
    touchVel         = 0;
    cancelAnimationFrame(rafId);
  }, { passive: true });

  strip.addEventListener('touchmove', (e) => {
    const x = e.touches[0].clientX;
    touchVel = x - touchPrev;
    touchPrev = x;
    strip.scrollLeft = touchScrollStart - (x - touchStartX);
  }, { passive: true });

  strip.addEventListener('touchend', () => {
    let v = touchVel;
    (function momentum() {
      if (Math.abs(v) < 0.6) return;
      strip.scrollLeft -= v;
      v *= 0.93;
      rafId = requestAnimationFrame(momentum);
    })();
  });
})();

(function initCaprimaid3D() {
  var container = document.getElementById('caprimaid-preview');
  if (!container || typeof THREE === 'undefined') return;

  var W = 220, H = 160;

  var scene    = new THREE.Scene();
  var camera   = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
  camera.position.set(0, 0, 6);

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  var sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(5, 5, 5);
  scene.add(sun);
  var fill = new THREE.DirectionalLight(0x667eea, 0.5);
  fill.position.set(-5, 3, -5);
  scene.add(fill);

  var pivot = null;

  var loader = new THREE.GLTFLoader();
  loader.load('projects/caprimaid/assets/scene.gltf', function(gltf) {
    var model = gltf.scene;
    var box    = new THREE.Box3().setFromObject(model);
    var center = box.getCenter(new THREE.Vector3());
    var size   = box.getSize(new THREE.Vector3());
    var scale  = 3 / Math.max(size.x, size.y, size.z);

    pivot = new THREE.Group();
    pivot.add(model);
    model.position.set(-center.x, -center.y, -center.z);
    pivot.scale.setScalar(scale);
    scene.add(pivot);
  });

  var frameId = null;
  var angle   = 0;

  function start() {
    if (frameId) return;
    (function loop() {
      frameId = requestAnimationFrame(loop);
      angle += 0.008;
      if (pivot) pivot.rotation.y = angle;
      renderer.render(scene, camera);
    })();
  }

  function stop() {
    cancelAnimationFrame(frameId);
    frameId = null;
  }

  var item = container.closest('.project-item');
  if (item) {
    item.addEventListener('mouseenter', start);
    item.addEventListener('mouseleave', stop);
  }
})();

(function initNameGlitch() {
  document.querySelectorAll('.name-line').forEach(line => {
    line.addEventListener('mouseenter', () => {
      line.style.transition = 'letter-spacing 0.06s ease';
      line.style.letterSpacing = '-0.06em';
      setTimeout(() => { line.style.letterSpacing = '-0.02em'; }, 120);
    });
  });
})();

(function initProjectParallax() {
  document.querySelectorAll('.project-item').forEach(item => {
    const img = item.querySelector('.project-image-reveal');
    if (!img) return;
    item.addEventListener('mousemove', (e) => {
      const rect   = item.getBoundingClientRect();
      const relY   = (e.clientY - rect.top) / rect.height;
      const offset = (relY - 0.5) * 20;
      img.style.transform = `translateY(calc(-50% + ${offset}px)) scale(1)`;
    });
    item.addEventListener('mouseleave', () => {
      img.style.transform = 'translateY(-50%) scale(0.92) rotate(-1deg)';
    });
  });
})();
