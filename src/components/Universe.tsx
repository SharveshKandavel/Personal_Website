import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import * as THREE from "three";

export function Universe() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const navigate   = useNavigate();
  const [hovered, setHovered]       = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const hoveredRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ── Renderer ─────────────────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const initW = canvas.clientWidth  || canvas.offsetWidth  || 800;
    const initH = canvas.clientHeight || canvas.offsetHeight || 500;
    renderer.setSize(initW, initH);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0xcce8f8, 1);
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    /* ── Scene ───────────────────────────────────────────────────────────── */
    const scene = new THREE.Scene();
    scene.fog   = new THREE.Fog(0xcce8f8, 38, 80);
    scene.background = new THREE.Color(0xcce8f8);

    /* ── Camera — fixed isometric-style, no drag ─────────────────────────── */
    const camera = new THREE.PerspectiveCamera(40, initW / initH, 0.1, 200);
    camera.position.set(19, 17, 19);
    camera.lookAt(0, 1.2, 0);

    /* ── Lights ──────────────────────────────────────────────────────────── */
    scene.add(new THREE.HemisphereLight(0xe8f8ff, 0xc8a060, 0.9));

    const sun = new THREE.DirectionalLight(0xfff5e0, 2.4);
    sun.position.set(-14, 22, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left   = -22;
    sun.shadow.camera.right  =  22;
    sun.shadow.camera.top    =  22;
    sun.shadow.camera.bottom = -22;
    sun.shadow.camera.far    =  60;
    sun.shadow.bias          = -0.0005;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x88aaff, 0.45);
    fill.position.set(12, 8, -10);
    scene.add(fill);

    /* ── Geometry helpers ────────────────────────────────────────────────── */
    const std = (col: number, rough = 0.72, metal = 0.0, emi = 0, emiI = 0) =>
      new THREE.MeshStandardMaterial({ color: col, roughness: rough, metalness: metal, emissive: emi, emissiveIntensity: emiI });

    const shadow = (m: THREE.Mesh) => { m.castShadow = true; m.receiveShadow = true; return m; };

    const bx = (w: number, h: number, d: number, col: number, rough = 0.72, emi = 0, emiI = 0) =>
      shadow(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), std(col, rough, 0, emi, emiI)));

    const cy = (rT: number, rB: number, h: number, seg: number, col: number, rough = 0.7, emi = 0, emiI = 0) =>
      shadow(new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, h, seg), std(col, rough, 0, emi, emiI)));

    const cn = (r: number, h: number, seg: number, col: number) =>
      shadow(new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), std(col, 0.8)));

    const sp = (r: number, col: number, rough = 0.6, emi = 0, emiI = 0) =>
      shadow(new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), std(col, rough, 0, emi, emiI)));

    /* ── WATER ───────────────────────────────────────────────────────────── */
    const wGeo  = new THREE.PlaneGeometry(55, 55, 40, 40);
    const wMesh = shadow(new THREE.Mesh(wGeo,
      new THREE.MeshStandardMaterial({ color: 0x4aabdf, roughness: 0.05, metalness: 0.75, transparent: true, opacity: 0.88 })
    ));
    wMesh.rotation.x = -Math.PI / 2;
    wMesh.position.y = -0.62;
    scene.add(wMesh);
    const wAttr = wGeo.attributes.position as THREE.BufferAttribute;
    const wOrig = Float32Array.from({ length: wAttr.count }, (_, i) => wAttr.getY(i));

    /* ── ISLAND base ─────────────────────────────────────────────────────── */
    const islandBase = shadow(new THREE.Mesh(
      new THREE.CylinderGeometry(7.8, 6.6, 0.72, 36),
      std(0xcc8838, 0.96)
    ));
    scene.add(islandBase);

    // Sand top
    const sandTop = shadow(new THREE.Mesh(new THREE.CylinderGeometry(7.6, 7.6, 0.1, 36), std(0xd89840, 0.95)));
    sandTop.position.y = 0.31;
    scene.add(sandTop);

    // ── Hills / dunes
    const hillDefs = [
      { x: -2.5, z: -3.8, r: 2.4, sy: 0.52, col: 0xca8c3e },
      { x:  2.2, z: -4.2, r: 2.0, sy: 0.48, col: 0xc48838 },
      { x:  5.0, z: -2.2, r: 1.6, sy: 0.50, col: 0xca8c40 },
      { x: -5.0, z:  1.8, r: 1.5, sy: 0.46, col: 0xc2863a },
      { x:  1.8, z:  4.2, r: 1.3, sy: 0.44, col: 0xca8c3e },
      { x: -1.5, z:  4.8, r: 1.0, sy: 0.40, col: 0xc4883a },
      { x:  5.2, z:  2.8, r: 1.1, sy: 0.45, col: 0xca8c40 },
      { x: -3.0, z:  0.5, r: 0.8, sy: 0.42, col: 0xc6883c },
    ];
    hillDefs.forEach(({ x, z, r, sy, col }) => {
      const geo = new THREE.SphereGeometry(r, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
      const h   = shadow(new THREE.Mesh(geo, std(col, 0.95)));
      h.scale.y = sy;
      h.position.set(x, 0.32, z);
      scene.add(h);
    });

    // ── Grass patches
    [
      { x: -3.8, z: -0.3, r: 2.0 }, { x: 3.8, z: -0.8, r: 1.7 },
      { x: -2.8, z:  2.8, r: 1.8 }, { x: 0.5, z:  2.2, r: 1.3 },
    ].forEach(({ x, z, r }) => {
      const gp = shadow(new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.045, 28), std(0x3d9228, 0.95)));
      gp.position.set(x, 0.33, z);
      scene.add(gp);
    });

    /* ── ROADS ───────────────────────────────────────────────────────────── */
    const roadMat  = std(0x3a3a4a, 0.98);
    const markMat  = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.15 });

    const addRoad = (x1: number, z1: number, x2: number, z2: number, w = 0.58) => {
      const dx = x2 - x1, dz = z2 - z1;
      const len = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dx, dz);
      const rm = shadow(new THREE.Mesh(new THREE.BoxGeometry(len, 0.045, w), roadMat));
      rm.position.set((x1 + x2) / 2, 0.35, (z1 + z2) / 2);
      rm.rotation.y = angle;
      scene.add(rm);
      // Dashed center line
      for (let d = 0.5; d < len - 0.3; d += 0.9) {
        const mk = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.05, 0.055), markMat);
        mk.position.x = d - len / 2;
        rm.add(mk);
      }
      // Curb edges
      [-w / 2, w / 2].forEach(z => {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(len, 0.06, 0.05), std(0xc0b898, 0.9));
        curb.position.set(0, 0.03, z);
        rm.add(curb);
      });
    };

    addRoad(-3.6, -1.3,  0.0, -3.8);
    addRoad( 0.0, -3.8,  3.6, -1.1);
    addRoad( 3.6, -1.1,  4.2,  2.1);
    addRoad( 4.2,  2.1, -2.5,  3.0);
    addRoad(-2.5,  3.0, -4.2,  0.6);
    addRoad(-4.2,  0.6, -3.6, -1.3);
    addRoad(-3.6, -1.3,  4.2,  2.1, 0.42); // cross

    /* ── TREES ───────────────────────────────────────────────────────────── */
    const treeGrps: THREE.Group[] = [];

    const addTree = (x: number, z: number, s = 1.0, palm = false) => {
      const g = new THREE.Group();
      if (palm) {
        const trunk = cy(0.045, 0.075, s * 0.9, 5, 0x9b6530);
        trunk.position.y = s * 0.45;
        trunk.rotation.z = (Math.random() - 0.5) * 0.22;
        g.add(trunk);
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const frond = cy(0.018, 0.018, s * 0.55, 4, 0x2d8c1a);
          frond.rotation.z = Math.PI * 0.45;
          frond.rotation.y = angle;
          frond.position.set(Math.cos(angle) * s * 0.22, s * 0.94, Math.sin(angle) * s * 0.22);
          g.add(frond);
        }
        const crown = sp(s * 0.19, 0x2d9020, 0.8);
        crown.position.y = s * 0.98;
        g.add(crown);
      } else {
        const trunk = cy(0.068, 0.1, s * 0.55, 6, 0x7a4520);
        trunk.position.y = s * 0.275;
        g.add(trunk);
        [[s * 0.52, s * 0.52], [s * 0.73, s * 0.42], [s * 0.92, s * 0.32]].forEach(([y, r]) => {
          const f = cn(r, r * 1.55, 8, 0x28881c);
          f.position.y = y;
          g.add(f);
        });
      }
      g.position.set(x, 0.33, z);
      scene.add(g);
      treeGrps.push(g);
    };

    const treeDefs: [number, number, number, boolean][] = [
      [-5.4, 0.4, 0.95, false], [-5.2, -1.5, 0.88, false], [-5.0, 2.4, 1.0, true],
      [-1.8, -4.8, 0.92, false], [0.4, -5.0, 0.85, true],  [5.3, -0.9, 0.9, false],
      [5.1, 3.4, 0.95, true],   [1.3, 4.5, 0.88, false],   [-1.0, 4.8, 0.92, true],
      [-3.2, 4.2, 0.96, false], [2.6, 3.8, 0.85, false],   [-4.6, -3.4, 0.90, false],
      [4.0, -3.4, 0.88, true],  [2.2, -3.2, 0.85, false],  [-2.0, -1.2, 0.78, true],
      [1.2, 1.5, 0.82, false],  [3.0, 1.0, 0.76, true],
    ];
    treeDefs.forEach(([x, z, s, palm]) => addTree(x, z, s, palm));

    /* ── STREETLAMPS ─────────────────────────────────────────────────────── */
    const addLamp = (x: number, z: number, angle = 0) => {
      const g = new THREE.Group();
      const pole = cy(0.03, 0.04, 1.45, 6, 0x555566);
      pole.position.y = 0.72;
      g.add(pole);
      const neck = cy(0.025, 0.03, 0.22, 5, 0x555566);
      neck.rotation.z = -Math.PI / 4;
      neck.position.set(0.12, 1.52, 0);
      g.add(neck);
      const shade = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
        std(0xf5e090, 0.5, 0, 0xf5e090, 2)
      );
      shade.rotation.x = Math.PI;
      shade.position.set(0.23, 1.62, 0);
      g.add(shade);
      const pl = new THREE.PointLight(0xffe080, 0.8, 4.2);
      pl.position.set(0.23, 1.62, 0);
      g.add(pl);
      g.position.set(x, 0.33, z);
      g.rotation.y = angle;
      scene.add(g);
    };

    [[-2.2, -2.1, 0], [-0.6, -3.4, 0.4], [2.0, -2.6, 0.8], [3.6, 0.4, 1.2],
     [2.6, 2.6, 1.6], [0.0, 3.7, 2.0], [-2.1, 2.3, 2.4], [-3.9, 0.3, 2.8]
    ].forEach(([x, z, a]) => addLamp(x, z, a));

    /* ═══════════════════════════════════════════════════════════════════════
       BUILDINGS
    ═══════════════════════════════════════════════════════════════════════ */
    const clickMeshes: THREE.Mesh[] = [];
    const addPicker = (parent: THREE.Group, to: string, label: string, r = 1.6) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(r, 8, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      m.userData = { to, label };
      parent.add(m);
      clickMeshes.push(m);
    };

    /* ── Animate refs ────────────────────────────────────────────────────── */
    let gradCapGrp: THREE.Group | null = null;
    let ballMesh: THREE.Mesh | null    = null;
    let beamPivot: THREE.Group | null  = null;
    const rPiv1 = new THREE.Group();
    const rPiv2 = new THREE.Group();
    const towerWinMats: THREE.MeshStandardMaterial[] = [];

    /* ═══ ABOUT — Grand University Hall ═════════════════════════════════════ */
    {
      const g = new THREE.Group();
      g.position.set(-3.6, 0.33, -1.3);

      // Foundation
      const found = bx(2.8, 0.14, 1.95, 0xe0ceaa);
      found.position.y = 0.07;
      g.add(found);

      // Main hall
      const hall = bx(2.3, 1.05, 1.55, 0xf0e2c0);
      hall.position.y = 0.665;
      g.add(hall);

      // Side wings
      [-1.25, 1.25].forEach(x => {
        const wing = bx(0.62, 0.82, 1.55, 0xe8d8b0);
        wing.position.set(x, 0.52, 0);
        g.add(wing);
      });

      // Gabled roof — main (stepped to look like a real gable)
      for (let s = 0; s < 18; s++) {
        const depth = 1.55 - s * 0.086;
        if (depth < 0.1) break;
        const slice = bx(2.3, 0.075, depth, 0xd4bc8c);
        slice.position.y = 1.19 + s * 0.038;
        g.add(slice);
      }
      // Wing roofs
      [-1.25, 1.25].forEach(x => {
        for (let s = 0; s < 12; s++) {
          const depth = 1.55 - s * 0.128;
          if (depth < 0.1) break;
          const slice = bx(0.62, 0.065, depth, 0xc8b084);
          slice.position.set(x, 1.11 + s * 0.033, 0);
          g.add(slice);
        }
      });

      // Columns
      for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        const col = cy(0.048, 0.055, 0.95, 8, 0xf8f0e0);
        col.position.set(i * 0.3, 0.595, 0.8);
        g.add(col);
        // Capital
        const cap = bx(0.12, 0.05, 0.12, 0xf0e8d0);
        cap.position.set(i * 0.3, 1.12, 0.8);
        g.add(cap);
      }

      // Front steps
      for (let i = 0; i < 4; i++) {
        const step = bx(1.2, 0.065, 0.22, 0xd8c8a2);
        step.position.set(0, 0.065 + i * 0.065, 0.9 + i * 0.11);
        g.add(step);
      }

      // Arched windows — front facade
      [-0.7, 0, 0.7].forEach(x => {
        const winB = bx(0.24, 0.38, 0.06, 0xa8ccf0, 0.2, 0xa8ccf0, 0.3);
        winB.position.set(x, 0.64, 0.8);
        g.add(winB);
        const arch = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 0.06, 10, 1, false, 0, Math.PI),
          std(0xa8ccf0, 0.2, 0, 0xa8ccf0, 0.3)
        );
        arch.rotation.z = Math.PI / 2;
        arch.position.set(x, 0.86, 0.8);
        g.add(arch);
      });

      // Side windows
      [-0.5, 0.5].forEach(z => {
        const sw = bx(0.22, 0.28, 0.05, 0xa8ccf0, 0.2, 0xa8ccf0, 0.25);
        sw.position.set(1.18, 0.65, z);
        g.add(sw);
      });

      // Entrance door arch
      const door = bx(0.38, 0.52, 0.07, 0x5a3a1a, 0.85);
      door.position.set(0, 0.36, 0.81);
      g.add(door);

      // Presidential plaque (gold)
      const plaque = bx(0.5, 0.1, 0.05, 0xf5c842, 0.3, 0xf5c842, 1.2);
      plaque.position.set(0, 0.22, 0.81);
      g.add(plaque);

      // Clock above entrance
      const clockFace = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.05, 20),
        std(0xf8f0e0, 0.5, 0, 0xfaf8e0, 0.4)
      );
      clockFace.rotation.x = Math.PI / 2;
      clockFace.position.set(0, 1.0, 0.82);
      g.add(clockFace);
      const clockFrame = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.025, 8, 24),
        std(0xd4a838, 0.5, 0.6, 0xd4a838, 0.8)
      );
      clockFrame.rotation.x = Math.PI / 2;
      clockFrame.position.set(0, 1.0, 0.83);
      g.add(clockFrame);

      // Floating graduation cap
      gradCapGrp = new THREE.Group();
      gradCapGrp.position.set(0, 1.95, 0);
      const capBoard = bx(0.78, 0.058, 0.78, 0x1a1a2a);
      gradCapGrp.add(capBoard);
      const capTop = bx(0.24, 0.15, 0.24, 0x1a1a2a);
      capTop.position.y = -0.105;
      gradCapGrp.add(capTop);
      const tassel = cy(0.013, 0.013, 0.3, 4, 0xffd700, 0.4, 0xffc000, 1.5);
      tassel.position.set(0.38, -0.24, 0);
      gradCapGrp.add(tassel);
      g.add(gradCapGrp);

      new THREE.PointLight(0xaa88ff, 1.2, 5.5).position.set(0, 1.5, 0);
      const pl = new THREE.PointLight(0xaa88ff, 1.2, 5.5);
      pl.position.set(0, 1.5, 0);
      g.add(pl);

      addPicker(g, "/about", "About", 2.0);
      scene.add(g);
    }

    /* ═══ EXPERIENCE — Credvan Tower ════════════════════════════════════════ */
    {
      const g = new THREE.Group();
      g.position.set(0.0, 0.33, -3.4);

      // Wide ground podium
      const pod = bx(2.6, 0.32, 2.6, 0xd8e8f8);
      pod.position.y = 0.16;
      g.add(pod);

      // Podium details
      const lobby = bx(1.3, 0.65, 0.1, 0x88bbee, 0.15, 0x88bbee, 0.18);
      lobby.position.set(0, 0.645, 1.35);
      g.add(lobby);
      const lobbyDoor = bx(0.5, 0.55, 0.08, 0x66aadd, 0.1, 0x66aadd, 0.25);
      lobbyDoor.position.set(0, 0.595, 1.42);
      g.add(lobbyDoor);

      // CREDVAN neon sign on podium
      const sign = bx(1.3, 0.115, 0.06, 0xff6600, 0.2, 0xff6600, 6);
      sign.position.set(0, 1.0, 1.36);
      g.add(sign);

      // Tower — tapered glass sections
      const sections = [
        { y: 0.32, w: 1.6, h: 0.7, d: 1.6 },
        { y: 1.02, w: 1.5, h: 0.7, d: 1.5 },
        { y: 1.72, w: 1.4, h: 0.7, d: 1.4 },
        { y: 2.42, w: 1.3, h: 0.7, d: 1.3 },
        { y: 3.12, w: 1.15, h: 0.65, d: 1.15 },
        { y: 3.77, w: 0.95, h: 0.65, d: 0.95 },
        { y: 4.42, w: 0.75, h: 0.55, d: 0.75 },
      ];

      sections.forEach(({ y, w, h, d }) => {
        // Main glass facade
        const sec = bx(w, h, d, 0x1a4080, 0.18, 0x0a3070, 0.08);
        sec.position.y = y + h / 2;
        g.add(sec);
        // Floor plate
        const plate = bx(w + 0.1, 0.035, d + 0.1, 0xddeeff);
        plate.position.y = y;
        g.add(plate);
        // Windows — front & back faces
        const cols = Math.round(w / 0.25);
        for (let c = 0; c < cols; c++) {
          const wx = (c - (cols - 1) / 2) * (w / cols);
          [[0, d / 2 + 0.02, false], [0, -d / 2 - 0.02, false]].forEach(([, oz, side]) => {
            const wm = new THREE.MeshStandardMaterial({
              color: 0x88ccff, roughness: 0.08, metalness: 0.6,
              emissive: 0x4488cc, emissiveIntensity: Math.random() > 0.28 ? 0.45 : 0.1,
              transparent: true, opacity: 0.88,
            });
            towerWinMats.push(wm);
            const win = new THREE.Mesh(new THREE.BoxGeometry(side ? 0.04 : w / cols * 0.72, h * 0.55, side ? h * 0.55 : 0.04), wm);
            win.position.set(wx, y + h / 2, oz as number);
            g.add(win);
          });
          // Side windows
          const rows = 2;
          for (let r = 0; r < rows; r++) {
            const wm2 = new THREE.MeshStandardMaterial({
              color: 0x88ccff, roughness: 0.08, metalness: 0.6,
              emissive: 0x4488cc, emissiveIntensity: Math.random() > 0.3 ? 0.4 : 0.08,
              transparent: true, opacity: 0.85,
            });
            towerWinMats.push(wm2);
            [[w / 2 + 0.02, 0], [-w / 2 - 0.02, 0]].forEach(([ox]) => {
              const sw = new THREE.Mesh(new THREE.BoxGeometry(0.04, h * 0.5, d / (rows + 1) * 0.7), wm2);
              sw.position.set(ox as number, y + h / 2, (r - (rows - 1) / 2) * (d / (rows + 1)));
              g.add(sw);
            });
          }
        }
      });

      // Top cap + antenna
      const cap = bx(0.62, 0.75, 0.62, 0x1530a0, 0.15, 0x2244cc, 0.2);
      cap.position.y = 5.35;
      g.add(cap);
      const ant = cy(0.02, 0.02, 1.05, 4, 0x888899);
      ant.position.y = 6.02;
      g.add(ant);
      // Blinking red tip
      const antTip = sp(0.065, 0xff1144, 0.3, 0xff1144, 4);
      antTip.position.y = 6.6;
      g.add(antTip);

      // Helipad on top
      const heli = cy(0.55, 0.55, 0.04, 20, 0xddddee);
      heli.position.y = 4.99;
      g.add(heli);
      const heliH = bx(0.35, 0.02, 0.04, 0xffffff, 0.3, 0xffffff, 0.5);
      heliH.position.y = 5.015;
      g.add(heliH);
      const heliV = bx(0.04, 0.02, 0.35, 0xffffff, 0.3, 0xffffff, 0.5);
      heliV.position.y = 5.015;
      g.add(heliV);

      // Crane beside tower (construction detail)
      const craneMast = cy(0.06, 0.06, 4.5, 6, 0xf5c800);
      craneMast.position.set(-1.6, 2.55, 0);
      g.add(craneMast);
      const craneBoom = cy(0.04, 0.04, 2.8, 4, 0xf5c800);
      craneBoom.rotation.z = Math.PI / 2;
      craneBoom.position.set(-1.6, 4.9, 0);
      g.add(craneBoom);
      const craneCab = bx(0.28, 0.22, 0.22, 0xf5c800, 0.6);
      craneCab.position.set(-1.6, 4.22, 0);
      g.add(craneCab);
      const craneCable = cy(0.01, 0.01, 0.9, 4, 0x999999);
      craneCable.position.set(-0.6, 4.45, 0);
      g.add(craneCable);
      const craneHook = sp(0.06, 0x555555);
      craneHook.position.set(-0.6, 3.95, 0);
      g.add(craneHook);

      const pl = new THREE.PointLight(0x4488ff, 2.8, 10);
      pl.position.set(0, 3.5, 0);
      g.add(pl);

      addPicker(g, "/experience", "Experience", 2.5);
      scene.add(g);
    }

    /* ═══ PROJECTS — Workshop & Lab ═════════════════════════════════════════ */
    {
      const g = new THREE.Group();
      g.position.set(3.6, 0.33, -1.0);

      // Foundation
      const found = bx(2.8, 0.12, 2.0, 0xcac898);
      found.position.y = 0.06;
      g.add(found);

      // Main workshop — warm yellow
      const mainW = bx(2.1, 0.95, 1.6, 0xf2d640, 0.72);
      mainW.position.y = 0.595;
      g.add(mainW);

      // Barrel vaulted roof (half-cylinder)
      const vaultGeo = new THREE.CylinderGeometry(0.92, 0.92, 2.15, 28, 1, false, -Math.PI / 2, Math.PI);
      const vault    = shadow(new THREE.Mesh(vaultGeo, std(0xe8c830, 0.78)));
      vault.rotation.z = Math.PI / 2;
      vault.position.set(0, 1.1, 0);
      g.add(vault);

      // Side annex
      const annex = bx(0.75, 0.72, 1.6, 0xeac030, 0.72);
      annex.position.set(-1.42, 0.46, 0);
      g.add(annex);
      const annexRoof = cn(0.65, 0.45, 6, 0xd8a828);
      annexRoof.position.set(-1.42, 0.98, 0);
      g.add(annexRoof);

      // Chimney
      const ch = cy(0.072, 0.088, 0.88, 8, 0x555555);
      ch.position.set(0.45, 1.9, -0.38);
      g.add(ch);
      const chCap = cy(0.11, 0.072, 0.07, 8, 0x333333);
      chCap.position.set(0.45, 2.37, -0.38);
      g.add(chCap);
      // Smoke puff
      const puff = sp(0.12, 0xdddddd, 0.3, 0xdddddd, 0.2);
      puff.position.set(0.45, 2.58, -0.38);
      g.add(puff);

      // Large garage door
      const garage = bx(0.65, 0.72, 0.07, 0x5588aa, 0.3, 0x4477aa, 0.25);
      garage.position.set(0.55, 0.46, 0.84);
      g.add(garage);
      // Garage door slats
      for (let i = 0; i < 5; i++) {
        const slat = bx(0.65, 0.02, 0.06, 0x4477aa);
        slat.position.set(0.55, 0.13 + i * 0.15, 0.87);
        g.add(slat);
      }

      // Front windows
      [-0.38].forEach(x => {
        const wf = bx(0.38, 0.32, 0.07, 0x88aacc, 0.2, 0x88aacc, 0.22);
        wf.position.set(x, 0.62, 0.84);
        g.add(wf);
        // Window frame
        const frH = bx(0.38, 0.03, 0.07, 0xc8a050);
        frH.position.set(x, 0.8, 0.84);
        g.add(frH);
        const frV = bx(0.03, 0.32, 0.07, 0xc8a050);
        frV.position.set(x, 0.62, 0.84);
        g.add(frV);
      });

      // Skylights on vault
      [-0.58, 0.58].forEach(x => {
        const sky = bx(0.28, 0.06, 0.88, 0x00ff88, 0.2, 0x00ff88, 2.5);
        sky.position.set(x, 1.75, 0);
        g.add(sky);
      });

      // BitGold coin stack (tall stack)
      for (let i = 0; i < 7; i++) {
        const coin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.13, 0.13, 0.054, 22),
          new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffaa00, emissiveIntensity: 1.5, roughness: 0.15, metalness: 0.95 })
        );
        coin.position.set(-0.95, 0.11 + i * 0.056, 0.62);
        coin.castShadow = true;
        g.add(coin);
      }
      // Small "$" sign on coin face (flat box)
      const coinSign = bx(0.06, 0.1, 0.04, 0xffdd44, 0.3, 0xffdd44, 2);
      coinSign.position.set(-0.95, 0.5, 0.68);
      g.add(coinSign);

      // Robot arm
      const armBase = cy(0.13, 0.16, 0.32, 8, 0x4a7a4a);
      armBase.position.set(1.15, 0.28, -0.3);
      g.add(armBase);

      rPiv1.position.set(1.15, 0.45, -0.3);
      g.add(rPiv1);
      const seg1 = cy(0.058, 0.072, 0.58, 6, 0x5a8a5a);
      seg1.position.y = 0.29;
      rPiv1.add(seg1);
      const joint1 = sp(0.08, 0x3a6a3a, 0.5);
      joint1.position.y = 0.58;
      rPiv1.add(joint1);

      rPiv2.position.set(0, 0.58, 0);
      rPiv1.add(rPiv2);
      const seg2 = cy(0.042, 0.056, 0.42, 6, 0x6a9a6a);
      seg2.position.y = 0.21;
      rPiv2.add(seg2);
      const claw1 = bx(0.16, 0.075, 0.075, 0x88bb88, 0.45, 0x44ff44, 0.6);
      claw1.position.set(0.1, 0.42, 0);
      rPiv2.add(claw1);
      const claw2 = bx(0.12, 0.065, 0.025, 0x88bb88, 0.5);
      claw2.position.set(0.1, 0.44, 0.05);
      rPiv2.add(claw2);
      const claw3 = bx(0.12, 0.065, 0.025, 0x88bb88, 0.5);
      claw3.position.set(0.1, 0.44, -0.05);
      rPiv2.add(claw3);

      const pl = new THREE.PointLight(0x88ff44, 1.6, 6);
      pl.position.set(0, 1.6, 0);
      g.add(pl);

      addPicker(g, "/projects", "Projects", 2.0);
      scene.add(g);
    }

    /* ═══ HOBBIES — Soccer Stadium ══════════════════════════════════════════ */
    {
      const g = new THREE.Group();
      g.position.set(-2.5, 0.33, 2.9);

      // Outer stadium wall
      const wall = bx(3.0, 0.6, 2.4, 0xf0e8d2);
      wall.position.y = 0.3;
      g.add(wall);

      // Arch entrance decorations
      [-1.4, 1.4].forEach(x => {
        const arch = cn(0.2, 0.3, 6, 0xe8d8b8);
        arch.position.set(x, 0.68, -1.22);
        g.add(arch);
        const pole = cy(0.04, 0.04, 0.5, 6, 0xddccaa);
        pole.position.set(x, 0.42, -1.22);
        g.add(pole);
      });

      // Pitch surface
      const pitch = bx(2.55, 0.065, 1.9, 0x28951a);
      pitch.position.y = 0.635;
      g.add(pitch);

      // Pitch markings
      const cL = bx(0.03, 0.07, 1.9, 0xffffff, 0.3, 0xffffff, 0.25);
      cL.position.y = 0.68;
      g.add(cL);

      const cCircle = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.026, 6, 40),
        std(0xffffff, 0.3, 0, 0xffffff, 0.2)
      );
      cCircle.rotation.x = Math.PI / 2;
      cCircle.position.y = 0.685;
      g.add(cCircle);

      const centerDot = cy(0.05, 0.05, 0.07, 12, 0xffffff, 0.3, 0xffffff, 0.3);
      centerDot.position.y = 0.685;
      g.add(centerDot);

      // Penalty areas
      [-1.0, 1.0].forEach(x => {
        const pbox = new THREE.Mesh(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(0.55, 0.01, 0.95)),
          new THREE.LineBasicMaterial({ color: 0xffffff })
        );
        pbox.position.set(x, 0.685, 0);
        g.add(pbox);
      });

      // Goal posts (both ends)
      [-1.17, 1.17].forEach(x => {
        const cb = cy(0.022, 0.022, 0.72, 6, 0xffffff, 0.3, 0xffffff, 0.4);
        cb.rotation.z = Math.PI / 2;
        cb.position.set(x, 0.98, 0);
        g.add(cb);
        [-0.36, 0.36].forEach(z => {
          const post = cy(0.022, 0.022, 0.5, 6, 0xffffff, 0.3, 0xffffff, 0.4);
          post.position.set(x, 0.88, z);
          g.add(post);
        });
        // Net suggestion (grid lines)
        for (let row = 0; row < 3; row++) {
          const net = bx(0.04, 0.02, 0.72, 0xdddddd, 0.2, 0xffffff, 0.08);
          net.position.set(x > 0 ? x + 0.15 : x - 0.15, 0.73 + row * 0.12, 0);
          g.add(net);
        }
      });

      // Bleacher stands (both long sides)
      [-1.08, 1.08].forEach(z => {
        const stand = bx(3.0, 0.38, 0.28, 0xcc3333);
        stand.position.set(0, 0.49, z);
        g.add(stand);
        // Seats (rows)
        for (let s = 0; s < 3; s++) {
          const row = bx(3.0, 0.04, 0.055, 0xffffff, 0.3, 0xffffff, 0.1);
          row.position.set(0, 0.36 + s * 0.13, z + (z > 0 ? -0.06 : 0.06));
          g.add(row);
        }
        // Stand columns
        for (let c = -1; c <= 1; c++) {
          const col = cy(0.04, 0.04, 0.38, 6, 0xcccccc);
          col.position.set(c * 0.9, 0.49, z);
          g.add(col);
        }
        // Roof overhang
        const roof = bx(3.0, 0.06, 0.22, 0xaa2222);
        roof.position.set(0, 0.71, z + (z > 0 ? -0.04 : 0.04));
        g.add(roof);
      });

      // Scoreboard
      const sbPole1 = cy(0.04, 0.04, 1.1, 6, 0x555566);
      sbPole1.position.set(-0.3, 0.88, -1.28);
      g.add(sbPole1);
      const sbPole2 = cy(0.04, 0.04, 1.1, 6, 0x555566);
      sbPole2.position.set(0.3, 0.88, -1.28);
      g.add(sbPole2);
      const sbBoard = bx(0.82, 0.46, 0.07, 0x111122);
      sbBoard.position.set(0, 1.3, -1.28);
      g.add(sbBoard);
      const sbScreen = bx(0.68, 0.34, 0.07, 0x002200, 0.5, 0x00ff44, 0.55);
      sbScreen.position.set(0, 1.3, -1.26);
      g.add(sbScreen);
      // Score text bar
      const scoreBar = bx(0.5, 0.06, 0.07, 0xffffff, 0.3, 0xffffff, 0.4);
      scoreBar.position.set(0, 1.1, -1.26);
      g.add(scoreBar);

      // Floodlight towers
      [[-1.35, -1.08], [1.35, -1.08], [-1.35, 1.08], [1.35, 1.08]].forEach(([x, z]) => {
        const fp = cy(0.04, 0.04, 1.2, 4, 0x888888);
        fp.position.set(x, 0.93, z);
        g.add(fp);
        const fl = bx(0.22, 0.06, 0.1, 0xffffcc, 0.2, 0xffffcc, 3);
        fl.position.set(x, 1.56, z);
        g.add(fl);
        const fll = new THREE.PointLight(0xffffcc, 0.6, 3.5);
        fll.position.set(x, 1.56, z);
        g.add(fll);
      });

      // Ball
      ballMesh = sp(0.115, 0xffffff);
      ballMesh.position.set(0.3, 0.68, 0.2);
      // Black pentagonal patches
      for (let i = 0; i < 6; i++) {
        const patch = bx(0.055, 0.055, 0.015, 0x111111);
        patch.position.set(
          Math.cos(i * 1.05) * 0.1, 0.68 + Math.sin(i * 1.05) * 0.1, 0.3 + 0.118,
        );
        g.add(patch);
      }
      g.add(ballMesh);

      const pl = new THREE.PointLight(0x44ff44, 1.3, 6);
      pl.position.set(0, 2, 0);
      g.add(pl);

      addPicker(g, "/hobbies", "Hobbies", 2.0);
      scene.add(g);
    }

    /* ═══ CONTACT — Lighthouse & Keeper's Cottage ════════════════════════════ */
    {
      const g = new THREE.Group();
      g.position.set(4.4, 0.33, 2.3);

      // Keeper's cottage
      const cotBase = bx(1.15, 0.6, 0.85, 0xf2e8d8);
      cotBase.position.set(-0.8, 0.36, 0.05);
      g.add(cotBase);
      const cotRoof = cn(0.82, 0.42, 4, 0xe04848);
      cotRoof.position.set(-0.8, 0.8, 0.05);
      cotRoof.rotation.y = Math.PI / 4;
      g.add(cotRoof);
      const cotWin = bx(0.2, 0.2, 0.06, 0x88ccff, 0.2, 0x88ccff, 0.3);
      cotWin.position.set(-0.42, 0.38, 0.46);
      g.add(cotWin);
      const cotWinF = new THREE.Mesh(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(0.2, 0.2, 0.04)),
        new THREE.LineBasicMaterial({ color: 0xddccaa })
      );
      cotWinF.position.set(-0.42, 0.38, 0.47);
      g.add(cotWinF);
      const cotDoor = bx(0.18, 0.32, 0.06, 0x8b4422, 0.85);
      cotDoor.position.set(-0.95, 0.26, 0.46);
      g.add(cotDoor);
      // Chimney
      const cotChi = cy(0.06, 0.07, 0.28, 6, 0xaa7755);
      cotChi.position.set(-0.62, 0.85, -0.15);
      g.add(cotChi);

      // Rocky base
      const rock = cy(0.52, 0.62, 0.42, 14, 0x6a6a7a);
      rock.position.y = 0.21;
      g.add(rock);
      // Rock details
      [[0.22, 0.09, 0.28], [-0.22, 0.07, -0.3], [0.35, 0.06, 0.08]].forEach(([bx2, by, bz]) => {
        const r = sp(0.2, 0x7a7a8a, 0.9);
        r.scale.set(1.25, 0.68, 1.05);
        r.position.set(bx2, by, bz);
        g.add(r);
      });

      // Lighthouse tower — striped
      const stripes = [
        0xf5f0e8, 0xdd2222, 0xf5f0e8, 0xdd2222, 0xf5f0e8, 0xdd2222,
      ];
      let ty = 0.42;
      stripes.forEach((col, i) => {
        const sh = 0.42;
        const rT = 0.31 - i * 0.018;
        const seg = cy(rT, rT + 0.015, sh, 14, col);
        seg.position.y = ty + sh / 2;
        g.add(seg);
        ty += sh;
      });

      // Balcony
      const balc = cy(0.48, 0.48, 0.065, 18, 0xdddddd);
      balc.position.y = ty + 0.035;
      g.add(balc);
      // Railing
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const rp = cy(0.017, 0.017, 0.13, 4, 0xffffff);
        rp.position.set(Math.cos(a) * 0.44, ty + 0.1, Math.sin(a) * 0.44);
        g.add(rp);
      }
      const rail = new THREE.Mesh(
        new THREE.TorusGeometry(0.44, 0.015, 6, 36),
        std(0xffffff, 0.3)
      );
      rail.rotation.x = Math.PI / 2;
      rail.position.y = ty + 0.17;
      g.add(rail);
      ty += 0.1;

      // Light room (glass octagon)
      const lr = cy(0.32, 0.32, 0.42, 8, 0xaacddd, 0.12, 0xaacced, 0.28);
      lr.position.y = ty + 0.21;
      g.add(lr);
      ty += 0.42;

      // Roof cone
      const roofC = cn(0.38, 0.38, 8, 0x2a2a40);
      roofC.position.y = ty + 0.19;
      g.add(roofC);

      // Weather vane on top
      const wv = cy(0.012, 0.012, 0.3, 4, 0x888888);
      wv.position.y = ty + 0.58;
      g.add(wv);
      const wvArrow = bx(0.22, 0.03, 0.03, 0x888888);
      wvArrow.position.y = ty + 0.75;
      g.add(wvArrow);

      // Beacon glow
      const beacon = sp(0.16, 0xffffc0, 0.2, 0xffffc0, 10);
      beacon.position.y = ty - 0.04;
      g.add(beacon);
      const beaconPL = new THREE.PointLight(0xffffc0, 5, 15);
      beaconPL.position.y = ty - 0.04;
      g.add(beaconPL);

      // Rotating beam
      beamPivot = new THREE.Group();
      beamPivot.position.y = ty - 0.04;
      const beamGeo  = new THREE.ConeGeometry(0.85, 9, 12, 1, true);
      const beamMesh = new THREE.Mesh(
        beamGeo,
        new THREE.MeshBasicMaterial({ color: 0xffffc0, transparent: true, opacity: 0.085, side: THREE.DoubleSide })
      );
      beamMesh.rotation.x = Math.PI / 2;
      beamMesh.position.z = 4.5;
      beamPivot.add(beamMesh);
      g.add(beamPivot);

      // Dock / jetty
      const dockBase = bx(0.35, 0.07, 1.2, 0x9a7240, 0.9);
      dockBase.position.set(0.7, -0.35, 0.3);
      g.add(dockBase);
      [0, 0.5, 1.0].forEach(z => {
        const pile = cy(0.04, 0.04, 0.55, 4, 0x7a5a30);
        pile.position.set(0.7, -0.56, -0.28 + z);
        g.add(pile);
      });

      addPicker(g, "/contact", "Contact", 2.0);
      scene.add(g);
    }

    /* ── Sailboat in water ────────────────────────────────────────────────── */
    const boat = new THREE.Group();
    const hull = shadow(new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.32, 0.2, 14, 1, false, 0, Math.PI),
      std(0xf5e8d0, 0.7)
    ));
    hull.rotation.x = Math.PI;
    hull.position.y = -0.04;
    boat.add(hull);
    const hullB = bx(0.44, 0.12, 0.42, 0xe8d8b8, 0.75);
    hullB.position.y = -0.02;
    boat.add(hullB);
    const mast = cy(0.022, 0.022, 1.3, 4, 0xc09060);
    mast.position.y = 0.62;
    boat.add(mast);
    // Sail
    const sailGeo = new THREE.ConeGeometry(0.55, 1.0, 3);
    const sail = shadow(new THREE.Mesh(sailGeo, std(0xffffff, 0.8)));
    sail.rotation.z = 0.28;
    sail.position.set(0.08, 0.95, 0);
    boat.add(sail);
    boat.position.set(9.0, -0.44, -4.5);
    boat.rotation.y = 0.45;
    scene.add(boat);

    /* ── CARS ─────────────────────────────────────────────────────────────── */
    const carPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.6, 0.38, -1.3),
      new THREE.Vector3(-1.6, 0.38, -3.8),
      new THREE.Vector3( 0.0, 0.38, -3.8),
      new THREE.Vector3( 2.1, 0.38, -2.3),
      new THREE.Vector3( 3.6, 0.38, -1.1),
      new THREE.Vector3( 4.2, 0.38,  0.6),
      new THREE.Vector3( 4.2, 0.38,  2.1),
      new THREE.Vector3( 2.8, 0.38,  3.1),
      new THREE.Vector3( 0.8, 0.38,  3.6),
      new THREE.Vector3(-0.9, 0.38,  3.6),
      new THREE.Vector3(-2.5, 0.38,  3.0),
      new THREE.Vector3(-4.2, 0.38,  0.6),
    ], true);

    type Car = { g: THREE.Group; t: number; speed: number };
    const carDesigns = [
      { body: 0xe82020, roof: 0xcc1010 },
      { body: 0x1e55f0, roof: 0x1040cc },
      { body: 0xf0a818, roof: 0xd08800 },
      { body: 0x1ab840, roof: 0x109a30 },
      { body: 0xcc20cc, roof: 0xaa10aa },
    ];
    const cars: Car[] = carDesigns.map(({ body, roof }, i) => {
      const cg = new THREE.Group();

      const cb = bx(0.52, 0.165, 0.3, body, 0.5);
      cb.position.y = 0.083;
      cg.add(cb);
      const ct = bx(0.3, 0.145, 0.27, roof, 0.5);
      ct.position.set(-0.04, 0.25, 0);
      cg.add(ct);
      const ws = bx(0.022, 0.12, 0.24, 0x88ccff, 0.1, 0x88ccff, 0.15);
      ws.position.set(0.13, 0.24, 0);
      cg.add(ws);
      const rws = bx(0.022, 0.1, 0.24, 0x88ccff, 0.1, 0x88ccff, 0.1);
      rws.position.set(-0.16, 0.23, 0);
      cg.add(rws);

      // Wheels (4)
      [-0.17, 0.17].forEach(z => {
        [-0.16, 0.2].forEach(x => {
          const wh = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.06, 14), std(0x1a1a1a)));
          wh.rotation.z = Math.PI / 2;
          wh.position.set(x, 0.068, z);
          cg.add(wh);
          const rim = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.065, 8), std(0xbbbbbb)));
          rim.rotation.z = Math.PI / 2;
          rim.position.set(x, 0.068, z);
          cg.add(rim);
        });
      });

      // Headlights
      [-0.12, 0.12].forEach(z => {
        const hl = sp(0.04, 0xffffee, 0.2, 0xffffee, 4);
        hl.position.set(0.27, 0.092, z);
        cg.add(hl);
      });
      // Tail lights
      [-0.11, 0.11].forEach(z => {
        const tl = sp(0.032, 0xff2200, 0.2, 0xff2200, 2.5);
        tl.position.set(-0.27, 0.092, z);
        cg.add(tl);
      });

      scene.add(cg);
      return { g: cg, t: i / carDesigns.length, speed: 0.00072 + Math.random() * 0.00025 };
    });

    /* ── Interaction ──────────────────────────────────────────────────────── */
    const raycaster = new THREE.Raycaster();
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top)  / rect.height) * 2 + 1
        ), camera
      );
      const hits = raycaster.intersectObjects(clickMeshes);
      if (hits.length) {
        const { label } = hits[0].object.userData as { label: string };
        hoveredRef.current = label;
        setHovered(label);
        setTooltipPos({ x: e.clientX, y: e.clientY });
        canvas.style.cursor = "pointer";
      } else {
        hoveredRef.current = null;
        setHovered(null);
        canvas.style.cursor = "default";
      }
    };
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top)  / rect.height) * 2 + 1
        ), camera
      );
      const hits = raycaster.intersectObjects(clickMeshes);
      if (hits.length) void navigate({ to: hits[0].object.userData.to as string });
    };
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("click",     onClick);

    /* ── Resize ───────────────────────────────────────────────────────────── */
    const ro = new ResizeObserver(() => {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    });
    ro.observe(canvas);

    /* ── Animate ──────────────────────────────────────────────────────────── */
    let frame = 0, rafId = 0;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      frame++;
      const t = frame * 0.016;

      // Water ripples
      for (let i = 0; i < wAttr.count; i++) {
        wAttr.setY(i, wOrig[i] + Math.sin(t * 0.75 + i * 0.28) * 0.022);
      }
      wAttr.needsUpdate = true;

      // Lighthouse beam
      if (beamPivot) beamPivot.rotation.y = t * 1.5;

      // Robot arm
      rPiv1.rotation.y = Math.sin(t * 0.65) * 0.75;
      rPiv2.rotation.y = Math.sin(t * 0.9 + 0.9) * 0.55;

      // Ball bounce & spin
      if (ballMesh) {
        ballMesh.position.y = 0.69 + Math.abs(Math.sin(t * 2.6)) * 0.32;
        ballMesh.rotation.x += 0.055;
        ballMesh.rotation.z += 0.022;
      }

      // Graduation cap float + slow rotate
      if (gradCapGrp) {
        gradCapGrp.position.y = 1.95 + Math.sin(t * 1.1) * 0.09;
        gradCapGrp.rotation.y = t * 0.28;
      }

      // Cars
      cars.forEach(car => {
        car.t = (car.t + car.speed) % 1;
        const pos = carPath.getPoint(car.t);
        const tan = carPath.getTangent(car.t);
        car.g.position.copy(pos);
        car.g.rotation.y = Math.atan2(tan.x, tan.z);
      });

      // Trees sway (wind)
      treeGrps.forEach((tg, i) => {
        tg.rotation.z = Math.sin(t * 0.38 + i * 0.72) * 0.02;
        tg.rotation.x = Math.cos(t * 0.3  + i * 0.5)  * 0.014;
      });

      // Window flicker (office tower)
      if (frame % 75 === 0 && towerWinMats.length) {
        const wm = towerWinMats[Math.floor(Math.random() * towerWinMats.length)];
        wm.emissiveIntensity = wm.emissiveIntensity > 0.25 ? 0.08 : 0.45;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("click",     onClick);
      renderer.dispose();
    };
  }, [navigate]);

  const LEGEND = [
    { label: "About",      icon: "🎓", hint: "University Hall",  to: "/about"      },
    { label: "Experience", icon: "🏢", hint: "Credvan Tower",    to: "/experience" },
    { label: "Projects",   icon: "🔧", hint: "Workshop & Lab",   to: "/projects"   },
    { label: "Hobbies",    icon: "⚽", hint: "Soccer Stadium",   to: "/hobbies"    },
    { label: "Contact",    icon: "🔦", hint: "Lighthouse",       to: "/contact"    },
  ];

  return (
    <section
      id="universe"
      aria-label="Island city"
      className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-10 sm:py-16"
    >
      <div className="mb-6 text-center sm:mb-8">
        <p className="pill mx-auto mb-4 !bg-white/8">Explore my world</p>
        <h2 className="font-display text-3xl font-semibold sm:text-5xl">
          Click a building to explore.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          Hover a landmark · click to enter
        </p>
      </div>

      <div
        className="relative w-full overflow-hidden rounded-3xl shadow-2xl"
        style={{ height: "min(80vw, 600px)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <canvas ref={canvasRef} className="h-full w-full" style={{ display: "block" }} />

        {hovered && (
          <div
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-full border border-white/20 bg-black/80 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md"
            style={{ left: tooltipPos.x, top: tooltipPos.y - 16 }}
          >
            {hovered} →
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2 sm:gap-3">
        {LEGEND.map(l => (
          <div
            key={l.to}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs backdrop-blur-sm"
          >
            <span>{l.icon}</span>
            <span className="font-semibold text-white/90">{l.label}</span>
            <span className="text-white/35">{l.hint}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
