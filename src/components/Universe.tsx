import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import * as THREE from "three";

export function Universe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ── Renderer ─────────────────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const W = canvas.clientWidth || canvas.offsetWidth || 900;
    const H = canvas.clientHeight || canvas.offsetHeight || 520;
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    /* ── Scene ───────────────────────────────────────────────────────────── */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f5fa); // clean ultra-light modern background
    scene.fog = new THREE.Fog(0xf0f5fa, 30, 80);

    /* ── Camera — Isometric angled ───────────────────────────────────────── */
    const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 200);
    camera.position.set(22, 18, 22);
    camera.lookAt(0, 0, 0);

    /* ── Lights ──────────────────────────────────────────────────────────── */
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb0c4de, 0.8));
    const sun = new THREE.DirectionalLight(0xffffff, 2.5);
    sun.position.set(-10, 25, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    sun.shadow.camera.far = 60;
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    const fillLight = new THREE.DirectionalLight(0xaaccff, 0.8);
    fillLight.position.set(15, 10, -15);
    scene.add(fillLight);

    /* ── Helpers & Materials ─────────────────────────────────────────────── */
    const mkMat = (col: number, rough = 0.2, metal = 0.1, emi = 0, eiI = 0) =>
      new THREE.MeshStandardMaterial({
        color: col,
        roughness: rough,
        metalness: metal,
        emissive: emi,
        emissiveIntensity: eiI,
      });

    const mkGlass = (col: number, op = 0.8) =>
      new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: op,
        envMapIntensity: 1.0,
      });

    const s = (m: THREE.Mesh) => {
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    };

    const bx = (w: number, h: number, d: number, mat: THREE.Material) => s(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat));
    const cy = (rT: number, rB: number, h: number, sg: number, mat: THREE.Material) => s(new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, h, sg), mat));
    const sp = (r: number, mat: THREE.Material) => s(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), mat));

    /* ── Palette ─────────────────────────────────────────────────────────── */
    const BASE_MAT = mkMat(0xffffff, 0.8, 0.1); // Sleek white concrete
    const DARK_MAT = mkMat(0x1a1f2b, 0.6, 0.4); // Dark accents
    const PATH_MAT = mkMat(0xe2e8f0, 0.5, 0.1); // Light grey paths
    const GLOW_BLUE = mkMat(0x00aaff, 0.2, 0.1, 0x00aaff, 2);
    const GLOW_GREEN = mkMat(0x00ffaa, 0.2, 0.1, 0x00ffaa, 2);
    const GLASS_MAT = mkGlass(0x88ccff, 0.6);

    /* ══════════════════════════════════════════════════════════════════════
       BASE PLATFORM (Modern intersecting sleek discs)
    ══════════════════════════════════════════════════════════════════════ */
    const baseGroup = new THREE.Group();
    
    // Distinct subtle colors for each district's concrete
    const MAT_D1 = mkMat(0x0a101a, 0.8, 0.2); // Midnight Blue
    const MAT_D2 = mkMat(0x0a1610, 0.8, 0.2); // Deep Emerald
    const MAT_D3 = mkMat(0x160a12, 0.8, 0.2); // Dark Plum
    const MAT_D4 = mkMat(0x14100a, 0.8, 0.2); // Dark Bronze

    const d1 = cy(10, 9.5, 1.5, 64, MAT_D1);
    d1.position.set(0, -0.75, 0);
    baseGroup.add(d1);

    const d2 = cy(6, 5.5, 1.2, 64, MAT_D2);
    d2.position.set(-6, -0.6, -5);
    baseGroup.add(d2);

    const d3 = cy(7, 6.5, 1.6, 64, MAT_D3);
    d3.position.set(5, -0.8, 5);
    baseGroup.add(d3);

    // Front extension platform (Sign)
    const d4 = cy(5, 4.5, 1.2, 32, MAT_D4);
    d4.position.set(1, -0.7, 12);
    baseGroup.add(d4);

    scene.add(baseGroup);

    // Glowing LED embedded paths connecting everything
    const addPathLine = (x1: number, z1: number, x2: number, z2: number) => {
      const dx = x2 - x1, dz = z2 - z1;
      const len = Math.sqrt(dx * dx + dz * dz);
      const line = bx(0.2, 0.02, len, GLOW_BLUE);
      line.position.set((x1 + x2) / 2, 0.01, (z1 + z2) / 2);
      line.rotation.y = Math.atan2(dx, dz);
      scene.add(line);
    };

    // Connect centers
    addPathLine(6, 6, 0, 0);          // To About
    addPathLine(0, 0, 7, -3);         // To Experience
    addPathLine(0, 0, -5, 3);         // To Projects
    addPathLine(0, 0, -4, -8);        // To Contact
    addPathLine(0, 0, -7, -4);        // To Hobbies
    addPathLine(0, 0, 1.5, 13);       // To Entrance Plaza

    // Central Hub Ring
    const hubRing = cy(2.5, 2.5, 0.02, 32, PATH_MAT);
    hubRing.position.y = 0.01;
    scene.add(hubRing);

    let hubGlow = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.03, 16, 64), GLOW_BLUE);
    hubGlow.rotation.x = Math.PI / 2;
    hubGlow.position.y = 0.02;
    scene.add(hubGlow);

    /* ══════════════════════════════════════════════════════════════════════
       HOLLYWOOD SIGN ("SHARVESH")
    ══════════════════════════════════════════════════════════════════════ */
    const signGroup = new THREE.Group();
    const letterMat = mkMat(0xffffff, 0.8, 0.2); // White text
    const L_DEPTH = 0.2;
    const makeLBox = (w: number, h: number, cx: number, cy: number, rotZ = 0) => {
      const m = bx(w, h, L_DEPTH, letterMat);
      m.position.set(cx, cy, 0);
      m.rotation.z = rotZ;
      return m;
    };

    const makeLetter = (char: string) => {
      const g = new THREE.Group();
      if (char === 'S') {
        g.add(makeLBox(0.8, 0.2, 0, 0.9));
        g.add(makeLBox(0.2, 0.4, -0.3, 0.6));
        g.add(makeLBox(0.8, 0.2, 0, 0.5));
        g.add(makeLBox(0.2, 0.4, 0.3, 0.3));
        g.add(makeLBox(0.8, 0.2, 0, 0.1));
      } else if (char === 'H') {
        g.add(makeLBox(0.2, 1.0, -0.3, 0.5));
        g.add(makeLBox(0.2, 1.0, 0.3, 0.5));
        g.add(makeLBox(0.4, 0.2, 0, 0.5));
      } else if (char === 'A') {
        g.add(makeLBox(0.2, 1.05, -0.2, 0.5, -0.18)); // left leg tilts right (/)
        g.add(makeLBox(0.2, 1.05, 0.2, 0.5, 0.18));   // right leg tilts left (\)
        g.add(makeLBox(0.4, 0.2, 0, 0.4));
      } else if (char === 'R') {
        g.add(makeLBox(0.2, 1.0, -0.3, 0.5));
        g.add(makeLBox(0.5, 0.2, 0.05, 0.9));
        g.add(makeLBox(0.5, 0.2, 0.05, 0.5));
        g.add(makeLBox(0.2, 0.4, 0.3, 0.7));
        g.add(makeLBox(0.2, 0.5, 0.2, 0.25, 0.35)); // right angled leg tilts left (\)
      } else if (char === 'V') {
        g.add(makeLBox(0.2, 1.05, -0.2, 0.5, 0.25));  // left leg tilts left (\)
        g.add(makeLBox(0.2, 1.05, 0.2, 0.5, -0.25));  // right leg tilts right (/)
      } else if (char === 'E') {
        g.add(makeLBox(0.2, 1.0, -0.3, 0.5));
        g.add(makeLBox(0.6, 0.2, 0.1, 0.9));
        g.add(makeLBox(0.5, 0.2, 0.05, 0.5));
        g.add(makeLBox(0.6, 0.2, 0.1, 0.1));
      }
      return g;
    };

    const word = "SHARVESH";
    word.split("").forEach((char, i) => {
      const lg = makeLetter(char);
      lg.position.x = (i - (word.length - 1) / 2) * 1.1;
      lg.position.y = 0.2; // Slightly off the ground
      
      // Add a small metal support pillar for each letter
      const support = cy(0.05, 0.05, 0.3, 4, DARK_MAT);
      support.position.set((i - (word.length - 1) / 2) * 1.1, 0.1, -0.1);
      signGroup.add(support);
      
      signGroup.add(lg);
    });

    // Add a sleek black base for the sign
    const signBase = bx(9, 0.2, 0.6, DARK_MAT);
    signBase.position.set(0, -0.2, 0);
    signGroup.add(signBase);

    // Placed slightly to the right in the foreground
    signGroup.position.set(2, 0.5, 14);
    signGroup.scale.setScalar(0.6); // Keep it small
    signGroup.rotation.y = Math.PI / 8; // Keep it sleekly angled
    scene.add(signGroup);

    /* ══════════════════════════════════════════════════════════════════════
       BUILDINGS
    ══════════════════════════════════════════════════════════════════════ */
    const clickMeshes: THREE.Mesh[] = [];
    const pick = (parent: THREE.Group, to: string, label: string, r = 2.5, hitHeight = 0) => {
      let hitMesh: THREE.Mesh;
      if (hitHeight > 0) {
        // Tall towers get massive cylinders to catch tip hovers
        hitMesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, hitHeight, 16), new THREE.MeshBasicMaterial({ visible: false }));
        hitMesh.position.y = hitHeight / 2;
      } else {
        // Wide/normal buildings get standard spheres
        hitMesh = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), new THREE.MeshBasicMaterial({ visible: false }));
        hitMesh.position.y = r; 
      }
      hitMesh.userData = { to, label };
      parent.add(hitMesh);
      clickMeshes.push(hitMesh);
    };

    let gradCapGrp: THREE.Group | null = null;
    let aboutHoloRing: THREE.Mesh | null = null;
    let projArmBase: THREE.Group | null = null;
    let lighthouseBeam: THREE.Group | null = null;
    let soccerBall: THREE.Group | null = null;
    const cars: { mesh: THREE.Group, radius: number, speed: number, angle: number }[] = [];

    /* ── 1. UNIVERSITY (About) — Modern Tech Building ── */
    {
      const g = new THREE.Group();
      g.position.set(6, 0, 6);

      // Stacked Modern Office Building
      const baseFloor = bx(2.5, 1.0, 2.5, BASE_MAT);
      baseFloor.position.y = 0.5;
      g.add(baseFloor);

      // Glowing Cyan trim between floors
      const glowTrim1 = bx(2.6, 0.1, 2.6, GLOW_BLUE);
      glowTrim1.position.y = 1.05;
      g.add(glowTrim1);

      const glassMid = bx(2.2, 1.2, 2.2, GLASS_MAT);
      glassMid.position.y = 1.7;
      g.add(glassMid);

      const glowTrim2 = bx(2.4, 0.1, 2.4, GLOW_BLUE);
      glowTrim2.position.y = 2.35;
      g.add(glowTrim2);

      const topFloor = bx(2.6, 0.8, 2.6, DARK_MAT);
      topFloor.position.y = 2.8;
      g.add(topFloor);

      // Satellite dish / Antenna on roof
      const ant = cy(0.1, 0.1, 1.0, 8, BASE_MAT);
      ant.position.set(-0.8, 3.6, -0.8);
      g.add(ant);
      
      const antGlow = sp(0.15, GLOW_GREEN);
      antGlow.position.set(-0.8, 4.1, -0.8);
      g.add(antGlow);

      pick(g, "/about", "About", 3.0); // Standard Sphere Hitbox
      scene.add(g);
    }

    /* ── 2. EXPERIENCE (Credvan) — Sleek twisting skyscraper ── */
    {
      const g = new THREE.Group();
      g.position.set(7, 0, -3);

      const floors = 8;
      for (let i = 0; i < floors; i++) {
        const fh = 0.6;
        const fy = i * fh + fh / 2;
        const scale = 1.0 - (i * 0.05);
        
        const floorGrp = new THREE.Group();
        floorGrp.position.y = fy;
        floorGrp.rotation.y = i * 0.15;

        // Glass body
        const body = bx(1.8 * scale, fh - 0.05, 1.8 * scale, GLASS_MAT);
        floorGrp.add(body);

        // Concrete slab divider
        const slab = bx(1.9 * scale, 0.05, 1.9 * scale, BASE_MAT);
        slab.position.y = -fh / 2 + 0.025;
        floorGrp.add(slab);

        g.add(floorGrp);
      }

      // Antenna
      const ant = cy(0.05, 0.05, 1.5, 8, DARK_MAT);
      ant.position.y = floors * 0.6 + 0.75;
      g.add(ant);
      
      const antGlow = sp(0.1, GLOW_GREEN);
      antGlow.position.y = floors * 0.6 + 1.5;
      g.add(antGlow);

      pick(g, "/experience", "Experience", 3.0, 12.0); // Tall Cylinder Hitbox
      scene.add(g);
    }

    /* ── 3. PROJECTS (Tech Lab) — Holographic Projection Base ── */
    {
      const g = new THREE.Group();
      g.position.set(-5, 0, 3);
      
      // Main Projection Ring
      const ringGeo = new THREE.TorusGeometry(1.6, 0.4, 16, 48);
      const ring = new THREE.Mesh(ringGeo, GLASS_MAT);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.4;
      g.add(ring);

      // Central Holographic projection base
      const holoBase = cy(0.5, 0.6, 0.2, 16, BASE_MAT);
      holoBase.position.y = 0.1;
      g.add(holoBase);

      // Holographic Data Ring hovering above
      aboutHoloRing = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.05, 8, 64), GLOW_GREEN);
      aboutHoloRing.rotation.x = Math.PI / 2;
      aboutHoloRing.position.y = 1.6;
      g.add(aboutHoloRing);

      // Massive Floating Holographic Wireframe Gem
      gradCapGrp = new THREE.Group();
      gradCapGrp.position.set(0, 3.5, 0); // Floats above the holo ring
      gradCapGrp.scale.setScalar(1.5); 
      
      const gemGeo = new THREE.IcosahedronGeometry(1.0, 0);
      const gemMat = new THREE.MeshBasicMaterial({ color: 0x00ffaa, wireframe: true });
      const gem = new THREE.Mesh(gemGeo, gemMat);
      
      // Inner glowing core of the gem
      const innerGem = new THREE.Mesh(gemGeo, mkMat(0x00ffaa, 0.5, 0.1));
      innerGem.scale.setScalar(0.7);
      
      gradCapGrp.add(gem);
      gradCapGrp.add(innerGem);
      
      g.add(gradCapGrp);

      pick(g, "/projects", "Projects", 3.0);
      scene.add(g);
    }

    /* ── 4. HOBBIES (Soccer Stadium) — Modern Sunken Arena ── */
    {
      const g = new THREE.Group();
      g.position.set(-7, 0.1, -4);

      // Outer sleek bowl
      const bowlGeo = new THREE.TorusGeometry(2.0, 0.6, 16, 32);
      const bowl = s(new THREE.Mesh(bowlGeo, BASE_MAT));
      bowl.rotation.x = Math.PI / 2;
      bowl.position.y = 0.2;
      g.add(bowl);

      // Glowing Pitch
      const pitchGeo = new THREE.PlaneGeometry(3.0, 3.0);
      const pitch = new THREE.Mesh(pitchGeo, mkMat(0x00ff66, 0.5, 0.1, 0x00ff66, 0.5)); // glowing green
      pitch.rotation.x = -Math.PI / 2;
      pitch.position.y = 0.05;
      g.add(pitch);

      // Small Bouncing Soccer Ball
      soccerBall = new THREE.Group();
      // White base sphere
      soccerBall.add(sp(0.6, mkMat(0xffffff))); 
      
      // Black pentagonal seams using a wireframe Dodecahedron
      const seamsMat = new THREE.MeshStandardMaterial({ color: 0x111111, wireframe: true });
      const seams = new THREE.Mesh(new THREE.DodecahedronGeometry(0.605, 0), seamsMat);
      
      // Add a second layer of geometry for complexity
      const seams2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.605, 1), seamsMat);
      
      soccerBall.add(seams);
      soccerBall.add(seams2);
      soccerBall.position.set(0, 1.0, 0);
      soccerBall.scale.setScalar(0.4); // Make it a small, realistic-sized ball
      g.add(soccerBall);

      // High-tech floating screens
      for(let i=0; i<4; i++) {
        const a = (i/4) * Math.PI * 2;
        const screen = bx(0.8, 0.5, 0.05, GLOW_BLUE);
        screen.position.set(Math.cos(a) * 2.2, 1.5, Math.sin(a) * 2.2);
        screen.lookAt(0, 1.5, 0);
        g.add(screen);
      }

      pick(g, "/hobbies", "Hobbies", 2.8);
      scene.add(g);
    }

    /* ── 5. CONTACT (Lighthouse) — Glowing Obelisk ── */
    {
      const g = new THREE.Group();
      g.position.set(-4, 0, -8);

      // Obelisk base
      const obBase = cy(0.8, 1.2, 1.0, 4, BASE_MAT);
      obBase.position.y = 0.5;
      g.add(obBase);

      // Middle floating segments
      for (let i = 0; i < 4; i++) {
        const seg = cy(0.6 - i*0.1, 0.7 - i*0.1, 0.8, 4, BASE_MAT);
        seg.position.y = 1.6 + i * 1.0;
        seg.rotation.y = i * 0.2;
        g.add(seg);
        
        // Glow ring
        const ring = cy(0.65 - i*0.1, 0.65 - i*0.1, 0.05, 4, GLOW_BLUE);
        ring.position.y = 1.15 + i * 1.0;
        ring.rotation.y = i * 0.2;
        g.add(ring);
      }

      // Top massive orb
      lighthouseBeam = new THREE.Group();
      lighthouseBeam.position.y = 5.6;

      const orb = sp(0.6, GLOW_BLUE);
      lighthouseBeam.add(orb);

      // Rotating hologram rings
      const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.02, 16, 32), GLOW_BLUE);
      r1.rotation.x = Math.PI / 2;
      lighthouseBeam.add(r1);

      // Laser beam shooting into the sky
      const laser = cy(0.1, 0.1, 20, 8, GLOW_BLUE);
      laser.position.y = 10;
      lighthouseBeam.add(laser);

      g.add(lighthouseBeam);

      const pl = new THREE.PointLight(0x00aaff, 2.0, 10);
      pl.position.y = 5.6;
      g.add(pl);

      pick(g, "/contact", "Contact", 4.0, 20.0); // MASSIVE Tall Cylinder Hitbox
      scene.add(g);
    }

    /* ── MODERN TREES (Holographic Geometric Clusters) ── */
    const treeGrps: THREE.Group[] = [];
    const addTechTree = (x: number, z: number, scale: number) => {
      const g = new THREE.Group();
      const trunk = cy(0.04, 0.06, 0.8, 8, DARK_MAT);
      trunk.position.y = 0.4;
      g.add(trunk);

      // Icosahedron canopy
      const canopyGeo = new THREE.IcosahedronGeometry(0.4, 0);
      const canopy = new THREE.Mesh(canopyGeo, mkGlass(0x00ffa5, 0.8));
      canopy.position.y = 0.9;
      g.add(canopy);

      // Inner glowing core
      const core = sp(0.15, GLOW_GREEN);
      core.position.y = 0.9;
      g.add(core);

      g.position.set(x, 0, z);
      g.scale.setScalar(scale);
      scene.add(g);
      treeGrps.push(g);
    };

    [
      [2, 2, 1.0], [3, 1, 0.8], [-2, 2, 1.2], [-3, 1.5, 0.9],
      [1, -2, 1.1], [3, -1, 0.8], [-3, -2, 1.0], [-1, -5, 1.3],
      [7, 1, 1.1], [5, -1, 0.9], [-4, -6, 0.8], [-7, 0, 1.2],
      [-1, 12, 1.1], [4, 11, 0.9], [0, 11, 0.8], [4, 16, 1.0] // Trees framing the entrance
    ].forEach(([x, z, s]) => addTechTree(x, z, s));

    /* ── CARS ── */
    const createCar = () => {
      const g = new THREE.Group();
      const body = bx(0.6, 0.2, 0.3, mkMat(0xffffff, 0.5, 0.1));
      body.position.y = 0.1;
      g.add(body);
      const cabin = bx(0.3, 0.2, 0.25, mkMat(0xffffff, 0.5, 0.1));
      cabin.position.set(-0.05, 0.3, 0);
      g.add(cabin);
      return g;
    };

    for (let i = 0; i < 5; i++) {
      const car = createCar();
      const radius = i % 2 === 0 ? 4.5 : 5.2; // Alternate between 2 lanes
      const speed = 0.003 + Math.random() * 0.004; // Slow moving
      const angle = Math.random() * Math.PI * 2;
      cars.push({ mesh: car, radius, speed, angle });
      scene.add(car);
    }

    /* ── AMBIENT CITYSCAPE (Non-interactive towers & structures) ──────────── */
    const ambientGrp = new THREE.Group();

    // 1. Sleek Glass Spire
    const addSpire = (x: number, z: number, h: number) => {
      const g = new THREE.Group();
      const b = cy(0.1, 0.8, h, 4, GLASS_MAT);
      b.position.y = h / 2;
      g.add(b);
      const core = cy(0.05, 0.3, h * 0.9, 4, GLOW_BLUE);
      core.position.y = h / 2;
      g.add(core);
      g.position.set(x, 0, z);
      ambientGrp.add(g);
    };

    // 2. Data Center Blocks
    const addDataCenter = (x: number, z: number, rotY: number) => {
      const g = new THREE.Group();
      g.rotation.y = rotY;
      
      const b1 = bx(1.5, 0.8, 1.2, BASE_MAT);
      b1.position.y = 0.4;
      g.add(b1);
      
      const b2 = bx(1.0, 0.6, 0.8, DARK_MAT);
      b2.position.y = 1.1;
      g.add(b2);

      // Neon strips
      for(let i=0; i<3; i++) {
        const strip = bx(1.05, 0.05, 0.85, GLOW_GREEN);
        strip.position.y = 0.9 + i*0.2;
        g.add(strip);
      }
      
      g.position.set(x, 0, z);
      ambientGrp.add(g);
    };

    // 3. Hexagonal Power Coils
    const addCoil = (x: number, z: number) => {
      const g = new THREE.Group();
      const b = cy(0.6, 0.6, 0.4, 6, BASE_MAT);
      b.position.y = 0.2;
      g.add(b);

      const energy = cy(0.3, 0.3, 1.2, 6, GLOW_BLUE);
      energy.position.y = 0.6;
      g.add(energy);

      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 6, 16), DARK_MAT);
      ring.position.y = 0.6;
      ring.rotation.x = Math.PI/2;
      g.add(ring);
      
      const floatRing = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 6, 16), GLOW_BLUE);
      floatRing.position.y = 1.0;
      floatRing.rotation.x = Math.PI/2;
      g.add(floatRing);

      g.position.set(x, 0, z);
      ambientGrp.add(g);
    };

    // Restored to their original spots on the overlapping layout
    addSpire(-5, -9, 5); 
    addSpire(4, -8, 6);
    addSpire(9, -2, 4);
    addSpire(-2, 13, 7);

    addDataCenter(4, 9, -Math.PI/4);
    addDataCenter(-9.5, 1, -Math.PI/6);
    addDataCenter(-2.5, -5.5, Math.PI/8);

    addCoil(-1, 10);
    addCoil(-2, 7);
    addCoil(7, 2);

    scene.add(ambientGrp);

    /* ── FLYING DRONES ────────────────────────────────────────────────────── */
    const drones: { g: THREE.Group; t: number; speed: number; r: number }[] = [];
    for(let i=0; i<4; i++) {
      const dg = new THREE.Group();
      const core = bx(0.3, 0.05, 0.3, DARK_MAT);
      dg.add(core);
      const light = sp(0.08, mkMat(0xff2200, 0, 0, 0xff2200, 4));
      light.position.y = -0.05;
      dg.add(light);
      scene.add(dg);
      drones.push({ g: dg, t: i * 0.25, speed: 0.002 + i*0.001, r: 5 + i*1.5 });
    }

    /* ── INTERACTION ─────────────────────────────────────────────────────── */
    const raycaster = new THREE.Raycaster();

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        ),
        camera
      );
      const hits = raycaster.intersectObjects(clickMeshes);
      if (hits.length) {
        const { label } = hits[0].object.userData as { label: string };
        setHovered(label);
        setTooltipPos({ x: e.clientX, y: e.clientY });
        canvas.style.cursor = "pointer";
      } else {
        setHovered(null);
        canvas.style.cursor = "default";
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        ),
        camera
      );
      const hits = raycaster.intersectObjects(clickMeshes);
      if (hits.length) void navigate({ to: hits[0].object.userData.to as string });
    };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("click", onClick);

    /* ── RESIZE ──────────────────────────────────────────────────────────── */
    const ro = new ResizeObserver(() => {
      const nW = canvas.clientWidth || 900;
      const nH = canvas.clientHeight || 520;
      renderer.setSize(nW, nH, false);
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
    });
    ro.observe(canvas);

    /* ── ANIMATE ─────────────────────────────────────────────────────────── */
    let frame = 0,
      rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      frame++;
      const t = frame * 0.016;

      // Rotate central hub glow
      hubGlow.rotation.y = t * -0.5;

      // Animate about holo ring
      if (aboutHoloRing) {
        aboutHoloRing.rotation.z = t * 0.5;
      }

      // Holographic wireframe gem on Projects
      if (gradCapGrp) {
        gradCapGrp.position.y = 3.5 + Math.sin(t * 2) * 0.1;
        gradCapGrp.rotation.y = t * 0.8;
        gradCapGrp.rotation.z = Math.sin(t * 1.5) * 0.1; // gentle tilt
        if (gradCapGrp.children[1]) {
           gradCapGrp.children[1].rotation.y = -t * 1.6; // Inner gem spins opposite
           gradCapGrp.children[1].rotation.x = t * 1.2;
        }
      }

      // Rotate Lighthouse Orb Rings
      if (lighthouseBeam) {
        lighthouseBeam.children[1].rotation.x = Math.PI/2 + Math.sin(t) * 0.3;
        lighthouseBeam.children[1].rotation.y = t * 1.5;
      }

      // Move Cars
      cars.forEach(car => {
        car.angle += car.speed;
        const nextX = Math.cos(car.angle + 0.1) * car.radius;
        const nextZ = Math.sin(car.angle + 0.1) * car.radius;
        car.mesh.position.set(Math.cos(car.angle) * car.radius, 0, Math.sin(car.angle) * car.radius);
        car.mesh.lookAt(nextX, 0, nextZ);
      });

      // Giant Bouncing Soccer Ball
      if (soccerBall) {
        soccerBall.position.y = 0.5 + Math.abs(Math.sin(t * 3.5)) * 1.2; // Realistic bounce height
        soccerBall.rotation.x += 0.04;
        soccerBall.rotation.z -= 0.03;
      }

      // Tree canopies hover & rotate slowly
      treeGrps.forEach((tg, i) => {
        const canopy = tg.children[1];
        canopy.rotation.y = t * 0.4 + i;
        canopy.rotation.x = t * 0.2 + i;
        canopy.position.y = 0.9 + Math.sin(t * 1.5 + i) * 0.05;
      });

      // Animate ambient energy coils
      ambientGrp.children.forEach(child => {
        if (child.children.length === 4) { // Only coils have exactly 4 children
          child.children[2].rotation.z = t * 2; // dark metal ring
          child.children[3].rotation.z = -t * 3; // glowing float ring
          child.children[3].position.y = 1.0 + Math.sin(t * 4) * 0.1;
        }
      });

      // Animate flying drones
      drones.forEach((drone, i) => {
        drone.t += drone.speed;
        drone.g.position.x = Math.cos(drone.t) * drone.r;
        drone.g.position.z = Math.sin(drone.t) * drone.r;
        drone.g.position.y = 5 + Math.sin(drone.t * 3 + i) * 1.5; // High in the sky
        drone.g.lookAt(0, drone.g.position.y, 0); // Always face center
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("click", onClick);
      renderer.dispose();
    };
  }, [navigate]);

  const LEGEND = [
    { label: "About", hint: "University Ring", to: "/about" },
    { label: "Experience", hint: "Credvan Tower", to: "/experience" },
    { label: "Projects", hint: "Tech Lab", to: "/projects" },
    { label: "Hobbies", hint: "Sunken Arena", to: "/hobbies" },
    { label: "Contact", hint: "Obelisk Lighthouse", to: "/contact" },
  ];

  return (
    <section id="universe" aria-label="Island city" className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-10 sm:py-16">
      <div className="mb-6 text-center sm:mb-8">
        <p className="pill mx-auto mb-4 !bg-white/8 text-sm">Explore my world</p>
        <h2 className="font-display text-3xl font-semibold sm:text-5xl">Click a building to explore.</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          Hover a landmark · click to enter
        </p>
      </div>

      <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl" style={{ height: "min(80vw, 600px)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <canvas ref={canvasRef} className="h-full w-full bg-slate-50 dark:bg-slate-900" style={{ display: "block" }} />
        
        {hovered && (
          <div
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-full border border-black/10 bg-white/90 px-4 py-1.5 text-sm font-semibold text-black shadow-lg backdrop-blur-md dark:border-white/20 dark:bg-black/80 dark:text-white"
            style={{ left: tooltipPos.x, top: tooltipPos.y - 16 }}
          >
            {hovered} →
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
        {LEGEND.map((l) => (
          <div key={l.to} className="flex items-center gap-2 rounded-full border border-black/5 bg-black/5 px-4 py-2 text-xs backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            <span className="font-bold text-foreground/90">{l.label}</span>
            <span className="text-muted-foreground/60">{l.hint}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
