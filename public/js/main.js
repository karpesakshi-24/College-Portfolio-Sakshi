/* ════════════════════════════════════════════════
   PORTFOLIO — main.js
   Handles: Loader, Cursor, Navbar, Scroll Reveal,
            Counter Animation, Year Filter, Form
════════════════════════════════════════════════ */

/* ── 1. LOADER ────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
    // Start reveal animations after loader hides
    revealOnScroll();
  }, 1800);
});

/* ── 2. CUSTOM CURSOR ─────────────────────────── */
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.1;
  followerY += (mouseY - followerY) * 0.1;
  follower.style.left = followerX + 'px';
  follower.style.top  = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

// Scale cursor on hover over interactive elements
document.querySelectorAll('a, button, .tl-card, .project-card, .cert-card, .lead-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(2)';
    follower.style.width = '50px';
    follower.style.height = '50px';
    follower.style.borderColor = 'rgba(59,130,246,0.8)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    follower.style.width = '32px';
    follower.style.height = '32px';
    follower.style.borderColor = 'rgba(59,130,246,0.5)';
  });
});

/* ── 3. NAVBAR SCROLL EFFECT ──────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  revealOnScroll();
  updateActiveNavLink();
});

/* Active nav link on scroll */
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id], .hero[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  let currentSection = '';

  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    if (window.scrollY >= top) {
      currentSection = sec.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.style.color = '';
    if (link.getAttribute('href') === '#' + currentSection) {
      link.style.color = 'var(--blue-light)';
    }
  });
}

/* ── 4. MOBILE MENU ───────────────────────────── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.classList.toggle('open', menuOpen);
  const spans = hamburger.querySelectorAll('span');
  if (menuOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

function closeMobile() {
  menuOpen = false;
  mobileMenu.classList.remove('open');
  const spans = hamburger.querySelectorAll('span');
  spans[0].style.transform = '';
  spans[1].style.opacity = '';
  spans[2].style.transform = '';
}
window.closeMobile = closeMobile;

/* ── 5. SCROLL REVEAL ─────────────────────────── */
function revealOnScroll() {
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach(el => {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    if (rect.top < windowHeight - 60) {
      el.classList.add('visible');
    }
  });
}

// Initial check
setTimeout(revealOnScroll, 100);

/* ── 6. COUNTER ANIMATION ─────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'));
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target;
    }
  }
  requestAnimationFrame(update);
}

// Trigger counters when about section scrolls into view
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const numbers = entry.target.querySelectorAll('.stat-number');
      numbers.forEach(num => animateCounter(num));
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const aboutSection = document.getElementById('about');
if (aboutSection) counterObserver.observe(aboutSection);

/* ── 7. YEAR FILTER ───────────────────────────── */
const yearButtons = document.querySelectorAll('.yfbtn');
const timelineItems = document.querySelectorAll('#timeline-list .tl-item');

yearButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    yearButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const selected = btn.getAttribute('data-year');

    timelineItems.forEach(item => {
      const itemYear = item.getAttribute('data-year');

      if (selected === 'all') {
        // Show everything
        item.style.display = 'flex';
        setTimeout(() => { item.style.opacity = '1'; item.style.transform = ''; }, 10);
      } else {
        if (itemYear === selected) {
          item.style.display = 'flex';
          setTimeout(() => { item.style.opacity = '1'; item.style.transform = ''; }, 10);
        } else {
          item.style.opacity = '0';
          setTimeout(() => { item.style.display = 'none'; }, 300);
        }
      }
    });

    // Also check year markers — show if any item in that year is visible
    const yearMarkers = document.querySelectorAll('.tl-year-marker');
    yearMarkers.forEach(marker => {
      const markerText = marker.textContent;
      const markerYear = markerText.includes('Year 1') ? '1' :
                         markerText.includes('Year 2') ? '2' :
                         markerText.includes('Year 3') ? '3' :
                         markerText.includes('Year 4') ? '4' : 'all';
      const parentItem = marker.closest('.tl-item');
      if (parentItem) {
        if (selected === 'all' || markerYear === selected) {
          parentItem.style.display = 'block';
          setTimeout(() => { parentItem.style.opacity = '1'; }, 10);
        } else {
          parentItem.style.opacity = '0';
          setTimeout(() => { parentItem.style.display = 'none'; }, 300);
        }
      }
    });
  });
});

// Add transition styles to timeline items
timelineItems.forEach(item => {
  item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
});

/* ── 8. CONTACT FORM ──────────────────────────── */
// Update BACKEND_URL to your deployed backend URL when live
const BACKEND_URL = ' ';

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    const name = contactForm.querySelector('input[type="text"]').value;
    const email = contactForm.querySelector('input[type="email"]').value;
    const message = contactForm.querySelector('textarea').value;

    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;

    try {
      const res = await fetch(`${BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const data = await res.json();

      if (data.success) {
        btn.innerHTML = '<i class="fa fa-check"></i> Sent Successfully!';
        btn.style.background = 'var(--green)';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.disabled = false;
          contactForm.reset();
        }, 3000);
      } else {
        btn.innerHTML = `<i class="fa fa-times"></i> ${data.error || 'Error!'}`;
        btn.style.background = '#ef4444';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }
    } catch (err) {
      btn.innerHTML = '<i class="fa fa-times"></i> Network Error';
      btn.style.background = '#ef4444';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    }
  });
}

/* ── 9. SMOOTH SCROLL FOR ANCHOR LINKS ─────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── 10. TILT EFFECT ON PROJECT CARDS ─────────── */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -5;
    const rotY = ((x - cx) / cx) * 5;
    card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-5px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.4s ease';
  });
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.1s ease';
  });
});

/* ── 11. PAGE VISIBILITY ──────────────────────── */
// Update tab title dynamically
document.addEventListener('visibilitychange', () => {
  document.title = document.hidden
    ? '👋 Come back!'
    : 'Sakshi Karpe — Portfolio';
});
