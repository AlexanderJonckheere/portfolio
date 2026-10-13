// Loading screen: "LOADING" in the same gritty type as my name, sitting on a
// clean sheet of paper. As the page loads, more and more grit (speckle, ink,
// photocopy scraps, scan streaks) gets printed onto the background. At 100%
// the word jumps to "READY" and the sheet slides away into the hero intro.
// Shown once per browser session (coming back from a project page skips it).

function runLoader(tasks) {
  const screen = document.querySelector(".loader");
  if (!screen) return Promise.resolve();

  let seen = false;
  try { seen = sessionStorage.getItem("aj-entered") === "1"; } catch (e) {}
  if (seen || prefersReducedMotion) {
    screen.remove();
    return Promise.resolve();
  }

  document.body.classList.add("is-loading");
  const r = gsap.utils.random;
  const grit = screen.querySelector(".loader__grit");
  const word = screen.querySelector(".loader__word");
  const pct = screen.querySelector(".js-loader-pct");
  setMask(word, "distress", 4);

  // ---------- the grit layers, each printed on at its own progress point ----------
  const layers = [];
  const add = (kind, css, seed) => {
    const el = document.createElement("span");
    el.className = `grit grit--${kind}`;
    Object.assign(el.style, css);
    grit.appendChild(el);
    if (kind === "speckle") setTexture(el, "speckle", seed);
    if (kind === "ink") setTexture(el, "splat", seed);
    if (kind === "scrap") { setTexture(el, "xerox", seed); tear(el, 6, 10); }
    if (kind === "block") tear(el, 5, 10);
    layers.push(el);
  };

  // all-over speckle that gets denser in steps
  for (let i = 0; i < 3; i++) add("speckle", { backgroundSize: `${220 + i * 90}px`, opacity: 0.12 + i * 0.05 }, i + 2);
  // pink and mint print blocks, like the hero collage
  for (let i = 0; i < 4; i++) {
    add("block", { left: `${r(0, 80)}%`, top: `${r(0, 85)}%`, width: `${r(10, 24)}%`, height: `${r(6, 14)}%` }, 0);
    layers[layers.length - 1].classList.add(i % 2 ? "is-mint" : "is-pink");
  }
  // photocopy scraps around the edges
  const spots = [[2, 6], [70, 4], [6, 62], [74, 60], [38, 74], [44, 2]];
  spots.forEach(([x, y], i) => add("scrap", { left: `${x}%`, top: `${y}%`, width: `${r(16, 26)}%`, height: `${r(18, 30)}%`, rotate: `${r(-6, 6)}deg` }, 30 + i * 7));
  // ink splats
  for (let i = 0; i < 6; i++) add("ink", { left: `${r(-5, 75)}%`, top: `${r(-5, 70)}%`, width: `${r(18, 34)}vw`, height: `${r(18, 34)}vw` }, 50 + i * 5);
  // scan streaks
  for (let i = 0; i < 5; i++) add("streak", { top: `${r(5, 95)}%`, height: `${r(2, 6)}px`, opacity: r(0.4, 0.9) }, 0);

  gsap.utils.shuffle(layers);
  gsap.set(layers, { autoAlpha: 0 });
  const thresholds = layers.map((_, i) => (i + 1) / (layers.length + 1));
  let shown = 0;

  // ---------- progress ----------
  // the counter follows the clock (so the build-up always reads as a sequence)
  // but never runs ahead of what has really loaded
  const progress = { v: 0 };
  let done = 0;
  tasks.forEach((t) => Promise.resolve(t).finally(() => done++));
  const render = () => {
    pct.textContent = String(Math.round(progress.v * 100)).padStart(3, "0");
    // print every layer whose threshold has been passed (with a little photocopier flicker)
    while (shown < layers.length && progress.v >= thresholds[shown]) {
      const el = layers[shown++];
      gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: "steps(3)" });
      if (!el.classList.contains("grit--speckle")) gsap.from(el, { scale: 1.15, duration: 0.3, ease: "power3.out" });
    }
  };
  const clock = { t: 0 };
  const ramp = gsap.to(clock, {
    t: 1,
    duration: 1.8,
    ease: "power1.inOut",
    onUpdate: () => {
      progress.v = Math.max(progress.v, Math.min(clock.t * 0.95, 0.2 + 0.8 * (done / tasks.length)));
      render();
    },
  });
  const minTime = new Promise((res) => setTimeout(res, 1800));

  return new Promise((resolve) => {
    Promise.all([Promise.allSettled(tasks), minTime]).then(() => {
      ramp.kill();
      gsap.to(progress, {
        v: 1,
        duration: 0.35,
        ease: "power2.out",
        onUpdate: render,
        onComplete: () => {
          try { sessionStorage.setItem("aj-entered", "1"); } catch (e) {}
          gsap.timeline({
            onComplete: () => {
              screen.remove();
              document.body.classList.remove("is-loading");
              resolve();
            },
          })
            // ...jump! LOADING -> READY
            .to(word, { yPercent: -35, scaleY: 1.15, duration: 0.18, ease: "power2.out" })
            .add(() => { word.textContent = "READY"; })
            .to(word, { yPercent: 0, scaleY: 1, duration: 0.45, ease: "bounce.out" })
            .to(word, {
              x: () => r(-12, 12),
              textShadow: () => `${r(-10, 10)}px 0 #ff6cc9, ${r(-10, 10)}px 0 #69ede2`,
              duration: 0.05,
              ease: "steps(1)",
              repeat: 5,
              repeatRefresh: true,
            }, "-=0.2")
            .set(word, { x: 0, textShadow: "none" })
            .to(".loader__meta", { autoAlpha: 0, duration: 0.2 }, "+=0.35")
            // the printed sheet slides up and out
            .to(screen, { clipPath: "inset(0 0 100% 0)", duration: 0.75, ease: "power4.inOut" });
        },
      });
    });
  });
}
