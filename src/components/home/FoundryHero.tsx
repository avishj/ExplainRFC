import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { gsap } from "gsap";

// RFCs for output bricks (what gets forged)
const RFC_OUTPUTS = [
  { rfc: 793, title: "TCP" },
  { rfc: 791, title: "IP" },
  { rfc: 1035, title: "DNS" },
  { rfc: 8446, title: "TLS 1.3" },
  { rfc: 768, title: "UDP" },
  { rfc: 2616, title: "HTTP/1.1" },
  { rfc: 9000, title: "QUIC" },
  { rfc: 4271, title: "BGP" },
  { rfc: 7540, title: "HTTP/2" },
  { rfc: 6749, title: "OAuth 2.0" },
];

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
    uBaseColor: { value: new THREE.Color(0xff6b00) },
    uHighColor: { value: new THREE.Color(0xffc71f) },
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
      // Multi-layered noise for turbulent molten effect
      float noise1 = snoise(vec3(vPosition.xy * 2.0, uTime * 0.3)) * 0.5 + 0.5;
      float noise2 = snoise(vec3(vPosition.xy * 4.0, uTime * 0.5 + 100.0)) * 0.5 + 0.5;
      float noise3 = snoise(vec3(vPosition.xy * 8.0, uTime * 0.8 + 200.0)) * 0.5 + 0.5;
      
      float combined = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
      
      // Hot spots that move and pulse
      float hotSpot = pow(combined, 2.0) * uIntensity;
      
      // Color gradient from deep orange to bright gold
      vec3 color = mix(uBaseColor, uHighColor, hotSpot);
      
      // Add bright white-hot core areas - reduced intensity
      float whiteHot = smoothstep(0.9, 1.0, combined * uIntensity);
      color = mix(color, vec3(1.0, 0.95, 0.8), whiteHot * 0.3);
      
      // Rim darkening for depth
      float rim = 1.0 - pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 1.5);
      color *= mix(0.3, 1.0, rim);
      
      // Pulsing glow
      float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
      
      gl_FragColor = vec4(color * pulse, 1.0);
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
      float radius = (1.0 - t) * 3.0 + 0.3;
      float height = (1.0 - t) * 2.0 - 1.0;
      
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

// RFC Sheet shader - document that burns as it approaches crucible
const SheetShader = {
  uniforms: {
    uTime: { value: 0 },
    uBurnProgress: { value: 0 },
    uOpacity: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    uniform float uBurnProgress;
    uniform float uTime;
    
    void main() {
      vUv = uv;
      
      // Curl effect as sheet burns
      vec3 pos = position;
      float curl = uBurnProgress * sin(uv.x * 3.14159 + uTime * 2.0) * 0.1;
      pos.z += curl;
      pos.y += uBurnProgress * sin(uv.y * 6.28) * 0.05;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uBurnProgress;
    uniform float uOpacity;
    uniform float uTime;
    varying vec2 vUv;
    
    void main() {
      // Base sheet color - very dark charcoal
      vec3 sheetColor = vec3(0.06, 0.05, 0.04);
      
      // Faint text lines
      float lines = step(0.8, sin(vUv.y * 40.0));
      sheetColor += vec3(0.03) * lines * (1.0 - uBurnProgress);
      
      // Burn edge effect
      float burnEdge = smoothstep(1.0 - uBurnProgress * 1.2, 1.0 - uBurnProgress * 1.2 + 0.15, vUv.x + vUv.y * 0.3);
      
      // Ember glow at burn edge
      vec3 emberColor = mix(vec3(1.0, 0.3, 0.0), vec3(1.0, 0.6, 0.1), sin(uTime * 10.0 + vUv.y * 20.0) * 0.5 + 0.5);
      float emberGlow = smoothstep(0.0, 0.1, burnEdge) * smoothstep(0.3, 0.1, burnEdge);
      
      vec3 finalColor = mix(sheetColor, emberColor, emberGlow * 2.0);
      
      // Fade to transparent as it burns away
      float alpha = (1.0 - burnEdge) * uOpacity;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};

// RFC Brick shader - cooling molten metal with stamped text
const BrickShader = {
  uniforms: {
    uTime: { value: 0 },
    uHeat: { value: 1.0 },
    uOpacity: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uHeat;
    uniform float uOpacity;
    varying vec2 vUv;
    varying vec3 vNormal;
    
    void main() {
      // Cool brass color
      vec3 brassColor = vec3(0.83, 0.64, 0.3);
      // Hot molten color
      vec3 hotColor = vec3(1.0, 0.5, 0.1);
      // White hot
      vec3 whiteHot = vec3(1.0, 0.9, 0.7);
      
      // Mix based on heat level
      vec3 color = mix(brassColor, hotColor, uHeat);
      color = mix(color, whiteHot, uHeat * uHeat * 0.3);
      
      // Add some surface variation
      float noise = sin(vUv.x * 50.0 + uTime) * sin(vUv.y * 50.0) * 0.02;
      color += noise * uHeat;
      
      // Rim lighting
      float rim = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
      color += vec3(1.0, 0.7, 0.3) * rim * 0.2 * (1.0 - uHeat * 0.5);
      
      // Emissive glow when hot
      color += hotColor * uHeat * 0.5;
      
      gl_FragColor = vec4(color, uOpacity);
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
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);

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
      0.5, // strength - much more subtle
      0.3, // radius
      0.92 // threshold - only brightest elements bloom
    );
    composer.addPass(bloomPass);

    const vignettePass = new ShaderPass(VignetteShader);
    composer.addPass(vignettePass);

    // Lighting - forge atmosphere
    const ambientLight = new THREE.AmbientLight(0x1a0a00, 0.3);
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

    // Create the obsidian plinth
    const plinthGroup = new THREE.Group();
    scene.add(plinthGroup);

    const plinthGeo = new THREE.CylinderGeometry(2.5, 3, 0.4, 64, 1);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.15,
      metalness: 0.9,
      envMapIntensity: 0.3,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -1.5;
    plinthGroup.add(plinth);

    // Decorative rings on plinth
    const ringGeo = new THREE.TorusGeometry(2.7, 0.03, 8, 64);
    const brassRingMat = new THREE.MeshStandardMaterial({
      color: 0xd4a44c,
      roughness: 0.3,
      metalness: 0.95,
      emissive: 0xff8c00,
      emissiveIntensity: 0.05,
    });
    const plinthRing1 = new THREE.Mesh(ringGeo, brassRingMat);
    plinthRing1.rotation.x = Math.PI / 2;
    plinthRing1.position.y = -1.3;
    plinthGroup.add(plinthRing1);

    const plinthRing2 = plinthRing1.clone();
    plinthRing2.position.y = -1.7;
    plinthGroup.add(plinthRing2);

    // Central crucible
    const crucibleGroup = new THREE.Group();
    scene.add(crucibleGroup);

    const crucibleOuterGeo = new THREE.CylinderGeometry(0.8, 0.6, 0.5, 32, 1, true);
    const crucibleMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.2,
      metalness: 0.95,
      side: THREE.DoubleSide,
    });
    const crucibleOuter = new THREE.Mesh(crucibleOuterGeo, crucibleMat);
    crucibleGroup.add(crucibleOuter);

    const rimGeo = new THREE.TorusGeometry(0.8, 0.06, 16, 32);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.4,
      metalness: 0.85,
      emissive: 0xff6b00,
      emissiveIntensity: 0.1,
    });
    const crucibleRim = new THREE.Mesh(rimGeo, rimMat);
    crucibleRim.rotation.x = Math.PI / 2;
    crucibleRim.position.y = 0.25;
    crucibleGroup.add(crucibleRim);

    // Molten metal surface (custom shader)
    const moltenGeo = new THREE.CircleGeometry(0.75, 64);
    const moltenMat = new THREE.ShaderMaterial({
      uniforms: { ...MoltenShader.uniforms },
      vertexShader: MoltenShader.vertexShader,
      fragmentShader: MoltenShader.fragmentShader,
      transparent: false,
    });
    const moltenSurface = new THREE.Mesh(moltenGeo, moltenMat);
    moltenSurface.rotation.x = -Math.PI / 2;
    moltenSurface.position.y = 0.1;
    crucibleGroup.add(moltenSurface);

    // Orrery rings
    const orreryGroup = new THREE.Group();
    orreryGroup.position.y = 0.8;
    scene.add(orreryGroup);

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

    const middleOrreryGeo = new THREE.TorusGeometry(1.8, 0.025, 8, 64);
    const middleOrrery = new THREE.Mesh(middleOrreryGeo, orreryMat.clone());
    middleOrrery.rotation.x = Math.PI / 2;
    middleOrrery.rotation.z = Math.PI / 6;
    orreryGroup.add(middleOrrery);

    const outerOrreryGeo = new THREE.TorusGeometry(2.4, 0.03, 8, 64);
    const outerOrrery = new THREE.Mesh(outerOrreryGeo, orreryMat.clone());
    outerOrrery.rotation.x = Math.PI / 2;
    outerOrrery.rotation.z = -Math.PI / 8;
    orreryGroup.add(outerOrrery);

    // Tick marks on outer ring
    const tickGeo = new THREE.BoxGeometry(0.02, 0.15, 0.02);
    const tickMat = new THREE.MeshStandardMaterial({
      color: 0xffc71f,
      emissive: 0xff8c00,
      emissiveIntensity: 0.2,
    });
    for (let i = 0; i < 24; i++) {
      const tick = new THREE.Mesh(tickGeo, tickMat);
      const angle = (i / 24) * Math.PI * 2;
      tick.position.set(Math.cos(angle) * 2.4, 0, Math.sin(angle) * 2.4);
      tick.lookAt(0, 0, 0);
      orreryGroup.add(tick);
    }

    // Protocol artifacts
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
      const artifactGeo = new THREE.OctahedronGeometry(0.12, 0);
      const artifactMat = new THREE.MeshStandardMaterial({
        color: 0xffc71f,
        roughness: 0.2,
        metalness: 0.9,
        emissive: 0xff8c00,
        emissiveIntensity: 0.2,
      });
      const artifact = new THREE.Mesh(artifactGeo, artifactMat);

      const orbitIndex = i % 3;
      const orbitRadius = [1.2, 1.8, 2.4][orbitIndex];
      const baseAngle = (i / PROTOCOLS.length) * Math.PI * 2 + orbitIndex * 0.3;

      artifact.position.set(
        Math.cos(baseAngle) * orbitRadius,
        0,
        Math.sin(baseAngle) * orbitRadius
      );

      artifactGroup.add(artifact);

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

    // ========== RFC SHEET INPUTS (from upper-left) ==========
    interface RFCSheet {
      mesh: THREE.Mesh;
      material: THREE.ShaderMaterial;
      startTime: number;
      duration: number;
      startPos: THREE.Vector3;
      active: boolean;
    }
    const sheets: RFCSheet[] = [];
    let nextSheetTime = 3; // Start after intro animation
    const sheetInterval = 4; // Seconds between sheets

    const createSheet = (elapsed: number) => {
      const sheetGeo = new THREE.PlaneGeometry(0.5, 0.35, 8, 8);
      const sheetMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: elapsed },
          uBurnProgress: { value: 0 },
          uOpacity: { value: 0 },
        },
        vertexShader: SheetShader.vertexShader,
        fragmentShader: SheetShader.fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const sheet = new THREE.Mesh(sheetGeo, sheetMat);
      const startPos = new THREE.Vector3(-4.5, 3.5, -1);
      sheet.position.copy(startPos);
      sheet.rotation.x = -0.3;
      sheet.rotation.z = 0.15;
      scene.add(sheet);

      sheets.push({
        mesh: sheet,
        material: sheetMat,
        startTime: elapsed,
        duration: 5,
        startPos: startPos.clone(),
        active: true,
      });
    };

    // ========== RFC BRICK OUTPUTS (to the right) ==========
    interface RFCBrick {
      group: THREE.Group;
      material: THREE.ShaderMaterial;
      labelSprite: THREE.Sprite;
      startTime: number;
      duration: number;
      rfcData: { rfc: number; title: string };
      active: boolean;
      phase: "emerge" | "cool" | "drift" | "fade";
    }
    const bricks: RFCBrick[] = [];
    let nextBrickTime = 5;
    const brickInterval = 5;
    let brickIndex = 0;

    const createBrickLabelTexture = (rfc: number, title: string) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = 512;
      canvas.height = 128;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Text styling
      ctx.fillStyle = "#1a1510";
      ctx.font = "bold 48px 'IBM Plex Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`RFC ${rfc} | ${title}`, 256, 64);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    const createBrick = (elapsed: number) => {
      const rfcData = RFC_OUTPUTS[brickIndex % RFC_OUTPUTS.length];
      brickIndex++;

      const group = new THREE.Group();

      // Brick geometry
      const brickGeo = new THREE.BoxGeometry(0.8, 0.25, 0.4);
      const brickMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: elapsed },
          uHeat: { value: 1.0 },
          uOpacity: { value: 0 },
        },
        vertexShader: BrickShader.vertexShader,
        fragmentShader: BrickShader.fragmentShader,
        transparent: true,
      });

      const brickMesh = new THREE.Mesh(brickGeo, brickMat);
      group.add(brickMesh);

      // Label on the brick
      const labelTexture = createBrickLabelTexture(rfcData.rfc, rfcData.title);
      const labelMat = new THREE.SpriteMaterial({
        map: labelTexture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const labelSprite = new THREE.Sprite(labelMat);
      labelSprite.scale.set(1.2, 0.3, 1);
      labelSprite.position.y = 0.02;
      labelSprite.position.z = 0.21;
      group.add(labelSprite);

      // Start position - emerging from crucible
      group.position.set(0.3, 0.3, 0);
      group.rotation.y = -0.3;
      scene.add(group);

      bricks.push({
        group,
        material: brickMat,
        labelSprite,
        startTime: elapsed,
        duration: 8,
        rfcData,
        active: true,
        phase: "emerge",
      });
    };

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
    scene.add(dust);

    // Animation
    const clock = new THREE.Clock();
    let animationId: number;
    let sparkTimer = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const delta = Math.min(clock.getDelta(), 0.1);

      // Smooth mouse following
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Camera parallax
      if (!prefersReducedMotion) {
        camera.position.x = mouseRef.current.x * 1.5;
        camera.position.y = 3 + mouseRef.current.y * 0.8;
        camera.lookAt(0, 0, 0);
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
        outerOrrery.rotation.z = elapsed * 0.1;
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

      // ========== ANIMATE RFC SHEETS ==========
      if (elapsed > nextSheetTime && !prefersReducedMotion) {
        createSheet(elapsed);
        nextSheetTime = elapsed + sheetInterval + Math.random() * 2;
      }

      sheets.forEach((sheet, idx) => {
        if (!sheet.active) return;

        const progress = (elapsed - sheet.startTime) / sheet.duration;

        if (progress > 1) {
          scene.remove(sheet.mesh);
          sheet.mesh.geometry.dispose();
          sheet.material.dispose();
          sheet.active = false;
          return;
        }

        // Move toward crucible
        const targetPos = new THREE.Vector3(0, 0.5, 0);
        sheet.mesh.position.lerpVectors(sheet.startPos, targetPos, Math.pow(progress, 0.7));

        // Fade in at start
        const fadeIn = Math.min(progress * 5, 1);
        // Burn progress increases as it gets closer
        const burnProgress = Math.max(0, (progress - 0.4) / 0.6);

        sheet.material.uniforms.uTime.value = elapsed;
        sheet.material.uniforms.uOpacity.value = fadeIn * (1 - Math.pow(progress, 3));
        sheet.material.uniforms.uBurnProgress.value = burnProgress;

        // Wobble and rotate as it falls
        sheet.mesh.rotation.x = -0.3 + Math.sin(elapsed * 2 + idx) * 0.1;
        sheet.mesh.rotation.z = 0.15 + Math.sin(elapsed * 1.5 + idx) * 0.1;
        sheet.mesh.rotation.y = progress * 0.5;
      });

      // ========== ANIMATE RFC BRICKS ==========
      if (elapsed > nextBrickTime && !prefersReducedMotion) {
        createBrick(elapsed);
        nextBrickTime = elapsed + brickInterval + Math.random() * 2;
      }

      bricks.forEach((brick) => {
        if (!brick.active) return;

        const age = elapsed - brick.startTime;

        if (age > brick.duration) {
          scene.remove(brick.group);
          brick.material.dispose();
          brick.active = false;
          return;
        }

        // Phase timings
        const emergeEnd = 1.2;
        const coolEnd = 3.0;
        const driftEnd = 7.0;

        if (age < emergeEnd) {
          // Emerge from crucible
          brick.phase = "emerge";
          const t = age / emergeEnd;
          brick.group.position.y = 0.3 + t * 0.5;
          brick.group.position.x = 0.3 + t * 0.3;
          brick.material.uniforms.uOpacity.value = Math.min(t * 2, 1);
          brick.material.uniforms.uHeat.value = 1.0;
          brick.labelSprite.material.opacity = 0;
        } else if (age < coolEnd) {
          // Cooling phase
          brick.phase = "cool";
          const t = (age - emergeEnd) / (coolEnd - emergeEnd);
          brick.material.uniforms.uHeat.value = 1.0 - t * 0.9;
          brick.labelSprite.material.opacity = t * 0.8;
          brick.group.position.x = 0.6 + t * 0.5;
          brick.group.position.y = 0.8 + t * 0.2;
        } else if (age < driftEnd) {
          // Drifting right
          brick.phase = "drift";
          const t = (age - coolEnd) / (driftEnd - coolEnd);
          brick.group.position.x = 1.1 + t * 4;
          brick.group.position.y = 1.0 - t * 0.3;
          brick.group.rotation.y = -0.3 + t * 0.2;
          brick.material.uniforms.uHeat.value = 0.1 - t * 0.1;
        } else {
          // Fading out
          brick.phase = "fade";
          const t = (age - driftEnd) / (brick.duration - driftEnd);
          brick.material.uniforms.uOpacity.value = 1 - t;
          brick.labelSprite.material.opacity = 0.8 * (1 - t);
        }

        brick.material.uniforms.uTime.value = elapsed;
      });

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

    // ========== SLOW CINEMATIC INTRO ==========
    gsap.from(camera.position, {
      z: 18,
      y: 8,
      duration: 6,
      ease: "power2.out",
    });

    gsap.to(particleMat.uniforms.uProgress, {
      value: 1,
      duration: 5,
      delay: 2,
      ease: "power2.out",
    });

    // Stagger orrery entrance - slower, more graceful
    gsap.from(orreryGroup.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 4,
      delay: 2.5,
      ease: "power3.out",
    });

    gsap.from(crucibleGroup.position, {
      y: -2,
      duration: 3,
      delay: 1,
      ease: "power2.out",
    });

    // Fade in crucible light gradually
    crucibleLight.intensity = 0;
    gsap.to(crucibleLight, {
      intensity: 1.2,
      duration: 4,
      delay: 1.5,
      ease: "power2.out",
    });

    animate();

    setTimeout(() => setIsLoaded(true), 2000);

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
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* 3D Canvas - Full bleed background */}
      <div
        ref={containerRef}
        className="absolute inset-0"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top section with title */}
        <div className="flex-1 flex items-center justify-center px-6 pt-16 md:pt-24">
          <div
            className={`
              text-center transition-all duration-[2000ms] ease-out
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

              <div className="px-8 md:px-16 py-8 md:py-12">
                <p className="museum-label mb-4 md:mb-6 text-amber tracking-[0.25em]">
                  THE PROTOCOL VISUALIZATION MUSEUM
                </p>

                <h1 className="font-display text-5xl sm:text-7xl md:text-9xl font-bold tracking-tight mb-4 md:mb-6">
                  <span className="block text-text-bright text-glow-gold">EXPLAIN</span>
                  <span className="block text-gold" style={{
                    textShadow: "0 0 30px rgba(255,199,31,0.4), 0 0 60px rgba(255,140,0,0.2)"
                  }}>
                    RFC
                  </span>
                </h1>

                <div className="incised w-32 md:w-64 mx-auto my-6 md:my-8" />

                <p className="font-display text-lg md:text-2xl text-text-secondary max-w-xl mx-auto leading-relaxed">
                  Where dense specifications become
                  <span className="text-brass font-semibold"> living exhibits</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll prompt */}
        <div
          className={`
            pb-12 text-center transition-all duration-[2000ms] delay-1000
            ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          <a
            href="#vault"
            className="group inline-flex flex-col items-center gap-3"
          >
            <span className="font-mono text-xs tracking-wider text-text-muted group-hover:text-gold transition-colors">
              ENTER THE VAULT
            </span>
            <div className="w-8 h-12 rounded-full border border-patina group-hover:border-gold transition-colors flex items-start justify-center p-2">
              <div className="w-1 h-2.5 bg-amber rounded-full animate-bounce" />
            </div>
          </a>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-obsidian to-transparent pointer-events-none" />
    </section>
  );
}
