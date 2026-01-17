import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { gsap } from "gsap";

// Protocol artifacts that orbit the orrery
const PROTOCOLS = [
  { name: "TCP", rfc: 793, symbol: "◈" },
  { name: "IP", rfc: 791, symbol: "◇" },
  { name: "DNS", rfc: 1035, symbol: "◎" },
  { name: "TLS", rfc: 8446, symbol: "◆" },
  { name: "UDP", rfc: 768, symbol: "○" },
  { name: "HTTP", rfc: 2616, symbol: "◐" },
  { name: "QUIC", rfc: 9000, symbol: "◉" },
  { name: "BGP", rfc: 4271, symbol: "◌" },
];

// Vignette shader for cinematic edges
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    darkness: { value: 0.6 },
    offset: { value: 1.2 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float darkness;
    uniform float offset;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
      float vig = 1.0 - smoothstep(0.0, 1.0, dot(uv, uv));
      texel.rgb *= mix(1.0 - darkness, 1.0, vig);
      gl_FragColor = texel;
    }
  `,
};

// Custom molten metal shader
const MoltenShader = {
  uniforms: {
    uTime: { value: 0 },
    uIntensity: { value: 1.0 },
    uBaseColor: { value: new THREE.Color(0xaa3300) },
    uHighColor: { value: new THREE.Color(0xff6600) },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uIntensity;
    uniform vec3 uBaseColor;
    uniform vec3 uHighColor;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    // Simplex noise functions
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    void main() {
      // Distance from center for radial effects
      float dist = length(vUv - 0.5) * 2.0;
      
      // Multi-layered noise for turbulent molten effect
      float noise1 = snoise(vec3(vPosition.xy * 4.0, uTime * 0.2)) * 0.5 + 0.5;
      float noise2 = snoise(vec3(vPosition.xy * 8.0, uTime * 0.35 + 100.0)) * 0.5 + 0.5;
      float noise3 = snoise(vec3(vPosition.xy * 16.0, uTime * 0.5 + 200.0)) * 0.5 + 0.5;
      
      float combined = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
      
      // Hot spots - creates variation
      float hotSpot = pow(combined, 2.0) * 0.8;
      
      // Color gradient - warm orange base to brighter orange
      vec3 color = mix(uBaseColor, uHighColor, hotSpot);
      
      // Slight darkening at edges - but keep it molten looking
      float edgeDark = smoothstep(0.6, 1.0, dist);
      color *= 1.0 - edgeDark * 0.3;
      
      // Pulsing glow
      float pulse = sin(uTime * 1.5) * 0.05 + 0.9;
      
      // Clamp to prevent bloom blowout but keep it vibrant
      color = min(color * pulse, vec3(0.85, 0.5, 0.2));
      
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

// Data stream particle shader
const ParticleShader = {
  vertexShader: `
    attribute float aPhase;
    attribute float aSpeed;
    attribute float aSize;
    attribute vec3 aColor;
    
    uniform float uTime;
    uniform float uProgress;
    
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      vColor = aColor;
      
      // Calculate particle position along path
      float t = mod((uTime * aSpeed * 0.1) + aPhase, 1.0);
      
      // Spiral path converging to center
      float angle = t * 6.28318 * 3.0 + aPhase * 6.28318;
      float radius = (1.0 - t) * 1.25 + 0.15;
      float height = (1.0 - t) * 1.0 - 0.5;
      
      vec3 pos = vec3(
        cos(angle) * radius,
        height,
        sin(angle) * radius
      );
      
      // Fade in/out
      vAlpha = smoothstep(0.0, 0.1, t) * smoothstep(1.0, 0.7, t) * uProgress;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = aSize * (300.0 / -mvPosition.z) * (0.5 + t * 0.5);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      // Soft circular particle
      float d = length(gl_PointCoord - vec2(0.5));
      float alpha = smoothstep(0.5, 0.2, d) * vAlpha;
      
      // Glow effect
      vec3 color = vColor + vec3(0.3) * (1.0 - d * 2.0);
      
      gl_FragColor = vec4(color, alpha);
    }
  `,
};

export function FoundryHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.08);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    // Camera at ~30 degrees down from horizontal (eye level looking slightly down)
    // At distance 8, height 1.5 gives roughly 30 degree angle: atan(1.5/8) ≈ 10.6°, plus lookAt target
    camera.position.set(0, 1.0, 8);
    camera.lookAt(0, -1.0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.35, // strength - reduced to prevent blowout
      0.25, // radius
      0.95 // threshold - higher to only catch the brightest spots
    );
    composer.addPass(bloomPass);

    const vignettePass = new ShaderPass(VignetteShader);
    composer.addPass(vignettePass);

    // Lighting - forge atmosphere
    const ambientLight = new THREE.AmbientLight(0x1a0a00, 0.6); // Increased for visibility
    scene.add(ambientLight);

    // Main crucible light (warm amber) - toned down
    const crucibleLight = new THREE.PointLight(0xff8c00, 1.2, 12);
    crucibleLight.position.set(0, 0.5, 0);
    scene.add(crucibleLight);

    // Accent lights - subtle
    const rimLight1 = new THREE.PointLight(0xff6b00, 0.4, 10);
    rimLight1.position.set(3, 2, -2);
    scene.add(rimLight1);

    const rimLight2 = new THREE.PointLight(0xffc71f, 0.3, 10);
    rimLight2.position.set(-3, 1, 2);
    scene.add(rimLight2);

    // Cool fill for depth (barely visible)
    const fillLight = new THREE.PointLight(0x4a90a4, 0.15, 20);
    fillLight.position.set(0, 5, 5);
    scene.add(fillLight);

    // Spotlight pointing DOWN at the cauldron to illuminate it properly
    const cauldronSpotlight = new THREE.SpotLight(0xff6600, 3, 10, Math.PI / 4, 0.3, 1);
    cauldronSpotlight.position.set(0, 3, 2);
    cauldronSpotlight.target.position.set(0, -1, 0);
    scene.add(cauldronSpotlight);
    scene.add(cauldronSpotlight.target);

    // Create the obsidian plinth with engraved channels
    const plinthGroup = new THREE.Group();
    plinthGroup.visible = false; // DISABLED FOR DEBUGGING
    scene.add(plinthGroup);

    // Main plinth body
    const plinthGeo = new THREE.CylinderGeometry(1.25, 1.5, 0.2, 64, 1);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.3,
      metalness: 0.7,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -0.75;
    plinthGroup.add(plinth);

    // Decorative rings on plinth - no emissive to prevent bloom
    const ringGeo = new THREE.TorusGeometry(1.35, 0.015, 8, 64);
    const brassRingMat = new THREE.MeshStandardMaterial({
      color: 0x8a7040,
      roughness: 0.4,
      metalness: 0.8,
    });
    const plinthRing1 = new THREE.Mesh(ringGeo, brassRingMat);
    plinthRing1.rotation.x = Math.PI / 2;
    plinthRing1.position.y = -0.65;
    plinthGroup.add(plinthRing1);

    const plinthRing2 = plinthRing1.clone();
    plinthRing2.position.y = -0.85;
    plinthGroup.add(plinthRing2);

    // Central cauldron - dark bowl that the spiral flows into
    const cauldronGroup = new THREE.Group();
    cauldronGroup.position.y = -2.5; // Position so rim is near y=-0.5 where particles converge (depth is 2.0)
    scene.add(cauldronGroup);

    // Cauldron bowl - using LatheGeometry for proper tall cauldron shape
    const cauldronProfile: THREE.Vector2[] = [];
    const cauldronRadius = 1.2; // Opening radius
    const cauldronDepth = 2.0; // MUCH TALLER - proper cauldron proportions
    const wallThickness = 0.15;
    
    // Outer profile (bottom to top) - classic cauldron shape: narrower bottom, wider top
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const y = t * cauldronDepth;
      // Cauldron curve - starts narrow at bottom, flares out toward top
      const r = 0.4 + (cauldronRadius - 0.4) * Math.pow(t, 0.5);
      cauldronProfile.push(new THREE.Vector2(r, y));
    }
    // Add rim - slight lip at top
    cauldronProfile.push(new THREE.Vector2(cauldronRadius + 0.08, cauldronDepth));
    cauldronProfile.push(new THREE.Vector2(cauldronRadius + wallThickness, cauldronDepth + 0.05));
    cauldronProfile.push(new THREE.Vector2(cauldronRadius + wallThickness, cauldronDepth - 0.08));
    // Inner profile (top to bottom)
    for (let i = 24; i >= 0; i--) {
      const t = i / 24;
      const y = t * (cauldronDepth - 0.15) + 0.1;
      const r = Math.max(0.25, (0.4 + (cauldronRadius - 0.4) * Math.pow(t, 0.5)) - wallThickness);
      cauldronProfile.push(new THREE.Vector2(r, y));
    }
    // Close bottom
    cauldronProfile.push(new THREE.Vector2(0.25, 0.1));
    cauldronProfile.push(new THREE.Vector2(0.4, 0));
    
    const cauldronGeo = new THREE.LatheGeometry(cauldronProfile, 64);
    const cauldronMat = new THREE.MeshStandardMaterial({
      color: 0xff0000, // BRIGHT RED FOR DEBUGGING
      roughness: 0.5,
      metalness: 0.3,
      emissive: 0xff0000,
      emissiveIntensity: 1.0,
      side: THREE.DoubleSide,
    });
    const cauldronMesh = new THREE.Mesh(cauldronGeo, cauldronMat);
    cauldronGroup.add(cauldronMesh);

    // Cauldron rim highlight
    const rimGeo = new THREE.TorusGeometry(cauldronRadius + wallThickness * 0.5, 0.06, 12, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.3,
      metalness: 0.9,
      emissive: 0x221100,
      emissiveIntensity: 0.2,
    });
    const cauldronRim = new THREE.Mesh(rimGeo, rimMat);
    cauldronRim.rotation.x = Math.PI / 2;
    cauldronRim.position.y = cauldronDepth;
    cauldronGroup.add(cauldronRim);

    // Molten glow at bottom of cauldron - DISABLED FOR DEBUGGING
    const moltenGeo = new THREE.CircleGeometry(0.5, 64);
    const moltenMat = new THREE.ShaderMaterial({
      uniforms: MoltenShader.uniforms,
      vertexShader: MoltenShader.vertexShader,
      fragmentShader: MoltenShader.fragmentShader,
      transparent: false,
    });
    const moltenSurface = new THREE.Mesh(moltenGeo, moltenMat);
    moltenSurface.rotation.x = -Math.PI / 2;
    moltenSurface.position.y = 0.1;
    moltenSurface.visible = false; // DISABLED FOR DEBUGGING
    cauldronGroup.add(moltenSurface);

    // Orrery rings (the rotating mechanism) - positioned above crucible
    const orreryGroup = new THREE.Group();
    orreryGroup.position.y = 0.6;
    orreryGroup.visible = false; // DISABLED FOR DEBUGGING
    scene.add(orreryGroup);

    // Inner ring
    const innerOrreryGeo = new THREE.TorusGeometry(1.2, 0.02, 8, 64);
    const orreryMat = new THREE.MeshStandardMaterial({
      color: 0xd4a44c,
      roughness: 0.25,
      metalness: 0.9,
      emissive: 0xffaa00,
      emissiveIntensity: 0.08,
    });
    const innerOrrery = new THREE.Mesh(innerOrreryGeo, orreryMat);
    innerOrrery.rotation.x = Math.PI / 2;
    orreryGroup.add(innerOrrery);

    // Middle ring
    const middleOrreryGeo = new THREE.TorusGeometry(1.8, 0.025, 8, 64);
    const middleOrrery = new THREE.Mesh(middleOrreryGeo, orreryMat.clone());
    middleOrrery.rotation.x = Math.PI / 2;
    middleOrrery.rotation.z = Math.PI / 6;
    orreryGroup.add(middleOrrery);

    // Protocol artifacts orbiting the orrery
    const artifactGroup = new THREE.Group();
    orreryGroup.add(artifactGroup);

    interface Artifact {
      mesh: THREE.Mesh;
      label: THREE.Sprite;
      orbit: number;
      angle: number;
      speed: number;
      yOffset: number;
    }
    const artifacts: Artifact[] = [];

    const createTextTexture = (text: string, color: string) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = 256;
      canvas.height = 64;

      ctx.fillStyle = color;
      ctx.font = "bold 32px 'IBM Plex Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 128, 32);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    PROTOCOLS.forEach((protocol, i) => {
      // Artifact body (faceted gem-like)
      const artifactGeo = new THREE.OctahedronGeometry(0.12, 0);
      const artifactMat = new THREE.MeshStandardMaterial({
        color: 0xffc71f,
        roughness: 0.2,
        metalness: 0.9,
        emissive: 0xff8c00,
        emissiveIntensity: 0.2,
      });
      const artifact = new THREE.Mesh(artifactGeo, artifactMat);

      // Position in different orbit rings (only inner and middle now)
      const orbitIndex = i % 2;
      const orbitRadius = [1.2, 1.8][orbitIndex];
      const baseAngle = (i / PROTOCOLS.length) * Math.PI * 2 + orbitIndex * 0.3;

      artifact.position.set(
        Math.cos(baseAngle) * orbitRadius,
        0,
        Math.sin(baseAngle) * orbitRadius
      );

      artifactGroup.add(artifact);

      // Protocol label
      const labelTexture = createTextTexture(protocol.name, "#ffc71f");
      const labelMat = new THREE.SpriteMaterial({
        map: labelTexture,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      });
      const label = new THREE.Sprite(labelMat);
      label.scale.set(0.6, 0.15, 1);
      label.position.copy(artifact.position);
      label.position.y += 0.25;
      artifactGroup.add(label);

      artifacts.push({
        mesh: artifact,
        label,
        orbit: orbitRadius,
        angle: baseAngle,
        speed: 0.15 + Math.random() * 0.1,
        yOffset: (Math.random() - 0.5) * 0.2,
      });
    });

    // Data stream particles (converging to crucible)
    const particleCount = 2000;
    const particlePositions = new Float32Array(particleCount * 3);
    const particlePhases = new Float32Array(particleCount);
    const particleSpeeds = new Float32Array(particleCount);
    const particleSizes = new Float32Array(particleCount);
    const particleColors = new Float32Array(particleCount * 3);

    const colors = [
      new THREE.Color(0xff6b00),
      new THREE.Color(0xffaa00),
      new THREE.Color(0xffc71f),
      new THREE.Color(0xff8c00),
    ];

    for (let i = 0; i < particleCount; i++) {
      particlePhases[i] = Math.random();
      particleSpeeds[i] = 0.5 + Math.random() * 1.5;
      particleSizes[i] = 2 + Math.random() * 4;

      const color = colors[Math.floor(Math.random() * colors.length)];
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("aPhase", new THREE.BufferAttribute(particlePhases, 1));
    particleGeo.setAttribute("aSpeed", new THREE.BufferAttribute(particleSpeeds, 1));
    particleGeo.setAttribute("aSize", new THREE.BufferAttribute(particleSizes, 1));
    particleGeo.setAttribute("aColor", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
      },
      vertexShader: ParticleShader.vertexShader,
      fragmentShader: ParticleShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    particles.visible = false; // DISABLED FOR DEBUGGING
    scene.add(particles);

    // Sparks system (emitting from crucible)
    const sparkCount = 100;
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkVelocities: THREE.Vector3[] = [];
    const sparkLifetimes = new Float32Array(sparkCount);

    for (let i = 0; i < sparkCount; i++) {
      sparkPositions[i * 3] = 0;
      sparkPositions[i * 3 + 1] = 0;
      sparkPositions[i * 3 + 2] = 0;
      sparkVelocities.push(new THREE.Vector3());
      sparkLifetimes[i] = 0;
    }

    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));

    const sparkMat = new THREE.PointsMaterial({
      color: 0xffc71f,
      size: 0.08,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const sparks = new THREE.Points(sparkGeo, sparkMat);
    sparks.visible = false; // DISABLED FOR DEBUGGING
    scene.add(sparks);

    // Ambient dust particles
    const dustCount = 300;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 10;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));

    const dustMat = new THREE.PointsMaterial({
      color: 0x8b7355,
      size: 0.02,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });

    const dust = new THREE.Points(dustGeo, dustMat);
    dust.visible = false; // DISABLED FOR DEBUGGING
    scene.add(dust);

    // Animation
    const clock = new THREE.Clock();
    let animationId: number;
    let sparkTimer = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Smooth mouse following
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Camera parallax
      if (!prefersReducedMotion) {
        camera.position.x = mouseRef.current.x * 1.0;
        camera.position.y = 2.2 + mouseRef.current.y * 0.5;
        camera.lookAt(0, -0.3, 0);
      }

      // Update molten shader
      (moltenMat.uniforms.uTime as THREE.IUniform<number>).value = elapsed;
      (moltenMat.uniforms.uIntensity as THREE.IUniform<number>).value = 
        0.8 + Math.sin(elapsed * 1.5) * 0.2;

      // Update particles
      (particleMat.uniforms.uTime as THREE.IUniform<number>).value = elapsed;

      // Rotate orrery rings at different speeds
      if (!prefersReducedMotion) {
        innerOrrery.rotation.z = elapsed * 0.3;
        middleOrrery.rotation.z = -elapsed * 0.2;
      }

      // Animate artifacts in orbit
      artifacts.forEach((artifact) => {
        if (!prefersReducedMotion) {
          artifact.angle += artifact.speed * delta;
        }
        const x = Math.cos(artifact.angle) * artifact.orbit;
        const z = Math.sin(artifact.angle) * artifact.orbit;
        const y = artifact.yOffset + Math.sin(elapsed * 2 + artifact.angle) * 0.05;

        artifact.mesh.position.set(x, y, z);
        artifact.mesh.rotation.y = elapsed * 2;
        artifact.mesh.rotation.x = elapsed * 1.5;
        artifact.label.position.set(x, y + 0.25, z);

        // Pulsing emissive
        const mat = artifact.mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.3 + Math.sin(elapsed * 3 + artifact.angle) * 0.15;
      });

      // Crucible light flicker - subtle breathing
      crucibleLight.intensity = 1.2 + Math.sin(elapsed * 2) * 0.15 + Math.sin(elapsed * 5) * 0.05;

      // Spark emission
      sparkTimer += delta;
      if (sparkTimer > 0.05 && !prefersReducedMotion) {
        sparkTimer = 0;
        // Emit a new spark
        for (let i = 0; i < sparkCount; i++) {
          if (sparkLifetimes[i] <= 0) {
            sparkPositions[i * 3] = (Math.random() - 0.5) * 0.5;
            sparkPositions[i * 3 + 1] = 0.2;
            sparkPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
            sparkVelocities[i].set(
              (Math.random() - 0.5) * 2,
              1 + Math.random() * 2,
              (Math.random() - 0.5) * 2
            );
            sparkLifetimes[i] = 1 + Math.random();
            break;
          }
        }
      }

      // Update sparks
      for (let i = 0; i < sparkCount; i++) {
        if (sparkLifetimes[i] > 0) {
          sparkLifetimes[i] -= delta;
          sparkVelocities[i].y -= delta * 3; // gravity

          sparkPositions[i * 3] += sparkVelocities[i].x * delta;
          sparkPositions[i * 3 + 1] += sparkVelocities[i].y * delta;
          sparkPositions[i * 3 + 2] += sparkVelocities[i].z * delta;
        }
      }
      sparkGeo.attributes.position.needsUpdate = true;

      // Dust floating
      const dustPos = dust.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < dustCount; i++) {
        dustPos[i * 3 + 1] += Math.sin(elapsed * 0.5 + i) * 0.0003;
      }
      dust.geometry.attributes.position.needsUpdate = true;
      dust.rotation.y = elapsed * 0.02;

      composer.render();
    };

    // Resize handler
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    container.addEventListener("mousemove", handleMouseMove);

    // Intro animation - slow and cinematic
    gsap.from(camera.position, {
      z: 18,
      y: 8,
      duration: 5,
      ease: "power2.out",
    });

    gsap.to(particleMat.uniforms.uProgress, {
      value: 1,
      duration: 4,
      delay: 1.5,
      ease: "power2.out",
    });

    // Stagger orrery entrance - slower, more graceful
    gsap.from(orreryGroup.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 3,
      delay: 2,
      ease: "power3.out",
    });

    gsap.from(cauldronGroup.position, {
      y: -2,
      duration: 2.5,
      delay: 0.8,
      ease: "power2.out",
    });

    // Fade in crucible light gradually
    crucibleLight.intensity = 0;
    gsap.to(crucibleLight, {
      intensity: 1.2,
      duration: 3,
      delay: 1,
      ease: "power2.out",
    });

    animate();

    setTimeout(() => setIsLoaded(true), 1500);

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
      composer.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <section className="relative min-h-screen flex overflow-hidden bg-obsidian">
      {/* Main layout: Left text | Right cauldron */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full min-h-screen">
        {/* Left side - Text content */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-12 lg:py-0">
          <div
            className={`
              transition-all duration-1000 ease-out
              ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
            `}
          >
            {/* Museum plaque style container */}
            <div className="relative inline-block">
              {/* Decorative corner brackets */}
              <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-brass opacity-60" />
              <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-brass opacity-60" />
              <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-brass opacity-60" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-brass opacity-60" />

              <div className="px-8 md:px-12 py-8 md:py-10">
                <p className="museum-label mb-4 text-amber tracking-[0.25em]">
                  THE PROTOCOL VISUALIZATION MUSEUM
                </p>

                <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
                  <span className="block text-text-bright text-glow-gold">EXPLAIN</span>
                  <span className="block text-gold" style={{ 
                    textShadow: "0 0 40px rgba(255,199,31,0.5), 0 0 80px rgba(255,140,0,0.3)" 
                  }}>
                    RFC
                  </span>
                </h1>

                <div className="incised w-32 md:w-48 my-6" />

                <p className="font-display text-lg md:text-xl text-text-secondary max-w-md leading-relaxed">
                  Where dense specifications become
                  <span className="text-brass font-semibold"> living exhibits</span>
                </p>
              </div>
            </div>

            {/* Scroll prompt - below text on left side */}
            <div
              className={`
                mt-12 transition-all duration-1000 delay-500
                ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
              `}
            >
              <a
                href="#vault"
                className="group inline-flex items-center gap-4"
              >
                <div className="w-8 h-12 rounded-full border border-patina group-hover:border-gold transition-colors flex items-start justify-center p-2">
                  <div className="w-1 h-2.5 bg-amber rounded-full animate-bounce" />
                </div>
                <span className="font-mono text-xs tracking-wider text-text-muted group-hover:text-gold transition-colors">
                  ENTER THE VAULT
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Right side - Cauldron area with input/output spaces */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Left input space (placeholder) */}
          <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-24 z-20">
            {/* Future: Input elements will go here */}
          </div>

          {/* 3D Canvas - Cauldron */}
          <div
            ref={containerRef}
            className="w-full h-[50vh] lg:h-full lg:absolute lg:inset-0"
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full"
            />
          </div>

          {/* Right output space (placeholder) */}
          <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-24 z-20">
            {/* Future: Output elements will go here */}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-obsidian to-transparent pointer-events-none z-20" />
    </section>
  );
}
