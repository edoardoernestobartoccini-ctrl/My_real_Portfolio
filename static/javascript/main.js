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

function setupPortfolioDropdown(dropdown) {
  const toggle = dropdown.querySelector('.portfolio-toggle');
  const menu = dropdown.querySelector('.portfolio-menu');
  if (!toggle || !menu) return;

  function closeMenu(returnFocus = false) {
    toggle.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isExpanded));
    menu.hidden = isExpanded;
  });

  dropdown.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      event.preventDefault();
      closeMenu(true);
    }
  });

  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target)) closeMenu();
  });
}

function scrollSlider(sliderId, direction) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.slide'));
  if (!slides.length) return;

  const sliderLeft = slider.getBoundingClientRect().left;
  const currentIndex = slides.reduce((closestIndex, slide, index) => {
    const distance = Math.abs(slide.getBoundingClientRect().left - sliderLeft);
    const closestDistance = Math.abs(
      slides[closestIndex].getBoundingClientRect().left - sliderLeft
    );
    return distance < closestDistance ? index : closestIndex;
  }, 0);
  const target = slides[Math.max(0, Math.min(slides.length - 1, currentIndex + direction))];
  slider.scrollTo({
    left: slider.scrollLeft + target.getBoundingClientRect().left - sliderLeft,
    behavior: 'smooth'
  });
}

function setupLazyGallery(slider) {
  const images = Array.from(slider.querySelectorAll('.slide img[data-src]'));
  if (!images.length) return;

  const pending = new Map();
  const failed = new Set();
  let activeIndex = 0;
  let scrollTimer;

  function scheduleImages() {
    const wanted = new Set([activeIndex, activeIndex + 1]);

    pending.forEach((handlers, image) => {
      if (wanted.has(images.indexOf(image))) return;
      image.removeEventListener('load', handlers.load);
      image.removeEventListener('error', handlers.error);
      image.removeAttribute('src');
      pending.delete(image);
    });

    wanted.forEach((index) => {
      const image = images[index];
      if (!image || image.naturalWidth > 0 || pending.has(image) || failed.has(image)) return;

      image.fetchPriority = index === activeIndex ? 'high' : 'low';
      image.loading = 'eager';

      const load = () => finishLoading(image);
      const error = () => {
        failed.add(image);
        image.dataset.imageError = 'true';
        console.error(`Failed to load gallery image: ${image.dataset.src}`);
        finishLoading(image);
      };

      pending.set(image, { load, error });
      image.addEventListener('load', load, { once: true });
      image.addEventListener('error', error, { once: true });
      image.src = image.dataset.src;
    });
  }

  function finishLoading(image) {
    const handlers = pending.get(image);
    if (handlers) {
      image.removeEventListener('load', handlers.load);
      image.removeEventListener('error', handlers.error);
    }
    pending.delete(image);
    scheduleImages();
  }

  function updateActiveSlide() {
    const sliderLeft = slider.getBoundingClientRect().left;
    activeIndex = images.reduce((closestIndex, image, index) => {
      const distance = Math.abs(image.getBoundingClientRect().left - sliderLeft);
      const closestDistance = Math.abs(
        images[closestIndex].getBoundingClientRect().left - sliderLeft
      );
      return distance < closestDistance ? index : closestIndex;
    }, 0);
    scheduleImages();
  }

  slider.addEventListener('scroll', () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(updateActiveSlide, 120);
  }, { passive: true });
  scheduleImages();
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
  document.querySelectorAll('.portfolio-dropdown').forEach(setupPortfolioDropdown);
  createLightbox();
  document.querySelectorAll('.slider').forEach(setupLazyGallery);
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
