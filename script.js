const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-count]");
const header = document.querySelector("[data-header]");
const progress = document.querySelector("[data-scroll-progress]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let countersStarted = false;

menuToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  menuToggle.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuToggle?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-label", "Abrir menu");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const updateChrome = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollMax > 0 ? scrollTop / scrollMax : 0;

  header?.classList.toggle("is-scrolled", scrollTop > 24);
  if (progress) {
    progress.style.transform = `scaleX(${amount})`;
  }
};

window.addEventListener("scroll", updateChrome, { passive: true });
window.addEventListener("resize", updateChrome);
updateChrome();

const setupRevealFallback = () => {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
};

const setupGsapAnimations = () => {
  if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) {
    setupRevealFallback();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  revealItems.forEach((item) => item.classList.add("is-visible"));

  gsap.from(".site-header", {
    y: -28,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
  });

  gsap.from(".hero-content > *", {
    y: 34,
    opacity: 0,
    duration: 0.85,
    ease: "power3.out",
    stagger: 0.09,
    delay: 0.15,
  });

  gsap.from(".hero-panel", {
    x: 34,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out",
    delay: 0.55,
  });

  gsap.to(".hero-image", {
    scale: 1.08,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  gsap.utils.toArray(".route-step, .service-card, .timeline-item, .fleet-item, .quote-form, .control-card, .client-rail, .testimonial").forEach((item) => {
    gsap.from(item, {
      y: 32,
      opacity: 0,
      duration: 0.72,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 84%",
        once: true,
      },
    });
  });

  gsap.utils.toArray(".section-heading, .story-copy, .proof-copy, .contact-copy").forEach((item) => {
    gsap.from(item, {
      y: 28,
      opacity: 0,
      duration: 0.76,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 82%",
        once: true,
      },
    });
  });
};

const animateCounters = () => {
  counters.forEach((counter) => {
    const target = Number(counter.dataset.count);
    const duration = 1500;
    const start = performance.now();

    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.round(target * eased).toLocaleString("pt-BR");

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  });
};

const statsObserver = new IntersectionObserver(
  (entries) => {
    const isVisible = entries.some((entry) => entry.isIntersecting);
    if (isVisible && !countersStarted) {
      countersStarted = true;
      animateCounters();
      statsObserver.disconnect();
    }
  },
  { threshold: 0.35 }
);

const statsSection = document.querySelector(".stats");
if (statsSection) {
  statsObserver.observe(statsSection);
}

setupGsapAnimations();

document.querySelector(".quote-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const rota = encodeURIComponent(data.get("rota") || "");
  const nome = encodeURIComponent(data.get("nome") || "");
  window.open(
    `https://wa.me/5500000000000?text=Ola%2C%20sou%20${nome}%20e%20quero%20uma%20cotacao%20para%20a%20rota%3A%20${rota}`,
    "_blank",
    "noopener"
  );
});
