import * as THREE from 'three';

/**
 * Organza — translucent cloth lit from behind.
 *
 * This is the deliberate physical opposite of the sister site's material. That
 * one models an anisotropic *reflection*: light bouncing off a satin weave into
 * a sheen band. This one models *transmission*: light passing through a sheer
 * fabric, scattering as it goes, so the cloth glows where it is thin and goes
 * dense where it folds back on itself.
 *
 * The consequence is that the two sites read differently even before you look
 * at the colour. Satin is a surface that catches a highlight and moves it as
 * you move. Organza has no highlight worth speaking of — it has *depth*, and
 * the interesting information is where layers overlap.
 *
 * Overlap is the whole effect, so it is computed explicitly: thickness rises
 * where the surface turns away from the light, and layered panels multiply
 * into genuinely denser cloth rather than just darker pixels.
 */

export interface OrganzaUniforms {
  uTime: { value: number };
  uTint: { value: THREE.Color };
  uGlow: { value: THREE.Color };
  uLightDir: { value: THREE.Vector3 };
  uDensity: { value: number };
  uBreath: { value: number };
  uOpacity: { value: number };
}

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uBreath;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;
  varying float vLift;

  /**
   * Air movement in a still room, not wind. Two slow waves well under 1Hz,
   * offset so they never resolve into an obvious repeat — the atelier's motion
   * language is breathing, and a visible cycle would read as machinery.
   */
  float breathe(vec2 p, float t) {
    float a = sin(p.y * 2.1 - t * 0.34) * 0.5;
    float b = sin((p.x * 1.4 + p.y * 0.6) - t * 0.21) * 0.5;
    return a + b;
  }

  void main() {
    vUv = uv;

    vec3 pos = position;
    // Hung from the top edge: displacement grows toward the hem, which is what
    // separates suspended cloth from a flapping sheet.
    float hem = smoothstep(0.0, 1.0, 1.0 - uv.y);
    float lift = breathe(uv * 3.0, uTime) * uBreath * hem;
    pos.z += lift;
    pos.y -= abs(lift) * 0.06;   // cloth shortens slightly as it billows
    vLift = lift;

    float e = 0.015;
    vec3 dx = vec3(e * 2.0, 0.0,
      (breathe((uv + vec2(e,0.0)) * 3.0, uTime) - breathe((uv - vec2(e,0.0)) * 3.0, uTime)) * uBreath * hem);
    vec3 dy = vec3(0.0, e * 2.0,
      (breathe((uv + vec2(0.0,e)) * 3.0, uTime) - breathe((uv - vec2(0.0,e)) * 3.0, uTime)) * uBreath * hem);

    vNormal = normalize(normalMatrix * normalize(cross(dx, dy)));
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform vec3  uTint;
  uniform vec3  uGlow;
  uniform vec3  uLightDir;
  uniform float uDensity;
  uniform float uOpacity;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;
  varying float vLift;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewDir);
    vec3 l = normalize(uLightDir);

    /**
     * Optical thickness. Looking edge-on through a sheer fabric crosses far
     * more thread than looking straight at it, which is why organza reads as
     * near-solid at a grazing angle and nearly invisible face-on. Without this
     * the material looks like tinted glass.
     */
    float facing    = abs(dot(n, v));
    float thickness = uDensity / max(facing, 0.08);

    // Beer-Lambert: transmitted light falls off exponentially with thickness.
    float transmit = exp(-thickness);

    // Backlight — the term that makes it cloth rather than a coloured film.
    // Strongest when the light is behind the surface and we are looking into it.
    float back = pow(max(dot(-n, l), 0.0), 1.6);

    // A little front bounce so the lit side is not flat black.
    float front = max(dot(n, l), 0.0) * 0.35;

    // Weave. Fine enough to read as texture rather than pattern, and it fades
    // out with thickness so dense folds go smooth the way real cloth does.
    float weave = (sin(vUv.x * 420.0) * sin(vUv.y * 420.0)) * 0.02 * transmit;

    vec3 colour =
        uTint * (front + 0.18)
      + uGlow * back * transmit * 1.25
      + uGlow * transmit * 0.28
      + weave;

    // Alpha carries the density: thin where light passes, opaque where the
    // cloth doubles over. This is the channel doing most of the work.
    float alpha = clamp((1.0 - transmit) * 0.85 + back * 0.25, 0.0, 1.0) * uOpacity;

    gl_FragColor = vec4(colour, alpha);

    #include <colorspace_fragment>
  }
`;

export function createOrganzaMaterial(opts: {
  tint: THREE.ColorRepresentation;
  glow: THREE.ColorRepresentation;
  density?: number;
  breath?: number;
  opacity?: number;
}): THREE.ShaderMaterial {
  const uniforms: OrganzaUniforms = {
    uTime:     { value: 0 },
    uTint:     { value: new THREE.Color(opts.tint) },
    uGlow:     { value: new THREE.Color(opts.glow) },
    // Window light: low, from one side, warm. The atelier has one source.
    uLightDir: { value: new THREE.Vector3(-0.55, 0.35, -0.75).normalize() },
    uDensity:  { value: opts.density ?? 0.55 },
    uBreath:   { value: opts.breath ?? 0.3 },
    uOpacity:  { value: opts.opacity ?? 1 },
  };

  return new THREE.ShaderMaterial({
    uniforms: uniforms as unknown as Record<string, THREE.IUniform>,
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    // Sheer layers must accumulate where they overlap — that overlap is the
    // entire point of the material. Writing depth would let the nearest panel
    // occlude the ones behind and flatten it to a single sheet.
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}
