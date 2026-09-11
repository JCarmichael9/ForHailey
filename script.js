// ============================================================
// OPEN LETTER -> START MUSIC
// ============================================================
const openBtn = document.getElementById('openLetter');
const musicToggle = document.getElementById('musicToggle');
const audio = document.getElementById('bgMusic');
const heroHint = document.getElementById('heroHint');
const letter = document.getElementById('letter');

audio.volume = 0.35;

let opened = false;

// ============================================================
// LOCK SCROLL UNTIL "OPEN YOUR LETTER" IS CLICKED
// ============================================================
function blockScrollKeys(e){
  const keys = ['ArrowDown','ArrowUp','PageDown','PageUp',' ','Spacebar','Home','End'];
  if (keys.includes(e.key)) e.preventDefault();
}
function blockTouchMove(e){ e.preventDefault(); }
function blockWheel(e){ e.preventDefault(); }

document.addEventListener('keydown', blockScrollKeys, { passive: false });
document.addEventListener('wheel', blockWheel, { passive: false });
document.addEventListener('touchmove', blockTouchMove, { passive: false });

function unlockScroll(){
  document.documentElement.classList.remove('locked');
  document.body.classList.remove('locked');
  document.removeEventListener('keydown', blockScrollKeys);
  document.removeEventListener('wheel', blockWheel);
  document.removeEventListener('touchmove', blockTouchMove);
}

function easeInOutCubic(t){
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY, duration){
  const startY = window.pageYOffset;
  const distance = targetY - startY;
  const startTime = performance.now();

  function step(now){
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);
    window.scrollTo(0, startY + distance * eased);
    if (progress < 1){
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

function openLetter(){
  if (opened) return;
  opened = true;

  audio.play().catch(() => {
    // Autoplay might still be blocked on some browsers; toggle button lets them retry.
  });

  musicToggle.hidden = false;
  requestAnimationFrame(() => musicToggle.classList.add('show'));
  heroHint.classList.add('hide');

  unlockScroll();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targetY = letter.getBoundingClientRect().top + window.pageYOffset;

  if (prefersReducedMotion){
    window.scrollTo(0, targetY);
  } else {
    // slight pause after the click so the moment feels deliberate, then a slow cinematic scroll
    setTimeout(() => smoothScrollTo(targetY, 1600), 350);
  }
}

openBtn.addEventListener('click', openLetter);

musicToggle.addEventListener('click', () => {
  if (audio.paused){
    audio.play().catch(() => {});
    musicToggle.classList.remove('paused');
    musicToggle.setAttribute('aria-label', 'Pause music');
  } else {
    audio.pause();
    musicToggle.classList.add('paused');
    musicToggle.setAttribute('aria-label', 'Play music');
  }
});

// ============================================================
// SCROLL REVEAL
// ============================================================
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ============================================================
// FLOATING PETALS
// ============================================================
const canvas = document.getElementById('petals');
const ctx = canvas.getContext('2d');
let petals = [];
let w, h;

function resize(){
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const petalCount = window.innerWidth < 600 ? 10 : 16;

function makePetal(randomY){
  return {
    x: Math.random() * w,
    y: randomY ? Math.random() * h : -20,
    size: 6 + Math.random() * 7,
    speedY: 0.25 + Math.random() * 0.45,
    speedX: (Math.random() - 0.5) * 0.4,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.008 + Math.random() * 0.01,
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 0.6,
    opacity: 0.25 + Math.random() * 0.35
  };
}

for (let i = 0; i < petalCount; i++){
  petals.push(makePetal(true));
}

function drawPetal(p){
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = '#C58680';
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size, p.size * 0.62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function animate(){
  ctx.clearRect(0, 0, w, h);
  petals.forEach(p => {
    p.sway += p.swaySpeed;
    p.y += p.speedY;
    p.x += p.speedX + Math.sin(p.sway) * 0.3;
    p.rotation += p.rotSpeed;

    if (p.y > h + 20){
      Object.assign(p, makePetal(false));
    }
    drawPetal(p);
  });
  requestAnimationFrame(animate);
}

if (!prefersReducedMotion){
  animate();
} else {
  canvas.style.display = 'none';
}
