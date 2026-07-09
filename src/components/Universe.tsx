import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import * as THREE from "three";

export function Universe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate  = useNavigate();
  const [hovered, setHovered]       = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ── Renderer ─────────────────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const W = canvas.clientWidth  || canvas.offsetWidth  || 900;
    const H = canvas.clientHeight || canvas.offsetHeight || 520;
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    /* ── Scene ───────────────────────────────────────────────────────────── */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdaeef8);
    scene.fog = new THREE.Fog(0xdaeef8, 45, 90);

    /* ── Camera — low isometric angle (like the reference) ───────────────── */
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 200);
    camera.position.set(24, 13, 24);
    camera.lookAt(0, 2, 0);

    /* ── Lights ──────────────────────────────────────────────────────────── */
    scene.add(new THREE.HemisphereLight(0xe8f4ff, 0xd4a860, 1.1));
    const sun = new THREE.DirectionalLight(0xfff8e8, 3.0);
    sun.position.set(-16, 22, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left   = -26;
    sun.shadow.camera.right  =  26;
    sun.shadow.camera.top    =  26;
    sun.shadow.camera.bottom = -26;
    sun.shadow.camera.far    =  70;
    sun.shadow.bias = -0.0004;
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xaabbff, 0.5);
    rim.position.set(16, 6, -12);
    scene.add(rim);

    /* ── Geometry factories ──────────────────────────────────────────────── */
    const mkMat = (col: number, rough = 0.78, emi = 0, eiI = 0) =>
      new THREE.MeshStandardMaterial({ color: col, roughness: rough, metalness: 0, emissive: emi, emissiveIntensity: eiI });

    const s = (m: THREE.Mesh) => { m.castShadow = true; m.receiveShadow = true; return m; };

    const bx  = (w: number, h: number, d: number, c: number, r = 0.78, e = 0, ei = 0) =>
      s(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mkMat(c, r, e, ei)));
    const cy  = (rT: number, rB: number, h: number, sg: number, c: number, r = 0.72, e = 0, ei = 0) =>
      s(new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, h, sg), mkMat(c, r, e, ei)));
    const sp  = (r: number, c: number, rg = 0.65, e = 0, ei = 0) =>
      s(new THREE.Mesh(new THREE.SphereGeometry(r, 22, 22), mkMat(c, rg, e, ei)));
    const cn  = (r: number, h: number, sg: number, c: number, rg = 0.8) =>
      s(new THREE.Mesh(new THREE.ConeGeometry(r, h, sg), mkMat(c, rg)));

    /* ── PALETTE ─────────────────────────────────────────────────────────── */
    const SAND   = 0xd49030;
    const GRASS  = 0x2eb820;
    const WATER  = 0x38b8ec;

    /* ══════════════════════════════════════════════════════════════════════
       ISLAND — organic extruded shape
    ══════════════════════════════════════════════════════════════════════ */
    const shape = new THREE.Shape();
    shape.moveTo( 9,  0);
    shape.bezierCurveTo(11,  2,  9,  7,  5,  9);
    shape.bezierCurveTo( 2, 11, -2, 10, -5,  8.5);
    shape.bezierCurveTo(-8,  7,-10,  3,-10.5,-1);
    shape.bezierCurveTo(-11, -4, -8.5,-7.5,-5.5,-8.5);
    shape.bezierCurveTo(-2, -10,  3, -9.5,  6,  -8);
    shape.bezierCurveTo( 9,  -6, 10,  -3,  9,   0);

    const DEPTH = 1.4;
    const islandGeo = new THREE.ExtrudeGeometry(shape, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: 0.55,
      bevelSize: 0.55,
      bevelSegments: 6,
    });
    islandGeo.computeBoundingBox();
    const bb = islandGeo.boundingBox!;
    const cx = (bb.max.x + bb.min.x) / 2;
    const cy2 = (bb.max.y + bb.min.y) / 2;
    islandGeo.translate(-cx, -cy2, 0);

    const islandMesh = s(new THREE.Mesh(islandGeo, mkMat(SAND, 0.96)));
    islandMesh.rotation.x = -Math.PI / 2;
    islandMesh.position.y = -0.55;
    scene.add(islandMesh);

    // Ground Y = top surface of island = DEPTH + bevelThickness - offset
    const GY = DEPTH - 0.55 + 0.55; // = 1.4 (approx top face)

    // Sandy top disc (slightly above to cover seams)
    const topDisc = s(new THREE.Mesh(
      new THREE.CylinderGeometry(10.2, 10.2, 0.08, 48),
      mkMat(0xd89838, 0.96)
    ));
    topDisc.position.y = GY + 0.01;
    scene.add(topDisc);

    /* ── WATER ───────────────────────────────────────────────────────────── */
    const wGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
    const wMesh = s(new THREE.Mesh(wGeo,
      new THREE.MeshStandardMaterial({ color: WATER, roughness: 0.04, metalness: 0.7, transparent: true, opacity: 0.9 })
    ));
    wMesh.rotation.x = -Math.PI / 2;
    wMesh.position.y = -0.62;
    scene.add(wMesh);
    const wAttr = wGeo.attributes.position as THREE.BufferAttribute;
    const wOrig = Float32Array.from({ length: wAttr.count }, (_, i) => wAttr.getY(i));

    /* ══════════════════════════════════════════════════════════════════════
       HUGE DUNES — dominant landscape feature
    ══════════════════════════════════════════════════════════════════════ */
    const duneDefs = [
      { x: -2.5, z: -4.5, r: 3.2, sy: 0.54, c: 0xcf8a2a },
      { x:  3.0, z: -5.0, r: 2.7, sy: 0.50, c: 0xca8425 },
      { x:  5.5, z: -2.5, r: 2.2, sy: 0.52, c: 0xd08c2e },
      { x: -5.5, z:  2.0, r: 2.0, sy: 0.48, c: 0xcc8828 },
      { x:  2.0, z:  5.0, r: 1.8, sy: 0.46, c: 0xcf8a2a },
      { x: -2.0, z:  5.8, r: 1.4, sy: 0.44, c: 0xca8828 },
      { x:  6.0, z:  3.5, r: 1.5, sy: 0.47, c: 0xd08c2e },
      { x: -3.5, z:  0.5, r: 1.1, sy: 0.45, c: 0xcb872a },
      { x:  0.5, z: -7.0, r: 1.6, sy: 0.50, c: 0xcc8828 },
      { x: -6.5, z: -2.0, r: 1.4, sy: 0.48, c: 0xcf8a28 },
    ];
    duneDefs.forEach(({ x, z, r, sy, c }) => {
      const d = s(new THREE.Mesh(
        new THREE.SphereGeometry(r, 28, 28, 0, Math.PI * 2, 0, Math.PI * 0.5),
        mkMat(c, 0.96)
      ));
      d.scale.y = sy;
      d.position.set(x, GY, z);
      scene.add(d);
    });

    /* ── GRASS PATCHES ───────────────────────────────────────────────────── */
    [
      { x: -4.0, z: -0.5, r: 2.2 },
      { x:  4.2, z: -1.0, r: 1.9 },
      { x: -3.0, z:  3.2, r: 2.0 },
      { x:  0.5, z:  2.5, r: 1.4 },
    ].forEach(({ x, z, r }) => {
      const g = s(new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.05, 28), mkMat(0x28a818, 0.96)));
      g.position.set(x, GY + 0.02, z);
      scene.add(g);
    });

    /* ── ROADS ───────────────────────────────────────────────────────────── */
    const roadMat = mkMat(0x333340, 0.99);
    const markMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.12 });

    const addRoad = (x1: number, z1: number, x2: number, z2: number, w = 0.65) => {
      const dx = x2 - x1, dz = z2 - z1;
      const len = Math.sqrt(dx * dx + dz * dz);
      const rm = s(new THREE.Mesh(new THREE.BoxGeometry(len, 0.05, w), roadMat));
      rm.position.set((x1 + x2) / 2, GY + 0.04, (z1 + z2) / 2);
      rm.rotation.y = Math.atan2(dx, dz);
      scene.add(rm);
      for (let d = 0.6; d < len - 0.4; d += 1.0) {
        const mk2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.055, 0.065), markMat);
        mk2.position.x = d - len / 2;
        rm.add(mk2);
      }
    };

    addRoad(-3.8, -1.4,  0.2, -4.2);
    addRoad( 0.2, -4.2,  4.0, -1.2);
    addRoad( 4.0, -1.2,  4.5,  2.4);
    addRoad( 4.5,  2.4, -2.8,  3.4);
    addRoad(-2.8,  3.4, -4.5,  0.8);
    addRoad(-4.5,  0.8, -3.8, -1.4);
    addRoad(-3.8, -1.4,  4.5,  2.4, 0.5);

    /* ── LOLLIPOP TREES (sphere canopy) ──────────────────────────────────── */
    const treeGrps: THREE.Group[] = [];
    const treeDefs = [
      [-5.8, 0.6, 1.1], [-5.5, -1.8, 1.0], [-5.3, 2.8, 1.15], [-2.0, -5.2, 0.95],
      [ 0.5, -5.5, 0.90], [ 5.6, -1.0, 1.0], [ 5.4,  3.5, 1.05], [ 1.5,  4.8, 0.95],
      [-1.2,  5.2, 1.0],  [-3.5,  4.5, 1.1], [ 2.8,  4.2, 0.90], [-5.0, -3.5, 0.95],
      [ 4.4, -3.5, 0.95], [ 2.4, -3.8, 0.88], [-2.2, -1.5, 0.82], [ 1.2,  1.8, 0.85],
      [ 3.2,  0.8, 0.78], [-1.0,  3.2, 0.80], [ 0.5, -2.5, 0.75], [-4.0,  1.8, 0.85],
    ];
    treeDefs.forEach(([x, z, scale]) => {
      const g  = new THREE.Group();
      const sc = scale as number;
      // Trunk
      const trunk = cy(0.07, 0.1, sc * 0.6, 6, 0x8b5a20);
      trunk.position.y = sc * 0.3;
      g.add(trunk);
      // Round canopy (lollipop style — like the reference)
      const canopy = sp(sc * 0.55, GRASS, 0.65);
      canopy.position.y = sc * 0.72;
      g.add(canopy);
      // Second smaller sphere on top for depth
      const topBud = sp(sc * 0.35, 0x28c818, 0.65);
      topBud.position.y = sc * 1.08;
      g.add(topBud);
      g.position.set(x as number, GY, z as number);
      scene.add(g);
      treeGrps.push(g);
    });

    /* ── STREETLAMPS ─────────────────────────────────────────────────────── */
    const addLamp = (x: number, z: number) => {
      const g = new THREE.Group();
      const pole = cy(0.035, 0.045, 1.6, 6, 0x555568);
      pole.position.y = 0.8;
      g.add(pole);
      const arm = bx(0.28, 0.04, 0.04, 0x555568);
      arm.position.set(0.14, 1.63, 0);
      g.add(arm);
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
        mkMat(0xffe880, 0.4, 0xffe880, 2.5)
      );
      head.rotation.x = Math.PI;
      head.position.set(0.25, 1.63, 0);
      g.add(head);
      const pl = new THREE.PointLight(0xffe080, 0.9, 4.5);
      pl.position.set(0.25, 1.63, 0);
      g.add(pl);
      g.position.set(x, GY, z);
      scene.add(g);
    };
    [[-2.4,-2.3],[-0.7,-3.8],[2.2,-2.8],[3.8,0.6],[2.8,2.8],[0.2,3.8],[-2.4,2.5],[-4.2,0.3]].forEach(([x, z]) => addLamp(x, z));

    /* ══════════════════════════════════════════════════════════════════════
       BUILDINGS
    ══════════════════════════════════════════════════════════════════════ */
    const clickMeshes: THREE.Mesh[] = [];
    const pick = (parent: THREE.Group, to: string, label: string, r = 1.8) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
      m.userData = { to, label };
      parent.add(m);
      clickMeshes.push(m);
    };

    let gradCap: THREE.Group | null = null;
    let ballMesh: THREE.Mesh | null = null;
    let beamPivot: THREE.Group | null = null;
    const rPiv1 = new THREE.Group();
    const rPiv2 = new THREE.Group();
    const winMats: THREE.MeshStandardMaterial[] = [];

    /* ═══ ABOUT — Grand University Hall (cream stone, wide, arched) ══════════ */
    {
      const g = new THREE.Group();
      g.position.set(-4.0, GY, -1.4);

      // Wide stone base
      const base = bx(3.2, 0.18, 2.2, 0xe8dac8);
      base.position.y = 0.09;
      g.add(base);

      // Main hall body — warm cream
      const hall = bx(2.8, 1.2, 1.8, 0xf2e8d0);
      hall.position.y = 0.78;
      g.add(hall);

      // Two flanking towers
      [-1.5, 1.5].forEach(x => {
        const tower = bx(0.75, 1.6, 1.8, 0xeadec5);
        tower.position.set(x, 0.98, 0);
        g.add(tower);
        // Tower conical roof
        const tRoof = cn(0.6, 0.7, 6, 0xc87828, 0.75);
        tRoof.position.set(x, 2.15, 0);
        g.add(tRoof);
        // Tower windows
        const tw = bx(0.2, 0.28, 0.06, 0xa8c8e8, 0.25, 0xa8c8e8, 0.35);
        tw.position.set(x, 1.0, 0.92);
        g.add(tw);
      });

      // Gabled main roof (stacked slices)
      for (let i = 0; i < 14; i++) {
        const d = 1.8 - i * 0.128;
        if (d < 0.12) break;
        const sl = bx(2.8, 0.08, d, 0xd4b870);
        sl.position.y = 1.44 + i * 0.04;
        g.add(sl);
      }

      // Columns across front
      for (let i = -3; i <= 3; i++) {
        const col = cy(0.055, 0.065, 1.1, 8, 0xf8f0e2);
        col.position.set(i * 0.35, 0.73, 0.94);
        g.add(col);
        const cap = bx(0.15, 0.06, 0.15, 0xf0e8d8);
        cap.position.set(i * 0.35, 1.34, 0.94);
        g.add(cap);
      }

      // Front steps
      for (let i = 0; i < 4; i++) {
        const st = bx(1.4, 0.07, 0.26, 0xe2d0b0);
        st.position.set(0, 0.07 + i * 0.07, 1.06 + i * 0.13);
        g.add(st);
      }

      // Arched windows (front)
      [-0.7, 0, 0.7].forEach(x => {
        const wb = bx(0.26, 0.42, 0.07, 0xa8c8e8, 0.2, 0xa8c8e8, 0.35);
        wb.position.set(x, 0.74, 0.93);
        g.add(wb);
        const wa = new THREE.Mesh(
          new THREE.CylinderGeometry(0.13, 0.13, 0.07, 10, 1, false, 0, Math.PI),
          mkMat(0xa8c8e8, 0.2, 0xa8c8e8, 0.35)
        );
        wa.rotation.z = Math.PI / 2;
        wa.position.set(x, 0.99, 0.93);
        s(wa);
        g.add(wa);
      });

      // Entrance door
      const door = bx(0.44, 0.65, 0.08, 0x6a3a18, 0.85);
      door.position.set(0, 0.48, 0.94);
      g.add(door);

      // Gold plaque
      const plaque = bx(0.55, 0.11, 0.06, 0xf5c830, 0.3, 0xf5c830, 1.5);
      plaque.position.set(0, 0.23, 0.95);
      g.add(plaque);

      // Clock tower
      const clockFace = s(new THREE.Mesh(
        new THREE.CylinderGeometry(0.17, 0.17, 0.06, 20),
        mkMat(0xf8f5e8, 0.5, 0xfaf8e0, 0.5)
      ));
      clockFace.rotation.x = Math.PI / 2;
      clockFace.position.set(0, 1.08, 0.95);
      g.add(clockFace);
      const clockRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.17, 0.03, 8, 24),
        mkMat(0xd4a830, 0.5, 0xd4a830, 0.9)
      );
      clockRing.rotation.x = Math.PI / 2;
      clockRing.position.set(0, 1.08, 0.96);
      g.add(clockRing);

      // Floating graduation cap
      gradCap = new THREE.Group();
      gradCap.position.set(0, 2.35, 0);
      const board = bx(0.9, 0.06, 0.9, 0x111122);
      gradCap.add(board);
      const top = bx(0.26, 0.16, 0.26, 0x111122);
      top.position.y = -0.11;
      gradCap.add(top);
      const tassel = cy(0.014, 0.014, 0.34, 4, 0xffd700, 0.4, 0xffcc00, 2);
      tassel.position.set(0.45, -0.28, 0);
      gradCap.add(tassel);
      g.add(gradCap);

      const pl = new THREE.PointLight(0xaa88ff, 1.5, 6);
      pl.position.set(0, 1.5, 0);
      g.add(pl);

      pick(g, "/about", "About", 2.2);
      scene.add(g);
    }

    /* ═══ EXPERIENCE — Glass Tower with Crane ════════════════════════════════ */
    {
      const g = new THREE.Group();
      g.position.set(0.2, GY, -4.2);

      // Wide glass podium
      const pod = bx(3.0, 0.38, 3.0, 0xd0e4f8);
      pod.position.y = 0.19;
      g.add(pod);

      // Lobby glass wall
      const lobby = bx(1.5, 0.72, 0.1, 0x88bbee, 0.15, 0x88bbee, 0.2);
      lobby.position.set(0, 0.74, 1.55);
      g.add(lobby);
      const lobbyDoor = bx(0.55, 0.62, 0.09, 0x66aadd, 0.12, 0x66aadd, 0.3);
      lobbyDoor.position.set(0, 0.69, 1.62);
      g.add(lobbyDoor);

      // CREDVAN neon sign
      const sign = bx(1.6, 0.13, 0.07, 0xff6600, 0.2, 0xff6600, 7);
      sign.position.set(0, 1.15, 1.58);
      g.add(sign);

      // Main tower — glass curtain wall, tapered upward
      const sections = [
        { y: 0.38, w: 1.9, h: 0.75, d: 1.9 },
        { y: 1.13, w: 1.75, h: 0.75, d: 1.75 },
        { y: 1.88, w: 1.6,  h: 0.72, d: 1.6  },
        { y: 2.60, w: 1.4,  h: 0.72, d: 1.4  },
        { y: 3.32, w: 1.2,  h: 0.70, d: 1.2  },
        { y: 4.02, w: 1.0,  h: 0.68, d: 1.0  },
        { y: 4.70, w: 0.82, h: 0.60, d: 0.82 },
      ];
      sections.forEach(({ y, w, h, d }) => {
        // Glass body
        const sec = bx(w, h, d, 0x1a3a88, 0.15, 0x0a2880, 0.06);
        sec.position.y = y + h / 2;
        g.add(sec);
        // Floor plate
        const fp = bx(w + 0.12, 0.04, d + 0.12, 0xe0ecff);
        fp.position.y = y;
        g.add(fp);
        // Window strips — front & back
        const cols = Math.max(3, Math.round(w / 0.26));
        for (let c = 0; c < cols; c++) {
          const wx = (c - (cols - 1) / 2) * (w / cols);
          [d / 2 + 0.03, -d / 2 - 0.03].forEach(oz => {
            const wm = new THREE.MeshStandardMaterial({
              color: 0x88ccff, roughness: 0.07, metalness: 0.65,
              emissive: 0x4488cc,
              emissiveIntensity: Math.random() > 0.25 ? 0.5 : 0.1,
              transparent: true, opacity: 0.9,
            });
            winMats.push(wm);
            const win = new THREE.Mesh(new THREE.BoxGeometry(w / cols * 0.7, h * 0.58, 0.04), wm);
            win.position.set(wx, y + h / 2, oz);
            g.add(win);
          });
          // Side windows
          [w / 2 + 0.03, -w / 2 - 0.03].forEach(ox => {
            const wm2 = new THREE.MeshStandardMaterial({
              color: 0x88ccff, roughness: 0.07, metalness: 0.65,
              emissive: 0x4488cc,
              emissiveIntensity: Math.random() > 0.3 ? 0.45 : 0.08,
              transparent: true, opacity: 0.88,
            });
            winMats.push(wm2);
            const sw = new THREE.Mesh(new THREE.BoxGeometry(0.04, h * 0.52, d / 3 * 0.7), wm2);
            sw.position.set(ox, y + h / 2, 0);
            g.add(sw);
          });
        }
      });

      // Top cap + antenna
      const cap = bx(0.68, 0.85, 0.68, 0x122888, 0.14, 0x2244cc, 0.25);
      cap.position.y = 5.6;
      g.add(cap);
      const ant = cy(0.022, 0.022, 1.2, 4, 0x999aaa);
      ant.position.y = 6.3;
      g.add(ant);
      const antTip = sp(0.07, 0xff1144, 0.3, 0xff1144, 5);
      antTip.position.y = 6.95;
      g.add(antTip);

      // Helipad
      const hp = cy(0.62, 0.62, 0.045, 20, 0xdde8ff);
      hp.position.y = 5.18;
      g.add(hp);
      [bx(0.42, 0.025, 0.05, 0xffffff, 0.3, 0xffffff, 0.5), bx(0.05, 0.025, 0.42, 0xffffff, 0.3, 0xffffff, 0.5)].forEach(m => {
        m.position.y = 5.2;
        g.add(m);
      });

      // Yellow crane
      const cranePole = cy(0.065, 0.065, 5.2, 6, 0xf5c800);
      cranePole.position.set(-1.9, 2.9, 0);
      g.add(cranePole);
      const craneBoom = cy(0.045, 0.045, 3.2, 4, 0xf5c800);
      craneBoom.rotation.z = Math.PI / 2;
      craneBoom.position.set(-1.9, 5.65, 0);
      g.add(craneBoom);
      const craneCab = bx(0.32, 0.28, 0.28, 0xf5c800, 0.6);
      craneCab.position.set(-1.9, 4.72, 0);
      g.add(craneCab);
      const craneWire = cy(0.012, 0.012, 1.1, 4, 0xaaaaaa);
      craneWire.position.set(-0.7, 5.1, 0);
      g.add(craneWire);
      const craneHook = sp(0.07, 0x444444);
      craneHook.position.set(-0.7, 4.5, 0);
      g.add(craneHook);

      const pl = new THREE.PointLight(0x4488ff, 3, 12);
      pl.position.set(0, 4, 0);
      g.add(pl);

      pick(g, "/experience", "Experience", 2.8);
      scene.add(g);
    }

    /* ═══ PROJECTS — Workshop & Lab (chunky yellow) ══════════════════════════ */
    {
      const g = new THREE.Group();
      g.position.set(4.2, GY, -1.2);

      // Foundation
      const found = bx(3.0, 0.14, 2.2, 0xc8c098);
      found.position.y = 0.07;
      g.add(found);

      // Main workshop body — warm yellow
      const body = bx(2.4, 1.05, 1.75, 0xf2d830, 0.72);
      body.position.y = 0.665;
      g.add(body);

      // Barrel vault roof (half-cylinder)
      const vaultGeo = new THREE.CylinderGeometry(1.0, 1.0, 2.5, 30, 1, false, -Math.PI / 2, Math.PI);
      const vault = s(new THREE.Mesh(vaultGeo, mkMat(0xe8c420, 0.77)));
      vault.rotation.z = Math.PI / 2;
      vault.position.set(0, 1.2, 0);
      g.add(vault);

      // Side annex (lower)
      const annex = bx(0.85, 0.82, 1.75, 0xead022, 0.73);
      annex.position.set(-1.62, 0.52, 0);
      g.add(annex);
      const annexRoof = cn(0.72, 0.55, 6, 0xd8b018);
      annexRoof.position.set(-1.62, 1.1, 0);
      g.add(annexRoof);

      // Chimney + smoke
      const ch = cy(0.075, 0.095, 1.0, 8, 0x555555);
      ch.position.set(0.5, 2.08, -0.42);
      g.add(ch);
      const chCap = cy(0.12, 0.075, 0.08, 8, 0x333333);
      chCap.position.set(0.5, 2.6, -0.42);
      g.add(chCap);
      // Puff
      [0, 0.22, 0.42].forEach((dy, i) => {
        const puff = sp(0.12 - i * 0.02, 0xdddddd, 0.5, 0xdddddd, 0.18);
        puff.position.set(0.5 + i * 0.06, 2.75 + dy, -0.42);
        g.add(puff);
      });

      // Skylights
      [-0.6, 0.6].forEach(x => {
        const sky = bx(0.32, 0.07, 1.0, 0x00ff88, 0.2, 0x00ff88, 2.8);
        sky.position.set(x, 1.9, 0);
        g.add(sky);
      });

      // Garage door
      const gar = bx(0.72, 0.82, 0.08, 0x5588aa, 0.28, 0x4477aa, 0.3);
      gar.position.set(0.62, 0.51, 0.91);
      g.add(gar);
      for (let i = 0; i < 6; i++) {
        const slat = bx(0.72, 0.025, 0.08, 0x4477aa);
        slat.position.set(0.62, 0.15 + i * 0.15, 0.94);
        g.add(slat);
      }

      // Front window
      const wf = bx(0.42, 0.36, 0.08, 0x88aacc, 0.2, 0x88aacc, 0.25);
      wf.position.set(-0.42, 0.66, 0.91);
      g.add(wf);

      // BitGold coins
      for (let i = 0; i < 8; i++) {
        const coin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.14, 0.058, 22),
          new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffaa00, emissiveIntensity: 1.8, roughness: 0.12, metalness: 0.95 })
        );
        coin.position.set(-1.05, 0.13 + i * 0.06, 0.68);
        coin.castShadow = true;
        g.add(coin);
      }

      // Robot arm
      const armBase = cy(0.14, 0.17, 0.35, 8, 0x4a7a4a);
      armBase.position.set(1.3, 0.3, -0.35);
      g.add(armBase);
      rPiv1.position.set(1.3, 0.49, -0.35);
      g.add(rPiv1);
      const seg1 = cy(0.062, 0.076, 0.62, 6, 0x5a8a5a);
      seg1.position.y = 0.31;
      rPiv1.add(seg1);
      const joint = sp(0.092, 0x3a6a3a, 0.5);
      joint.position.y = 0.62;
      rPiv1.add(joint);
      rPiv2.position.set(0, 0.62, 0);
      rPiv1.add(rPiv2);
      const seg2 = cy(0.046, 0.06, 0.45, 6, 0x6a9a6a);
      seg2.position.y = 0.225;
      rPiv2.add(seg2);
      const claw = bx(0.18, 0.08, 0.08, 0x88bb88, 0.45, 0x44ff44, 0.7);
      claw.position.set(0.12, 0.45, 0);
      rPiv2.add(claw);

      const pl = new THREE.PointLight(0x88ff44, 1.8, 7);
      pl.position.set(0, 1.8, 0);
      g.add(pl);

      pick(g, "/projects", "Projects", 2.2);
      scene.add(g);
    }

    /* ═══ HOBBIES — Soccer Stadium ═══════════════════════════════════════════ */
    {
      const g = new THREE.Group();
      g.position.set(-2.8, GY, 3.4);

      // Stadium perimeter wall — warm terracotta
      const wall = bx(3.4, 0.68, 2.7, 0xf0e0c8);
      wall.position.y = 0.34;
      g.add(wall);

      // Corner arch pillars
      [[-1.6,-1.3],[1.6,-1.3],[-1.6,1.3],[1.6,1.3]].forEach(([x,z]) => {
        const pillar = bx(0.22, 0.72, 0.22, 0xe0ccb0);
        pillar.position.set(x, 0.36, z);
        g.add(pillar);
      });

      // Pitch
      const pitch = bx(2.95, 0.07, 2.2, 0x22991a);
      pitch.position.y = 0.725;
      g.add(pitch);

      // Field markings
      const cL = bx(0.03, 0.075, 2.2, 0xffffff, 0.3, 0xffffff, 0.2);
      cL.position.y = 0.77;
      g.add(cL);
      const cCirc = new THREE.Mesh(
        new THREE.TorusGeometry(0.46, 0.028, 6, 40),
        mkMat(0xffffff, 0.3, 0xffffff, 0.2)
      );
      cCirc.rotation.x = Math.PI / 2;
      cCirc.position.y = 0.776;
      g.add(cCirc);

      // Goal posts
      [-1.3, 1.3].forEach(x => {
        const cb = cy(0.024, 0.024, 0.8, 6, 0xffffff, 0.3, 0xffffff, 0.45);
        cb.rotation.z = Math.PI / 2;
        cb.position.set(x, 1.1, 0);
        g.add(cb);
        [-0.4, 0.4].forEach(z => {
          const post = cy(0.024, 0.024, 0.56, 6, 0xffffff, 0.3, 0xffffff, 0.45);
          post.position.set(x, 0.98, z);
          g.add(post);
        });
      });

      // Bleachers — bright red on both long sides
      [-1.22, 1.22].forEach(z => {
        const stand = bx(3.4, 0.45, 0.3, 0xdd2222);
        stand.position.set(0, 0.565, z);
        g.add(stand);
        for (let row = 0; row < 4; row++) {
          const rowBar = bx(3.4, 0.04, 0.06, 0xffffff, 0.3, 0xffffff, 0.08);
          rowBar.position.set(0, 0.38 + row * 0.12, z + (z > 0 ? -0.06 : 0.06));
          g.add(rowBar);
        }
        const stRoof = bx(3.4, 0.07, 0.25, 0xbb1818);
        stRoof.position.set(0, 0.82, z + (z > 0 ? -0.04 : 0.04));
        g.add(stRoof);
      });

      // Floodlights
      [[-1.55,-1.2],[1.55,-1.2],[-1.55,1.2],[1.55,1.2]].forEach(([x,z]) => {
        const fp = cy(0.04, 0.04, 1.35, 4, 0x888888);
        fp.position.set(x, 1.07, z);
        g.add(fp);
        const fl = bx(0.26, 0.07, 0.12, 0xffffcc, 0.2, 0xffffcc, 3.5);
        fl.position.set(x, 1.78, z);
        g.add(fl);
        new THREE.PointLight(0xffffcc, 0.7, 4).position.set(x, 1.78, z);
        const fll = new THREE.PointLight(0xffffcc, 0.7, 4);
        fll.position.set(x, 1.78, z);
        g.add(fll);
      });

      // Scoreboard
      const sbp1 = cy(0.044, 0.044, 1.2, 6, 0x555566);
      sbp1.position.set(-0.35, 1.0, -1.45);
      g.add(sbp1);
      const sbp2 = cy(0.044, 0.044, 1.2, 6, 0x555566);
      sbp2.position.set(0.35, 1.0, -1.45);
      g.add(sbp2);
      const sbBrd = bx(0.9, 0.52, 0.08, 0x111122);
      sbBrd.position.set(0, 1.5, -1.45);
      g.add(sbBrd);
      const sbScr = bx(0.76, 0.38, 0.08, 0x002200, 0.5, 0x00ff44, 0.6);
      sbScr.position.set(0, 1.5, -1.43);
      g.add(sbScr);

      // Ball
      ballMesh = sp(0.125, 0xffffff);
      ballMesh.position.set(0.3, 0.77, 0.2);
      g.add(ballMesh);

      const pl = new THREE.PointLight(0x44ff44, 1.5, 7);
      pl.position.set(0, 2.2, 0);
      g.add(pl);

      pick(g, "/hobbies", "Hobbies", 2.2);
      scene.add(g);
    }

    /* ═══ CONTACT — Lighthouse & Keeper's Cottage ════════════════════════════ */
    {
      const g = new THREE.Group();
      g.position.set(4.7, GY, 2.5);

      // Keeper's cottage
      const cott = bx(1.3, 0.7, 0.9, 0xf2e8d8);
      cott.position.set(-0.92, 0.42, 0.08);
      g.add(cott);
      const cottRoof = cn(0.94, 0.5, 4, 0xe04848);
      cottRoof.position.set(-0.92, 0.97, 0.08);
      cottRoof.rotation.y = Math.PI / 4;
      g.add(cottRoof);
      const cottWin = bx(0.24, 0.22, 0.07, 0x88ccff, 0.2, 0x88ccff, 0.32);
      cottWin.position.set(-0.48, 0.45, 0.48);
      g.add(cottWin);
      const cottDoor = bx(0.2, 0.36, 0.07, 0x8b4422, 0.85);
      cottDoor.position.set(-1.08, 0.32, 0.48);
      g.add(cottDoor);
      const cottChi = cy(0.065, 0.075, 0.32, 6, 0xaa7755);
      cottChi.position.set(-0.7, 1.05, -0.18);
      g.add(cottChi);
      const puffS = sp(0.1, 0xdddddd, 0.5, 0xdddddd, 0.15);
      puffS.position.set(-0.7, 1.25, -0.18);
      g.add(puffS);

      // Rocky base
      const rock = cy(0.58, 0.7, 0.48, 14, 0x6a6a7a);
      rock.position.y = 0.24;
      g.add(rock);
      [[0.24,0.1,0.3],[-0.24,0.08,-0.32],[0.38,0.06,0.1]].forEach(([bx2,by,bz]) => {
        const rk = sp(0.22, 0x7a7a8a, 0.9);
        rk.scale.set(1.3, 0.65, 1.05);
        rk.position.set(bx2, by, bz);
        g.add(rk);
      });

      // Striped lighthouse tower
      const cols = [0xf5f0e8, 0xdd2222, 0xf5f0e8, 0xdd2222, 0xf5f0e8, 0xdd2222];
      let ty = 0.48;
      cols.forEach((col, i) => {
        const sh = 0.45;
        const rT = 0.33 - i * 0.02;
        const seg = cy(rT, rT + 0.017, sh, 14, col);
        seg.position.y = ty + sh / 2;
        g.add(seg);
        ty += sh;
      });

      // Balcony
      const balc = cy(0.5, 0.5, 0.07, 18, 0xdddddd);
      balc.position.y = ty + 0.038;
      g.add(balc);
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const rp = cy(0.018, 0.018, 0.14, 4, 0xffffff);
        rp.position.set(Math.cos(a) * 0.46, ty + 0.11, Math.sin(a) * 0.46);
        g.add(rp);
      }
      const rail = new THREE.Mesh(
        new THREE.TorusGeometry(0.46, 0.016, 6, 36),
        mkMat(0xffffff, 0.3)
      );
      rail.rotation.x = Math.PI / 2;
      rail.position.y = ty + 0.18;
      g.add(rail);
      ty += 0.11;

      // Glass light room
      const lr = cy(0.34, 0.34, 0.44, 8, 0xaaccdd, 0.12, 0xaaccdd, 0.3);
      lr.position.y = ty + 0.22;
      g.add(lr);
      ty += 0.44;

      // Roof
      const rfc = cn(0.4, 0.42, 8, 0x2a2a40);
      rfc.position.y = ty + 0.21;
      g.add(rfc);

      // Beacon
      const bcn = sp(0.17, 0xffffc0, 0.2, 0xffffc0, 10);
      bcn.position.y = ty - 0.06;
      g.add(bcn);
      const bcnPL = new THREE.PointLight(0xffffc0, 5, 18);
      bcnPL.position.y = ty - 0.06;
      g.add(bcnPL);

      // Rotating beam
      beamPivot = new THREE.Group();
      beamPivot.position.y = ty - 0.06;
      const beamMesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.9, 10, 12, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
      );
      beamMesh.rotation.x = Math.PI / 2;
      beamMesh.position.z = 5;
      beamPivot.add(beamMesh);
      g.add(beamPivot);

      // Dock
      const dock = bx(0.38, 0.08, 1.4, 0x9a7240, 0.9);
      dock.position.set(0.72, -0.3, 0.35);
      g.add(dock);
      [0, 0.55, 1.1].forEach(z => {
        const pile = cy(0.045, 0.045, 0.62, 4, 0x7a5a30);
        pile.position.set(0.72, -0.52, -0.38 + z);
        g.add(pile);
      });

      pick(g, "/contact", "Contact", 2.2);
      scene.add(g);
    }

    /* ── SAILBOAT ─────────────────────────────────────────────────────────── */
    const boat = new THREE.Group();
    const hull = s(new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.36, 0.22, 14, 1, false, 0, Math.PI),
      mkMat(0xf5e8d0, 0.72)
    ));
    hull.rotation.x = Math.PI;
    hull.position.y = -0.03;
    boat.add(hull);
    const hullD = bx(0.5, 0.14, 0.48, 0xe8d8b8, 0.76);
    hullD.position.y = -0.02;
    boat.add(hullD);
    const mast2 = cy(0.024, 0.024, 1.4, 4, 0xb08050);
    mast2.position.y = 0.68;
    boat.add(mast2);
    const sailMesh = s(new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.1, 3), mkMat(0xffffff, 0.82)));
    sailMesh.rotation.z = 0.26;
    sailMesh.position.set(0.1, 1.05, 0);
    boat.add(sailMesh);
    boat.position.set(10, GY - 1.65, -5.5);
    boat.rotation.y = 0.4;
    scene.add(boat);

    /* ── CARS ─────────────────────────────────────────────────────────────── */
    const carPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.8, GY + 0.06, -1.4),
      new THREE.Vector3(-1.8, GY + 0.06, -4.3),
      new THREE.Vector3( 0.2, GY + 0.06, -4.4),
      new THREE.Vector3( 2.3, GY + 0.06, -2.5),
      new THREE.Vector3( 4.0, GY + 0.06, -1.2),
      new THREE.Vector3( 4.6, GY + 0.06,  0.7),
      new THREE.Vector3( 4.6, GY + 0.06,  2.4),
      new THREE.Vector3( 3.0, GY + 0.06,  3.5),
      new THREE.Vector3( 0.8, GY + 0.06,  4.0),
      new THREE.Vector3(-1.0, GY + 0.06,  4.0),
      new THREE.Vector3(-2.8, GY + 0.06,  3.4),
      new THREE.Vector3(-4.6, GY + 0.06,  0.8),
    ], true);

    type Car = { g: THREE.Group; t: number; speed: number };
    const carColors = [
      { body: 0xe82020, roof: 0xcc1010 },
      { body: 0x2255ee, roof: 0x1144cc },
      { body: 0xf0a818, roof: 0xd09000 },
      { body: 0x1ab840, roof: 0x108a30 },
      { body: 0xcc20cc, roof: 0xaa10aa },
      { body: 0xffffff, roof: 0xdddddd },
    ];
    const cars: Car[] = carColors.map(({ body, roof }, i) => {
      const cg = new THREE.Group();
      const cb = bx(0.55, 0.175, 0.32, body, 0.5);
      cb.position.y = 0.088;
      cg.add(cb);
      const ct = bx(0.32, 0.155, 0.29, roof, 0.5);
      ct.position.set(-0.04, 0.268, 0);
      cg.add(ct);
      const ws = bx(0.024, 0.13, 0.26, 0x88ccff, 0.12, 0x88ccff, 0.16);
      ws.position.set(0.14, 0.268, 0);
      cg.add(ws);
      [-0.18, 0.18].forEach(z => {
        [-0.18, 0.2].forEach(x => {
          const wh = s(new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.065, 14), mkMat(0x1a1a1a)));
          wh.rotation.z = Math.PI / 2;
          wh.position.set(x, 0.072, z);
          cg.add(wh);
          const rim = s(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.068, 8), mkMat(0xbbbbbb)));
          rim.rotation.z = Math.PI / 2;
          rim.position.set(x, 0.072, z);
          cg.add(rim);
        });
      });
      [-0.13, 0.13].forEach(z => {
        const hl = sp(0.042, 0xffffee, 0.2, 0xffffee, 4.5);
        hl.position.set(0.285, 0.1, z);
        cg.add(hl);
        const tl = sp(0.034, 0xff2200, 0.2, 0xff2200, 2.5);
        tl.position.set(-0.285, 0.1, z);
        cg.add(tl);
      });
      scene.add(cg);
      return { g: cg, t: i / carColors.length, speed: 0.00072 + (i % 3) * 0.00014 };
    });

    /* ── INTERACTION ─────────────────────────────────────────────────────── */
    const raycaster = new THREE.Raycaster();

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width)  * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        ), camera
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
          ((e.clientX - rect.left) / rect.width)  * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        ), camera
      );
      const hits = raycaster.intersectObjects(clickMeshes);
      if (hits.length) void navigate({ to: hits[0].object.userData.to as string });
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("click",     onClick);

    /* ── RESIZE ──────────────────────────────────────────────────────────── */
    const ro = new ResizeObserver(() => {
      const nW = canvas.clientWidth  || 900;
      const nH = canvas.clientHeight || 520;
      renderer.setSize(nW, nH, false);
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
    });
    ro.observe(canvas);

    /* ── ANIMATE ─────────────────────────────────────────────────────────── */
    let frame = 0, rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      frame++;
      const t = frame * 0.016;

      // Water
      for (let i = 0; i < wAttr.count; i++)
        wAttr.setY(i, wOrig[i] + Math.sin(t * 0.7 + i * 0.25) * 0.02);
      wAttr.needsUpdate = true;

      // Lighthouse beam
      if (beamPivot) beamPivot.rotation.y = t * 1.6;

      // Robot arm
      rPiv1.rotation.y = Math.sin(t * 0.62) * 0.8;
      rPiv2.rotation.y = Math.sin(t * 0.88 + 1.0) * 0.6;

      // Ball
      if (ballMesh) {
        ballMesh.position.y = 0.78 + Math.abs(Math.sin(t * 2.8)) * 0.35;
        ballMesh.rotation.x += 0.06;
        ballMesh.rotation.z += 0.025;
      }

      // Graduation cap
      if (gradCap) {
        gradCap.position.y = 2.35 + Math.sin(t * 1.1) * 0.1;
        gradCap.rotation.y = t * 0.3;
      }

      // Cars
      cars.forEach(car => {
        car.t = (car.t + car.speed) % 1;
        const pos = carPath.getPoint(car.t);
        const tan = carPath.getTangent(car.t);
        car.g.position.copy(pos);
        car.g.rotation.y = Math.atan2(tan.x, tan.z);
      });

      // Trees sway
      treeGrps.forEach((tg, i) => {
        tg.rotation.z = Math.sin(t * 0.38 + i * 0.7) * 0.022;
        tg.rotation.x = Math.cos(t * 0.3  + i * 0.5) * 0.015;
      });

      // Window flicker
      if (frame % 80 === 0 && winMats.length) {
        const wm = winMats[Math.floor(Math.random() * winMats.length)];
        wm.emissiveIntensity = wm.emissiveIntensity > 0.25 ? 0.08 : 0.48;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("click",     onClick);
      renderer.dispose();
    };
  }, [navigate]);

  const LEGEND = [
    { label: "About",      icon: "🎓", hint: "University Hall", to: "/about"      },
    { label: "Experience", icon: "🏢", hint: "Credvan Tower",   to: "/experience" },
    { label: "Projects",   icon: "🔧", hint: "Workshop & Lab",  to: "/projects"   },
    { label: "Hobbies",    icon: "⚽", hint: "Soccer Stadium",  to: "/hobbies"    },
    { label: "Contact",    icon: "🔦", hint: "Lighthouse",      to: "/contact"    },
  ];

  return (
    <section id="universe" aria-label="Island city" className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-10 sm:py-16">
      <div className="mb-6 text-center sm:mb-8">
        <p className="pill mx-auto mb-4 !bg-white/8">Explore my world</p>
        <h2 className="font-display text-3xl font-semibold sm:text-5xl">Click a building to explore.</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          Hover a landmark · click to enter
        </p>
      </div>

      <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl" style={{ height: "min(80vw, 600px)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <canvas ref={canvasRef} className="h-full w-full" style={{ display: "block" }} />
        {hovered && (
          <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-full border border-white/20 bg-black/80 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md"
            style={{ left: tooltipPos.x, top: tooltipPos.y - 16 }}>
            {hovered} →
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2 sm:gap-3">
        {LEGEND.map(l => (
          <div key={l.to} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs backdrop-blur-sm">
            <span>{l.icon}</span>
            <span className="font-semibold text-white/90">{l.label}</span>
            <span className="text-white/35">{l.hint}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
