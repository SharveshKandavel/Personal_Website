import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import * as THREE from "three";

/* ─── Node definitions ─────────────────────────────────────── */
const NODES = [
  { to: "/about",      label: "About",      color: 0x7c5cbf, emissive: 0x3a1f8a, orbitRadius: 2.6, orbitSpeed: 0.0035, orbitPhase: 0,         size: 0.28 },
  { to: "/experience", label: "Experience", color: 0xbf5c7c, emissive: 0x8a1f40, orbitRadius: 3.6, orbitSpeed: 0.0025, orbitPhase: Math.PI * 0.4, size: 0.26 },
  { to: "/projects",   label: "Projects",   color: 0x5c9cbf, emissive: 0x1f508a, orbitRadius: 4.8, orbitSpeed: 0.002,  orbitPhase: Math.PI * 0.9, size: 0.30 },
  { to: "/hobbies",    label: "Hobbies",    color: 0x5cbf9c, emissive: 0x1f8a60, orbitRadius: 6.0, orbitSpeed: 0.0015, orbitPhase: Math.PI * 1.5, size: 0.24 },
  { to: "/contact",    label: "Contact",    color: 0xbf9c5c, emissive: 0x8a6020, orbitRadius: 7.2, orbitSpeed: 0.001,  orbitPhase: Math.PI * 0.7, size: 0.22 },
] as const;

/* ─── Component ────────────────────────────────────────────── */
export function Universe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate  = useNavigate();
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
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
    camera.position.set(0, 3.5, 14);
    camera.lookAt(0, 0, 0);

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pointLight = new THREE.PointLight(0xffa060, 4, 30);
    scene.add(pointLight);

    /* ── Central Star ── */
    const starGeo  = new THREE.IcosahedronGeometry(0.55, 4);
    const starMat  = new THREE.MeshStandardMaterial({ color: 0xffd580, emissive: 0xff9820, emissiveIntensity: 2.5, roughness: 0.2, metalness: 0.6 });
    const starMesh = new THREE.Mesh(starGeo, starMat);
    scene.add(starMesh);

    /* Corona glow around star */
    const coronaGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({ color: 0xff9820, transparent: true, opacity: 0.12, side: THREE.BackSide });
    scene.add(new THREE.Mesh(coronaGeo, coronaMat));

    /* ── Starfield ── */
    const starCount  = 1800;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 120;
    }
    const bgStarGeo = new THREE.BufferGeometry();
    bgStarGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const bgStarMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, sizeAttenuation: true, transparent: true, opacity: 0.75 });
    scene.add(new THREE.Points(bgStarGeo, bgStarMat));

    /* ── Orbit rings ── */
    NODES.forEach((node) => {
      const ringGeo = new THREE.RingGeometry(node.orbitRadius - 0.012, node.orbitRadius + 0.012, 128);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06, side: THREE.DoubleSide });
      const ring    = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    });

    /* ── Planet nodes ── */
    type PlanetEntry = {
      mesh:       THREE.Mesh;
      glow:       THREE.Mesh;
      to:         string;
      label:      string;
      orbitRadius: number;
      orbitSpeed:  number;
      orbitPhase:  number;
      angle:       number;
    };

    const planets: PlanetEntry[] = NODES.map((node) => {
      /* Main sphere */
      const geo  = new THREE.IcosahedronGeometry(node.size, 3);
      const mat  = new THREE.MeshStandardMaterial({
        color:             node.color,
        emissive:          node.emissive,
        emissiveIntensity: 0.8,
        roughness:         0.35,
        metalness:         0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { to: node.to, label: node.label };
      scene.add(mesh);

      /* Glow halo */
      const glowGeo = new THREE.SphereGeometry(node.size * 1.6, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({ color: node.color, transparent: true, opacity: 0.0, side: THREE.BackSide });
      const glow    = new THREE.Mesh(glowGeo, glowMat);
      mesh.add(glow);

      return { mesh, glow, to: node.to, label: node.label, orbitRadius: node.orbitRadius, orbitSpeed: node.orbitSpeed, orbitPhase: node.orbitPhase, angle: node.orbitPhase };
    });

    /* ── Raycaster ── */
    const raycaster  = new THREE.Raycaster();
    const mouse      = new THREE.Vector2(-99, -99);
    const mouseDelta = new THREE.Vector2(0, 0);

    function getCanvasMouse(e: MouseEvent | TouchEvent) {
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      return {
        nx: ((clientX - rect.left) / rect.width) * 2 - 1,
        ny: -((clientY - rect.top) / rect.height) * 2 + 1,
        cx: clientX,
        cy: clientY,
      };
    }

    const onMouseMove = (e: MouseEvent) => {
      const { nx, ny, cx, cy } = getCanvasMouse(e);
      mouseDelta.set(nx, ny);
      mouse.set(nx, ny);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(planets.map((p) => p.mesh));
      if (hits.length > 0) {
        const hit = hits[0].object as THREE.Mesh;
        const lbl = hit.userData.label as string;
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
      const hits = raycaster.intersectObjects(planets.map((p) => p.mesh));
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

      /* Star pulse */
      const pulse = Math.sin(frame * 0.025) * 0.08;
      starMesh.scale.setScalar(1 + pulse);
      (starMat as THREE.MeshStandardMaterial).emissiveIntensity = 2.5 + pulse * 4;

      /* Camera subtle mouse parallax */
      camera.position.x += (mouseDelta.x * 1.2 - camera.position.x) * 0.02;
      camera.position.y += (mouseDelta.y * 0.8 + 3.5 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      /* Orbit planets */
      planets.forEach((p) => {
        p.angle += p.orbitSpeed;
        p.mesh.position.set(
          Math.cos(p.angle) * p.orbitRadius,
          Math.sin(p.angle * 0.3) * 0.6,
          Math.sin(p.angle) * p.orbitRadius,
        );
        p.mesh.rotation.y += 0.008;

        /* Hover glow */
        const isHovered = hoveredRef.current === p.label;
        const glowMat   = p.glow.material as THREE.MeshBasicMaterial;
        glowMat.opacity += (isHovered ? 0.22 : 0.0 - glowMat.opacity) * 0.12;
        const planetMat = p.mesh.material as THREE.MeshStandardMaterial;
        planetMat.emissiveIntensity += ((isHovered ? 2.5 : 0.8) - planetMat.emissiveIntensity) * 0.1;
      });

      renderer.render(scene, camera);
    };
    animate();

    /* ── Cleanup ── */
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("click",     onClick);
      renderer.dispose();
    };
  }, [navigate]);

  return (
    <section
      id="universe"
      aria-label="Interactive 3D universe"
      className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-10 sm:py-16"
    >
      {/* Header */}
      <div className="mb-6 text-center sm:mb-8">
        <p className="pill mx-auto mb-4 !bg-white/8">Explore my universe</p>
        <h2 className="font-display text-3xl font-semibold sm:text-5xl">
          Drag, hover &amp; click to explore.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          Each orbiting planet is a chapter of my story. Click one to dive in.
        </p>
      </div>

      {/* Canvas */}
      <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-black/30 backdrop-blur-sm"
           style={{ height: "min(70vw, 520px)" }}>
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ display: "block" }}
        />

        {/* Tooltip */}
        {hoveredLabel && (
          <div
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-full border border-white/15 bg-black/80 px-4 py-1.5 text-xs font-medium tracking-wide text-white backdrop-blur-md"
            style={{ left: tooltipPos.x, top: tooltipPos.y - 12 }}
          >
            {hoveredLabel} →
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-wrap justify-center gap-2">
          {NODES.map((n) => (
            <span
              key={n.to}
              className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] font-medium text-white/60 backdrop-blur-sm"
              style={{ color: `#${n.color.toString(16).padStart(6, "0")}` }}
            >
              {n.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
