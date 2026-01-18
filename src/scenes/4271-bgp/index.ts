import * as THREE from "three";
import { gsap } from "gsap";
import type { SceneController, SceneInitFn, StoryboardStep } from "@/types";

interface ASNode {
  id: string;
  mesh: THREE.Group;
  position: THREE.Vector3;
  connections: string[];
  isHijacker?: boolean;
  routeGlow?: THREE.Mesh;
  label: string;
}

interface PeeringLink {
  from: string;
  to: string;
  line: THREE.Line;
  tube?: THREE.Mesh;
}

interface RouteWave {
  mesh: THREE.Mesh;
  progress: number;
}

interface Entities {
  asNodes: Map<string, ASNode>;
  peeringLinks: PeeringLink[];
  routeWaves: RouteWave[];
  particles: THREE.Points;
  nebula: THREE.Mesh;
  routePaths: THREE.Line[];
  activeRoutes: Map<string, THREE.Line>;
}

const AS_TOPOLOGY = [
  { id: "AS-100", label: "Origin", x: -6, y: 0, z: 0, connections: ["AS-200", "AS-300"] },
  { id: "AS-200", label: "Transit A", x: -2, y: 3, z: 2, connections: ["AS-100", "AS-400", "AS-500"] },
  { id: "AS-300", label: "Transit B", x: -2, y: -3, z: -2, connections: ["AS-100", "AS-400", "AS-500"] },
  { id: "AS-400", label: "Tier-1", x: 2, y: 0, z: 3, connections: ["AS-200", "AS-300", "AS-500", "AS-600"] },
  { id: "AS-500", label: "Enterprise", x: 5, y: 2, z: -1, connections: ["AS-200", "AS-300", "AS-400"] },
  { id: "AS-600", label: "Edge", x: 7, y: -2, z: 1, connections: ["AS-400"] },
  { id: "AS-666", label: "Rogue", x: 4, y: -4, z: -4, connections: ["AS-400"], isHijacker: true },
];

export const init: SceneInitFn = async (
  canvas: HTMLCanvasElement,
  accentColors: [string, string]
): Promise<SceneController> => {
  const [primaryColor, secondaryColor] = accentColors;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a12, 0.02);

  const camera = new THREE.PerspectiveCamera(
    55,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    200
  );
  camera.position.set(0, 15, 25);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x050508, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
  scene.add(ambientLight);

  const primaryLight = new THREE.PointLight(primaryColor, 3, 50);
  primaryLight.position.set(-10, 10, 10);
  scene.add(primaryLight);

  const secondaryLight = new THREE.PointLight(secondaryColor, 2, 50);
  secondaryLight.position.set(10, -5, -10);
  scene.add(secondaryLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
  rimLight.position.set(0, 20, -20);
  scene.add(rimLight);

  const entities = createEntities(scene, primaryColor, secondaryColor);

  let animationId: number;
  let currentTimeline: gsap.core.Timeline | null = null;

  const handleResize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  window.addEventListener("resize", handleResize);

  const clock = new THREE.Clock();

  function animate() {
    animationId = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    entities.asNodes.forEach((node, _id) => {
      node.mesh.position.y = node.position.y + Math.sin(elapsed * 0.5 + node.position.x) * 0.15;
      node.mesh.rotation.y = elapsed * 0.1;
      
      const core = node.mesh.children[0] as THREE.Mesh;
      if (core) {
        const pulse = 1 + Math.sin(elapsed * 2 + node.position.x) * 0.03;
        core.scale.setScalar(pulse);
      }

      if (node.routeGlow) {
        const glowMat = node.routeGlow.material as THREE.MeshBasicMaterial;
        glowMat.opacity = 0.3 + Math.sin(elapsed * 3) * 0.1;
      }
    });

    entities.particles.rotation.y = elapsed * 0.02;
    entities.particles.rotation.x = elapsed * 0.01;

    const nebulaMat = entities.nebula.material as THREE.ShaderMaterial;
    nebulaMat.uniforms.uTime.value = elapsed;

    renderer.render(scene, camera);
  }
  animate();

  return {
    apply(step: StoryboardStep) {
      if (currentTimeline) {
        currentTimeline.kill();
      }
      currentTimeline = gsap.timeline();

      if (step.scene?.camera) {
        currentTimeline.to(camera.position, {
          x: step.scene.camera.x,
          y: step.scene.camera.y,
          z: step.scene.camera.z,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => camera.lookAt(0, 0, 0),
        }, 0);
      }

      switch (step.scene?.action) {
        case "showPeering":
          animatePeeringReveal(entities, currentTimeline, primaryColor);
          break;
        case "establishSession":
          animateSessionEstablish(entities, step.scene.from!, step.scene.to!, currentTimeline, primaryColor);
          break;
        case "announceRoute":
          animateRouteAnnounce(entities, scene, step.scene.from!, currentTimeline, primaryColor);
          break;
        case "propagateRoute":
          animateRoutePropagation(entities, scene, currentTimeline, primaryColor);
          break;
        case "showMultiplePaths":
          animateMultiplePaths(entities, scene, step.scene.to!, currentTimeline, primaryColor, secondaryColor);
          break;
        case "selectBestPath":
          animateBestPathSelection(entities, step.scene.at!, currentTimeline, primaryColor);
          break;
        case "showConvergence":
          animateConvergence(entities, currentTimeline, primaryColor);
          break;
        case "hijackRoute":
          animateHijack(entities, scene, step.scene.from!, currentTimeline);
          break;
        case "withdrawRoute":
          animateWithdrawal(entities, step.scene.from!, currentTimeline);
          break;
      }

      if (step.scene?.highlight) {
        highlightNodes(entities, step.scene.highlight, currentTimeline, primaryColor);
      }
    },

    setProgress(_progress: number) {},

    dispose() {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      if (currentTimeline) {
        currentTimeline.kill();
      }
      renderer.dispose();
      scene.clear();
    },
  };
}

function createEntities(
  scene: THREE.Scene,
  primaryColor: string,
  secondaryColor: string
): Entities {
  const asNodes = new Map<string, ASNode>();
  const peeringLinks: PeeringLink[] = [];

  AS_TOPOLOGY.forEach(config => {
    const node = createASNode(config, primaryColor, secondaryColor);
    scene.add(node.mesh);
    asNodes.set(config.id, node);
  });

  const processedLinks = new Set<string>();
  AS_TOPOLOGY.forEach(config => {
    config.connections.forEach(targetId => {
      const linkKey = [config.id, targetId].sort().join("-");
      if (!processedLinks.has(linkKey)) {
        processedLinks.add(linkKey);
        const sourceNode = asNodes.get(config.id)!;
        const targetNode = asNodes.get(targetId)!;
        const link = createPeeringLink(sourceNode, targetNode, primaryColor);
        scene.add(link.line);
        if (link.tube) scene.add(link.tube);
        peeringLinks.push(link);
      }
    });
  });

  const particles = createCosmicParticles(primaryColor, secondaryColor);
  scene.add(particles);

  const nebula = createNebula(primaryColor, secondaryColor);
  scene.add(nebula);

  const gridHelper = new THREE.GridHelper(40, 40, 0x1a1a2e, 0x0d0d1a);
  gridHelper.position.y = -8;
  scene.add(gridHelper);

  return {
    asNodes,
    peeringLinks,
    routeWaves: [],
    particles,
    nebula,
    routePaths: [],
    activeRoutes: new Map(),
  };
}

function createASNode(
  config: typeof AS_TOPOLOGY[0],
  primaryColor: string,
  secondaryColor: string
): ASNode {
  const group = new THREE.Group();
  const position = new THREE.Vector3(config.x, config.y, config.z);
  group.position.copy(position);

  const isHijacker = config.isHijacker || false;
  const nodeColor = isHijacker ? 0xff2255 : primaryColor;

  const coreGeometry = new THREE.IcosahedronGeometry(0.6, 1);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: nodeColor,
    emissive: nodeColor,
    emissiveIntensity: 0.4,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.9,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  group.add(core);

  const shellGeometry = new THREE.IcosahedronGeometry(0.9, 0);
  const shellMaterial = new THREE.MeshBasicMaterial({
    color: nodeColor,
    wireframe: true,
    transparent: true,
    opacity: 0.3,
  });
  const shell = new THREE.Mesh(shellGeometry, shellMaterial);
  group.add(shell);

  const ringGeometry = new THREE.TorusGeometry(1.1, 0.02, 8, 32);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: secondaryColor,
    transparent: true,
    opacity: 0.4,
  });

  const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
  ring1.rotation.x = Math.PI / 2;
  group.add(ring1);

  const ring2 = new THREE.Mesh(ringGeometry, ringMaterial.clone());
  ring2.rotation.y = Math.PI / 3;
  ring2.rotation.z = Math.PI / 4;
  group.add(ring2);

  const glowGeometry = new THREE.SphereGeometry(1.5, 16, 16);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: nodeColor,
    transparent: true,
    opacity: 0,
    side: THREE.BackSide,
  });
  const routeGlow = new THREE.Mesh(glowGeometry, glowMaterial);
  group.add(routeGlow);

  group.userData = {
    id: config.id,
    label: config.label,
    isHijacker,
  };

  return {
    id: config.id,
    mesh: group,
    position,
    connections: config.connections,
    isHijacker,
    routeGlow,
    label: config.label,
  };
}

function createPeeringLink(source: ASNode, target: ASNode, color: string): PeeringLink {
  const points = [source.position.clone(), target.position.clone()];

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.15,
  });
  const line = new THREE.Line(lineGeometry, lineMaterial);

  return {
    from: source.id,
    to: target.id,
    line,
  };
}

function createCosmicParticles(primaryColor: string, secondaryColor: string): THREE.Points {
  const count = 800;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  const color1 = new THREE.Color(primaryColor);
  const color2 = new THREE.Color(secondaryColor);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const radius = 20 + Math.random() * 30;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    const color = Math.random() > 0.5 ? color1 : color2;
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[i] = Math.random() * 0.15 + 0.05;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometry, material);
}

function createNebula(primaryColor: string, secondaryColor: string): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(100, 100);

  const material = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(primaryColor) },
      uColor2: { value: new THREE.Color(secondaryColor) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      varying vec2 vUv;

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec2 uv = vUv - 0.5;
        float dist = length(uv);
        
        float n = noise(uv * 3.0 + uTime * 0.1);
        float pattern = sin(dist * 10.0 - uTime * 0.5 + n * 5.0) * 0.5 + 0.5;
        
        vec3 color = mix(uColor1, uColor2, pattern);
        float alpha = (1.0 - dist * 1.5) * 0.08 * pattern;
        
        gl_FragColor = vec4(color, max(0.0, alpha));
      }
    `,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -10;

  return mesh;
}

function animatePeeringReveal(
  entities: Entities,
  timeline: gsap.core.Timeline,
  _color: string
) {
  entities.peeringLinks.forEach((link, index) => {
    const material = link.line.material as THREE.LineBasicMaterial;
    timeline.to(material, {
      opacity: 0.5,
      duration: 0.3,
    }, index * 0.1);
  });
}

function animateSessionEstablish(
  entities: Entities,
  fromId: string,
  toId: string,
  timeline: gsap.core.Timeline,
  color: string
) {
  const fromNode = entities.asNodes.get(fromId);
  const toNode = entities.asNodes.get(toId);
  if (!fromNode || !toNode) return;

  const link = entities.peeringLinks.find(
    l => (l.from === fromId && l.to === toId) || (l.from === toId && l.to === fromId)
  );

  if (link) {
    const material = link.line.material as THREE.LineBasicMaterial;

    timeline.to(material, {
      opacity: 0.8,
      duration: 0.5,
    }, 0);

    const flashColor = new THREE.Color(color);
    timeline.to(material.color, {
      r: 1,
      g: 1,
      b: 1,
      duration: 0.2,
    }, 0.5);
    timeline.to(material.color, {
      r: flashColor.r,
      g: flashColor.g,
      b: flashColor.b,
      duration: 0.3,
    }, 0.7);
  }

  [fromNode, toNode].forEach((node, i) => {
    const core = node.mesh.children[0] as THREE.Mesh;
    const mat = core.material as THREE.MeshStandardMaterial;
    timeline.to(mat, {
      emissiveIntensity: 1,
      duration: 0.3,
    }, i * 0.3);
    timeline.to(mat, {
      emissiveIntensity: 0.4,
      duration: 0.5,
    }, i * 0.3 + 0.5);
  });
}

function animateRouteAnnounce(
  entities: Entities,
  scene: THREE.Scene,
  fromId: string,
  timeline: gsap.core.Timeline,
  color: string
) {
  const fromNode = entities.asNodes.get(fromId);
  if (!fromNode) return;

  const glowMat = fromNode.routeGlow!.material as THREE.MeshBasicMaterial;
  timeline.to(glowMat, {
    opacity: 0.4,
    duration: 0.5,
  }, 0);

  const waveGeometry = new THREE.RingGeometry(0.5, 0.7, 32);
  const waveMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
  });
  const wave = new THREE.Mesh(waveGeometry, waveMaterial);
  wave.position.copy(fromNode.position);
  wave.lookAt(0, fromNode.position.y + 10, 0);
  scene.add(wave);

  timeline.to(wave.scale, {
    x: 5,
    y: 5,
    z: 5,
    duration: 1.5,
    ease: "power2.out",
  }, 0);
  timeline.to(waveMaterial, {
    opacity: 0,
    duration: 1.5,
    ease: "power2.out",
    onComplete: () => {
      scene.remove(wave);
      waveGeometry.dispose();
      waveMaterial.dispose();
    },
  }, 0);
}

function animateRoutePropagation(
  entities: Entities,
  scene: THREE.Scene,
  timeline: gsap.core.Timeline,
  color: string
) {
  const propagationOrder = [
    ["AS-100"],
    ["AS-200", "AS-300"],
    ["AS-400", "AS-500"],
    ["AS-600"],
  ];

  propagationOrder.forEach((tier, tierIndex) => {
    tier.forEach(asId => {
      const node = entities.asNodes.get(asId);
      if (!node) return;

      const glowMat = node.routeGlow!.material as THREE.MeshBasicMaterial;
      timeline.to(glowMat, {
        opacity: 0.3,
        duration: 0.4,
      }, tierIndex * 0.6);

      if (tierIndex > 0) {
        const prevTier = propagationOrder[tierIndex - 1];
        prevTier.forEach(prevId => {
          const prevNode = entities.asNodes.get(prevId);
          if (prevNode && node.connections.includes(prevId)) {
            createRoutePacket(scene, prevNode, node, color, timeline, tierIndex * 0.6);
          }
        });
      }
    });
  });
}

function createRoutePacket(
  scene: THREE.Scene,
  from: ASNode,
  to: ASNode,
  color: string,
  timeline: gsap.core.Timeline,
  startTime: number
) {
  const packetGeometry = new THREE.OctahedronGeometry(0.15, 0);
  const packetMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0,
  });
  const packet = new THREE.Mesh(packetGeometry, packetMaterial);
  packet.position.copy(from.position);
  scene.add(packet);

  timeline.to(packetMaterial, {
    opacity: 1,
    duration: 0.1,
  }, startTime);

  timeline.to(packet.position, {
    x: to.position.x,
    y: to.position.y,
    z: to.position.z,
    duration: 0.5,
    ease: "power2.inOut",
  }, startTime);

  timeline.to(packet.rotation, {
    y: Math.PI * 2,
    duration: 0.5,
  }, startTime);

  timeline.to(packetMaterial, {
    opacity: 0,
    duration: 0.1,
    onComplete: () => {
      scene.remove(packet);
      packetGeometry.dispose();
      packetMaterial.dispose();
    },
  }, startTime + 0.5);
}

function animateMultiplePaths(
  entities: Entities,
  scene: THREE.Scene,
  toId: string,
  timeline: gsap.core.Timeline,
  primaryColor: string,
  secondaryColor: string
) {
  const toNode = entities.asNodes.get(toId);
  if (!toNode) return;

  const paths = [
    { via: "AS-200", color: primaryColor },
    { via: "AS-300", color: secondaryColor },
  ];

  paths.forEach((pathConfig, index) => {
    const viaNode = entities.asNodes.get(pathConfig.via);
    if (!viaNode) return;

    const curve = new THREE.QuadraticBezierCurve3(
      entities.asNodes.get("AS-100")!.position.clone(),
      viaNode.position.clone().add(new THREE.Vector3(0, 2, 0)),
      toNode.position.clone()
    );

    const points = curve.getPoints(30);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: pathConfig.color,
      transparent: true,
      opacity: 0,
    });
    const pathLine = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(pathLine);
    entities.routePaths.push(pathLine);

    timeline.to(lineMaterial, {
      opacity: 0.6,
      duration: 0.5,
    }, index * 0.3);
  });
}

function animateBestPathSelection(
  entities: Entities,
  atId: string,
  timeline: gsap.core.Timeline,
  color: string
) {
  entities.routePaths.forEach((path, index) => {
    const material = path.material as THREE.LineBasicMaterial;

    if (index === 0) {
      timeline.to(material, {
        opacity: 1,
        duration: 0.3,
      }, 0);
      material.color.set(color);
      material.linewidth = 3;
    } else {
      timeline.to(material, {
        opacity: 0.15,
        duration: 0.3,
      }, 0);
    }
  });

  const atNode = entities.asNodes.get(atId);
  if (atNode) {
    const core = atNode.mesh.children[0] as THREE.Mesh;
    const mat = core.material as THREE.MeshStandardMaterial;
    timeline.to(mat, {
      emissiveIntensity: 1.2,
      duration: 0.2,
    }, 0.3);
    timeline.to(mat, {
      emissiveIntensity: 0.6,
      duration: 0.4,
    }, 0.6);
  }
}

function animateConvergence(
  entities: Entities,
  timeline: gsap.core.Timeline,
  color: string
) {
  entities.asNodes.forEach((node, id) => {
    if (id === "AS-666") return;

    const glowMat = node.routeGlow!.material as THREE.MeshBasicMaterial;
    glowMat.color.set(color);

    timeline.to(glowMat, {
      opacity: 0.25,
      duration: 0.5,
    }, Math.random() * 0.5);
  });

  entities.peeringLinks.forEach((link) => {
    const material = link.line.material as THREE.LineBasicMaterial;
    timeline.to(material, {
      opacity: 0.4,
      duration: 0.5,
    }, 0);
  });
}

function animateHijack(
  entities: Entities,
  scene: THREE.Scene,
  fromId: string,
  timeline: gsap.core.Timeline
) {
  const hijacker = entities.asNodes.get(fromId);
  if (!hijacker) return;

  const maliciousColor = 0xff2255;

  const core = hijacker.mesh.children[0] as THREE.Mesh;
  const coreMat = core.material as THREE.MeshStandardMaterial;

  timeline.to(coreMat, {
    emissiveIntensity: 1.5,
    duration: 0.3,
  }, 0);

  const glowMat = hijacker.routeGlow!.material as THREE.MeshBasicMaterial;
  glowMat.color.set(maliciousColor);
  timeline.to(glowMat, {
    opacity: 0.6,
    duration: 0.3,
  }, 0);

  const waveGeometry = new THREE.RingGeometry(0.5, 0.8, 6);
  const waveMaterial = new THREE.MeshBasicMaterial({
    color: maliciousColor,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < 3; i++) {
    const wave = new THREE.Mesh(waveGeometry.clone(), waveMaterial.clone());
    wave.position.copy(hijacker.position);
    wave.rotation.x = Math.PI / 2;
    scene.add(wave);

    const waveMat = wave.material as THREE.MeshBasicMaterial;

    timeline.to(wave.scale, {
      x: 8,
      y: 8,
      z: 8,
      duration: 2,
      ease: "power2.out",
    }, i * 0.3);

    timeline.to(waveMat, {
      opacity: 0,
      duration: 2,
      ease: "power2.out",
      onComplete: () => {
        scene.remove(wave);
        wave.geometry.dispose();
        waveMat.dispose();
      },
    }, i * 0.3);
  }

  entities.asNodes.forEach((node, id) => {
    if (id === fromId || id === "AS-100") return;

    const nodeGlow = node.routeGlow!.material as THREE.MeshBasicMaterial;
    timeline.to(nodeGlow.color, {
      r: 1,
      g: 0.13,
      b: 0.33,
      duration: 0.5,
    }, 0.5 + Math.random() * 0.8);
  });
}

function animateWithdrawal(
  entities: Entities,
  fromId: string,
  timeline: gsap.core.Timeline
) {
  const hijacker = entities.asNodes.get(fromId);
  if (!hijacker) return;

  const glowMat = hijacker.routeGlow!.material as THREE.MeshBasicMaterial;
  timeline.to(glowMat, {
    opacity: 0,
    duration: 0.5,
  }, 0);

  const core = hijacker.mesh.children[0] as THREE.Mesh;
  const coreMat = core.material as THREE.MeshStandardMaterial;
  timeline.to(coreMat, {
    emissiveIntensity: 0.2,
    duration: 0.5,
  }, 0);

  entities.asNodes.forEach((node, id) => {
    if (id === fromId || id === "AS-100") return;

    const nodeGlow = node.routeGlow!.material as THREE.MeshBasicMaterial;
    const tealColor = new THREE.Color(0x00d4aa);
    timeline.to(nodeGlow.color, {
      r: tealColor.r,
      g: tealColor.g,
      b: tealColor.b,
      duration: 0.5,
    }, 0.3 + Math.random() * 0.5);
  });

  entities.routePaths.forEach(path => {
    const material = path.material as THREE.LineBasicMaterial;
    timeline.to(material, {
      opacity: 0,
      duration: 0.3,
    }, 0);
  });
}

function highlightNodes(
  entities: Entities,
  highlights: string[],
  timeline: gsap.core.Timeline,
  color: string
) {
  entities.asNodes.forEach((node, id) => {
    const core = node.mesh.children[0] as THREE.Mesh;
    const material = core.material as THREE.MeshStandardMaterial;

    const shouldHighlight = highlights.includes(id) ||
      highlights.includes("all") ||
      highlights.includes("all-stable");

    if (shouldHighlight) {
      timeline.to(material, {
        emissiveIntensity: 0.8,
        duration: 0.3,
      }, 0);
    } else if (highlights.length > 0 && !highlights.includes("topology") && !highlights.includes("propagation-wave")) {
      timeline.to(material, {
        emissiveIntensity: 0.2,
        duration: 0.3,
      }, 0);
    }
  });
}
