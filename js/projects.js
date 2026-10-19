// Project data. Every field below `intro` is optional: the project page only
// renders the sections a project actually has.
//
// personal: true    → listed under the "Personal projects" button instead of Selected Work
// wip: "text"       → adds a "…, stay tuned!" note at the bottom of a written-up page
// comingSoon: true  → detail page only shows a "will update soon" note (no media needed)
// finished: true    → shows a "Finished" tag in the list
//
// media.type: "figma" → media.url = Figma share link (file must be viewable by anyone with the link)
// media.type: "video" → media.src = "assets/videos/name.mp4", media.poster = still image (optional)
// gallery: a caption string (placeholder image), { src, caption } for an image,
//          or { video, caption } for a short clip that loops silently.
//          Extra flags: wide: true (half-width, uncropped), color: true (skip the black & white look),
//          note: { text, x, y } - floating arrow + glitchy label, x/y in % of the image (top-left of the label)
// media.type: "model" → media.src = "assets/models/name.glb" (three.js viewer), media.videos = { materialName: mp4 }
// media.size: "small" → shows the media narrower than the full page width (optional)
const PROJECTS = [
  {
    slug: "myst",
    title: "Myst",
    year: "2026",
    role: "Visual design, motion & installation",
    discipline: "Experience design · Installation · App",
    context: "Howest × Rotterdam - brief by Visit Antwerp",
    group: true,
    tags: ["Group project", "Installation", "App", "Motion"],
    color: "pink",
    media: { type: "video", src: "assets/videos/myst-promo.mp4", poster: "assets/images/myst-poster.jpg", caption: "Promo video - 0:20" },
    intro:
      "Visit Antwerp asked us to pull young travellers into the city's fashion scene without it ever feeling like an ad. Our answer: hide Antwerp's most personal stores in mist, and let people clear it themselves.",
    body: [
      "Six weeks, six students: four from Devine and two from CMD Rotterdam. Together with Luca Hauspie I was responsible for all of the visual design and motion, and we built the physical installation side by side.",
      "The result is MYST: a projection box in the city where you dress a mannequin in one of nine Antwerp styles, and an app that turns the city into a fog-covered map full of side quests.",
    ],
    concept: {
      headline: ["No plans.", "Side quests."],
      points: [
        {
          title: "The problem",
          text: "Young urban travellers (18–36) know Antwerp, but hardly ever plan a trip there. They hate planning and love stumbling onto things. So we hid the good stuff.",
        },
        {
          title: "The Myst box",
          text: "An installation built around Antwerp's fashion legacy, from the Antwerp Six to its independent boutiques. Pick a style on the iPad, watch the outfit get projected onto a mannequin, read its story and scan the QR code to the app.",
        },
        {
          title: "The app",
          text: "Antwerp, covered in fog that lifts as you explore. Pins uncover stores, ateliers, fashion history and workshops, and you share every find with your crew.",
        },
      ],
    },
    gallery: [
      { video: "assets/videos/myst-projection-test.mp4", caption: "Projection test, MadMapper maps the outfit onto the mannequin" },
      { src: "assets/images/myst-box-build.webp", caption: "The Myst Box, our installation ready to be mapped", note: { text: "ME!", x: 70, y: 13 } },
      { src: "assets/images/myst-progress-map.jpg", caption: "Progress, animating the map pins for the promo video in After Effects", wide: true, color: true },
      { src: "assets/images/myst-progress-iphone.jpg", caption: "Progress, setting up the 3D phone in After Effects", wide: true, color: true },
    ],
    question:
      "How do you build a digital experience that quietly tempts young people into Antwerp's fashion scene, without it feeling like advertising?",
    team: [
      { name: "Amber Vanhooren", role: "Experience design, development" },
      { name: "Luca Hauspie", role: "Visual design, motion, installation" },
      { name: "Alexander Jonckheere", role: "Visual design, motion, installation", me: true },
      { name: "Tjorven Florin", role: "Development" },
    ],
    process: [
      {
        title: "Research & concept",
        text: "We interviewed Gen Z in Rotterdam. Everyone knew Antwerp, almost nobody had planned a visit. The insight that stuck: they don't want to plan, they want side quests. That gave us our how-might-we question, four design principles and a first pitch: a map hidden under mist.",
        tags: ["Co-creation", "Free choice", "Unconscious discovery", "Personality"],
      },
      {
        title: "Refining & validating",
        text: "The identity grew out of Antwerp itself: the city's pixel-grid campaigns and the fashion festival's serif became a pixelated serif logo, with blur, grain and red accents on top. A survey, three personas and a user journey told us we were on the right track.",
        tags: ["Styleboards", "Survey", "Personas", "Hi-fi wireframes"],
      },
      {
        title: "Testing & prototyping",
        text: "Projector tests showed the box needed three closed sides and a plexiglass front. A small test site proved MadMapper could switch outfits straight from code. In the meantime we mapped out nine Antwerp fashion styles and kept iterating on the iPad screens; the dark, blue-tinted first version made way for a light one in black and red.",
        tags: ["Flowchart", "MadMapper", "9 fashion styles", "iPad iterations"],
      },
      {
        title: "Building the box",
        text: "We put together the box, the iPad stand and the mannequin, and wrapped it in white fabric for a bigger projection surface. Luca and I took on the installation: learning projection mapping in MadMapper, fitting every outfit to the mannequin and switching it the second someone taps the iPad.",
        tags: ["Physical build", "Projection mapping", "OSC + MadMapper", "Mobile design"],
      },
      {
        title: "Final design & development",
        text: "Luca and I finished every app screen, down to the custom icons and illustrations. The iPad got a loading screen and a QR code that drops visitors straight into the app, which the developers built in React Native with Supabase. We closed the week by cutting the promo video and the case movie.",
        tags: ["Final app", "iPad kiosk", "Case movie & promo"],
      },
      {
        title: "Expo",
        text: "We presented MYST in Kortrijk to our teachers and the client: the box, the iPad, the app and the pitch, all in black, white and red.",
        tags: ["Expo in Kortrijk"],
      },
    ],
    challenge: "Keeping communication tight across a team split between two cities and two schools.",
    learned: "UX/UI design for an app and a kiosk, testing early, projection mapping, and how much good teamwork depends on talking things through before you build them.",
  },
  {
    slug: "montana-cans",
    title: "Montana Cans",
    year: "2026",
    role: "3D modelling & animation",
    discipline: "3D · Motion",
    context: "Devine - year 3",
    tags: ["3D", "Blender", "Animation"],
    color: "pink",
    media: {
      type: "model",
      src: "assets/models/montana-cans.glb",
      // sticker materials in the .blend that play a video
      videos: { sticker_mp4: "assets/videos/montana-sticker.mp4", sticker2: "assets/videos/montana-sticker2.mp4" },
      // the can that drops in from the sky shouldn't count when framing the view
      fitIgnore: ["spray_can_1_bottom.002"],
      caption: "Interactive 3D - drag to look around",
    },
    intro:
      "A 3D hero scene for the website of Montana Cans.",
    body: [
      "For this assignment we had to choose a random brand we liked, and then make a 3D scene for the hero image of their website. I chose Montana Cans.",
      "After some trial and error I settled on this scene and composition. I experimented with hand-painted normal maps and some 2D animations on the stickers.",
    ],
  },
  {
    slug: "type01",
    title: "Type01",
    year: "2025",
    role: "UI design",
    discipline: "Web design · Responsive",
    context: "Devine - typography conference website",
    tags: ["Figma", "Web", "Typography"],
    color: "mint",
    media: {
      type: "figma",
      url: "https://www.figma.com/design/Z5wHzpx3tRheWy6rDAOx7m/Type01?node-id=314-7358",
      caption: "Figma file - desktop & mobile",
    },
    intro:
      "My first time designing for mobile: a website for Type01, a typography conference, on desktop and phone.",
    body: [
      "For this assignment we were tasked with designing for mobile for the first time, and it was heaps of fun. I really enjoyed it, and I learned a lot about scale, proportion, spacing and readability along the way.",
      "I like how it turned out. It still has a few flaws, but then again, what design is ever perfect? XD",
    ],
    gallery: ["Home page", "Friday & Saturday schedule", "Mobile versions"],
  },
  {
    slug: "kickstarter",
    title: "Kickstarter",
    year: "2025",
    role: "Motion design",
    discipline: "Motion design · Product promo",
    context: "Devine - Motion Design 2, Kickstarter assignment",
    tags: ["Motion", "Video", "Kickstarter"],
    color: "orange",
    media: { type: "video", src: "assets/videos/hengstermann-kickstarter.mp4", poster: "assets/images/hengstermann-poster.jpg", caption: "Kickstarter promo - 0:30", size: "small" },
    intro:
      "My very first motion project: a Kickstarter promo for Hengstermann Guitars and their hand-poured concrete electric guitar.",
    body: [
      "The assignment was simple on paper: find a Kickstarter campaign that grabs you and make a promo video for its product. I went for Hengstermann Guitars, because a guitar made of concrete is about as bold as a product gets.",
      "It was a challenging one. The deadline was tight and it was my first proper motion design project, but I pushed through and got it done, and it taught me a lot.",
    ],
  },
  // ---------- personal projects ----------
  {
    slug: "electric-guitar",
    title: "Electric Guitar",
    year: "WIP",
    discipline: "Woodworking · Electronics",
    context: "Personal project",
    personal: true,
    comingSoon: true,
    tags: ["Personal", "Woodworking", "Build"],
    color: "orange",
  },
  {
    slug: "metal-stiletto-nails",
    title: "Metal Stiletto Nails",
    year: "WIP",
    discipline: "Metalworking",
    context: "Personal project",
    personal: true,
    tags: ["Personal", "Metalworking"],
    color: "pink",
    intro: "The first 5 nails I made, cut out of aluminium.",
    body: [
      "These are the first 5 nails I made. I cut them out of aluminium. After designing and 3D printing a dapping punch, and 5 failed attempts, I got the hammering and shaping down.",
      "Then I started polishing and sanding, and cleaned up all edges and surfaces. Still to do: the 5 other nails.",
    ],
    gallery: [{ src: "assets/images/metal-nails-first-five.jpg", caption: "The first 5 nails, hammered, sanded and polished", color: true, wide: true },
      { src: "assets/images/metal-nails-hand.jpg", caption: "Trying them on a 3D printed hand", color: true, wide: true },
    ],
    // project is still going: closing note under the page
    wip: "5 more to go,",
  },
  {
    slug: "wooden-rings",
    title: "Wooden Rings",
    year: "WIP",
    discipline: "Woodworking",
    context: "Personal project",
    personal: true,
    comingSoon: true,
    tags: ["Personal", "Woodworking", "Jewellery"],
    color: "mint",
  },
];

// school work vs personal work, in the order they appear above
const WORK = PROJECTS.filter((p) => !p.personal);
const PERSONAL = PROJECTS.filter((p) => p.personal);
