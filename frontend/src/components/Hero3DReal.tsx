'use client';

import { useEffect, useRef } from 'react';

/**
 * Real WebGL 3D hero — a genuine 3D rendering of Ammalu Tex's own mark (the
 * tilted oval ring + bold "A", matching Logo.tsx exactly), drag-to-rotate
 * and scroll-to-zoom via OrbitControls, not a CSS transform.
 *
 * Deliberately vanilla `three`, not @react-three/fiber: R3F's custom
 * react-reconciler hit a real, blocking incompatibility with Turbopack on
 * Next.js 16 when tried earlier (see Vijey Textile's identical component).
 * Vanilla three.js has no React-specific bundling surface, so it isn't
 * affected — this component just owns a canvas ref and drives the scene
 * imperatively in useEffect.
 *
 * Deliberately its own geometry, not a shared component with Vijey's
 * heart+T version — the two sites' CSS hero moments were already built as
 * independent designs (ribbon-drape vs. heirloom-locket), matching their
 * own logos and palettes, and this keeps that same separation.
 */
export default function Hero3DReal({
  accent = '#b3735f',
  accentDark = '#4a302a',
  onFail,
}: {
  accent?: string;
  accentDark?: string;
  onFail?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      let THREE: typeof import('three');
      let OrbitControls: typeof import('three/examples/jsm/controls/OrbitControls.js').OrbitControls;
      let RoomEnvironment: typeof import('three/examples/jsm/environments/RoomEnvironment.js').RoomEnvironment;
      try {
        [THREE, { OrbitControls }, { RoomEnvironment }] = await Promise.all([
          import('three'),
          import('three/examples/jsm/controls/OrbitControls.js'),
          import('three/examples/jsm/environments/RoomEnvironment.js'),
        ]);
      } catch {
        if (!cancelled) onFail?.();
        return;
      }
      if (cancelled || !container) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      } catch {
        onFail?.();
        return;
      }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 0.1, 6.4);

      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

      const roseGold = new THREE.MeshPhysicalMaterial({
        color: 0xf1d9c8, metalness: 1, roughness: 0.34, clearcoat: 0.5, clearcoatRoughness: 0.3,
      });

      // ── Bold "A" — two angled legs + crossbar, matching Logo.tsx's glyph ──
      const legGeo = new THREE.BoxGeometry(0.16, 1.32, 0.2);
      const leftLeg = new THREE.Mesh(legGeo, roseGold);
      leftLeg.position.set(-0.19, 0, 0);
      leftLeg.rotation.z = THREE.MathUtils.degToRad(14);
      const rightLeg = new THREE.Mesh(legGeo, roseGold);
      rightLeg.position.set(0.19, 0, 0);
      rightLeg.rotation.z = THREE.MathUtils.degToRad(-14);

      const barGeo = new THREE.BoxGeometry(0.52, 0.14, 0.2);
      const bar = new THREE.Mesh(barGeo, roseGold);
      bar.position.set(0, -0.12, 0);

      const letterGroup = new THREE.Group();
      letterGroup.add(leftLeg, rightLeg, bar);

      // ── Tilted oval ring around the letter — matches Logo.tsx's ellipse+rotate(-6deg) ──
      const ringGeo = new THREE.TorusGeometry(1, 0.07, 24, 64);
      const ring = new THREE.Mesh(ringGeo, roseGold);
      ring.scale.set(1, 1.18, 0.55);
      ring.rotation.z = THREE.MathUtils.degToRad(-6);

      const rig = new THREE.Group();
      rig.add(letterGroup, ring);
      scene.add(rig);

      // ── Backdrop: soft accent-tinted plane, matching the brand palette ──
      const backdropGeo = new THREE.PlaneGeometry(14, 14);
      const backdropMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: 0.14 });
      const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
      backdrop.position.z = -2.4;
      scene.add(backdrop);

      const key = new THREE.DirectionalLight(0xfff3e8, 2.3);
      key.position.set(3, 4, 5);
      const rim = new THREE.DirectionalLight(new THREE.Color(accent), 1.5);
      rim.position.set(-4, -2, -3);
      const fill = new THREE.AmbientLight(new THREE.Color(accentDark), 0.5);
      scene.add(key, rim, fill);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enableZoom = true;
      controls.enablePan = false;
      controls.minDistance = 3.8;
      controls.maxDistance = 9.5;
      controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      controls.autoRotateSpeed = 2.2;
      controls.target.set(0, 0.1, 0);

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = container;
        if (!w || !h) return;
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;cursor:grab;';
      container.appendChild(renderer.domElement);

      const ro = new ResizeObserver(resize);
      ro.observe(container);

      let raf = 0;
      const tick = () => {
        controls.update();
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      tick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        controls.dispose();
        pmrem.dispose();
        legGeo.dispose();
        barGeo.dispose();
        ringGeo.dispose();
        backdropGeo.dispose();
        roseGold.dispose();
        backdropMat.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accent, accentDark]);

  return <div ref={containerRef} className="w-full h-full" aria-label="Rotatable 3D Ammalu Tex mark — drag to turn, scroll to zoom" role="img" />;
}
