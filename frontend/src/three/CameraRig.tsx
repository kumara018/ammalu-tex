'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SceneId } from '@/store/useSceneStore';
import { useSceneStore } from '@/store/useSceneStore';
import { easeScroll, approach } from './core/easing';

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
 * The second half of the language is *weight*. Moves are shaped by a cubic
 * bezier with a long tail, so the camera accelerates slowly and decelerates
 * into its mark — a heavy object on a track.
 *
 * An earlier version used a damped spring here. That was wrong for this
 * treatment and has been removed: a spring overshoots and settles, which is
 * the signature of app UI responding to a tap. A film camera never overshoots
 * its mark, and the tell is immediate even when the overshoot is small enough
 * that you cannot consciously see it.
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
  /** Approach rate. Transactional stations arrive fast and stop. */
  settle: number;
  /**
   * Scroll-driven move, on top of the station.
   *
   * arc   — additional orbit around the table as the page scrolls
   * rise  — the camera craning up or down
   * push  — pulling in toward the work
   *
   * Hero stations are never locked off; the transactional ones get nothing.
   */
  arc: number;
  rise: number;
  push: number;
}

const station = (
  azimuth: number, elevation: number, distance: number,
  focusY: number, sway: number, settle: number,
  arc = 0, rise = 0, push = 0,
): Station => ({ azimuth, elevation, distance, focusY, sway, settle, arc, rise, push });

/**
 * Stations, described as places to stand around one table rather than as
 * coordinates. The cutting station looks down at the surface; the form
 * station drops to eye level with the garment; the archive pulls back and
 * levels off so nothing moves in the corner of the eye while someone reads.
 */
const STATIONS: Record<SceneId, Station> = {
  //                                                    sway  settle  arc   rise  push
  atelier:   station(-0.32,  0.16,  8.4,  0.1,          0.16, 0.020,  0.34, 0.20, 1.9),
  cutting:   station( 0.10,  0.62,  7.6, -0.6,          0.12, 0.024,  0.18, 0.00, 1.2),  // looking down at the table
  form:      station( 0.46,  0.05,  5.4,  0.0,          0.10, 0.028,  0.40, 0.12, 0.9),  // eye level with the garment
  basket:    station(-0.70,  0.34,  7.0, -0.4,          0.10, 0.024,  0.12, 0.00, 0.7),
  // No scroll-driven move on the transactional stations. A camera drifting
  // behind a card-number field is precisely the treatment obstructing the
  // thing it exists to sell.
  ledger:    station( 0.00,  0.10, 10.2,  0.0,          0.02, 0.050,  0,    0,    0),
  archive:   station( 0.14,  0.08, 10.6,  0.0,          0.02, 0.050,  0,    0,    0),
  threshold: station(-0.18,  0.12,  9.8,  0.0,          0.03, 0.046,  0,    0,    0),
  muslin:    station( 0.00,  0.00, 12.0,  0.0,          0.00, 0.060,  0,    0,    0),
};

export default function CameraRig() {
  const scene = useSceneStore((s) => s.scene);

  // Orbit state, not position state — the whole rig thinks in angles.
  const azimuth = useRef(STATIONS.muslin.azimuth);
  const elevation = useRef(STATIONS.muslin.elevation);
  const distance = useRef(STATIONS.muslin.distance);
  const focusY = useRef(0);
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
      // Reduced motion: the destination, held. No orbit, no parallax, no
      // scroll move, no idle drift. The staging still reads; it just does not
      // move.
      azimuth.current = targetAz;
      elevation.current = targetEl;
      distance.current = s.distance;
      focusY.current = s.focusY;
    } else {
      /**
       * Scroll progress shaped by a cubic bezier rather than used raw.
       *
       * Linear mapping is the tell of a scroll-jacked page — the camera tracks
       * the wheel exactly, so it feels bolted to the input instead of to the
       * room. An eased curve gives the move a lead-in and a long tail.
       */
      const p = easeScroll(Math.min(1, Math.max(0, scroll)));

      // A slow idle breath so the shot is never fully locked off at rest.
      const breath = Math.sin(state.clock.elapsedTime * 0.13);

      azimuth.current = approach(
        azimuth.current, targetAz + p * s.arc + breath * s.sway * 0.18, s.settle, dt,
      );
      elevation.current = approach(
        elevation.current, targetEl + p * s.rise, s.settle, dt,
      );
      // Scroll draws the camera in toward the table rather than pushing it
      // through the scene — closer inspection, not forward travel.
      distance.current = approach(distance.current, s.distance - p * s.push, s.settle, dt);
      focusY.current = approach(focusY.current, s.focusY, s.settle, dt);
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
