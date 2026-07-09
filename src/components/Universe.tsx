import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import * as THREE from "three";

const GROUND_Y = 0.3;

export function Universe() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const navigate   = useNavigate();
  const [hovered, setHovered]         = useState<string | null>(null);
  const [tooltipPos, setTooltipPos]   = useState({ x: 0, y: 0 });
  const hoveredRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ── Renderer ─────────────────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x060a14, 1);

    /* ── Scene / Camera ───────────────────────────────────────────────────── */
    const scene  = new THREE.Scene();
    scene.fog    = new THREE.FogExp2(0x060a14, 0.022);

    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
    camera.position.set(12, 13, 12);
    camera.lookAt(0, 0, 0);

    /* ── Lights ────────────────────────────────────────────────────────────── */
    scene.add(new THREE.AmbientLight(0x1a2035, 2));
    const moon = new THREE.DirectionalLight(0x4060a0, 0.7);
    moon.position.set(-10, 20, 5);
    scene.add(moon);

    /* ── Helper factories ──────────────────────────────────────────────────── */
    const mkBox = (w: number, h: number, d: number, col: number, emi = 0, emiI = 0) => {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color: col, emissive: emi, emissiveIntensity: emiI, roughness: 0.7, metalness: 0.15 })
      );
      return m;
    };

    const mkCyl = (rT: number, rB: number, h: number, seg: number, col: number, emi = 0, emiI = 0) =>
      new THREE.Mesh(
        new THREE.CylinderGeometry(rT, rB, h, seg),
        new THREE.MeshStandardMaterial({ color: col, emissive: emi, emissiveIntensity: emiI, roughness: 0.6, metalness: 0.2 })
      );

    const mkCone = (r: number, h: number, seg: number, col: number) =>
      new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), new THREE.MeshStandardMaterial({ color: col, roughness: 0.8 }));

    const mkSph = (r: number, col: number, emi = 0, emiI = 0) =>
      new THREE.Mesh(
        new THREE.SphereGeometry(r, 12, 12),
        new THREE.MeshStandardMaterial({ color: col, emissive: emi, emissiveIntensity: emiI, roughness: 0.5 })
      );

    /* ── Island ────────────────────────────────────────────────────────────── */
    const islandGeo = new THREE.CylinderGeometry(6.2, 5.2, 0.6, 24);
    const islandMesh = new THREE.Mesh(islandGeo, new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.95 }));
    scene.add(islandMesh);

    // Grass top
    const grassMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(6.0, 6.0, 0.06, 24),
      new THREE.MeshStandardMaterial({ color: 0x0b2a14, roughness: 1 })
    );
    grassMesh.position.y = GROUND_Y;
    scene.add(grassMesh);

    // Neon edge glow
    const edgeMesh = new THREE.Mesh(
      new THREE.TorusGeometry(5.7, 0.07, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.4 })
    );
    edgeMesh.rotation.x = Math.PI / 2;
    edgeMesh.position.y = -0.27;
    scene.add(edgeMesh);
    const edgeMat = edgeMesh.material as THREE.MeshBasicMaterial;

    /* ── Water ─────────────────────────────────────────────────────────────── */
    const waterGeo = new THREE.PlaneGeometry(30, 30, 40, 40);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x040c1a, emissive: 0x001428, emissiveIntensity: 0.4,
      roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.92,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = -0.5;
    scene.add(waterMesh);
    const wPosAttr = waterGeo.attributes.position as THREE.BufferAttribute;
    const wOrigY   = Float32Array.from({ length: wPosAttr.count }, (_, i) => wPosAttr.getY(i));

    /* ── Roads ─────────────────────────────────────────────────────────────── */
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x141422, roughness: 0.98 });
    const addRoad = (x1: number, z1: number, x2: number, z2: number) => {
      const dx = x2 - x1, dz = z2 - z1;
      const len = Math.sqrt(dx * dx + dz * dz);
      const m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.03, 0.5), roadMat);
      m.position.set((x1 + x2) / 2, GROUND_Y + 0.01, (z1 + z2) / 2);
      m.rotation.y = Math.atan2(dx, dz);
      scene.add(m);
    };
    addRoad(-3.2, -1.0,  0.0, -3.0);
    addRoad( 0.0, -3.0,  3.2, -0.8);
    addRoad( 3.2, -0.8,  3.8,  1.8);
    addRoad( 3.8,  1.8, -2.5,  2.5);
    addRoad(-2.5,  2.5, -3.5,  0.5);
    addRoad(-3.5,  0.5, -3.2, -1.0);
    addRoad(-3.2, -1.0,  3.8,  1.8); // cross road

    /* ── Trees ─────────────────────────────────────────────────────────────── */
    type AnimGroup = { g: THREE.Group; phase: number };
    const trees: AnimGroup[] = [];
    const addTree = (x: number, z: number, s = 1.0) => {
      const g = new THREE.Group();
      const trunk = mkCyl(0.07, 0.1, 0.45 * s, 6, 0x3d1f00);
      trunk.position.y = 0.225 * s;
      g.add(trunk);
      [{ scale: 1.0, yOff: 0.55 }, { scale: 0.75, yOff: 0.78 }].forEach(({ scale, yOff }) => {
        const f = mkCone(0.35 * s * scale, 0.65 * s * scale, 7, 0x0d3a12);
        f.position.y = yOff * s;
        g.add(f);
      });
      g.position.set(x, GROUND_Y, z);
      scene.add(g);
      trees.push({ g, phase: Math.random() * Math.PI * 2 });
    };

    [[-4.5, 0.2], [-4.3, -1.8], [-4.0, 2.6], [-1.5, -3.9], [1.7, -3.8],
     [4.5, -0.6], [4.3, 3.0], [0.8, 3.6], [-1.2, 3.8], [-3.1, 3.5],
     [2.4, 2.9], [-4.2, -3.0], [3.7, -2.9], [1.8, 3.0]
    ].forEach(([x, z]) => addTree(x, z, 0.8 + Math.random() * 0.35));

    /* ── Streetlamps ───────────────────────────────────────────────────────── */
    const addLamp = (x: number, z: number) => {
      const g = new THREE.Group();
      const pole = mkCyl(0.03, 0.03, 1.3, 6, 0x2a2a44);
      pole.position.y = 0.65;
      g.add(pole);
      const head = mkBox(0.16, 0.07, 0.07, 0x1a1a33);
      head.position.set(0.11, 1.33, 0);
      g.add(head);
      const bulb = mkSph(0.06, 0xffee88, 0xffee88, 4);
      bulb.position.set(0.18, 1.33, 0);
      g.add(bulb);
      const pl = new THREE.PointLight(0xffdd66, 0.9, 3.5);
      pl.position.set(0.18, 1.33, 0);
      g.add(pl);
      g.position.set(x, GROUND_Y, z);
      scene.add(g);
    };

    [[-2.0, -1.9], [-0.9, -2.9], [1.7, -2.3], [3.2, 0.4],
     [2.4, 2.2], [-0.1, 3.3], [-1.9, 2.1], [-3.8, 0.5]
    ].forEach(([x, z]) => addLamp(x, z));

    /* ── Clickable buildings ───────────────────────────────────────────────── */
    const clickMeshes: THREE.Mesh[] = [];
    const makePicker = (parent: THREE.Group, to: string, label: string, r: number) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(r, 8, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      m.userData = { to, label };
      parent.add(m);
      clickMeshes.push(m);
    };

    /* ── ABOUT: University Hall ────────────────────────────────────────────── */
    {
      const g = new THREE.Group();
      g.position.set(-3.2, GROUND_Y, -1.0);

      // Main hall body
      const body = mkBox(2.1, 0.75, 1.3, 0x1c1c42, 0x3828aa, 0.18);
      body.position.y = 0.375;
      g.add(body);

      // Side wings
      [-1.3, 1.3].forEach(x => {
        const w = mkBox(0.5, 0.58, 1.3, 0x171730);
        w.position.set(x, 0.29, 0);
        g.add(w);
      });

      // Flat roof
      const roof = mkBox(2.3, 0.07, 1.4, 0x252550);
      roof.position.y = 0.785;
      g.add(roof);

      // Purple glowing windows
      [-0.6, 0, 0.6].forEach(x => {
        const w = mkBox(0.17, 0.22, 0.04, 0x6a44ff, 0x7755ff, 2.8);
        w.position.set(x, 0.44, 0.67);
        g.add(w);
      });

      // Entrance
      const door = mkBox(0.42, 0.55, 0.06, 0x0a0a20, 0x4422aa, 0.5);
      door.position.set(0, 0.275, 0.68);
      g.add(door);

      // Pillars
      [-0.3, 0.3].forEach(x => {
        const p = mkCyl(0.04, 0.04, 0.58, 6, 0x2a2a55);
        p.position.set(x, 0.29, 0.67);
        g.add(p);
      });

      // Floating graduation cap
      const capGroup = new THREE.Group();
      capGroup.position.y = 1.4;
      const board = mkBox(0.65, 0.045, 0.65, 0x111111);
      capGroup.add(board);
      const top = mkBox(0.2, 0.13, 0.2, 0x222222);
      top.position.y = -0.09;
      capGroup.add(top);
      const tassel = mkCyl(0.012, 0.012, 0.25, 4, 0xffd700, 0xffbb00, 2);
      tassel.position.set(0.32, -0.2, 0);
      capGroup.add(tassel);
      g.add(capGroup);

      // Point light
      const pl = new THREE.PointLight(0x7755ff, 2, 5);
      pl.position.y = 1;
      g.add(pl);

      makePicker(g, "/about", "About", 1.6);
      scene.add(g);
    }

    /* ── EXPERIENCE: Credvan Tower ─────────────────────────────────────────── */
    const windowMats: THREE.MeshStandardMaterial[] = [];
    {
      const g = new THREE.Group();
      g.position.set(0.0, GROUND_Y, -3.0);

      // Podium
      const pod = mkBox(1.9, 0.18, 1.9, 0x181830);
      pod.position.y = 0.09;
      g.add(pod);

      // Tower body
      const tower = mkBox(1.15, 3.5, 1.15, 0x1a2045, 0x0a3680, 0.12);
      tower.position.y = 1.93;
      g.add(tower);

      // Mid ledge
      const ledge = mkBox(1.5, 0.07, 1.5, 0x222255);
      ledge.position.y = 1.5;
      g.add(ledge);

      // Top cap
      const cap = mkBox(0.55, 0.65, 0.55, 0x1e2e66, 0x0a50cc, 0.3);
      cap.position.y = 3.85;
      g.add(cap);

      // Antenna
      const ant = mkCyl(0.02, 0.02, 0.9, 4, 0x888899, 0xaaaaff, 0.4);
      ant.position.y = 4.6;
      g.add(ant);
      const antTip = mkSph(0.07, 0xff3399, 0xff3399, 6);
      antTip.position.y = 5.1;
      g.add(antTip);

      // CREDVAN sign bar
      const sign = mkBox(0.95, 0.09, 0.03, 0xff6600, 0xff6600, 4);
      sign.position.set(0, 1.35, 0.6);
      g.add(sign);

      // Glowing windows grid
      for (let floor = 0; floor < 7; floor++) {
        for (let col = -1; col <= 1; col++) {
          const lit = Math.random() > 0.25;
          const mat = new THREE.MeshStandardMaterial({
            color: 0x00ccff, emissive: 0x00aaff,
            emissiveIntensity: lit ? 2.2 : 0.3, roughness: 0.3,
          });
          windowMats.push(mat);
          const w = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.04), mat);
          w.position.set(col * 0.3, 0.85 + floor * 0.45, 0.6);
          g.add(w);
        }
      }

      // Server rack at base
      const rack = mkBox(0.32, 0.42, 0.18, 0x0d0d1f, 0x003366, 0.6);
      rack.position.set(0.72, 0.39, 0.42);
      g.add(rack);

      const pl = new THREE.PointLight(0x0088ff, 2.5, 7);
      pl.position.y = 2.5;
      g.add(pl);

      makePicker(g, "/experience", "Experience", 2.2);
      scene.add(g);
    }

    /* ── PROJECTS: Workshop / Lab ──────────────────────────────────────────── */
    const robotPivots: THREE.Group[] = [];
    let ballMesh: THREE.Mesh | null = null;

    {
      const g = new THREE.Group();
      g.position.set(3.2, GROUND_Y, -0.8);

      // Main industrial building
      const body = mkBox(2.0, 0.85, 1.45, 0x1a2b1a, 0x083a08, 0.1);
      body.position.y = 0.425;
      g.add(body);

      // Flat roof
      const roof = mkBox(2.1, 0.07, 1.55, 0x122012);
      roof.position.y = 0.885;
      g.add(roof);

      // Green skylights
      [-0.55, 0.55].forEach(x => {
        const sk = mkBox(0.32, 0.05, 0.65, 0x00ff88, 0x00ff88, 2);
        sk.position.set(x, 0.93, 0);
        g.add(sk);
      });

      // Windows
      [-0.55, 0, 0.55].forEach(x => {
        const w = mkBox(0.2, 0.22, 0.04, 0x00cc66, 0x00ff88, 1.8);
        w.position.set(x, 0.5, 0.745);
        g.add(w);
      });

      // Circuit tile floor
      const circuit = mkBox(1.9, 0.025, 1.4, 0x081808, 0x002200, 0.4);
      circuit.position.y = 0.012;
      g.add(circuit);

      // BitGold coin stack
      for (let i = 0; i < 5; i++) {
        const coin = mkCyl(0.14, 0.14, 0.055, 16, 0xffd700, 0xffaa00, 1.8);
        coin.position.set(-0.7, 0.028 + i * 0.058, 0.55);
        g.add(coin);
      }

      // Robot arm
      const armBase = mkCyl(0.13, 0.16, 0.28, 8, 0x3a5a3a, 0x1a3a1a, 0.3);
      armBase.position.set(0.52, 0.14, -0.22);
      g.add(armBase);

      const pivot1 = new THREE.Group();
      pivot1.position.set(0.52, 0.28, -0.22);
      g.add(pivot1);
      const seg1 = mkCyl(0.055, 0.068, 0.48, 6, 0x4a6a4a);
      seg1.position.y = 0.24;
      seg1.rotation.z = 0.35;
      pivot1.add(seg1);
      robotPivots.push(pivot1);

      const pivot2 = new THREE.Group();
      pivot2.position.set(0.65, 0.62, -0.22);
      g.add(pivot2);
      const seg2 = mkCyl(0.042, 0.052, 0.38, 6, 0x5a7a5a);
      seg2.position.y = 0.19;
      seg2.rotation.z = -0.45;
      pivot2.add(seg2);
      const claw = mkBox(0.13, 0.09, 0.09, 0x77aa77, 0x44ff44, 1);
      claw.position.set(0.17, 0.38, 0);
      pivot2.add(claw);
      robotPivots.push(pivot2);

      const pl = new THREE.PointLight(0x00ff88, 1.8, 5.5);
      pl.position.set(0, 1.2, 0);
      g.add(pl);

      makePicker(g, "/projects", "Projects", 1.7);
      scene.add(g);
    }

    /* ── HOBBIES: Soccer Pitch ─────────────────────────────────────────────── */
    {
      const g = new THREE.Group();
      g.position.set(-2.5, GROUND_Y, 2.5);

      // Green pitch
      const pitch = mkBox(2.3, 0.055, 1.7, 0x0c3a0c);
      pitch.position.y = 0.028;
      g.add(pitch);

      // White markings
      const center = mkBox(0.028, 0.065, 1.7, 0xffffff, 0xffffff, 0.5);
      center.position.y = 0.06;
      g.add(center);

      const circleGeo = new THREE.TorusGeometry(0.38, 0.022, 8, 36);
      const circleMesh = new THREE.Mesh(circleGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }));
      circleMesh.rotation.x = Math.PI / 2;
      circleMesh.position.y = 0.065;
      g.add(circleMesh);

      // Goal posts (both ends)
      [-1.05, 1.05].forEach(xOff => {
        const crossbar = mkCyl(0.024, 0.024, 0.72, 6, 0xffffff, 0xffffff, 0.6);
        crossbar.rotation.z = Math.PI / 2;
        crossbar.position.set(xOff, 0.52, 0);
        g.add(crossbar);
        [-0.36, 0.36].forEach(zOff => {
          const post = mkCyl(0.024, 0.024, 0.52, 6, 0xffffff, 0xffffff, 0.6);
          post.position.set(xOff, 0.26, zOff);
          g.add(post);
        });
      });

      // Ball
      ballMesh = mkSph(0.105, 0xffffff, 0xdddddd, 0.3);
      ballMesh.position.set(0, 0.16, 0);
      g.add(ballMesh);

      // Add black patches to ball
      for (let i = 0; i < 5; i++) {
        const patch = mkBox(0.05, 0.05, 0.01, 0x222222);
        patch.position.set(
          Math.cos(i * 1.2) * 0.1,
          0.16 + Math.sin(i * 1.2) * 0.1,
          0.11,
        );
        g.add(patch);
      }

      const pl = new THREE.PointLight(0x66ff66, 1.2, 4);
      pl.position.y = 1.2;
      g.add(pl);

      makePicker(g, "/hobbies", "Hobbies", 1.6);
      scene.add(g);
    }

    /* ── CONTACT: Lighthouse ───────────────────────────────────────────────── */
    let beamPivot: THREE.Group | null = null;
    {
      const g = new THREE.Group();
      g.position.set(3.8, GROUND_Y, 2.0);

      // Rocky base
      const base = mkCyl(0.55, 0.65, 0.42, 12, 0x252535);
      base.position.y = 0.21;
      g.add(base);

      // Striped tower
      const stripes = [
        { col: 0xeeeeee, h: 0.38 }, { col: 0xcc2222, h: 0.38 },
        { col: 0xeeeeee, h: 0.38 }, { col: 0xcc2222, h: 0.38 },
        { col: 0xeeeeee, h: 0.38 }, { col: 0xcc2222, h: 0.28 },
      ];
      let sy = 0.42;
      stripes.forEach(({ col, h }) => {
        const rTop = 0.28 - sy * 0.025;
        const seg = mkCyl(rTop - 0.015, rTop, h, 12, col);
        seg.position.y = sy + h / 2;
        g.add(seg);
        sy += h;
      });

      // Balcony
      const balcony = mkCyl(0.46, 0.46, 0.065, 16, 0x2a2a44);
      balcony.position.y = sy + 0.03;
      g.add(balcony);
      sy += 0.065;

      // Light room (glass)
      const lightRoom = mkCyl(0.33, 0.33, 0.38, 12, 0x88bbcc, 0x88ddff, 0.5);
      lightRoom.position.y = sy + 0.19;
      g.add(lightRoom);
      sy += 0.38;

      // Roof
      const roofCone = mkCone(0.38, 0.32, 12, 0x1e1e3a);
      roofCone.position.y = sy + 0.16;
      g.add(roofCone);

      // Beacon
      const beacon = mkSph(0.15, 0xffffcc, 0xffffcc, 10);
      beacon.position.y = 2.65;
      g.add(beacon);

      const beaconLight = new THREE.PointLight(0xffffaa, 4, 10);
      beaconLight.position.y = 2.65;
      g.add(beaconLight);

      // Rotating beam cone
      beamPivot = new THREE.Group();
      beamPivot.position.y = 2.65;
      const beamGeo  = new THREE.ConeGeometry(0.7, 6, 12, 1, true);
      const beamMat  = new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
      const beamCone = new THREE.Mesh(beamGeo, beamMat);
      beamCone.rotation.x = Math.PI / 2;
      beamCone.position.z = 3;
      beamPivot.add(beamCone);
      g.add(beamPivot);

      makePicker(g, "/contact", "Contact", 1.7);
      scene.add(g);
    }

    /* ── Cars ──────────────────────────────────────────────────────────────── */
    const carPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.2, GROUND_Y + 0.05, -1.0),
      new THREE.Vector3(-1.2, GROUND_Y + 0.05, -3.2),
      new THREE.Vector3( 0.0, GROUND_Y + 0.05, -3.2),
      new THREE.Vector3( 2.0, GROUND_Y + 0.05, -2.1),
      new THREE.Vector3( 3.2, GROUND_Y + 0.05, -0.8),
      new THREE.Vector3( 3.9, GROUND_Y + 0.05,  1.1),
      new THREE.Vector3( 3.5, GROUND_Y + 0.05,  2.1),
      new THREE.Vector3( 1.2, GROUND_Y + 0.05,  3.3),
      new THREE.Vector3(-1.0, GROUND_Y + 0.05,  3.3),
      new THREE.Vector3(-2.5, GROUND_Y + 0.05,  2.5),
      new THREE.Vector3(-3.8, GROUND_Y + 0.05,  0.8),
      new THREE.Vector3(-3.6, GROUND_Y + 0.05, -0.4),
    ], true);

    type Car = { g: THREE.Group; t: number; speed: number };
    const carColorList = [0xff3333, 0x3366ff, 0xffaa00];
    const cars: Car[] = carColorList.map((col, i) => {
      const cg = new THREE.Group();
      const body = mkBox(0.48, 0.16, 0.26, col);
      body.position.y = 0.08;
      cg.add(body);
      const top = mkBox(0.3, 0.14, 0.23, col);
      top.position.set(-0.02, 0.25, 0);
      cg.add(top);
      [-0.14, 0.14].forEach(z => {
        const hl = mkSph(0.04, 0xffffaa, 0xffffaa, 5);
        hl.position.set(0.25, 0.09, z);
        cg.add(hl);
        const ll = new THREE.PointLight(0xffffaa, 0.5, 1.4);
        ll.position.set(0.25, 0.09, z);
        cg.add(ll);
      });
      scene.add(cg);
      return { g: cg, t: i / carColorList.length, speed: 0.00075 + Math.random() * 0.0003 };
    });

    /* ── Fireflies ──────────────────────────────────────────────────────────── */
    const ffCount = 65;
    const ffP     = new Float32Array(ffCount * 3);
    const ffOff   = new Float32Array(ffCount);
    for (let i = 0; i < ffCount; i++) {
      const r = 1.5 + Math.random() * 4.5;
      const a = Math.random() * Math.PI * 2;
      ffP[i * 3]     = Math.cos(a) * r;
      ffP[i * 3 + 1] = 0.5 + Math.random() * 2.8;
      ffP[i * 3 + 2] = Math.sin(a) * r;
      ffOff[i]        = Math.random() * Math.PI * 2;
    }
    const ffGeo  = new THREE.BufferGeometry();
    ffGeo.setAttribute("position", new THREE.BufferAttribute(ffP.slice(), 3));
    const ffMat  = new THREE.PointsMaterial({ color: 0x88ffaa, size: 0.09, transparent: true, opacity: 0.9, sizeAttenuation: true });
    scene.add(new THREE.Points(ffGeo, ffMat));
    const ffPosA = ffGeo.attributes.position as THREE.BufferAttribute;

    /* ── Background stars ───────────────────────────────────────────────────── */
    const sP = new Float32Array(1600 * 3).map(() => (Math.random() - 0.5) * 130);
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute("position", new THREE.BufferAttribute(sP, 3));
    scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.55 })));

    /* ── Interaction ────────────────────────────────────────────────────────── */
    const raycaster = new THREE.Raycaster();
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
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
        canvas.style.cursor = "grab";
      }
    };
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top)  / rect.height) * 2 + 1,
        ), camera
      );
      const hits = raycaster.intersectObjects(clickMeshes);
      if (hits.length) void navigate({ to: hits[0].object.userData.to as string });
    };
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("click", onClick);

    /* ── Camera orbit ────────────────────────────────────────────────────────── */
    let isDragging = false, prevX = 0;
    let camTheta   = Math.PI / 4.2;
    let camPhi     = 0.82;
    const camR     = 20;
    let autoSpin   = true;
    let idleFrames = 0;

    const syncCamera = () => {
      camera.position.set(
        camR * Math.sin(camTheta) * Math.sin(camPhi),
        camR * Math.cos(camPhi),
        camR * Math.cos(camTheta) * Math.sin(camPhi),
      );
      camera.lookAt(0, 0.8, 0);
    };
    syncCamera();

    const onDown = (e: MouseEvent) => { isDragging = true; prevX = e.clientX; autoSpin = false; idleFrames = 0; };
    const onUp   = () => { isDragging = false; };
    const onDrag = (e: MouseEvent) => {
      if (!isDragging) return;
      camTheta -= (e.clientX - prevX) * 0.007;
      prevX = e.clientX;
      syncCamera();
    };
    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);
    canvas.addEventListener("mousemove", onDrag);

    /* ── Resize ──────────────────────────────────────────────────────────────── */
    const ro = new ResizeObserver(() => {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    });
    ro.observe(canvas);

    /* ── Animate ─────────────────────────────────────────────────────────────── */
    let frame = 0, rafId = 0;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      frame++;
      const t = frame * 0.016;

      // Auto-rotate
      if (autoSpin) {
        camTheta += 0.0025;
        syncCamera();
      } else {
        idleFrames++;
        if (idleFrames > 220) autoSpin = true;
      }

      // Water shimmer
      for (let i = 0; i < wPosAttr.count; i++) {
        wPosAttr.setY(i, wOrigY[i] + Math.sin(t * 1.1 + i * 0.45) * 0.045);
      }
      wPosAttr.needsUpdate = true;

      // Lighthouse beam
      if (beamPivot) beamPivot.rotation.y = t * 1.3;

      // Robot arm sway
      robotPivots.forEach((piv, i) => { piv.rotation.y = Math.sin(t * 0.7 + i * 1.2) * 0.55; });

      // Ball bounce + spin
      if (ballMesh) {
        ballMesh.position.y = 0.12 + Math.abs(Math.sin(t * 2.6)) * 0.3;
        ballMesh.rotation.x += 0.06;
      }

      // Fireflies
      for (let i = 0; i < ffCount; i++) {
        const ph = ffOff[i];
        ffPosA.setY(i, 0.5 + Math.sin(t + ph) * 0.65 + (Math.random() - 0.5) * 0.012);
        ffPosA.setX(i, ffPosA.getX(i) + Math.sin(t * 0.28 + ph) * 0.003);
        ffPosA.setZ(i, ffPosA.getZ(i) + Math.cos(t * 0.28 + ph) * 0.003);
      }
      ffPosA.needsUpdate = true;
      ffMat.opacity = 0.55 + Math.sin(t * 1.8) * 0.35;

      // Cars
      cars.forEach(car => {
        car.t = (car.t + car.speed) % 1;
        const pos = carPath.getPoint(car.t);
        const tan = carPath.getTangent(car.t);
        car.g.position.copy(pos);
        car.g.rotation.y = Math.atan2(tan.x, tan.z);
      });

      // Trees sway
      trees.forEach(({ g: tg, phase }) => {
        tg.rotation.z = Math.sin(t * 0.5 + phase) * 0.028;
        tg.rotation.x = Math.cos(t * 0.38 + phase) * 0.018;
      });

      // Graduation cap float
      edgeMat.opacity = 0.28 + Math.sin(t * 1.4) * 0.14;

      // Flicker windows randomly
      if (frame % 90 === 0 && windowMats.length) {
        const m = windowMats[Math.floor(Math.random() * windowMats.length)];
        m.emissiveIntensity = m.emissiveIntensity > 1 ? 0.3 : 2.2;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("click",     onClick);
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup",   onUp);
      renderer.dispose();
    };
  }, [navigate]);

  const LEGEND = [
    { label: "About",      icon: "🎓", color: "#7755ff", hint: "University Hall"  },
    { label: "Experience", icon: "🏢", color: "#00aaff", hint: "Credvan Tower"    },
    { label: "Projects",   icon: "🔧", color: "#00ff88", hint: "Workshop & Lab"   },
    { label: "Hobbies",    icon: "⚽", color: "#66ff66", hint: "Soccer Pitch"     },
    { label: "Contact",    icon: "🔦", color: "#ffffaa", hint: "Lighthouse"       },
  ];

  return (
    <section
      id="universe"
      aria-label="Island city universe"
      className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-10 sm:py-16"
    >
      <div className="mb-6 text-center sm:mb-8">
        <p className="pill mx-auto mb-4 !bg-white/8">Explore my world</p>
        <h2 className="font-display text-3xl font-semibold sm:text-5xl">
          My island. Click to explore.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          Drag to rotate · hover a building · click to enter
        </p>
      </div>

      <div
        className="relative w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
        style={{ height: "min(78vw, 570px)" }}
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full cursor-grab active:cursor-grabbing"
          style={{ display: "block" }}
        />

        {hovered && (
          <div
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-full border border-white/20 bg-black/85 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md"
            style={{ left: tooltipPos.x, top: tooltipPos.y - 16 }}
          >
            {hovered} →
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2 sm:gap-3">
        {LEGEND.map(l => (
          <div
            key={l.label}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs backdrop-blur-sm"
          >
            <span>{l.icon}</span>
            <span style={{ color: l.color }} className="font-semibold">{l.label}</span>
            <span className="text-white/35">{l.hint}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
