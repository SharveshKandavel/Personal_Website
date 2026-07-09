import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import * as THREE from "three";

/* ─── Node definitions ─────────────────────────────────────── */
const NODES = [
  { to: "/about",      label: "About",      color: 0x7c5cbf, emissive: 0x3a1f8a, orbitRadius: 2.6, orbitSpeed: 0.0038, orbitPhase: 0,              size: 0.30, tilt: 0.45 },
  { to: "/experience", label: "Experience", color: 0x3a9ad9, emissive: 0x0d4f8a, orbitRadius: 3.8, orbitSpeed: 0.0026, orbitPhase: Math.PI * 0.4,  size: 0.27, tilt: 0.2  },
  { to: "/projects",   label: "Projects",   color: 0x5cbf9c, emissive: 0x1f8a60, orbitRadius: 5.1, orbitSpeed: 0.002,  orbitPhase: Math.PI * 0.9,  size: 0.32, tilt: 0.6  },
  { to: "/hobbies",    label: "Hobbies",    color: 0xd4a84b, emissive: 0x8a5c10, orbitRadius: 6.4, orbitSpeed: 0.0015, orbitPhase: Math.PI * 1.5,  size: 0.26, tilt: 0.1  },
  { to: "/contact",    label: "Contact",    color: 0xbf3a5c, emissive: 0x8a0f2a, orbitRadius: 7.6, orbitSpeed: 0.001,  orbitPhase: Math.PI * 0.7,  size: 0.24, tilt: 0.3  },
] as const;

/* ─── Component ────────────────────────────────────────────── */
export function Universe() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const navigate   = useNavigate();
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos]     = useState({ x: 0, y: 0 });
  const hoveredRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);

    /* ── Scene / Camera ── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, canvas.clientWidth / canvas.clientHeight, 0.1, 300);
    camera.position.set(0, 4, 15);
    camera.lookAt(0, 0, 0);

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const sunLight = new THREE.PointLight(0xffd080, 5, 40);
    scene.add(sunLight);

    /* ── Central Star ── */
    const starGeo  = new THREE.IcosahedronGeometry(0.55, 5);
    const starMat  = new THREE.MeshStandardMaterial({ color: 0xffe880, emissive: 0xff9820, emissiveIntensity: 3, roughness: 0.1, metalness: 0.7 });
    const starMesh = new THREE.Mesh(starGeo, starMat);
    scene.add(starMesh);

    /* Layered coronas */
    [1.1, 1.4, 1.9].forEach((s, i) => {
      const cGeo = new THREE.SphereGeometry(s, 32, 32);
      const cMat = new THREE.MeshBasicMaterial({ color: 0xff9820, transparent: true, opacity: 0.06 - i * 0.015, side: THREE.BackSide });
      scene.add(new THREE.Mesh(cGeo, cMat));
    });

    /* ── Starfield ── */
    const starCount  = 2200;
    const sPos = new Float32Array(starCount * 3);
    const sSizes = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      sPos[i * 3]     = (Math.random() - 0.5) * 140;
      sPos[i * 3 + 1] = (Math.random() - 0.5) * 140;
      sPos[i * 3 + 2] = (Math.random() - 0.5) * 140;
      sSizes[i] = Math.random();
    }
    const bgGeo = new THREE.BufferGeometry();
    bgGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    const bgMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.09, sizeAttenuation: true, transparent: true, opacity: 0.7 });
    scene.add(new THREE.Points(bgGeo, bgMat));

    /* ── Orbit rings ── */
    NODES.forEach((node) => {
      const ringGeo = new THREE.RingGeometry(node.orbitRadius - 0.015, node.orbitRadius + 0.015, 160);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.05, side: THREE.DoubleSide });
      const ring    = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    });

    /* ── PLANET BUILDERS ── */
    type PlanetEntry = {
      group:      THREE.Group;
      mesh:       THREE.Mesh;
      extras:     THREE.Object3D[];
      to:         string;
      label:      string;
      orbitRadius: number;
      orbitSpeed:  number;
      orbitPhase:  number;
      angle:       number;
      update:      (frame: number, hovered: boolean) => void;
    };

    const planets: PlanetEntry[] = [];

    NODES.forEach((node, idx) => {
      const group = new THREE.Group();
      scene.add(group);

      /* Core sphere */
      const geo = new THREE.IcosahedronGeometry(node.size, 4);
      const mat = new THREE.MeshStandardMaterial({
        color:             node.color,
        emissive:          node.emissive,
        emissiveIntensity: 0.8,
        roughness:         0.4,
        metalness:         0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { to: node.to, label: node.label };
      group.add(mesh);

      /* Invisible click target (bigger) */
      const hitGeo  = new THREE.SphereGeometry(node.size * 1.8, 12, 12);
      const hitMat  = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData = { to: node.to, label: node.label };
      group.add(hitMesh);

      const extras: THREE.Object3D[] = [];
      let updateFn: (frame: number, hovered: boolean) => void = () => {};

      /* ── ABOUT: Saturn-style tilted rings ── */
      if (idx === 0) {
        const rInner = new THREE.RingGeometry(node.size * 1.5, node.size * 2.2, 80);
        const rMat   = new THREE.MeshBasicMaterial({ color: 0xb89dff, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
        const ring   = new THREE.Mesh(rInner, rMat);
        ring.rotation.x = node.tilt;
        group.add(ring);

        const rOuter = new THREE.RingGeometry(node.size * 2.3, node.size * 2.8, 80);
        const rMatO  = new THREE.MeshBasicMaterial({ color: 0x9d7dff, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
        const ringO  = new THREE.Mesh(rOuter, rMatO);
        ringO.rotation.x = node.tilt;
        group.add(ringO);

        extras.push(ring, ringO);
        updateFn = (frame) => {
          ring.rotation.z  = frame * 0.004;
          ringO.rotation.z = frame * 0.003;
        };
      }

      /* ── EXPERIENCE: Spinning wireframe exoskeleton ── */
      if (idx === 1) {
        const wGeo  = new THREE.IcosahedronGeometry(node.size * 1.7, 1);
        const wMat  = new THREE.MeshBasicMaterial({ color: 0x5ac8fa, wireframe: true, transparent: true, opacity: 0.35 });
        const wMesh = new THREE.Mesh(wGeo, wMat);
        group.add(wMesh);

        const wGeo2 = new THREE.OctahedronGeometry(node.size * 2.1, 0);
        const wMat2 = new THREE.MeshBasicMaterial({ color: 0x3a9ad9, wireframe: true, transparent: true, opacity: 0.18 });
        const wMesh2 = new THREE.Mesh(wGeo2, wMat2);
        group.add(wMesh2);

        extras.push(wMesh, wMesh2);
        updateFn = (frame) => {
          wMesh.rotation.y  = frame * 0.018;
          wMesh.rotation.x  = frame * 0.009;
          wMesh2.rotation.y = -frame * 0.012;
          wMesh2.rotation.z = frame * 0.006;
        };
      }

      /* ── PROJECTS: Two orbiting moons ── */
      if (idx === 2) {
        const moonData = [
          { size: 0.09, dist: node.size * 2.4, speed: 0.07, phase: 0,            color: 0x88ffcc },
          { size: 0.06, dist: node.size * 3.3, speed: 0.045, phase: Math.PI,     color: 0x44ddaa },
        ];
        const moonPivots: THREE.Group[] = [];
        moonData.forEach((md) => {
          const pivot   = new THREE.Group();
          pivot.rotation.x = 0.4 + md.phase * 0.2;
          group.add(pivot);
          const mGeo  = new THREE.IcosahedronGeometry(md.size, 2);
          const mMat  = new THREE.MeshStandardMaterial({ color: md.color, emissive: md.color, emissiveIntensity: 0.6, roughness: 0.5 });
          const mMesh = new THREE.Mesh(mGeo, mMat);
          mMesh.position.x = md.dist;
          pivot.add(mMesh);
          moonPivots.push(pivot);
          extras.push(pivot);
        });
        updateFn = (frame) => {
          moonPivots[0].rotation.y = frame * moonData[0].speed;
          moonPivots[1].rotation.y = frame * moonData[1].speed + Math.PI;
        };
      }

      /* ── HOBBIES: Particle atmosphere cloud ── */
      if (idx === 3) {
        const cloudCount = 120;
        const cPos = new Float32Array(cloudCount * 3);
        for (let i = 0; i < cloudCount; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi   = Math.acos(2 * Math.random() - 1);
          const r     = node.size * (1.4 + Math.random() * 1.0);
          cPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
          cPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          cPos[i * 3 + 2] = r * Math.cos(phi);
        }
        const cGeo = new THREE.BufferGeometry();
        cGeo.setAttribute("position", new THREE.BufferAttribute(cPos, 3));
        const cMat    = new THREE.PointsMaterial({ color: 0xffd080, size: 0.045, transparent: true, opacity: 0.7, sizeAttenuation: true });
        const cloud   = new THREE.Points(cGeo, cMat);
        group.add(cloud);

        extras.push(cloud);
        updateFn = (frame) => {
          cloud.rotation.y = frame * 0.006;
          cloud.rotation.x = frame * 0.003;
          cMat.opacity = 0.5 + Math.sin(frame * 0.04) * 0.2;
        };
      }

      /* ── CONTACT: Pulsing sonar beacon rings ── */
      if (idx === 4) {
        const beaconRings: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; offset: number }[] = [];
        [0, 0.33, 0.66].forEach((offset) => {
          const bGeo = new THREE.RingGeometry(node.size * 1.2, node.size * 1.35, 64);
          const bMat = new THREE.MeshBasicMaterial({ color: 0xff4488, transparent: true, opacity: 0, side: THREE.DoubleSide });
          const bMesh = new THREE.Mesh(bGeo, bMat);
          group.add(bMesh);
          beaconRings.push({ mesh: bMesh, mat: bMat, offset });
          extras.push(bMesh);
        });

        updateFn = (frame) => {
          beaconRings.forEach(({ mesh, mat, offset }) => {
            const t = ((frame * 0.018 + offset * Math.PI * 2) % (Math.PI * 2));
            const s = 1 + t * 1.8;
            mesh.scale.setScalar(s);
            mat.opacity = Math.max(0, 0.7 * (1 - t / (Math.PI * 2)));
          });
        };
      }

      planets.push({
        group,
        mesh: hitMesh,
        extras,
        to:          node.to,
        label:       node.label,
        orbitRadius: node.orbitRadius,
        orbitSpeed:  node.orbitSpeed,
        orbitPhase:  node.orbitPhase,
        angle:       node.orbitPhase,
        update:      updateFn,
      });
    });

    /* ── Raycaster ── */
    const raycaster  = new THREE.Raycaster();
    const mouse      = new THREE.Vector2(-99, -99);
    const mouseDelta = new THREE.Vector2(0, 0);

    function getCanvasMouse(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      return {
        nx:  ((e.clientX - rect.left) / rect.width) * 2 - 1,
        ny: -((e.clientY - rect.top)  / rect.height) * 2 + 1,
        cx: e.clientX,
        cy: e.clientY,
      };
    }

    const allHitMeshes = planets.map((p) => p.mesh);

    const onMouseMove = (e: MouseEvent) => {
      const { nx, ny, cx, cy } = getCanvasMouse(e);
      mouseDelta.set(nx, ny);
      mouse.set(nx, ny);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(allHitMeshes);
      if (hits.length > 0) {
        const lbl = (hits[0].object as THREE.Mesh).userData.label as string;
        hoveredRef.current = lbl;
        setHoveredLabel(lbl);
        setTooltipPos({ x: cx, y: cy });
        canvas.style.cursor = "pointer";
      } else {
        hoveredRef.current = null;
        setHoveredLabel(null);
        canvas.style.cursor = "default";
      }
    };

    const onClick = (e: MouseEvent) => {
      const { nx, ny } = getCanvasMouse(e);
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
      const hits = raycaster.intersectObjects(allHitMeshes);
      if (hits.length > 0) {
        const to = (hits[0].object as THREE.Mesh).userData.to as string;
        void navigate({ to });
      }
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("click",     onClick);

    /* ── Resize ── */
    const onResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    /* ── Animate ── */
    let frame = 0;
    let rafId = 0;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      frame++;

      /* Central star pulse */
      const pulse = Math.sin(frame * 0.022) * 0.06;
      starMesh.scale.setScalar(1 + pulse);
      starMesh.rotation.y += 0.006;
      (starMat as THREE.MeshStandardMaterial).emissiveIntensity = 3 + pulse * 6;

      /* Camera parallax */
      camera.position.x += (mouseDelta.x * 1.5 - camera.position.x) * 0.018;
      camera.position.y += (mouseDelta.y * 1.0 + 4.0 - camera.position.y) * 0.018;
      camera.lookAt(0, 0, 0);

      /* Orbit + per-planet update */
      planets.forEach((p) => {
        p.angle += p.orbitSpeed;
        p.group.position.set(
          Math.cos(p.angle) * p.orbitRadius,
          Math.sin(p.angle * 0.35) * 0.7,
          Math.sin(p.angle) * p.orbitRadius,
        );
        p.group.rotation.y += 0.007;

        const hovered = hoveredRef.current === p.label;

        /* Hover scale bounce on the group */
        const targetScale = hovered ? 1.18 : 1.0;
        p.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

        /* Emissive boost */
        const coreMesh = p.group.children[0] as THREE.Mesh;
        const coreMat  = coreMesh.material as THREE.MeshStandardMaterial;
        coreMat.emissiveIntensity += ((hovered ? 2.8 : 0.8) - coreMat.emissiveIntensity) * 0.1;

        /* Per-planet unique animation */
        p.update(frame, hovered);
      });

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
    { to: "/about",      label: "About",      desc: "Tilted rings",         color: "#7c5cbf" },
    { to: "/experience", label: "Experience", desc: "Wireframe shell",       color: "#3a9ad9" },
    { to: "/projects",   label: "Projects",   desc: "Orbiting moons",        color: "#5cbf9c" },
    { to: "/hobbies",    label: "Hobbies",    desc: "Particle atmosphere",   color: "#d4a84b" },
    { to: "/contact",    label: "Contact",    desc: "Sonar beacon",          color: "#bf3a5c" },
  ];

  return (
    <section
      id="universe"
      aria-label="Interactive 3D universe"
      className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-10 sm:py-16"
    >
      <div className="mb-6 text-center sm:mb-8">
        <p className="pill mx-auto mb-4 !bg-white/8">Explore my universe</p>
        <h2 className="font-display text-3xl font-semibold sm:text-5xl">
          Hover &amp; click to explore.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          Each planet has its own story. Click one to dive in.
        </p>
      </div>

      {/* Canvas */}
      <div
        className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-black/30 backdrop-blur-sm"
        style={{ height: "min(72vw, 540px)" }}
      >
        <canvas ref={canvasRef} className="h-full w-full" style={{ display: "block" }} />

        {/* Tooltip */}
        {hoveredLabel && (
          <div
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-full border border-white/15 bg-black/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur-md"
            style={{ left: tooltipPos.x, top: tooltipPos.y - 14 }}
          >
            {hoveredLabel} →
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3 w-full max-w-3xl">
        {LEGEND.map((l) => (
          <div
            key={l.to}
            className="rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-center backdrop-blur-sm"
          >
            <div className="text-xs font-semibold" style={{ color: l.color }}>{l.label}</div>
            <div className="mt-0.5 text-[10px] text-white/40">{l.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
