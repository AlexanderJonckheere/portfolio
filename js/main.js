// Home page: collage poster hero, project list, hover + scroll animations.

function workRow(p, i) {
  // media type tag (Figma / MP4); projects without media yet get no tag
  const type = p.media ? (p.media.type === "figma" ? "Figma" : "MP4") : "";
  return `
      <li class="work__item">
        <a class="work__link" href="project.html?p=${p.slug}" data-cursor="open project"
           style="--accent: ${ACCENTS[p.color]}">
          <span class="work__bg"></span>
          <span class="work__num">${String(i + 1).padStart(2, "0")}</span>
          <span class="work__title" data-text="${p.title}">${p.title}</span>
          <span class="work__meta">
            ${type ? `<span class="label label--black">${type}</span>` : ""}
            ${p.role ? `<span class="label label--white">${p.role}</span>` : ""}
            ${p.finished ? '<span class="label label--mint">Finished</span>' : ""}
            ${p.group ? '<span class="label label--pink">Group</span>' : ""}
          </span>
          <span class="work__year">${p.year}</span>
        </a>
      </li>`;
}

function renderWorkList() {
  const pad2 = (n) => String(n).padStart(2, "0");
  document.querySelector(".js-index-count").textContent = `Index (${pad2(WORK.length)})`;
  document.querySelector(".js-personal-count").textContent = `(${pad2(PERSONAL.length)})`;
  document.querySelector(".js-work-list").innerHTML = WORK.map(workRow).join("");
  document.querySelector(".js-personal-list").innerHTML = PERSONAL.map(workRow).join("");
}

// the "Personal projects" button folds its list open / closed
function initPersonal() {
  const btn = document.querySelector(".js-personal-toggle");
  const panel = document.querySelector(".personal__panel");
  const icon = btn.querySelector(".personal__icon");
  const rows = panel.querySelectorAll(".work__item");
  gsap.set(panel, { height: 0 });
  panel.inert = true;

  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    panel.inert = !open;
    gsap.to(icon, { rotation: open ? 45 : 0, duration: 0.4, ease: "back.out(2)" });
    if (open) {
      gsap.to(panel, { height: "auto", duration: 0.6, ease: "power4.inOut", onComplete: () => ScrollTrigger.refresh() });
      gsap.fromTo(rows, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power4.inOut", stagger: 0.08, delay: 0.15 });
    } else {
      gsap.to(panel, { height: 0, duration: 0.5, ease: "power4.inOut", onComplete: () => ScrollTrigger.refresh() });
    }
  });
}

// ---------- Hero poster ----------
const CLIP_AUSTRALIA = {
  title: "Australia",
  text: [
    "When I was around two years old, my parents moved from China, where I was born, to Australia: the land where I would spend my childhood.",
    "We lived there for seven years before moving to Belgium.",
    "I love Australia and the outback. That place holds some of my fondest memories.",
  ],
};
// placeholder for the right-hand clipping - swap in your own story later
const CLIP_PLACEHOLDER = {
  title: "Placeholder",
  text: [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  ],
};

// the little newspaper clippings in the hero
// .c1 = left (text repeated to fill the scrap), .c2 = right (placeholder), others = Australia
function fillClippings() {
  document.querySelectorAll(".js-clipping").forEach((el, i) => {
    const story = el.classList.contains("c2") ? CLIP_PLACEHOLDER : CLIP_AUSTRALIA;
    const paragraphs = el.classList.contains("c1") ? [...story.text, ...story.text] : story.text;
    el.innerHTML = `<b>${story.title}</b>
      ${i % 2 ? "" : `<div class="ph" data-seed="${60 + i}"></div>`}
      ${paragraphs.map((t) => `<p>${t}</p>`).join("")}`;
  });
}
// letters of the name become cut-outs: slightly shifted, rotated, two inverted
function buildName() {
  const name = document.querySelector(".poster__name");
  const chars = gsap.utils.toArray(".poster__name .js-chars").flatMap(splitChars);
  chars.forEach((c, i) => {
    if (i === 3 || i === 14) c.classList.add("inv");
    gsap.set(c, { yPercent: gsap.utils.random(-5, 5), rotation: gsap.utils.random(-2.5, 2.5) });
  });
  // torn white paper strip behind each line so the black letters read against the clutter
  name.querySelectorAll(".poster__line").forEach((line, i) => {
    const paper = document.createElement("span");
    paper.className = "poster__paper";
    paper.dataset.tear = "";
    gsap.set(paper, { rotation: i ? 1.2 : -1.5 });
    line.prepend(paper);
  });
  setMask(name, "distress", 4);
  setMask(document.querySelector(".poster__bg-type"), "distress", 9);
  texture("speckle", 3).then((url) => document.querySelector(".about__portrait").style.setProperty("--grit", url));
  // gritty paper behind the quote: speckle print + torn edge (data-tear)
  texture("speckle", 6).then((url) => document.querySelector(".poster__para").style.setProperty("--grit", url));

  // hovering a letter makes it "skip" like a misfeed
  chars.forEach((c) => {
    c.addEventListener("mouseenter", () => {
      gsap.fromTo(c, { x: 0 }, { x: gsap.utils.random(-16, 16), duration: 0.1, yoyo: true, repeat: 1, ease: "steps(2)" });
      if (!c.classList.contains("inv")) {
        gsap.fromTo(c, { color: gsap.utils.random(["#ff6cc9", "#69ede2", "#f9b25c"]) }, { color: "#000", duration: 0.4, ease: "steps(3)" });
      }
    });
  });
  return chars;
}

function heroIntro(chars) {
  const q = (sel) => gsap.utils.toArray(`.poster ${sel}`);
  const tl = gsap.timeline({ paused: true });

  // stroke lengths for the "draw on" effect
  q(".strokes path").forEach((p) => {
    const len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
  });

  // background line scans in first
  tl.from(q(".poster__bg-type"), { clipPath: "inset(0 100% 0 0)", duration: 0.8, ease: "power3.inOut" })
    .from(q(".p-ink"), { scale: 0.3, autoAlpha: 0, duration: 0.5, ease: "expo.out", stagger: 0.08 }, "-=0.4")
    // scraps & clippings slapped onto the wall
    .from(q(".layer--back .scrap, .layer--back .clipping, .box, .box-grid"), {
      autoAlpha: 0,
      scale: 1.25,
      rotation: () => gsap.utils.random(-10, 10),
      duration: 0.35,
      ease: "power4.out",
      stagger: { each: 0.05, from: "random" },
    }, "-=0.35")
    // paper strips get pasted down first...
    .from(q(".poster__paper"), { scaleX: 0, transformOrigin: (i) => (i ? "right center" : "left center"), duration: 0.5, ease: "power4.inOut", stagger: 0.1 }, "-=0.3")
    // ...then the name slams in letter by letter
    .from(chars, {
      autoAlpha: 0,
      scale: 1.9,
      rotation: () => gsap.utils.random(-25, 25),
      duration: 0.3,
      ease: "power4.out",
      stagger: { each: 0.035, from: "random" },
    }, "-=0.3")
    .from(q(".hairline"), { scaleY: 0, duration: 0.6, ease: "power3.inOut", stagger: 0.05 }, "-=0.4")
    .to(q(".strokes path"), { strokeDashoffset: 0, duration: 0.5, ease: "power2.in", stagger: 0.06 }, "<")
    .from(q(".splat"), { scale: 0.3, autoAlpha: 0, duration: 0.45, ease: "expo.out", stagger: 0.1 }, "-=0.5")
    .from(q(".block"), {
      scaleX: 0,
      transformOrigin: (i) => (i % 2 ? "right center" : "left center"),
      duration: 0.55,
      ease: "power4.inOut",
      stagger: 0.07,
    }, "-=0.4")
    .from(q(".layer--front .scrap, .layer--front .clipping"), { autoAlpha: 0, scale: 1.3, rotation: 8, duration: 0.3, ease: "power4.out", stagger: 0.08 }, "-=0.3")
    .from(q(".dot-circle"), { scale: 0, duration: 0.5, ease: "back.out(2.5)", stagger: 0.06 }, "-=0.3")
    .from(q(".poster__tag"), { autoAlpha: 0, duration: 0.01 }, "-=0.2")
    .add(() => q(".js-scramble").forEach((el) => scramble(el, 0.7)), "<")
    .from(q(".poster__vert, .poster__para, .poster__list li, .poster__foot"), {
      autoAlpha: 0,
      y: 16,
      duration: 0.5,
      ease: "power3.out",
      stagger: 0.04,
    }, "<");

  return tl;
}

// every few seconds a handful of letters glitch: pink/mint misregistration + jitter,
// the same print-misalignment as the project titles on hover
function glitchName(chars) {
  const r = gsap.utils.random;
  const burst = () => {
    const picks = gsap.utils.shuffle([...chars]).slice(0, r(3, 7, 1));
    gsap.timeline({ onComplete: () => gsap.delayedCall(r(1.8, 4.5), burst) })
      .to(picks, {
        x: () => r(-14, 14),
        textShadow: () => `${r(-9, 9)}px ${r(-4, 4)}px #ff6cc9, ${r(-9, 9)}px ${r(-4, 4)}px #69ede2`,
        duration: 0.06,
        ease: "steps(1)",
        repeat: r(3, 7, 1),
        repeatRefresh: true,
      })
      .set(picks, { x: 0, textShadow: "0px 0px 0px rgba(0,0,0,0), 0px 0px 0px rgba(0,0,0,0)" });
  };
  gsap.delayedCall(3.5, burst);
}

// park "Digital Design & Development" just above the name: its bottom only
// overlaps the top of the first paper strip a little, whatever the screen size
function placeBgType() {
  const type = document.querySelector(".poster__bg-type");
  const paper = document.querySelector(".poster__paper");
  if (!type || !paper) return;
  type.style.top = "0px";
  const overlap = Math.min(16, innerHeight * 0.015);
  const shift = paper.getBoundingClientRect().top + overlap - type.getBoundingClientRect().bottom;
  type.style.top = `${Math.max(0, shift)}px`;
}

// portrait glitch: copies of the photo cut into horizontal strips; during a burst
// a few strips slide sideways and some flip to mint (hue-rotated pink)
function glitchPortrait() {
  const portrait = document.querySelector(".about__portrait");
  const img = portrait && portrait.querySelector("img");
  if (!img) return;
  const r = gsap.utils.random;
  const slices = Array.from({ length: 8 }, (_, i) => {
    const slice = document.createElement("div");
    slice.className = "glitch-slice";
    slice.setAttribute("aria-hidden", "true");
    slice.appendChild(img.cloneNode());
    portrait.appendChild(slice);
    return slice;
  });

  const burst = () => {
    // fresh random strips every burst
    slices.forEach((slice) => {
      const top = r(0, 92);
      slice.style.clipPath = `inset(${top}% 0 ${Math.max(0, 100 - top - r(2, 9))}% 0)`;
    });
    const picks = gsap.utils.shuffle([...slices]).slice(0, r(3, 6, 1));
    gsap.timeline({ onComplete: () => gsap.delayedCall(r(2, 4.5), burst) })
      .set(picks, { autoAlpha: 1 })
      .to(picks, {
        x: () => r(-28, 28),
        filter: () => (Math.random() < 0.4 ? "hue-rotate(213deg) saturate(1.2)" : "none"),
        duration: 0.07,
        ease: "steps(1)",
        repeat: r(3, 6, 1),
        repeatRefresh: true,
      })
      .to(img, { x: () => r(-6, 6), duration: 0.05, ease: "steps(1)", repeat: 3, repeatRefresh: true }, 0)
      .set(picks, { autoAlpha: 0, x: 0, filter: "none" })
      .set(img, { x: 0 });
  };
  ScrollTrigger.create({ trigger: portrait, start: "top 80%", once: true, onEnter: () => gsap.delayedCall(1.2, burst) });
}

// hovering my face on the portrait pops up a glitchy "Me!" that follows the cursor
function initFacePop() {
  if (isTouch) return;
  const spot = document.querySelector(".js-face-spot");
  const pop = document.querySelector(".face-pop");
  if (!spot || !pop) return;
  const text = pop.querySelector(".face-pop__text");
  const xTo = gsap.quickTo(pop, "x", { duration: 0.35, ease: "power3" });
  const yTo = gsap.quickTo(pop, "y", { duration: 0.35, ease: "power3" });
  const r = gsap.utils.random;
  let glitch;

  spot.addEventListener("mousemove", (e) => {
    xTo(e.clientX + 18);
    yTo(e.clientY - 70);
  });
  spot.addEventListener("mouseenter", (e) => {
    gsap.set(pop, { x: e.clientX + 18, y: e.clientY - 70 });
    gsap.fromTo(pop, { autoAlpha: 1, scale: 0, rotation: -25 }, { scale: 1, rotation: 0, duration: 0.45, ease: "back.out(2.5)", overwrite: true });
    // keep glitching while hovered
    glitch = gsap.to(text, {
      x: () => r(-6, 6),
      textShadow: () => `${r(-6, 6)}px ${r(-3, 3)}px #ff6cc9, ${r(-6, 6)}px ${r(-3, 3)}px #69ede2`,
      duration: 0.07,
      ease: "steps(1)",
      repeat: -1,
      repeatDelay: 0.25,
      repeatRefresh: true,
    });
  });
  spot.addEventListener("mouseleave", () => {
    if (glitch) glitch.kill();
    gsap.set(text, { x: 0, textShadow: "0px 0px 0px rgba(0,0,0,0), 0px 0px 0px rgba(0,0,0,0)" });
    gsap.to(pop, { scale: 0, rotation: 20, duration: 0.25, ease: "power2.in", overwrite: true, onComplete: () => gsap.set(pop, { autoAlpha: 0 }) });
  });
}

// background words drift independently, like loose paper cut-outs
function floatBgWords() {
  gsap.utils.toArray(".bg-word").forEach((w, i) => {
    gsap.set(w, { rotation: gsap.utils.random(-5, 5), y: gsap.utils.random(-5, 5) });
    gsap.to(w, {
      y: () => gsap.utils.random(-8, 8),
      x: () => gsap.utils.random(-8, 8),
      rotation: () => gsap.utils.random(-6, 6),
      duration: () => gsap.utils.random(2.6, 4.2),
      ease: "sine.inOut",
      repeat: -1,
      repeatRefresh: true,
      delay: i * 0.3,
    });
  });
}

// depth parallax: layers drift with the mouse (x / yPercent) and on scroll (y)
function initHeroDepth() {
  const layers = gsap.utils.toArray(".poster [data-depth]");

  layers.forEach((el) => {
    const d = parseFloat(el.dataset.depth);
    gsap.to(el, {
      y: () => -120 * d + 60,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  });

  if (isTouch) return;
  const movers = layers.map((el) => ({
    d: parseFloat(el.dataset.depth),
    x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3" }),
    y: gsap.quickTo(el, "yPercent", { duration: 0.9, ease: "power3" }),
  }));
  window.addEventListener("mousemove", (e) => {
    const nx = e.clientX / innerWidth - 0.5;
    const ny = e.clientY / innerHeight - 0.5;
    movers.forEach((m) => {
      m.x(nx * -30 * m.d);
      m.y(ny * -3 * m.d);
    });
  });
}

// ---------- Swaying collage pieces ----------
// pieces near the cursor drift away from it and ease back when it leaves
function initSway() {
  if (isTouch) return;
  const hero = document.querySelector(".hero");
  const RADIUS = 220;
  const PUSH = 70;
  const pieces = gsap.utils.toArray(".poster .js-sway").map((el) => ({
    el,
    x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3" }),
    y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3" }),
    r: gsap.quickTo(el, "rotation", { duration: 1.1, ease: "power3" }),
  }));

  hero.addEventListener("mousemove", (e) => {
    pieces.forEach((p) => {
      const rect = p.el.getBoundingClientRect();
      // centre of the piece at rest (minus the offset it already has)
      const cx = rect.left + rect.width / 2 - gsap.getProperty(p.el, "x");
      const cy = rect.top + rect.height / 2 - gsap.getProperty(p.el, "y");
      const dx = cx - e.clientX;
      const dy = cy - e.clientY;
      const dist = Math.hypot(dx, dy) || 1;
      const reach = RADIUS + Math.max(rect.width, rect.height) / 2;
      const force = Math.max(0, 1 - dist / reach);
      p.x((dx / dist) * force * PUSH);
      p.y((dy / dist) * force * PUSH);
      p.r((dx / dist) * force * 10);
    });
  });
  hero.addEventListener("mouseleave", () => pieces.forEach((p) => { p.x(0); p.y(0); p.r(0); }));
}

// ---------- Section titles ----------
function initTitles() {
  gsap.utils.toArray(".section-title.js-chars").forEach((title) => {
    const chars = splitChars(title);
    gsap.from(chars, {
      yPercent: () => gsap.utils.random(-40, 40),
      xPercent: () => gsap.utils.random(-30, 30),
      opacity: 0,
      duration: 0.06,
      ease: "steps(1)",
      stagger: { each: 0.035, from: "random" },
      scrollTrigger: { trigger: title, start: "top 85%" },
    });
  });
}

// ---------- Work list ----------
function initWork() {
  gsap.from(".js-work-list .work__item", {
    clipPath: "inset(0 100% 0 0)",
    duration: 0.9,
    ease: "power4.inOut",
    stagger: 0.09,
    scrollTrigger: { trigger: ".work__list", start: "top 80%" },
  });

  document.querySelectorAll(".work__link").forEach((link) => {
    const bg = link.querySelector(".work__bg");
    const title = link.querySelector(".work__title");
    let jitter;

    link.addEventListener("mouseenter", () => {
      // overwrite: a quick in/out must never leave the fill tween finishing last
      gsap.to(bg, { scaleX: 1, transformOrigin: "left center", duration: 0.5, ease: "power4.out", overwrite: true });
      if (jitter) jitter.kill();
      jitter = misregister(title);
    });
    link.addEventListener("mouseleave", () => {
      gsap.to(bg, { scaleX: 0, transformOrigin: "right center", duration: 0.45, ease: "power4.inOut", overwrite: true });
      if (jitter) jitter.kill();
      jitter = null;
      gsap.set(title, { "--gx1": "0px", "--gy1": "0px", "--gx2": "0px", "--gy2": "0px" });
    });
  });
}

// ---------- About ----------
function initAbout() {
  const words = splitWords(document.querySelector(".about__lead"));
  gsap.from(words, {
    opacity: 0,
    yPercent: 40,
    duration: 0.5,
    ease: "power3.out",
    stagger: 0.03,
    scrollTrigger: { trigger: ".about__lead", start: "top 80%" },
  });

  gsap.to(".hl", {
    backgroundSize: "100% 80%",
    duration: 0.9,
    ease: "power2.inOut",
    scrollTrigger: { trigger: ".about__lead", start: "top 55%" },
  });

  gsap.from(".about__cols p, .about__facts > div", {
    y: 24,
    opacity: 0,
    duration: 0.6,
    ease: "power3.out",
    stagger: 0.06,
    scrollTrigger: { trigger: ".about__cols", start: "top 85%" },
  });
}

// ---------- Capabilities ----------
function initCaps() {
  const cards = gsap.utils.toArray(".cap");
  cards.forEach((c) => gsap.set(c, { rotation: Number(c.dataset.rot) }));

  // cards get slapped onto the wall one by one
  gsap.from(cards, {
    y: 140,
    autoAlpha: 0,
    rotation: () => gsap.utils.random(-14, 14),
    duration: 1,
    ease: "power4.out",
    stagger: 0.15,
    scrollTrigger: { trigger: ".caps__grid", start: "top 80%" },
  });
  gsap.from(".cap__tape", {
    scaleX: 0,
    transformOrigin: "left center",
    duration: 0.5,
    ease: "power4.out",
    stagger: 0.15,
    delay: 0.5,
    scrollTrigger: { trigger: ".caps__grid", start: "top 80%" },
  });

  // DEV: the terminal types itself out line by line
  const lines = gsap.utils.toArray(".cap__items--term li");
  gsap.set(lines, { autoAlpha: 0 });
  const term = gsap.timeline({ delay: 0.5, scrollTrigger: { trigger: ".cap--dev", start: "top 75%" } });
  lines.forEach((line) => {
    const t = line.querySelector(".term-t");
    term.set(line, { autoAlpha: 1 });
    if (t) term.add(scramble(t, Math.max(0.15, t.textContent.length * 0.025)), ">");
  });

  // DESIGN: swatches pop like stickers, names slide in
  gsap.from(".cap--design .dot", {
    scale: 0,
    rotation: -90,
    duration: 0.5,
    ease: "back.out(2.5)",
    stagger: 0.05,
    delay: 0.6,
    scrollTrigger: { trigger: ".cap--design", start: "top 75%" },
  });
  gsap.from(".cap__items--swatch li", {
    x: -16,
    autoAlpha: 0,
    duration: 0.4,
    ease: "power3.out",
    stagger: 0.05,
    delay: 0.6,
    scrollTrigger: { trigger: ".cap--design", start: "top 75%" },
  });

  // ...and every so often a few of them glitch (pink/mint misregistration), like the name
  const dots = gsap.utils.toArray(".cap--design .dot");
  const glitchDots = (targets) =>
    gsap.timeline()
      .to(targets, {
        x: () => gsap.utils.random(-6, 6),
        boxShadow: () => `${gsap.utils.random(-5, 5)}px ${gsap.utils.random(-3, 3)}px 0 #ff6cc9, ${gsap.utils.random(-5, 5)}px ${gsap.utils.random(-3, 3)}px 0 #69ede2`,
        duration: 0.06,
        ease: "steps(1)",
        repeat: gsap.utils.random(3, 6, 1),
        repeatRefresh: true,
      })
      .set(targets, { x: 0, boxShadow: "0px 0px 0 rgba(0,0,0,0), 0px 0px 0 rgba(0,0,0,0)" });
  const burst = () => {
    glitchDots(gsap.utils.shuffle([...dots]).slice(0, gsap.utils.random(2, 4, 1)));
    gsap.delayedCall(gsap.utils.random(1.5, 3.5), burst);
  };
  ScrollTrigger.create({ trigger: ".cap--design", start: "top 75%", once: true, onEnter: () => gsap.delayedCall(1.5, burst) });
  document.querySelectorAll(".cap__items--swatch li").forEach((li) => {
    li.addEventListener("mouseenter", () => glitchDots(li.querySelector(".dot")));
  });

  // UX: steps come in order while the connector line draws down
  gsap.from(".cap__items--flow li", {
    x: -16,
    autoAlpha: 0,
    duration: 0.4,
    ease: "power3.out",
    stagger: 0.08,
    delay: 0.6,
    scrollTrigger: { trigger: ".cap--ux", start: "top 75%" },
  });
  gsap.fromTo(".cap__items--flow", { "--line": 0 }, {
    "--line": 1,
    duration: 1,
    ease: "power2.inOut",
    delay: 0.6,
    scrollTrigger: { trigger: ".cap--ux", start: "top 75%" },
  });

  // hover: card straightens and lifts, its tape misaligns
  if (isTouch) return;
  cards.forEach((card) => {
    const tape = card.querySelector(".cap__tape");
    card.addEventListener("mouseenter", () => {
      gsap.to(card, { rotation: 0, y: -10, duration: 0.4, ease: "power3.out", overwrite: "auto" });
      gsap.to(tape, { x: gsap.utils.random(-14, 14), rotation: gsap.utils.random(-6, 6), duration: 0.3, ease: "steps(3)" });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { rotation: Number(card.dataset.rot), y: 0, duration: 0.8, ease: "elastic.out(1, 0.5)", overwrite: "auto" });
      gsap.to(tape, { x: 0, rotation: 0, duration: 0.4, ease: "power3.out" });
    });
  });
}

// ---------- Contact ----------
function initContact() {
  const btn = document.querySelector(".js-magnetic");
  const face = btn.querySelector(".contact__btn-face");
  const inner = btn.querySelector(".js-magnetic-inner");

  const tl = gsap.timeline({ scrollTrigger: { trigger: ".contact", start: "top 60%" } });
  tl.from(face, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "power4.inOut" })
    .from(".contact__btn-shadow", { opacity: 0, duration: 0.4, ease: "steps(4)" }, "-=0.3")
    .from(".contact__socials li", { y: 20, opacity: 0, stagger: 0.06, duration: 0.4 }, "-=0.3");

  if (isTouch) return;

  btn.addEventListener("mousemove", (e) => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    gsap.to(btn, { x: x * 0.12, y: y * 0.18, rotate: x * 0.008, duration: 0.6, ease: "power3" });
    gsap.to(inner, { x: x * 0.06, y: y * 0.08, duration: 0.6, ease: "power3" });
  });
  btn.addEventListener("mouseenter", () => {
    gsap.fromTo(inner, { opacity: 0.2 }, { opacity: 1, duration: 0.25, ease: "steps(3)" });
  });
  btn.addEventListener("mouseleave", () => {
    gsap.to([btn, inner], { x: 0, y: 0, rotate: 0, duration: 1, ease: "elastic.out(1, 0.4)" });
  });
}

renderWorkList();
fillClippings();
const nameChars = buildName();
document.fonts.ready.then(placeBgType);
window.addEventListener("resize", placeBgType);
const intro = prefersReducedMotion ? null : heroIntro(nameChars);

// textures for the clippings / project list, then play the poster intro
Promise.all([texturesReady, applyTextures(document.querySelector(".poster")), applyTextures(document.querySelector(".work"))])
  .then(() => intro && intro.play());

initWork();
initPersonal();
if (!prefersReducedMotion) {
  initHeroDepth();
  floatBgWords();
  glitchName(nameChars);
  glitchPortrait();
  initFacePop();
  initSway();
  initTitles();
  initPrintReveals();
  initAbout();
  initCaps();
  initContact();
}
