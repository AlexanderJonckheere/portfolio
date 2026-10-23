// Interactive 3D viewer (three.js) for project media of type "model".
// Loads a GLB exported from Blender, plays its animations, puts the sticker
// videos back on their materials and lets visitors drag to look around.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const DRACO_PATH = "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/";

function initViewer(el) {
  const status = el.querySelector(".js-model-status");
  // print grit behind the (transparent) canvas, same speckle as the rest of the site
  const grit = document.createElement("span");
  grit.className = "model-view__grit";
  el.prepend(grit);
  if (window.setTexture) window.setTexture(grit, "speckle", 7);
  const videos = JSON.parse(el.dataset.videos || "{}");

  // ---------- renderer / scene ----------
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) {
    status.textContent = "3D isn't supported in this browser";
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap; // soft, blurred shadows like big area lights
  el.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  // a strong soft environment stands in for Cycles' bounced light
  scene.environmentIntensity = 0.8;

  // the four area lights from the .blend (Blender Z-up -> three.js Y-up: x, z, -y),
  // as soft directional lights; only the main one casts a (blurred) shadow
  const key = new THREE.DirectionalLight(0xffe9d2, 1.9); // "Area"
  key.position.set(-0.07, 6.44, -4.8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 14;
  key.shadow.blurSamples = 20;
  key.shadow.bias = -0.0006;
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 8, bottom: -4, near: 0.5, far: 30 });
  scene.add(key);
  const key2 = new THREE.DirectionalLight(0xfff0e0, 1.5); // "Area.001"
  key2.position.set(3.2, 6.05, 3.85);
  scene.add(key2);
  const top = new THREE.DirectionalLight(0xffffff, 0.35); // "Area.002"
  top.position.set(0.2, 9, 0.6);
  scene.add(top);
  const fill = new THREE.DirectionalLight(0xdbebff, 0.6); // "Area.003", cool fill
  fill.position.set(-5.58, 4.2, 3.89);
  scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xfff3e6, 0x8f6f5c, 0.6));

  const camera = new THREE.PerspectiveCamera(23, 16 / 9, 0.1, 200);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false; // keep the page scroll working over the canvas
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.6;
  controls.minPolarAngle = 0.2;
  controls.maxPolarAngle = Math.PI / 2 - 0.02;
  controls.addEventListener("start", () => {
    controls.autoRotate = false;
    el.classList.add("is-touched");
  });

  // ---------- load ----------
  const draco = new DRACOLoader().setDecoderPath(DRACO_PATH);
  const loader = new GLTFLoader().setDRACOLoader(draco);
  let mixer = null;
  let limits = null;
  let dragging = false;
  const hideWhenStill = []; // objects that only show while they move (the falling can)
  controls.addEventListener("start", () => (dragging = true));
  controls.addEventListener("end", () => (dragging = false));

  // rubber-band limits: past a limit the view resists while dragging and glides back after
  const sphNow = new THREE.Spherical();
  const softLimit = () => {
    if (!limits) return;
    const off = camera.position.clone().sub(controls.target);
    sphNow.setFromVector3(off);
    const pull = dragging ? 0.2 : 0.1; // share of the overshoot removed per frame
    let changed = false;
    for (const key of ["theta", "phi"]) {
      const [lo, hi] = limits[key];
      const v = sphNow[key];
      const clamped = Math.min(hi, Math.max(lo, v));
      if (v !== clamped) {
        sphNow[key] = THREE.MathUtils.lerp(v, clamped, pull);
        changed = true;
      }
    }
    if (changed) {
      camera.position.copy(controls.target).add(off.setFromSpherical(sphNow));
      camera.lookAt(controls.target);
    }
  };
  const clock = new THREE.Clock();

  loader.load(
    el.dataset.src,
    (gltf) => {
      const model = gltf.scene;
      model.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = true;
        o.receiveShadow = true;
        // the bricks were simplified for the web; at full strength their normal maps
        // read much harsher than in the Cycles render, so tone them down
        const matName = (o.material && o.material.name || "").toLowerCase();
        if (o.material && o.material.normalMap && /brick|concrete/.test(matName)) {
          o.material.normalScale.multiplyScalar(0.38);
        }
        // sticker materials: play the original videos on them
        const src = videos[o.material && o.material.name];
        if (src) {
          const video = Object.assign(document.createElement("video"), { src, muted: true, loop: true, playsInline: true, autoplay: true, crossOrigin: "anonymous" });
          video.play().catch(() => {});
          const tex = new THREE.VideoTexture(video);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.flipY = false;
          o.material = o.material.clone();
          o.material.map = tex;
          o.material.needsUpdate = true;
        }
      });
      scene.add(model);

      // frame the scene without objects that animate in from far away (data-fit-ignore)
      const norm = (n) => n.toLowerCase().replace(/[^a-z0-9]/g, "");
      const ignore = (el.dataset.fitIgnore || "").split(",").filter(Boolean).map(norm);
      const box = new THREE.Box3();
      model.updateWorldMatrix(true, true);
      model.traverse((o) => {
        if (!o.isMesh) return;
        let p = o, skip = false;
        while (p) { if (ignore.includes(norm(p.name))) skip = true; p = p.parent; }
        if (!skip) box.expandByObject(o);
      });
      const center = box.getCenter(new THREE.Vector3());
      // those same objects only show while they're moving: in Blender they sit
      // outside the camera before and after their animation
      model.traverse((o) => {
        if (ignore.includes(norm(o.name))) hideWhenStill.push({ o, last: o.getWorldPosition(new THREE.Vector3()), still: 0 });
      });

      const blendCam = gltf.cameras[0];
      if (blendCam) {
        // use the Blender camera exactly (position, angle, lens), so the crop matches the render;
        // orbit around a point straight ahead of it, as deep as the middle of the scene
        blendCam.updateWorldMatrix(true, false);
        camera.position.setFromMatrixPosition(blendCam.matrixWorld);
        camera.fov = blendCam.fov;
        const forward = new THREE.Vector3(0, 0, -1).transformDirection(blendCam.matrixWorld);
        const depth = center.clone().sub(camera.position).dot(forward);
        controls.target.copy(camera.position).addScaledVector(forward, depth);
        // stay close to that view: a little look-around, no auto spin.
        // The limits are soft (see softLimit below), so the camera eases back instead of stopping dead.
        controls.autoRotate = false;
        const offset = camera.position.clone().sub(controls.target);
        const sph = new THREE.Spherical().setFromVector3(offset);
        limits = {
          theta: [sph.theta - 0.6, sph.theta + 0.6],
          phi: [Math.max(0.2, sph.phi - 0.35), Math.min(Math.PI / 2 - 0.02, sph.phi + 0.2)],
        };
        controls.minPolarAngle = 0.05;
        controls.maxPolarAngle = Math.PI / 2;
        controls.minDistance = controls.maxDistance = offset.length();
      } else {
        controls.target.copy(center);
        camera.position.copy(center).add(new THREE.Vector3(-12, 3, -4));
        controls.minDistance = controls.maxDistance = camera.position.distanceTo(center);
      }
      camera.updateProjectionMatrix();
      controls.update();

      if (gltf.animations.length) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
        el.mixer = mixer; // handy for debugging: document.querySelector(".js-model").mixer.setTime(t)
      }

      el.camera = camera; // debugging handle
      el.classList.add("is-loaded");
      status.textContent = "Drag to look around";
    },
    (e) => {
      if (e.total) status.textContent = `Loading 3D ${Math.round((e.loaded / e.total) * 100)}%`;
    },
    () => {
      status.textContent = "Couldn't load the 3D scene";
    }
  );

  // ---------- size / render loop ----------
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = el;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(el);
  resize();

  let visible = true;
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(el);

  renderer.setAnimationLoop(() => {
    const dt = clock.getDelta();
    if (!visible) return;
    if (mixer) mixer.update(dt);
    for (const h of hideWhenStill) {
      const pos = h.o.getWorldPosition(new THREE.Vector3());
      h.still = pos.distanceToSquared(h.last) < 1e-8 ? h.still + dt : 0;
      h.o.visible = h.still < 0.1;
      h.last.copy(pos);
    }
    controls.update();
    softLimit();
    renderer.render(scene, camera);
  });
}

document.querySelectorAll(".js-model").forEach(initViewer);
