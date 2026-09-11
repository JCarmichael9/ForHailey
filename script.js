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

if ('scrollRestoration' in history){
  history.scrollRestoration = 'manual';
}

function resetLockedPosition(){
  if (opened) return;
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  requestAnimationFrame(() => {
    if (!opened){
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  });
}

resetLockedPosition();
window.addEventListener('load', resetLockedPosition);
window.addEventListener('pageshow', resetLockedPosition);

function unlockScroll(){
  document.documentElement.classList.remove('locked');
  document.body.classList.remove('locked');
  document.removeEventListener('keydown', blockScrollKeys);
  document.removeEventListener('wheel', blockWheel);
  document.removeEventListener('touchmove', blockTouchMove);
}

function openLetter(){
  if (opened) return;
  opened = true;

  unlockScroll();

  const targetY = Math.max(0, letter.getBoundingClientRect().top + window.pageYOffset - 40);
  window.scrollTo({ top: targetY, left: 0, behavior: 'auto' });

  audio.play().catch(() => {
    // Autoplay might still be blocked on some browsers; toggle button lets them retry.
  });

  musicToggle.hidden = false;
  requestAnimationFrame(() => musicToggle.classList.add('show'));
  heroHint?.classList.add('hide');
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
