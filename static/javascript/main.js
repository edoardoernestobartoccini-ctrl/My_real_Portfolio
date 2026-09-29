function goToHome() {
  const isSubdir = window.location.pathname.includes('/static/html/');
  window.location.href = isSubdir ? "../../index.html" : "index.html";
}

function goToProjects() {
  window.location.href = "projects.html";
}

function goToAbout() {
  window.location.href = "about.html";
}

function goToContact() {
  window.location.href = "contacts.html";
}

function goToProject(project) {
  window.location.href = project + ".html";
}

function scrollSlider(sliderId, direction) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;

  const firstSlide = slider.querySelector('.slide');
  const slideWidth = firstSlide ? firstSlide.getBoundingClientRect().width + 28 : 320;

  slider.scrollBy({
    left: direction * slideWidth,
    behavior: 'smooth'
  });
}

// LIGHTBOX: click an image to view fullscreen in an overlay
function createLightbox() {
  if (document.getElementById('site-lightbox')) return;
  const lb = document.createElement('div');
  lb.id = 'site-lightbox';
  lb.className = 'lightbox';
  lb.setAttribute('aria-hidden', 'true');
  lb.innerHTML = `
    <div class="lightbox-inner" role="dialog" aria-modal="true">
      <button class="lightbox-close" aria-label="Close">×</button>
      <img src="" alt="" />
      <div class="lightbox-caption"></div>
    </div>
  `;
  document.body.appendChild(lb);

  // Close when clicking outside image or pressing close button
  lb.addEventListener('click', (e) => {
    if (e.target === lb || e.target.classList.contains('lightbox-close')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

function openLightbox(src, alt, caption) {
  createLightbox();
  const lb = document.getElementById('site-lightbox');
  const img = lb.querySelector('img');
  const cap = lb.querySelector('.lightbox-caption');
  img.src = src;
  img.alt = alt || '';
  cap.textContent = caption || '';
  lb.classList.add('active');
  lb.setAttribute('aria-hidden', 'false');
  // prevent body scroll when lightbox open
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('site-lightbox');
  if (!lb) return;
  lb.classList.remove('active');
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  // remove src to release memory
  const img = lb.querySelector('img');
  if (img) img.src = '';
}

// attach click handlers to slide images after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  createLightbox();
  document.querySelectorAll('.slide img').forEach((imgElem) => {
    imgElem.style.cursor = 'zoom-in';
    imgElem.addEventListener('click', () => {
      // find caption inside the same slide
      const slide = imgElem.closest('.slide');
      const captionElem = slide ? slide.querySelector('.caption') : null;
      const caption = captionElem ? captionElem.textContent.trim() : '';
      openLightbox(imgElem.src, imgElem.alt, caption);
    });
  });
});
