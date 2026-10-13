// Project detail page - renders a project from ?p=<slug>.
// Optional sections (concept, gallery, question, team, process, reflection)
// only appear when the project in projects.js has them.

const pad = (n) => String(n).padStart(2, "0");

function figmaEmbedUrl(url) {
  return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
}

function renderMedia(p, index) {
  const { media } = p;
  if (media.type === "figma" && media.url) {
    return `<iframe src="${figmaEmbedUrl(media.url)}" allowfullscreen loading="lazy" title="${p.title} - Figma"></iframe>`;
  }
  if (media.type === "video" && media.src) {
    return `<video src="${media.src}" ${media.poster ? `poster="${media.poster}"` : ""} controls playsinline preload="metadata"></video>`;
  }

  // Placeholder until the real Figma link / mp4 is added in projects.js
  const isVideo = media.type === "video";
  return `
    <div class="ph" data-seed="${index * 13 + 7}"><span class="ph__label">${isVideo ? "VIDEO_PLACEHOLDER.MP4" : "FIGMA_EMBED_PLACEHOLDER.FIG"}</span></div>
    ${isVideo ? '<div class="media-frame__play"><span>▶ Play</span></div>' : ""}
    <span class="label label--white media-frame__note">${isVideo ? "Add media.src in projects.js" : "Add media.url in projects.js"}</span>`;
}

const sectionLabel = (text) => `<span class="label label--black p-label js-scramble">(${text})</span>`;

function renderConcept(p) {
  if (!p.concept) return "";
  const { headline, points } = p.concept;
  return `
    <section class="p-section p-concept">
      ${sectionLabel("The concept")}
      <h2 class="p-concept__headline">
        ${headline.map((line, i) => `<span class="p-concept__line ${i % 2 ? "is-alt" : ""}" data-tear>${line}</span>`).join("")}
      </h2>
      <div class="p-points">
        ${points
          .map(
            (pt, i) => `
          <article class="p-point">
            <span class="p-point__num">${pad(i + 1)}</span>
            <h3 class="p-point__title">${pt.title}</h3>
            <p class="small">${pt.text}</p>
          </article>`
          )
          .join("")}
      </div>
    </section>`;
}

function renderGallery(p, index) {
  // only real images / videos are shown; caption-only entries (no file yet) are skipped
  const captions = (p.gallery || []).filter((item) => typeof item !== "string");
  if (!captions.length) return "";
  return `
    <section class="p-section p-gallery">
      ${captions
        .map((item, i) => {
          // a gallery item is either a caption (placeholder) or { src, caption }
          const { src, video, caption, wide, color, note } = typeof item === "string" ? { caption: item } : item;
          const content = video
            ? `<video class="p-shot__video" src="${video}" autoplay muted loop playsinline aria-label="${caption}"></video>`
            : src
            ? `<img src="${src}" alt="${caption}" loading="lazy">`
            : `<span class="ph__label">IMG_${pad(i + 1)}</span>`;
          return `
        <figure class="p-shot ${wide ? "p-shot--wide" : ""} ${color ? "p-shot--color" : ""}">
          <div class="ph js-paste" data-seed="${index * 13 + 21 + i * 11}">
            ${content}
          </div>
          <figcaption class="label label--white p-shot__cap">${caption}</figcaption>
          ${note ? `
          <div class="p-note" style="left:${note.x}%; top:${note.y}%" aria-hidden="true">
            <div class="p-note__float">
              <span class="p-note__text">${note.text}</span>
              <svg class="p-note__arrow" viewBox="0 0 120 120"><path d="M96 8 C 112 44, 86 70, 30 92" /><path d="M48 76 L 28 93 L 52 104" /></svg>
            </div>
          </div>` : ""}
        </figure>`;
        })
        .join("")}
      <span class="block js-block p-gallery__block" style="background-color:${ACCENTS[p.color]}"></span>
    </section>`;
}

function renderQuestion(p) {
  if (!p.question) return "";
  return `
    <section class="p-section p-question">
      ${sectionLabel("The question")}
      <blockquote class="p-question__text js-words" data-tear>${p.question}</blockquote>
    </section>`;
}

function renderTeam(p) {
  if (!p.team) return "";
  return `
    <section class="p-section p-team">
      ${sectionLabel("The team")}
      <ul class="p-team__list">
        ${p.team
          .map(
            (m) => `
          <li class="p-team__row ${m.me ? "is-me" : ""}">
            <span class="p-team__name">${m.name}</span>
            <span class="p-team__role small">${m.role}</span>
            ${m.me ? '<span class="label label--black p-team__me">← me</span>' : ""}
          </li>`
          )
          .join("")}
      </ul>
    </section>`;
}

function renderProcess(p) {
  if (!p.process) return "";
  return `
    <section class="p-section p-process">
      ${sectionLabel("The process")}
      <ol class="p-weeks">
        ${p.process
          .map(
            (w, i) => `
          <li class="p-week">
            <div class="p-week__num"><span class="small">Week</span>${pad(i + 1)}</div>
            <div class="p-week__body">
              <h3 class="p-week__title">${w.title}</h3>
              <p class="small">${w.text}</p>
              ${w.tags ? `<ul class="p-week__tags">${w.tags.map((t) => `<li class="label label--${p.color}">${t}</li>`).join("")}</ul>` : ""}
            </div>
          </li>`
          )
          .join("")}
      </ol>
    </section>`;
}

function renderReflection(p) {
  if (!p.challenge && !p.learned) return "";
  return `
    <section class="p-section p-reflect">
      ${p.challenge ? `<div class="p-reflect__col">${sectionLabel("Biggest challenge")}<p>${p.challenge}</p></div>` : ""}
      ${p.learned ? `<div class="p-reflect__col">${sectionLabel("What I learned")}<p>${p.learned}</p></div>` : ""}
    </section>`;
}

function renderCase(p, index, accent, isVideo) {
  return `
    <section class="project__media ${p.media.size === "small" ? "project__media--small" : ""}">
      <div class="media-frame">
        ${renderMedia(p, index)}
        <span class="block media-frame__block js-block" style="background-color:${accent}"></span>
        <span class="label label--black label--lg media-frame__badge">${isVideo ? "▶ MP4" : "✦ Figma"}</span>
      </div>
      ${p.media.caption ? `<p class="label label--white media-frame__caption">${p.media.caption}</p>` : ""}
    </section>

    <section class="project__content">
      <div>
        ${sectionLabel("Overview")}
        <p class="project__intro">${p.intro}</p>
      </div>
      <div class="project__body small">${p.body.map((t) => `<p>${t}</p>`).join("")}</div>
    </section>

    ${renderConcept(p)}
    ${renderGallery(p, index)}
    ${renderQuestion(p)}
    ${renderTeam(p)}
    ${renderProcess(p)}
    ${renderReflection(p)}`;
}

// placeholder page for projects that aren't written up yet
function renderSoon(p) {
  return `
    <section class="p-section p-soon">
      <div class="ink p-soon__ink js-ink" data-seed="${p.slug.length * 7}"></div>
      ${sectionLabel("Work in progress")}
      <p class="p-soon__text" style="--accent:${ACCENTS[p.color]}">
        <span class="p-soon__line">Will update soon,</span>
        <span class="p-soon__line p-soon__line--alt">stay tuned!</span>
      </p>
    </section>`;
}

function renderProject() {
  const slug = new URLSearchParams(location.search).get("p");
  const p = PROJECTS.find((x) => x.slug === slug) || WORK[0];
  // numbering and "next project" stay inside the project's own group
  const group = p.personal ? PERSONAL : WORK;
  const index = group.indexOf(p);
  const next = group[(index + 1) % group.length];
  const accent = ACCENTS[p.color];
  const isVideo = p.media && p.media.type === "video";

  document.title = `${p.title} - Alexander Jonckheere`;

  const meta = [
    ["Year", p.year],
    ["Discipline", p.discipline],
    ["Role", p.role],
    ["Context", p.context],
  ].filter(([, v]) => v);

  document.querySelector(".js-project").innerHTML = `
    <section class="project__hero">
      <div class="ink project__hero-ink js-ink" data-seed="${index * 3 + 40}"></div>
      <div class="project__kicker">
        <span class="label label--black js-scramble">${p.personal ? "Personal" : "Project"} ${pad(index + 1)} / ${pad(group.length)}</span>
        ${p.tags.map((t) => `<span class="label label--${p.color}">${t}</span>`).join("")}
      </div>
      <h1 class="project__title js-title">${p.title}</h1>
      <dl class="project__meta small">
        ${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}
      </dl>
    </section>

    ${p.comingSoon ? renderSoon(p) : renderCase(p, index, accent, isVideo)}

    <a class="next" href="project.html?p=${next.slug}" data-cursor="next project" style="--accent:${ACCENTS[next.color]}">
      <span class="work__bg"></span>
      <span class="label label--black">Next project →</span>
      <p class="next__title">${next.title}</p>
    </a>`;
}

function animateProject() {
  const chars = splitChars(document.querySelector(".js-title"));
  gsap.set(chars, { opacity: 0 });

  const tl = gsap.timeline();
  tl.add(transitionIn())
    .to(chars, { opacity: 1, duration: 0.05, ease: "steps(1)", stagger: { each: 0.04, from: "random" } }, "-=0.5")
    .add(() => scramble(document.querySelector(".project__kicker .js-scramble")), "<")
    .from(".project__kicker .label:not(.js-scramble), .project__meta > div", { opacity: 0, y: 14, stagger: 0.06, duration: 0.4 }, "<")
    .from(".project__hero-ink", { scale: 0.4, opacity: 0, duration: 0.5, ease: "expo.out" }, "-=0.4");

  if (document.querySelector(".media-frame")) {
    tl.from(".media-frame", { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "power3.inOut" }, "-=0.4")
      .from(".media-frame__block", { scaleX: 0, transformOrigin: "left center", duration: 0.6, ease: "power4.out" }, "-=0.3")
      .from(".media-frame__badge", { scale: 0, rotate: -30, duration: 0.5, ease: "back.out(2.5)" }, "-=0.4");
  }

  // coming soon: strips paste on, then the text floats and glitches now and then
  const soon = document.querySelector(".p-soon__text");
  if (soon) {
    const lines = soon.querySelectorAll(".p-soon__line");
    tl.from(lines, { xPercent: (i) => (i ? 30 : -30), rotation: (i) => (i ? 6 : -6), autoAlpha: 0, duration: 0.8, ease: "power4.out", stagger: 0.15 }, "-=0.2")
      .from(".p-soon__ink", { scale: 0.4, autoAlpha: 0, duration: 0.5, ease: "expo.out" }, "<");
    gsap.to(soon, { y: -8, rotation: 0.8, duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    const r = gsap.utils.random;
    const burst = () => {
      gsap.timeline({ onComplete: () => gsap.delayedCall(r(1.5, 3.5), burst) })
        .to(lines, {
          x: () => r(-10, 10),
          textShadow: () => `${r(-8, 8)}px ${r(-3, 3)}px #ff6cc9, ${r(-8, 8)}px ${r(-3, 3)}px #69ede2`,
          duration: 0.06,
          ease: "steps(1)",
          repeat: r(3, 6, 1),
          repeatRefresh: true,
        })
        .set(lines, { x: 0, textShadow: "0px 0px 0px rgba(0,0,0,0), 0px 0px 0px rgba(0,0,0,0)" });
    };
    gsap.delayedCall(2, burst);
  }

  // section labels scramble in
  gsap.utils.toArray(".p-label").forEach((el) => {
    if (el.closest(".project__hero")) return;
    ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => scramble(el, 0.6) });
  });

  gsap.from(".project__intro, .project__body p", {
    y: 30,
    opacity: 0,
    duration: 0.7,
    ease: "power3.out",
    stagger: 0.1,
    scrollTrigger: { trigger: ".project__content", start: "top 80%" },
  });

  // concept: headline strips paste on from opposite sides, then the three points
  gsap.utils.toArray(".p-concept__line").forEach((line, i) => {
    gsap.from(line, {
      xPercent: i % 2 ? 40 : -40,
      rotation: i % 2 ? 6 : -6,
      autoAlpha: 0,
      duration: 0.9,
      ease: "power4.out",
      scrollTrigger: { trigger: ".p-concept__headline", start: "top 80%" },
      delay: i * 0.15,
    });
  });
  gsap.from(".p-point", {
    y: 80,
    autoAlpha: 0,
    rotation: () => gsap.utils.random(-8, 8),
    duration: 0.9,
    ease: "power4.out",
    stagger: 0.12,
    scrollTrigger: { trigger: ".p-points", start: "top 85%" },
  });

  // gallery: shots scan in, captions stamp on, slight parallax
  gsap.utils.toArray(".p-shot").forEach((shot, i) => {
    gsap.from(shot.querySelector(".ph"), {
      clipPath: "inset(0 0 100% 0)",
      duration: 1.1,
      ease: "power4.inOut",
      scrollTrigger: { trigger: shot, start: "top 88%" },
    });
    gsap.from(shot.querySelector(".p-shot__cap"), {
      scale: 0,
      rotation: -12,
      duration: 0.5,
      ease: "back.out(2.5)",
      delay: 0.6,
      scrollTrigger: { trigger: shot, start: "top 88%" },
    });
    gsap.to(shot, {
      yPercent: i % 2 ? -10 : -4,
      ease: "none",
      scrollTrigger: { trigger: shot, start: "top bottom", end: "bottom top", scrub: true },
    });
  });
  gsap.from(".p-gallery__block", {
    scaleX: 0,
    transformOrigin: "left center",
    duration: 0.9,
    ease: "power4.inOut",
    scrollTrigger: { trigger: ".p-gallery", start: "top 70%" },
  });

  // gallery notes ("ME!"): float gently and glitch now and then
  gsap.utils.toArray(".p-note").forEach((note) => {
    const text = note.querySelector(".p-note__text");
    // pop-in on the wrapper, endless float on the inner element, so the two never fight
    gsap.from(note, { scale: 0, rotation: -40, duration: 0.6, ease: "back.out(2.5)", delay: 0.8, scrollTrigger: { trigger: note, start: "top 85%" } });
    gsap.to(note.querySelector(".p-note__float"), { y: -10, rotation: 3, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
    const r = gsap.utils.random;
    const burst = () => {
      gsap.timeline({ onComplete: () => gsap.delayedCall(r(1.2, 3), burst) })
        .to(text, {
          x: () => r(-6, 6),
          textShadow: () => `${r(-6, 6)}px ${r(-3, 3)}px #ff6cc9, ${r(-6, 6)}px ${r(-3, 3)}px #69ede2`,
          duration: 0.06,
          ease: "steps(1)",
          repeat: r(3, 6, 1),
          repeatRefresh: true,
        })
        .set(text, { x: 0, textShadow: "0px 0px 0px rgba(0,0,0,0), 0px 0px 0px rgba(0,0,0,0)" });
    };
    gsap.delayedCall(1.5, burst);
  });

  // question: word by word
  const q = document.querySelector(".p-question__text");
  if (q) {
    gsap.from(splitWords(q), {
      autoAlpha: 0,
      yPercent: 50,
      duration: 0.5,
      ease: "power3.out",
      stagger: 0.04,
      scrollTrigger: { trigger: q, start: "top 80%" },
    });
  }

  // team rows slide in, my row last with a little jolt
  gsap.from(".p-team__row", {
    xPercent: -6,
    autoAlpha: 0,
    duration: 0.6,
    ease: "power3.out",
    stagger: 0.08,
    scrollTrigger: { trigger: ".p-team__list", start: "top 85%" },
  });

  // process: each week slides in, the big number flickers on
  gsap.utils.toArray(".p-week").forEach((week) => {
    const st = { trigger: week, start: "top 85%" };
    gsap.from(week.querySelector(".p-week__body"), { x: 40, autoAlpha: 0, duration: 0.7, ease: "power3.out", scrollTrigger: st });
    gsap.from(week.querySelector(".p-week__num"), { autoAlpha: 0, duration: 0.3, ease: "steps(4)", scrollTrigger: st });
    gsap.from(week.querySelectorAll(".p-week__tags li"), {
      scale: 0,
      rotation: () => gsap.utils.random(-25, 25),
      duration: 0.4,
      ease: "back.out(3)",
      stagger: 0.05,
      delay: 0.3,
      scrollTrigger: st,
    });
  });

  gsap.from(".p-reflect__col", {
    y: 40,
    autoAlpha: 0,
    duration: 0.7,
    ease: "power3.out",
    stagger: 0.12,
    scrollTrigger: { trigger: ".p-reflect", start: "top 85%" },
  });

  // next project: colour wipes in as you scroll to it
  gsap.to(".next .work__bg", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { trigger: ".next", start: "top bottom", end: "bottom bottom", scrub: true },
  });
  gsap.from(".next__title", {
    xPercent: 30,
    ease: "none",
    scrollTrigger: { trigger: ".next", start: "top bottom", end: "bottom bottom", scrub: true },
  });
}

renderProject();
applyTextures(document.querySelector(".js-project"));
if (prefersReducedMotion) {
  gsap.set(".transition", { clipPath: "inset(0 0 100% 0)" });
} else {
  animateProject();
}
