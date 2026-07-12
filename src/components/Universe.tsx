import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

interface UniverseProps {
  onBuildingEnter?: (route: string) => void;
}

export function Universe({ onBuildingEnter }: UniverseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onBuildingEnterRef = useRef(onBuildingEnter);
  onBuildingEnterRef.current = onBuildingEnter;
  const [hovered, setHovered] = useState<string | null>(null);
  const [nearBuilding, setNearBuilding] = useState<{ label: string; to: string } | null>(null);

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
    camera.position.set(3, 2.5, 14);
    camera.lookAt(1, 0.5, 12);

    /* ── Player Character ─────────────────────────────────────────────── */
    const playerGroup = new THREE.Group();
    // Main glowing orb
    const playerCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0x00ccff,
        emissive: 0x00ccff,
        emissiveIntensity: 2.0,
        roughness: 0.2,
        metalness: 0.8,
      }),
    );
    playerCore.castShadow = true;
    playerGroup.add(playerCore);

    // Outer glow ring
    const playerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.5, 0.03, 16, 32),
      new THREE.MeshStandardMaterial({
        color: 0x00ccff,
        emissive: 0x00ccff,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.5,
      }),
    );
    playerRing.rotation.x = Math.PI / 2;
    playerGroup.add(playerRing);

    // Point light on player
    const playerLight = new THREE.PointLight(0x00ccff, 3.0, 8);
    playerLight.position.y = 0.5;
    playerGroup.add(playerLight);

    playerGroup.position.set(1, 0.5, 12);
    scene.add(playerGroup);

    // Trail particles
    const TRAIL_PARTICLE_COUNT = 12;
    const trailParticles: THREE.Mesh[] = [];
    const trailPositions: { x: number; y: number; z: number; life: number }[] = [];
    const trailMat = new THREE.MeshStandardMaterial({
      color: 0x00ccff,
      emissive: 0x00ccff,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.4,
    });
    for (let i = 0; i < TRAIL_PARTICLE_COUNT; i++) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), trailMat.clone());
      p.visible = false;
      scene.add(p);
      trailParticles.push(p);
      trailPositions.push({ x: 1, y: 0.5, z: 12, life: 0 });
    }
    let trailIndex = 0;
    let trailTimer = 0;

    // Player movement state
    const keys: Record<string, boolean> = {};
    const playerPos = new THREE.Vector3(1, 0.5, 12);
    const playerVel = new THREE.Vector3();
    const PLAYER_SPEED = 0.12;
    const PLAYER_FRICTION = 0.88;
    const targetCameraOffset = new THREE.Vector3(22, 18, 22);
    const currentCameraOffset = new THREE.Vector3(2, 2, 2);
    const cameraTarget = new THREE.Vector3();
    let introTime = 0;
    let hasInteracted = false;

    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      if (
        ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(
          e.key.toLowerCase(),
        )
      ) {
        if (!hasInteracted) {
          hasInteracted = true;
        }
        e.preventDefault();
      }
      // Enter key to enter a building
      if (e.key === "Enter") {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // Building positions for proximity detection
    const buildingPositions = [
      { pos: new THREE.Vector3(6, 0, 6), label: "About", to: "/about", radius: 4 },
      { pos: new THREE.Vector3(7, 0, -3), label: "Experience", to: "/experience", radius: 3.5 },
      { pos: new THREE.Vector3(-5, 0, 5), label: "Projects", to: "/projects", radius: 4 },
      { pos: new THREE.Vector3(-7, 0, -4), label: "Hobbies", to: "/hobbies", radius: 3.5 },
      { pos: new THREE.Vector3(0, 0, -7), label: "Contact", to: "/contact", radius: 4 },
    ];

    // References for proximity-based glow enhancement
    const buildingGroups: THREE.Group[] = [];

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

    const bx = (w: number, h: number, d: number, mat: THREE.Material) =>
      s(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat));
    const cy = (rT: number, rB: number, h: number, sg: number, mat: THREE.Material) =>
      s(new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, h, sg), mat));
    const sp = (r: number, mat: THREE.Material) =>
      s(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), mat));

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
      const dx = x2 - x1,
        dz = z2 - z1;
      const len = Math.sqrt(dx * dx + dz * dz);
      const line = bx(0.2, 0.02, len, GLOW_BLUE);
      line.position.set((x1 + x2) / 2, 0.01, (z1 + z2) / 2);
      line.rotation.y = Math.atan2(dx, dz);
      scene.add(line);
    };

    // Connect centers
    addPathLine(6, 6, 0, 0); // To About
    addPathLine(0, 0, 7, -3); // To Experience
    addPathLine(0, 0, -5, 5); // To Projects
    addPathLine(0, 0, 0, -7); // To Contact
    addPathLine(0, 0, -7, -4); // To Hobbies
    addPathLine(0, 0, 1.5, 13); // To Entrance Plaza

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
      if (char === "S") {
        g.add(makeLBox(0.8, 0.2, 0, 0.9));
        g.add(makeLBox(0.2, 0.4, -0.3, 0.6));
        g.add(makeLBox(0.8, 0.2, 0, 0.5));
        g.add(makeLBox(0.2, 0.4, 0.3, 0.3));
        g.add(makeLBox(0.8, 0.2, 0, 0.1));
      } else if (char === "H") {
        g.add(makeLBox(0.2, 1.0, -0.3, 0.5));
        g.add(makeLBox(0.2, 1.0, 0.3, 0.5));
        g.add(makeLBox(0.4, 0.2, 0, 0.5));
      } else if (char === "A") {
        g.add(makeLBox(0.2, 1.05, -0.2, 0.5, -0.18)); // left leg tilts right (/)
        g.add(makeLBox(0.2, 1.05, 0.2, 0.5, 0.18)); // right leg tilts left (\)
        g.add(makeLBox(0.4, 0.2, 0, 0.4));
      } else if (char === "R") {
        g.add(makeLBox(0.2, 1.0, -0.3, 0.5));
        g.add(makeLBox(0.5, 0.2, 0.05, 0.9));
        g.add(makeLBox(0.5, 0.2, 0.05, 0.5));
        g.add(makeLBox(0.2, 0.4, 0.3, 0.7));
        g.add(makeLBox(0.2, 0.5, 0.2, 0.25, 0.35)); // right angled leg tilts left (\)
      } else if (char === "V") {
        g.add(makeLBox(0.2, 1.05, -0.2, 0.5, 0.25)); // left leg tilts left (\)
        g.add(makeLBox(0.2, 1.05, 0.2, 0.5, -0.25)); // right leg tilts right (/)
      } else if (char === "E") {
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
        hitMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(r, r, hitHeight, 16),
          new THREE.MeshBasicMaterial({ visible: false }),
        );
        hitMesh.position.y = hitHeight / 2;
      } else {
        // Wide/normal buildings get standard spheres
        hitMesh = new THREE.Mesh(
          new THREE.SphereGeometry(r, 16, 16),
          new THREE.MeshBasicMaterial({ visible: false }),
        );
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
      buildingGroups.push(g);
    }

    /* ── 2. EXPERIENCE (Credvan) — Sleek twisting skyscraper ── */
    {
      const g = new THREE.Group();
      g.position.set(7, 0, -3);

      const floors = 8;
      for (let i = 0; i < floors; i++) {
        const fh = 0.6;
        const fy = i * fh + fh / 2;
        const scale = 1.0 - i * 0.05;

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

      pick(g, "/experience", "Experience", 1.5, 12.0); // Tall Cylinder Hitbox
      scene.add(g);
      buildingGroups.push(g);
    }

    /* ── 3. PROJECTS (Tech Lab) — Holographic Projection Base ── */
    {
      const g = new THREE.Group();
      g.position.set(-5, 0, 5);

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
      aboutHoloRing = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.05, 8, 64), GLOW_BLUE);
      aboutHoloRing.rotation.x = Math.PI / 2;
      aboutHoloRing.position.y = 1.6;
      g.add(aboutHoloRing);

      // Massive Floating Holographic Wireframe Gem
      gradCapGrp = new THREE.Group();
      const gemGeo = new THREE.IcosahedronGeometry(1.0, 0);
      const gemMat = new THREE.MeshBasicMaterial({
        color: 0x00ccff,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });
      const gem = new THREE.Mesh(gemGeo, gemMat);

      // Inner glowing core of the gem
      const innerGem = new THREE.Mesh(gemGeo, mkMat(0x00ccff, 0.4, 0.2));
      innerGem.scale.setScalar(0.7);

      gradCapGrp.add(gem);
      gradCapGrp.add(innerGem);

      // Lighting shadow/glow from the base
      const baseLight = new THREE.PointLight(0x00ccff, 4.0, 6.0);
      baseLight.position.set(0, 0.5, 0); // Positioned right above the base, under the gem
      g.add(baseLight);

      g.add(gradCapGrp);

      pick(g, "/projects", "Projects", 3.0);
      scene.add(g);
      buildingGroups.push(g);
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
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const screen = bx(0.8, 0.5, 0.05, GLOW_BLUE);
        screen.position.set(Math.cos(a) * 2.2, 1.5, Math.sin(a) * 2.2);
        screen.lookAt(0, 1.5, 0);
        g.add(screen);
      }

      pick(g, "/hobbies", "Hobbies", 2.8);
      scene.add(g);
      buildingGroups.push(g);
    }

    /* ── 5. CONTACT (Lighthouse) — Glowing Obelisk ── */
    {
      const g = new THREE.Group();
      g.position.set(0, 0, -7);

      // Obelisk base
      const obBase = cy(0.8, 1.2, 1.0, 4, BASE_MAT);
      obBase.position.y = 0.5;
      g.add(obBase);

      // Middle floating segments
      for (let i = 0; i < 4; i++) {
        const seg = cy(0.6 - i * 0.1, 0.7 - i * 0.1, 0.8, 4, BASE_MAT);
        seg.position.y = 1.6 + i * 1.0;
        seg.rotation.y = i * 0.2;
        g.add(seg);

        // Glow ring
        const ring = cy(0.65 - i * 0.1, 0.65 - i * 0.1, 0.05, 4, GLOW_BLUE);
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
      buildingGroups.push(g);
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
      [2, 2, 1.0],
      [3, 1, 0.8],
      [-2, 2, 1.2],
      [-3, 1.5, 0.9],
      [1, -2, 1.1],
      [3, -1, 0.8],
      [-3, -2, 1.0],
      [-1, -5, 1.3],
      [7, 1, 1.1],
      [5, -1, 0.9],
      [-4, -6, 0.8],
      [-7, 0, 1.2],
      [-1, 12, 1.1],
      [4, 11, 0.9],
      [0, 11, 0.8],
      [4, 16, 1.0], // Trees framing the entrance
    ].forEach(([x, z, s]) => addTechTree(x, z, s));

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
      for (let i = 0; i < 3; i++) {
        const strip = bx(1.05, 0.05, 0.85, GLOW_GREEN);
        strip.position.y = 0.9 + i * 0.2;
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
      ring.rotation.x = Math.PI / 2;
      g.add(ring);

      const floatRing = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 6, 16), GLOW_BLUE);
      floatRing.position.y = 1.0;
      floatRing.rotation.x = Math.PI / 2;
      g.add(floatRing);

      g.position.set(x, 0, z);
      ambientGrp.add(g);
    };

    // Restored to their original spots on the overlapping layout
    addSpire(-5, -9, 5);
    addSpire(-2, 13, 7);

    addDataCenter(4, 9, -Math.PI / 4);
    addDataCenter(-9.5, 1, -Math.PI / 6);
    addDataCenter(-2.5, -5.5, Math.PI / 8);

    addCoil(-1, 10);
    addCoil(-2, 7);
    addCoil(7, 2);

    scene.add(ambientGrp);

    /* ── FLYING DRONES ────────────────────────────────────────────────────── */
    const drones: { g: THREE.Group; t: number; speed: number; r: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const dg = new THREE.Group();
      const core = bx(0.3, 0.05, 0.3, DARK_MAT);
      dg.add(core);
      const light = sp(0.08, mkMat(0xff2200, 0, 0, 0xff2200, 4));
      light.position.y = -0.05;
      dg.add(light);
      scene.add(dg);
      drones.push({ g: dg, t: i * 0.25, speed: 0.002 + i * 0.001, r: 5 + i * 1.5 });
    }

    /* ── INTERACTION (click fallback + WASD primary) ───────────────────── */
    const raycaster = new THREE.Raycaster();

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1,
        ),
        camera,
      );
      const hits = raycaster.intersectObjects(clickMeshes);
      if (hits.length) {
        const { label } = hits[0].object.userData as { label: string };
        setHovered(label);
      } else {
        setHovered(null);
      }
    };

    const onScroll = () => {
      setHovered(null);
    };

    const onMouseLeave = () => {
      setHovered(null);
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1,
        ),
        camera,
      );
      const hits = raycaster.intersectObjects(clickMeshes);
      if (hits.length) {
        const route = hits[0].object.userData.to as string;
        if (onBuildingEnterRef.current) onBuildingEnterRef.current(route);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        raycaster.setFromCamera(
          new THREE.Vector2(
            ((touch.clientX - rect.left) / rect.width) * 2 - 1,
            -((touch.clientY - rect.top) / rect.height) * 2 + 1,
          ),
          camera,
        );
        const hits = raycaster.intersectObjects(clickMeshes);
        if (hits.length) {
          const route = hits[0].object.userData.to as string;
          if (onBuildingEnterRef.current) onBuildingEnterRef.current(route);
        }
      }
    };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

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
    let prevNearBuilding: string | null = null;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      frame++;
      const t = frame * 0.016;

      /* ── Player movement ───────────────────────────────────────────── */
      // Camera-relative movement direction (isometric)
      const moveDir = new THREE.Vector3();
      if (keys["w"] || keys["arrowup"]) {
        moveDir.x -= 1;
        moveDir.z -= 1;
      }
      if (keys["s"] || keys["arrowdown"]) {
        moveDir.x += 1;
        moveDir.z += 1;
      }
      if (keys["a"] || keys["arrowleft"]) {
        moveDir.x -= 1;
        moveDir.z += 1;
      }
      if (keys["d"] || keys["arrowright"]) {
        moveDir.x += 1;
        moveDir.z -= 1;
      }

      if (moveDir.lengthSq() > 0) {
        moveDir.normalize().multiplyScalar(PLAYER_SPEED);
        playerVel.add(moveDir);
      }
      playerVel.multiplyScalar(PLAYER_FRICTION);

      // Clamp to island bounds
      playerPos.add(playerVel);
      const distFromCenter = Math.sqrt(playerPos.x ** 2 + playerPos.z ** 2);
      if (distFromCenter > 16) {
        playerPos.normalize().multiplyScalar(16);
        playerPos.y = 0.5;
        playerVel.set(0, 0, 0);
      }
      playerPos.y = 0.5;

      playerGroup.position.lerp(playerPos, 0.15);

      // Animate player ring
      playerRing.rotation.z = t * 2;
      playerCore.scale.setScalar(1 + Math.sin(t * 4) * 0.05);

      // Trail particles
      trailTimer += 1;
      if (trailTimer % 3 === 0 && playerVel.lengthSq() > 0.0001) {
        const idx = trailIndex % TRAIL_PARTICLE_COUNT;
        trailPositions[idx] = {
          x: playerGroup.position.x + (Math.random() - 0.5) * 0.2,
          y: playerGroup.position.y + (Math.random() - 0.5) * 0.2,
          z: playerGroup.position.z + (Math.random() - 0.5) * 0.2,
          life: 1.0,
        };
        trailParticles[idx].visible = true;
        trailIndex++;
      }
      for (let i = 0; i < TRAIL_PARTICLE_COUNT; i++) {
        const tp = trailPositions[i];
        if (tp.life > 0) {
          tp.life -= 0.03;
          trailParticles[i].position.set(tp.x, tp.y + (1 - tp.life) * 0.3, tp.z);
          trailParticles[i].scale.setScalar(tp.life * 0.8);
          (trailParticles[i].material as THREE.MeshStandardMaterial).opacity = tp.life * 0.5;
          if (tp.life <= 0) trailParticles[i].visible = false;
        }
      }

      /* ── Camera intro animation ─────────────────────────────────────── */
      if (introTime < 1.0) {
        introTime += 0.002;
        const easeOutQuart = 1 - Math.pow(1 - introTime, 4);
        currentCameraOffset.lerpVectors(
          new THREE.Vector3(2, 2, 2),
          targetCameraOffset,
          easeOutQuart,
        );
      }

      /* ── Camera follow ──────────────────────────────────────────────── */
      cameraTarget.copy(playerGroup.position).add(currentCameraOffset);
      camera.position.lerp(cameraTarget, 0.04);
      camera.lookAt(playerGroup.position);

      /* ── Player Indicator overlay ───────────────────────────────────── */
      const indicator = document.getElementById("player-indicator");
      if (indicator) {
        if (!hasInteracted && introTime > 0.5) {
          // Project 3D position to 2D screen
          const screenPos = playerGroup.position.clone();
          screenPos.y += 0.5; // Offset perfectly above the player
          screenPos.project(camera);
          const x = (screenPos.x * 0.5 + 0.5) * (canvas.clientWidth || 900);
          const y = -(screenPos.y * 0.5 - 0.5) * (canvas.clientHeight || 520);
          
          indicator.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
          indicator.style.opacity = "1";
        } else if (hasInteracted) {
          indicator.style.opacity = "0";
        }
      }

      /* ── Proximity detection ────────────────────────────────────────── */
      let closest: (typeof buildingPositions)[0] | null = null;
      let closestDist = Infinity;
      for (const bp of buildingPositions) {
        const d = playerGroup.position.distanceTo(bp.pos);
        if (d < bp.radius && d < closestDist) {
          closest = bp;
          closestDist = d;
        }
      }

      if (closest) {
        if (prevNearBuilding !== closest.label) {
          prevNearBuilding = closest.label;
          setNearBuilding({ label: closest.label, to: closest.to });
          setHovered(closest.label);
        }
        // Enter building on Enter key
        if (keys["enter"]) {
          keys["enter"] = false;
          if (onBuildingEnterRef.current) onBuildingEnterRef.current(closest.to);
        }
      } else {
        if (prevNearBuilding !== null) {
          prevNearBuilding = null;
          setNearBuilding(null);
          setHovered(null);
        }
      }

      // Rotate central hub glow
      hubGlow.rotation.y = t * -0.5;

      // Animate about holo ring
      if (aboutHoloRing) {
        aboutHoloRing.rotation.z = t * 0.5;
      }

      // Gem float + slow rotate
      if (gradCapGrp) {
        gradCapGrp.position.y = 3.5 + Math.sin(t * 2) * 0.1;
        gradCapGrp.rotation.y = t * 0.8;
        gradCapGrp.rotation.z = Math.sin(t * 1.5) * 0.1;
        if (gradCapGrp.children[1]) {
          gradCapGrp.children[1].rotation.y = -t * 1.6;
          gradCapGrp.children[1].rotation.x = t * 1.2;
        }
      }

      // Rotate Lighthouse Orb Rings
      if (lighthouseBeam) {
        lighthouseBeam.children[1].rotation.x = Math.PI / 2 + Math.sin(t) * 0.3;
        lighthouseBeam.children[1].rotation.y = t * 1.5;
      }

      // Giant Bouncing Soccer Ball
      if (soccerBall) {
        soccerBall.position.y = 0.5 + Math.abs(Math.sin(t * 3.5)) * 1.2;
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
      ambientGrp.children.forEach((child) => {
        if (child.children.length === 4) {
          child.children[2].rotation.z = t * 2;
          child.children[3].rotation.z = -t * 3;
          child.children[3].position.y = 1.0 + Math.sin(t * 4) * 0.1;
        }
      });

      // Animate flying drones
      drones.forEach((drone, i) => {
        drone.t += drone.speed;
        drone.g.position.x = Math.cos(drone.t) * drone.r;
        drone.g.position.z = Math.sin(drone.t) * drone.r;
        drone.g.position.y = 5 + Math.sin(drone.t * 3 + i) * 1.5;
        drone.g.lookAt(0, drone.g.position.y, 0);
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      renderer.dispose();
    };
  }, []);

  const LEGEND = [
    { label: "About", hint: "Tech Building", to: "/about" },
    { label: "Experience", hint: "Twisting Skyscraper", to: "/experience" },
    { label: "Projects", hint: "Hologram", to: "/projects" },
    { label: "Hobbies", hint: "Stadium", to: "/hobbies" },
    { label: "Contact", hint: "Glowing Obelisk", to: "/contact" },
  ];

  return (
    <div id="universe" aria-label="Island city" className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full bg-slate-50 dark:bg-slate-900"
      />

      {/* Permanent Controls Hint */}
      <div className="pointer-events-none absolute bottom-8 left-0 right-0 z-50 flex justify-center">
        <div className="border border-black/10 bg-white/80 px-6 py-3 font-mono text-xs uppercase tracking-widest text-black/70 shadow-sm backdrop-blur-md hidden sm:block rounded-md">
          Use <kbd className="font-bold text-black border-b border-black/20">W A S D</kbd> or <kbd className="font-bold text-black border-b border-black/20">↑ ↓ ← →</kbd> to move · 
          Press <kbd className="font-bold text-black border-b border-black/20">Enter</kbd> near
          buildings to enter
        </div>
        <div className="border border-black/10 bg-white/80 px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-black/70 shadow-sm backdrop-blur-md sm:hidden text-center max-w-[80%] rounded-lg">
          Tap on buildings to enter
        </div>
      </div>

      {/* Dynamic Player Indicator (Controlled by animate loop) */}
      <div 
        id="player-indicator"
        className="pointer-events-none absolute top-0 left-0 z-40 flex flex-col items-center transition-opacity duration-500"
        style={{ opacity: 0 }}
      >
        <div className="flex animate-bounce flex-col items-center">
          <div className="flex items-center gap-2 rounded-full border border-cyan-400 bg-black/70 px-3 py-1 font-mono text-[10px] font-bold tracking-[0.2em] text-cyan-300 shadow-[0_0_25px_rgba(0,255,255,0.8)] backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(0,255,255,1)]"></span>
            YOU
          </div>
          <div className="h-6 w-[2px] bg-gradient-to-b from-cyan-400 to-transparent shadow-[0_0_10px_rgba(0,255,255,1)]"></div>
        </div>
      </div>

      {/* Proximity tooltip */}
      {nearBuilding && (
        <div
          className="pointer-events-none absolute left-1/2 top-10 z-50 -translate-x-1/2"
          style={{ animation: "fadeIn 0.3s ease" }}
        >
          <div className="flex items-center gap-4 rounded-full border border-white/15 bg-black/70 px-6 py-4 shadow-2xl backdrop-blur-xl">
            <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(0,200,255,0.8)]"></span>
            <span className="font-display text-base font-semibold text-white">
              {nearBuilding.label}
            </span>
            <span className="ml-2 rounded-md bg-white/10 px-2 py-1 text-xs font-bold text-white">
              Enter ↵
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
