const menuBtn = document.querySelector(".menu-btn");
const mainNav = document.querySelector(".main-nav");
const navLinks = document.querySelectorAll(".main-nav a");
const themeToggle = document.querySelector("#themeToggle");
const revealItems = document.querySelectorAll(".reveal");
const parallaxLayers = document.querySelectorAll(".parallax-layer");
const rippleButtons = document.querySelectorAll(".ripple-btn");
const introScreen = document.querySelector("#introScreen");
const cursorGlow = document.querySelector("#cursorGlow");
const adviceOptions = document.querySelectorAll(".advice-option");
const adviceSubmit = document.querySelector("#adviceSubmit");
const storeStatus = document.querySelector("#storeStatus");

// Intro animada: se oculta en menos de 3 segundos para no molestar.
window.addEventListener("load", () => {
  window.setTimeout(() => {
    if (introScreen) introScreen.classList.add("is-hidden");
  }, 2200);
});

// Toggle manual + persistencia de tema.
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  });
}

// Menu movil.
if (menuBtn && mainNav) {
  menuBtn.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

// Reveal suave en scroll.
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
);

revealItems.forEach((item) => revealObserver.observe(item));

// Parallax leve y performante.
let ticking = false;
function updateParallax() {
  const y = window.scrollY;
  parallaxLayers.forEach((layer) => {
    const speed = Number(layer.dataset.parallaxSpeed || 0.1);
    const movement = Math.max(Math.min(y * speed, 90), -90);
    layer.style.transform = `translate3d(0, ${movement}px, 0) scale(1.1)`;
  });
  ticking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateParallax);
  },
  { passive: true }
);

updateParallax();

// Ripple sutil en botones.
rippleButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.className = "ripple";
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    button.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
  });
});

// Cursor ambiental neon (solo dispositivos con puntero fino).
const finePointer = window.matchMedia("(pointer: fine)").matches;
if (cursorGlow && finePointer) {
  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursorGlow.style.opacity = "1";
  });

  window.addEventListener("mouseout", () => {
    cursorGlow.style.opacity = "0";
  });

  const smoothCursor = () => {
    cursorX += (mouseX - cursorX) * 0.16;
    cursorY += (mouseY - cursorY) * 0.16;
    cursorGlow.style.left = `${cursorX}px`;
    cursorGlow.style.top = `${cursorY}px`;
    window.requestAnimationFrame(smoothCursor);
  };

  smoothCursor();
}

// Selector de asesoramiento: una sola opcion activa y mensaje dinamico.
let selectedAdviceOption = "";

function updateAdviceState() {
  if (!adviceSubmit) return;
  adviceSubmit.disabled = selectedAdviceOption === "";
}

adviceOptions.forEach((optionButton) => {
  optionButton.addEventListener("click", () => {
    selectedAdviceOption = optionButton.dataset.option || "";

    adviceOptions.forEach((button) => {
      const isActive = button === optionButton;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    updateAdviceState();
  });
});

if (adviceSubmit) {
  adviceSubmit.addEventListener("click", () => {
    if (!selectedAdviceOption) return;

    const message = `Hola, necesito asesoramiento para un espacio con ${selectedAdviceOption}.`;
    const whatsappUrl = `https://wa.me/5491100000000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  });
}

updateAdviceState();

// Estado del local (abierto/cerrado) con colores segun horario.
function getArgentinaNow() {
  try {
    const localString = new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" });
    const parsed = new Date(localString);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  } catch (error) {
    // Fallback a hora local si falla la conversion de zona horaria.
  }
  return new Date();
}

function getStoreStatus() {
  const now = getArgentinaNow();
  const day = now.getDay(); // 0=Domingo ... 6=Sabado
  const hour = now.getHours();
  const minute = now.getMinutes();
  const totalMinutes = hour * 60 + minute;

  const isSunday = day === 0;
  const openStart = isSunday ? 10 * 60 : 9 * 60;
  const openEnd = isSunday ? 14 * 60 : 19 * 60;
  const isOpen = totalMinutes >= openStart && totalMinutes < openEnd;

  return { isOpen, isSunday };
}

function renderStoreStatus() {
  if (!storeStatus) return;
  const textEl = storeStatus.querySelector(".status-text");
  if (!textEl) return;

  try {
    const { isOpen, isSunday } = getStoreStatus();

    storeStatus.classList.remove("status-open", "status-closed");
    if (isOpen) {
      storeStatus.classList.add("status-open");
      textEl.textContent = isSunday ? "Abierto ahora - Cierra 14:00" : "Abierto ahora - Cierra 19:00";
    } else {
      storeStatus.classList.add("status-closed");
      textEl.textContent = isSunday ? "Cerrado ahora - Abre 10:00" : "Cerrado ahora - Abre 09:00";
    }
  } catch (error) {
    // Nunca dejar el texto en "Cargando...".
    storeStatus.classList.remove("status-open");
    storeStatus.classList.add("status-closed");
    textEl.textContent = "Cerrado ahora";
  }
}

renderStoreStatus();
window.setInterval(renderStoreStatus, 60000);
