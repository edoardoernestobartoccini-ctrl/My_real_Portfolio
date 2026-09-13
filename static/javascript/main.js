function goToHome() {
  window.location.href = "../../index.html";
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