import * as THREE from "three";
import { gsap } from "gsap";
import type { SceneController, StoryboardStep } from "@/types/rfc";

interface Entities {
  client: THREE.Group;
  server: THREE.Group;
  packet: THREE.Mesh | null;
  particles: THREE.Points;
  connectionLine: THREE.Line;
}

export async function init(
  canvas: HTMLCanvasElement,
  accentColors: [string, string]
): Promise<SceneController> {
  const [primaryColor, secondaryColor] = accentColors;
  
  // Scene setup
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x050505, 10, 50);
  
  // Camera
  const camera = new THREE.PerspectiveCamera(
    60,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 5, 12);
  camera.lookAt(0, 0, 0);
  
  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 1);
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);
  
  const primaryLight = new THREE.PointLight(primaryColor, 2, 20);
  primaryLight.position.set(-5, 5, 5);
  scene.add(primaryLight);
  
  const secondaryLight = new THREE.PointLight(secondaryColor, 1.5, 20);
  secondaryLight.position.set(5, 3, 5);
  scene.add(secondaryLight);
  
  // Create entities
  const entities = createEntities(scene, primaryColor, secondaryColor);
  
  // Grid floor - amber/ochre tones
  const gridHelper = new THREE.GridHelper(20, 20, 0x3d2a14, 0x1a1206);
  gridHelper.position.y = -3;
  scene.add(gridHelper);
  
  // Animation state
  let animationId: number;
  let currentTimeline: gsap.core.Timeline | null = null;
  
  // Resize handler
  const handleResize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  window.addEventListener("resize", handleResize);
  
  // Animation loop
  const clock = new THREE.Clock();
  
  function animate() {
    animationId = requestAnimationFrame(animate);
    
    const elapsed = clock.getElapsedTime();
    
    // Gentle floating animation for entities
    entities.client.position.y = Math.sin(elapsed * 0.5) * 0.1;
    entities.server.position.y = Math.sin(elapsed * 0.5 + Math.PI) * 0.1;
    
    // Rotate particles slowly
    entities.particles.rotation.y = elapsed * 0.05;
    
    // Pulse the client and server cores
    const clientCore = entities.client.children[0] as THREE.Mesh;
    const serverCore = entities.server.children[0] as THREE.Mesh;
    if (clientCore && serverCore) {
      const pulse = 1 + Math.sin(elapsed * 2) * 0.05;
      clientCore.scale.setScalar(pulse);
      serverCore.scale.setScalar(pulse);
    }
    
    renderer.render(scene, camera);
  }
  animate();
  
  // Scene controller
  return {
    apply(step: StoryboardStep) {
      // Kill any existing animations
      if (currentTimeline) {
        currentTimeline.kill();
      }
      
      currentTimeline = gsap.timeline();
      
      // Handle camera movement
      if (step.scene?.camera) {
        currentTimeline.to(camera.position, {
          x: step.scene.camera.x,
          y: step.scene.camera.y,
          z: step.scene.camera.z,
          duration: 1,
          ease: "power2.inOut",
        }, 0);
      }
      
      // Handle packet emission
      if (step.scene?.action === "emitPacket" && step.scene.from && step.scene.to) {
        emitPacket(
          scene,
          entities,
          step.scene.from,
          step.scene.to,
          step.scene.packet?.flags || [],
          primaryColor,
          currentTimeline
        );
      }
      
      // Handle highlighting
      if (step.scene?.highlight) {
        highlightEntities(entities, step.scene.highlight, primaryColor, currentTimeline);
      }
      
      // Handle focus (dim non-focused entities)
      if (step.scene?.focus) {
        focusEntities(entities, step.scene.focus, currentTimeline);
      }
    },
    
    setProgress(progress: number) {
      // Could be used for scrubbing the timeline
    },
    
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
  // Client entity
  const client = createEndpoint("CLIENT", primaryColor, -4);
  scene.add(client);
  
  // Server entity
  const server = createEndpoint("SERVER", secondaryColor, 4);
  scene.add(server);
  
  // Connection line (hidden initially)
  const lineMaterial = new THREE.LineBasicMaterial({
    color: primaryColor,
    transparent: true,
    opacity: 0,
  });
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-4, 0, 0),
    new THREE.Vector3(4, 0, 0),
  ]);
  const connectionLine = new THREE.Line(lineGeometry, lineMaterial);
  scene.add(connectionLine);
  
  // Background particles
  const particles = createParticles(primaryColor, secondaryColor);
  scene.add(particles);
  
  return {
    client,
    server,
    packet: null,
    particles,
    connectionLine,
  };
}

function createEndpoint(label: string, color: string, xPos: number): THREE.Group {
  const group = new THREE.Group();
  group.position.x = xPos;
  
  // Core sphere
  const coreGeometry = new THREE.IcosahedronGeometry(0.8, 2);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  group.add(core);
  
  // Outer ring
  const ringGeometry = new THREE.TorusGeometry(1.2, 0.05, 8, 32);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.5,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  
  // Second ring (rotated)
  const ring2 = ring.clone();
  ring2.rotation.x = 0;
  ring2.rotation.y = Math.PI / 4;
  group.add(ring2);
  
  // Label (using a simple plane - in production you'd use TextGeometry or HTML overlay)
  const labelPlane = new THREE.Group();
  labelPlane.position.y = -2;
  group.add(labelPlane);
  
  // Store the label for later use
  group.userData.label = label;
  group.userData.color = color;
  
  return group;
}

function createParticles(primaryColor: string, secondaryColor: string): THREE.Points {
  const count = 500;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  
  const color1 = new THREE.Color(primaryColor);
  const color2 = new THREE.Color(secondaryColor);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    // Spread particles in a sphere
    const radius = 15 + Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) - 5;
    positions[i3 + 2] = radius * Math.cos(phi);
    
    // Randomly choose between colors
    const color = Math.random() > 0.5 ? color1 : color2;
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  
  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });
  
  return new THREE.Points(geometry, material);
}

function emitPacket(
  scene: THREE.Scene,
  entities: Entities,
  from: string,
  to: string,
  flags: string[],
  color: string,
  timeline: gsap.core.Timeline
) {
  const startPos = from === "client" ? entities.client.position.clone() : entities.server.position.clone();
  const endPos = to === "server" ? entities.server.position.clone() : entities.client.position.clone();
  
  // Create packet
  const packetGeometry = new THREE.OctahedronGeometry(0.3, 0);
  const packetMaterial = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0,
  });
  const packet = new THREE.Mesh(packetGeometry, packetMaterial);
  packet.position.copy(startPos);
  scene.add(packet);
  
  // Store flags for potential display
  packet.userData.flags = flags;
  
  // Create trail
  const trailPositions: THREE.Vector3[] = [];
  const trailGeometry = new THREE.BufferGeometry();
  const trailMaterial = new THREE.LineBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.5,
  });
  const trail = new THREE.Line(trailGeometry, trailMaterial);
  scene.add(trail);
  
  // Animate packet
  timeline.to(packetMaterial, {
    opacity: 1,
    duration: 0.2,
  }, 0);
  
  timeline.to(packet.position, {
    x: endPos.x,
    y: endPos.y,
    z: endPos.z,
    duration: 1.5,
    ease: "power2.inOut",
    onUpdate: () => {
      // Update trail
      trailPositions.push(packet.position.clone());
      if (trailPositions.length > 20) {
        trailPositions.shift();
      }
      trailGeometry.setFromPoints(trailPositions);
    },
  }, 0.2);
  
  // Rotate packet while moving
  timeline.to(packet.rotation, {
    x: Math.PI * 2,
    y: Math.PI * 2,
    duration: 1.5,
    ease: "none",
  }, 0.2);
  
  // Fade out packet at destination
  timeline.to(packetMaterial, {
    opacity: 0,
    duration: 0.3,
    onComplete: () => {
      scene.remove(packet);
      scene.remove(trail);
      packetGeometry.dispose();
      packetMaterial.dispose();
      trailGeometry.dispose();
      trailMaterial.dispose();
    },
  }, 1.5);
  
  // Flash the destination
  const destEntity = to === "server" ? entities.server : entities.client;
  const destCore = destEntity.children[0] as THREE.Mesh;
  const destMaterial = destCore.material as THREE.MeshStandardMaterial;
  
  timeline.to(destMaterial, {
    emissiveIntensity: 1.5,
    duration: 0.2,
  }, 1.7);
  
  timeline.to(destMaterial, {
    emissiveIntensity: 0.5,
    duration: 0.3,
  }, 1.9);
  
  entities.packet = packet;
}

function highlightEntities(
  entities: Entities,
  highlights: string[],
  color: string,
  timeline: gsap.core.Timeline
) {
  const allEntities = ["client", "server"];
  
  allEntities.forEach(name => {
    const entity = entities[name as keyof Entities] as THREE.Group;
    if (!entity || !entity.children[0]) return;
    
    const core = entity.children[0] as THREE.Mesh;
    const material = core.material as THREE.MeshStandardMaterial;
    
    if (highlights.includes(name)) {
      timeline.to(material, {
        emissiveIntensity: 0.8,
        duration: 0.5,
      }, 0);
    } else {
      timeline.to(material, {
        emissiveIntensity: 0.2,
        duration: 0.5,
      }, 0);
    }
  });
}

function focusEntities(
  entities: Entities,
  focus: string[],
  timeline: gsap.core.Timeline
) {
  const allEntities = ["client", "server"];
  
  allEntities.forEach(name => {
    const entity = entities[name as keyof Entities] as THREE.Group;
    if (!entity) return;
    
    if (focus.includes(name)) {
      timeline.to(entity.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.5,
      }, 0);
    } else {
      timeline.to(entity.scale, {
        x: 0.8,
        y: 0.8,
        z: 0.8,
        duration: 0.5,
      }, 0);
    }
  });
}
