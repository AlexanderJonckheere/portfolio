// Shared: print textures, cursor, page transition, text helpers.
gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none)").matches;
const ACCENTS = { pink: "#ff6cc9", mint: "#69ede2", orange: "#f9b25c" };

// ---------- Procedural print textures ----------
// Generated with SVG filters, then rasterised ONCE to a bitmap so the
// browser doesn't recompute the filters on every animation frame.
const svgUrl = (svg) => svg;

const TEX = {
  // grayscale photocopy "image" — stands in for a real photo
  xerox: (seed) => svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="500" height="640" viewBox="0 0 500 640">
    <filter id="f" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.011" numOctaves="5" seed="${seed}" result="n"/>
      <feColorMatrix in="n" type="saturate" values="0" result="g"/>
      <feComponentTransfer in="g" result="p">
        <feFuncR type="discrete" tableValues="0 0.05 0.3 0.75 0.95 1 1"/>
        <feFuncG type="discrete" tableValues="0 0.05 0.3 0.75 0.95 1 1"/>
        <feFuncB type="discrete" tableValues="0 0.05 0.3 0.75 0.95 1 1"/>
        <feFuncA type="table" tableValues="1 1"/>
      </feComponentTransfer>
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="${seed + 1}" result="s"/>
      <feColorMatrix in="s" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -16 0 0 0 5.9" result="dots"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.002 0.08" numOctaves="2" seed="${seed + 2}" result="l"/>
      <feColorMatrix in="l" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -24 0 0 0 8.5" result="lines"/>
      <feMerge><feMergeNode in="p"/><feMergeNode in="lines"/><feMergeNode in="dots"/></feMerge>
    </filter>
    <rect width="100%" height="100%" filter="url(#f)"/>
  </svg>`),

  // crisp ink splatter, denser towards the centre — black ink, or a mask for coloured splats
  splat: (seed) => `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>
      <radialGradient id="g"><stop offset="0.05" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>
      <filter id="f" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="5" seed="${seed}" result="n"/>
        <feColorMatrix in="n" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 1" result="no"/>
        <feComposite in="no" in2="SourceGraphic" operator="arithmetic" k2="1" k3="0.5" k4="-0.08" result="mix"/>
        <feColorMatrix in="mix" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -40 0 0 0 20" result="blobs"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="2" seed="${seed + 5}" result="s"/>
        <feColorMatrix in="s" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 1" result="so"/>
        <feComposite in="so" in2="SourceGraphic" operator="arithmetic" k2="1" k3="0.35" k4="0" result="smix"/>
        <feColorMatrix in="smix" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -40 0 0 0 15.6" result="spray"/>
        <feMerge><feMergeNode in="blobs"/><feMergeNode in="spray"/></feMerge>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" filter="url(#f)"/>
  </svg>`,

  // opaque with photocopy dropouts + scratches — used as a mask on big type
  distress: (seed) => `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420">
    <filter id="f" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="${seed}" result="a"/>
      <feColorMatrix in="a" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -22 0 0 0 15.6" result="A"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.3" numOctaves="2" seed="${seed + 3}" result="b"/>
      <feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -26 0 0 0 19" result="B"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="${seed + 7}" result="c"/>
      <feColorMatrix in="c" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -30 0 0 0 23" result="C"/>
      <feComposite in="A" in2="B" operator="in" result="AB"/>
      <feComposite in="AB" in2="C" operator="in"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#f)"/>
  </svg>`,

  // speckle grain for colour blocks (printed, not flat)
  speckle: (seed) => svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
    <filter id="f"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed}"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -14 0 0 0 5.1"/></filter>
    <rect width="100%" height="100%" filter="url(#f)"/>
  </svg>`),

  // paper fibres
  paper: () => svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
    <filter id="f"><feTurbulence type="fractalNoise" baseFrequency="0.5 0.08" numOctaves="3" seed="2"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.44  0 0 0 0 0.42  -3 0 0 0 1.45"/></filter>
    <rect width="100%" height="100%" filter="url(#f)" opacity="0.5"/>
  </svg>`),
};

const TEX_SIZE = { xerox: [500, 640], splat: [600, 600], distress: [420, 420], speckle: [300, 300], paper: [600, 600] };
const texCache = new Map();

function texture(kind, seed = 0) {
  const key = `${kind}-${seed}`;
  if (!texCache.has(key)) {
    texCache.set(key, new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const [w, h] = TEX_SIZE[kind];
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => resolve(`url(${URL.createObjectURL(blob)})`));
      };
      img.src = `data:image/svg+xml,${encodeURIComponent(TEX[kind](seed))}`;
    }));
  }
  return texCache.get(key);
}

function setTexture(el, kind, seed) {
  return texture(kind, seed).then((url) => (el.style.backgroundImage = url));
}

function setMask(el, kind, seed) {
  return texture(kind, seed).then((url) => {
    el.style.webkitMaskImage = url;
    el.style.maskImage = url;
  });
}

// Torn paper edge as a static clip-path (cheap, unlike an SVG displacement filter)
function tear(el, depth = 4, steps = 18) {
  const r = () => (Math.random() * depth).toFixed(1);
  const pts = [];
  for (let i = 0; i <= steps; i++) pts.push(`${(i / steps) * 100}% ${r()}px`);
  for (let i = 1; i <= steps; i++) pts.push(`calc(100% - ${r()}px) ${(i / steps) * 100}%`);
  for (let i = steps - 1; i >= 0; i--) pts.push(`${(i / steps) * 100}% calc(100% - ${r()}px)`);
  for (let i = steps - 1; i > 0; i--) pts.push(`${r()}px ${(i / steps) * 100}%`);
  el.style.clipPath = `polygon(${pts.join(",")})`;
}

function applyTextures(root = document) {
  const jobs = [];
  root.querySelectorAll(".ph").forEach((el, i) => {
    if (el.querySelector("img, video, iframe")) return;
    jobs.push(setTexture(el, "xerox", Number(el.dataset.seed) || i * 7 + 3));
  });
  root.querySelectorAll(".ink").forEach((el, i) => {
    jobs.push(setTexture(el, "splat", Number(el.dataset.seed) || i * 5 + 1));
  });
  root.querySelectorAll(".splat").forEach((el, i) => {
    jobs.push(setMask(el, "splat", Number(el.dataset.seed) || i * 3 + 2));
  });
  root.querySelectorAll("[data-tear]").forEach((el) => tear(el, 7, 12));
  root.querySelectorAll(".block, .work__bg, .contact__btn-shadow").forEach((el, i) => {
    jobs.push(setTexture(el, "speckle", (i % 3) + 2));
    tear(el, 6);
  });
  const paper = document.querySelector(".paper");
  if (paper) jobs.push(setTexture(paper, "paper"));
  return Promise.all(jobs);
}

// ---------- Text helpers ----------
// Wrap every character in span.char. Letters are grouped per word in a
// no-wrap span, so a title only ever breaks between words, never mid-word.
function splitChars(el) {
  const text = el.textContent;
  el.textContent = "";
  const chars = [];
  text.split(/( )/).forEach((part) => {
    if (!part) return;
    if (part === " ") {
      // breakable space; still returned as a char so indexes stay stable
      const space = document.createElement("span");
      space.className = "char char--space";
      space.textContent = " ";
      el.appendChild(space);
      chars.push(space);
      return;
    }
    const word = document.createElement("span");
    word.className = "char-word";
    [...part].forEach((ch) => {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = ch;
      word.appendChild(span);
      chars.push(span);
    });
    el.appendChild(word);
  });
  return chars;
}

// Split into words but keep inline elements (e.g. <mark>) intact
function splitWords(el) {
  const words = [];
  [...el.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(" "));
        const span = document.createElement("span");
        span.className = "word";
        span.textContent = part;
        frag.appendChild(span);
        words.push(span);
      });
      node.replaceWith(frag);
    } else {
      node.classList.add("word");
      words.push(node);
    }
  });
  return words;
}

// Typewriter / photocopy "scramble" of a label's text
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*/—+=0123456789";
function scramble(el, duration = 0.9) {
  const final = el.dataset.final || (el.dataset.final = el.textContent);
  const state = { p: 0 };
  return gsap.to(state, {
    p: 1,
    duration,
    ease: "none",
    onUpdate: () => {
      const n = Math.floor(state.p * final.length);
      el.textContent = final.slice(0, n) + [...final.slice(n)].map((c) => (c === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join("");
    },
    onComplete: () => (el.textContent = final),
  });
}

// Misregistration jitter: offsets the pink/mint copies of a title
function misregister(el) {
  return gsap.to(el, {
    "--gx1": () => `${gsap.utils.random(-8, 8)}px`,
    "--gy1": () => `${gsap.utils.random(-5, 5)}px`,
    "--gx2": () => `${gsap.utils.random(-8, 8)}px`,
    "--gy2": () => `${gsap.utils.random(-5, 5)}px`,
    duration: 0.08,
    repeat: -1,
    repeatRefresh: true,
    ease: "steps(1)",
  });
}

// ---------- Cursor ----------
function initCursor() {
  const cursor = document.querySelector(".cursor");
  if (!cursor || isTouch) return;
  const label = cursor.querySelector(".cursor__label");
  const xTo = gsap.quickTo(cursor, "x", { duration: 0.2, ease: "power3" });
  const yTo = gsap.quickTo(cursor, "y", { duration: 0.2, ease: "power3" });

  window.addEventListener("mousemove", (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
  });
  document.addEventListener("mouseover", (e) => {
    const t = e.target.closest("[data-cursor], a, button, .js-drag");
    cursor.classList.toggle("is-hover", !!t);
    const text = t && (t.dataset.cursor || (t.classList.contains("js-drag") ? "drag" : ""));
    cursor.classList.toggle("has-label", !!text);
    if (text) label.textContent = text;
  });
}

// ---------- Page transition (photocopier scan) ----------
function transitionIn() {
  const t = document.querySelector(".transition");
  gsap.set(t, { clipPath: "inset(0 0 0% 0)" });
  return gsap.to(t, { clipPath: "inset(100% 0 0% 0)", duration: 0.9, ease: "power3.inOut" });
}

function transitionOut(href) {
  const t = document.querySelector(".transition");
  gsap.fromTo(t, { clipPath: "inset(0 0 100% 0)" }, {
    clipPath: "inset(0 0 0% 0)",
    duration: 0.8,
    ease: "power3.inOut",
    onComplete: () => (window.location.href = href),
  });
}

function initPageLinks() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link || e.metaKey || e.ctrlKey || link.target === "_blank") return;
    const url = new URL(link.href, location.href);
    if (url.protocol === "mailto:" || url.origin !== location.origin) return;

    // in-page anchor → smooth scroll
    if (url.pathname === location.pathname && url.search === location.search) {
      const target = url.hash && url.hash !== "#top" ? document.querySelector(url.hash) : document.body;
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      return;
    }
    e.preventDefault();
    transitionOut(link.href);
  });

  // coming back via browser back button (bfcache)
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) gsap.set(".transition", { clipPath: "inset(0 0 100% 0)" });
  });
}

// ---------- Shared scroll animations ----------
function initPrintReveals() {
  // colour blocks get "printed" on: wipe in from a random side
  gsap.utils.toArray(".js-block").forEach((el) => {
    if (el.closest(".hero")) return; // hero handles its own intro
    gsap.from(el, {
      scaleX: 0,
      transformOrigin: Math.random() > 0.5 ? "left center" : "right center",
      duration: 0.9,
      ease: "power4.inOut",
      scrollTrigger: { trigger: el, start: "top 90%" },
    });
  });

  // xerox images scan in top → bottom
  gsap.utils.toArray(".js-paste").forEach((el) => {
    if (el.closest(".hero")) return;
    gsap.from(el, {
      clipPath: "inset(0 0 100% 0)",
      duration: 1.3,
      ease: "power3.inOut",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  // ink splats "hit" the page
  gsap.utils.toArray(".js-ink").forEach((el) => {
    if (el.closest(".hero")) return;
    gsap.from(el, {
      scale: 0.4,
      opacity: 0,
      duration: 0.5,
      ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  gsap.utils.toArray(".js-scramble").forEach((el) => {
    if (el.closest(".hero")) return;
    ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => scramble(el) });
  });

  // parallax for any collage piece with data-speed
  gsap.utils.toArray("[data-speed]").forEach((el) => {
    gsap.to(el, {
      yPercent: () => -60 * parseFloat(el.dataset.speed),
      ease: "none",
      scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
    });
  });
}

const texturesReady = applyTextures();
initCursor();
initPageLinks();
