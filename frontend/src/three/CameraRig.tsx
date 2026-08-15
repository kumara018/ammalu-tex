'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SceneId } from '@/store/useSceneStore';
import { useSceneStore } from '@/store/useSceneStore';

/**
 * Orbit-and-settle camera.
 *
 * The sister site moves its camera along a rail between docked positions — a
 * lateral dolly through a floor plan, which reads as walking through a
 * facility. This one never travels laterally at all. It stays on a sphere
 * around a single worktable and changes *where it looks from*: azimuth,
 * elevation and distance. Route changes swing around the work rather than
 * moving to a different room.
 *
 * That is the whole distinction in motion language. Lateral travel implies
 * separate places; orbiting implies one object being examined from different
 * sides, which is what an atelier does.
 *
 * The second half of the language is *settling*. Nothing here arrives on a
 * constant ease. Movement starts quickly and finishes slowly with a small
 * overshoot, the way a hand places something down.
 */

interface Station {
  /** Radians around the table. 0 faces the window. */
  azimuth: number;
  /** Radians above the table plane. */
  elevation: number;
  distance: number;
  /** Height of the point being looked at. */
  focusY: number;
  /** How far the pointer may swing the orbit, in radians. */
  sway: number;
  /** Settle rate. Transactional stations arrive fast and stop. */
  settle: number;
}

const station = (
  azimuth: number, elevation: number, distance: number,
  focusY: number, sway: number, settle: number,
): Station => ({ azimuth, elevation, distance, focusY, sway, settle });

/**
 * Stations, described as places to stand around one table rather than as
 * coordinates. The cutting station looks down at the surface; the form
 * station drops to eye level with the garment; the archive pulls back and
 * levels off so nothing moves in the corner of the eye while someone reads.
 */
const STATIONS: Record<SceneId, Station> = {
  atelier:   station(-0.32,  0.16,  8.4,  0.1,  0.16, 0.020),
  cutting:   station( 0.10,  0.62,  7.6, -0.6,  0.12, 0.024),  // looking down at the table
  form:      station( 0.46,  0.05,  5.4,  0.0,  0.10, 0.028),  // eye level with the garment
  basket:    station(-0.70,  0.34,  7.0, -0.4,  0.10, 0.024),
  ledger:    station( 0.00,  0.10, 10.2,  0.0,  0.02, 0.050),
  archive:   station( 0.14,  0.08, 10.6,  0.0,  0.02, 0.050),
  threshold: station(-0.18,  0.12,  9.8,  0.0,  0.03, 0.046),
  muslin:    station( 0.00,  0.00, 12.0,  0.0,  0.00, 0.060),
};

export default function CameraRig() {
  const scene = useSceneStore((s) => s.scene);

  // Orbit state, not position state — the whole rig thinks in angles.
  const azimuth = useRef(STATIONS.muslin.azimuth);
  const elevation = useRef(STATIONS.muslin.elevation);
  const distance = useRef(STATIONS.muslin.distance);
  const focusY = useRef(0);
  const velocity = useRef({ az: 0, el: 0 });
  const focus = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    const s = STATIONS[scene] ?? STATIONS.muslin;
    const { pointer, scroll, capabilities } = useSceneStore.getState();
    const still = capabilities?.reducedMotion ?? false;

    const dt = Math.min(delta, 0.1);
    // Frame-rate independent: a fixed factor settles twice as fast at 120Hz.
    const k = 1 - Math.pow(1 - s.settle, dt * 60);

    const targetAz = s.azimuth + (still ? 0 : pointer.x * s.sway);
    const targetEl = s.elevation + (still ? 0 : pointer.y * s.sway * 0.5);

    if (still) {
      azimuth.current = targetAz;
      elevation.current = targetEl;
      distance.current = s.distance;
      focusY.current = s.focusY;
    } else {
      /**
       * Critically-damped-ish spring rather than a plain lerp. A lerp decays
       * uniformly and always feels mechanical; a spring arrives with a trace
       * of overshoot and settles, which is the hand-placed quality the rest of
       * this site is built around. Damping is high enough that it never
       * visibly bounces — it just stops less abruptly.
       */
      const stiffness = s.settle * 26;
      const damping = 0.82;
      velocity.current.az = (velocity.current.az + (targetAz - azimuth.current) * stiffness * dt) * damping;
      velocity.current.el = (velocity.current.el + (targetEl - elevation.current) * stiffness * dt) * damping;
      azimuth.current += velocity.current.az;
      elevation.current += velocity.current.el;

      // Scroll draws the camera in toward the table rather than pushing it
      // through the scene — closer inspection, not forward travel.
      distance.current += ((s.distance - scroll * 1.4) - distance.current) * k;
      focusY.current += (s.focusY - focusY.current) * k;
    }

    const az = azimuth.current;
    const el = elevation.current;
    const r = distance.current;

    state.camera.position.set(
      Math.sin(az) * Math.cos(el) * r,
      Math.sin(el) * r + focusY.current * 0.4,
      Math.cos(az) * Math.cos(el) * r,
    );

    focus.current.set(0, focusY.current, 0);
    state.camera.lookAt(focus.current);
  });

  return null;
}
