import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

interface FoundryHeroProps {
  onEnterExhibit: (rfcId: number) => void;
}

export function FoundryHero({ onEnterExhibit }: FoundryHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeProtocol, setActiveProtocol] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const protocols = [
    { id: 793, name: "TCP", subtitle: "Transmission Control Protocol" },
    { id: 1035, name: "DNS", subtitle: "Domain Name System" },
    { id: 8446, name: "TLS", subtitle: "Transport Layer Security" },
  ];
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5);
    
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    
    // Lighting - warm amber tones
    const ambientLight = new THREE.AmbientLight(0x1a1a1a, 0.5);
    scene.add(ambientLight);
    
    const mainLight = new THREE.PointLight(0xffaa00, 2, 20);
    mainLight.position.set(2, 3, 4);
    scene.add(mainLight);
    
    const accentLight = new THREE.PointLight(0xff6b00, 1.5, 15);
    accentLight.position.set(-3, -1, 3);
    scene.add(accentLight);
    
    const rimLight = new THREE.PointLight(0xffc71f, 0.8, 10);
    rimLight.position.set(0, -2, 2);
    scene.add(rimLight);
    
    // Create the obsidian slab (main artifact holder)
    const slabGeometry = new THREE.BoxGeometry(3.5, 3.5, 0.3);
    const slabMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      roughness: 0.2,
      metalness: 0.8,
      envMapIntensity: 0.5,
    });
    const slab = new THREE.Mesh(slabGeometry, slabMaterial);
    slab.position.z = -0.5;
    scene.add(slab);
    
    // Circular viewport cutout frame
    const frameGeometry = new THREE.TorusGeometry(1.2, 0.08, 16, 64);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4a44c,
      roughness: 0.3,
      metalness: 0.9,
      emissive: 0xffaa00,
      emissiveIntensity: 0.1,
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    scene.add(frame);
    
    // Inner decorative ring
    const innerRingGeometry = new THREE.TorusGeometry(1.0, 0.02, 8, 64);
    const innerRingMaterial = new THREE.MeshStandardMaterial({
      color: 0xffc71f,
      roughness: 0.4,
      metalness: 0.8,
      emissive: 0xff8c00,
      emissiveIntensity: 0.2,
    });
    const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
    innerRing.position.z = 0.05;
    scene.add(innerRing);
    
    // Create the protocol visualization (molten channels)
    const channelGroup = new THREE.Group();
    scene.add(channelGroup);
    
    // Central nodes (Client/Server for TCP visualization)
    const nodeGeometry = new THREE.IcosahedronGeometry(0.15, 2);
    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      roughness: 0.2,
      metalness: 0.7,
      emissive: 0xff6b00,
      emissiveIntensity: 0.5,
    });
    
    const clientNode = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
    clientNode.position.set(-0.6, 0, 0.1);
    channelGroup.add(clientNode);
    
    const serverNode = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
    serverNode.position.set(0.6, 0, 0.1);
    channelGroup.add(serverNode);
    
    // Connection channels (engraved grooves with molten flow)
    const createChannel = (start: THREE.Vector3, end: THREE.Vector3, yOffset: number) => {
      const curve = new THREE.QuadraticBezierCurve3(
        start,
        new THREE.Vector3((start.x + end.x) / 2, yOffset, 0.1),
        end
      );
      const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.02, 8, false);
      const tubeMaterial = new THREE.MeshStandardMaterial({
        color: 0xffc71f,
        roughness: 0.3,
        metalness: 0.8,
        emissive: 0xff8c00,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.9,
      });
      return new THREE.Mesh(tubeGeometry, tubeMaterial);
    };
    
    // Three channels representing SYN, SYN-ACK, ACK
    const channel1 = createChannel(
      new THREE.Vector3(-0.5, 0, 0.1),
      new THREE.Vector3(0.5, 0, 0.1),
      0.3
    );
    const channel2 = createChannel(
      new THREE.Vector3(0.5, 0, 0.1),
      new THREE.Vector3(-0.5, 0, 0.1),
      0
    );
    const channel3 = createChannel(
      new THREE.Vector3(-0.5, 0, 0.1),
      new THREE.Vector3(0.5, 0, 0.1),
      -0.3
    );
    
    channelGroup.add(channel1, channel2, channel3);
    
    // Animated "molten" packets
    const packetGeometry = new THREE.SphereGeometry(0.04, 16, 16);
    const packetMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6b00,
      emissive: 0xff4400,
      emissiveIntensity: 1,
      roughness: 0.1,
      metalness: 0.5,
    });
    
    const packets: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const packet = new THREE.Mesh(packetGeometry, packetMaterial.clone());
      packet.visible = false;
      channelGroup.add(packet);
      packets.push(packet);
    }
    
    // Corner brackets (museum hardware)
    const bracketGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.05);
    const bracketMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.5,
      metalness: 0.7,
    });
    
    const corners = [
      { x: -1.5, y: 1.5, rot: 0 },
      { x: 1.5, y: 1.5, rot: Math.PI / 2 },
      { x: 1.5, y: -1.5, rot: Math.PI },
      { x: -1.5, y: -1.5, rot: -Math.PI / 2 },
    ];
    
    corners.forEach(({ x, y, rot }) => {
      const bracket1 = new THREE.Mesh(bracketGeometry, bracketMaterial);
      bracket1.position.set(x, y, 0.2);
      bracket1.rotation.z = rot;
      scene.add(bracket1);
      
      const bracket2 = bracket1.clone();
      bracket2.rotation.z = rot + Math.PI / 2;
      scene.add(bracket2);
    });
    
    // Particle system (floating ember particles)
    const particleCount = 100;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 8;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4 + 2;
      particleSizes[i] = Math.random() * 3 + 1;
    }
    
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute("size", new THREE.BufferAttribute(particleSizes, 1));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffaa00,
      size: 0.02,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    
    // Animation
    const clock = new THREE.Clock();
    let animationId: number;
    let packetProgress = [0, 0.33, 0.66];
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      
      // Gentle slab rotation
      slab.rotation.x = Math.sin(elapsed * 0.3) * 0.02;
      slab.rotation.y = Math.sin(elapsed * 0.2) * 0.03;
      
      // Frame and ring rotation
      frame.rotation.z = elapsed * 0.1;
      innerRing.rotation.z = -elapsed * 0.15;
      
      // Node pulsing
      const pulse = 1 + Math.sin(elapsed * 2) * 0.1;
      clientNode.scale.setScalar(pulse);
      serverNode.scale.setScalar(pulse);
      
      // Packet animation along channels
      packets.forEach((packet, i) => {
        packet.visible = true;
        packetProgress[i] += 0.005;
        if (packetProgress[i] > 1) packetProgress[i] = 0;
        
        const t = packetProgress[i];
        const yOffset = i === 0 ? 0.3 : i === 1 ? 0 : -0.3;
        const direction = i === 1 ? -1 : 1;
        
        packet.position.x = -0.5 * direction + t * 1 * direction;
        packet.position.y = yOffset * Math.sin(t * Math.PI);
        packet.position.z = 0.15;
        
        // Intensity based on position
        const mat = packet.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.8 + Math.sin(elapsed * 5 + i) * 0.2;
      });
      
      // Particle drift
      const positions = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.002;
        if (positions[i * 3 + 1] > 4) positions[i * 3 + 1] = -4;
      }
      particleGeometry.attributes.position.needsUpdate = true;
      
      // Light flickering (like fire)
      mainLight.intensity = 2 + Math.sin(elapsed * 3) * 0.2;
      accentLight.intensity = 1.5 + Math.sin(elapsed * 4 + 1) * 0.3;
      
      renderer.render(scene, camera);
    };
    
    // Handle resize
    const handleResize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);
    
    // Start animation
    animate();
    
    // Intro animation
    gsap.from(slab.position, { z: -3, duration: 1.5, ease: "power3.out" });
    gsap.from(slab.rotation, { y: Math.PI * 0.5, duration: 1.5, ease: "power3.out" });
    gsap.from(frame.scale, { x: 0, y: 0, z: 0, duration: 1, delay: 0.5, ease: "back.out(1.7)" });
    
    setTimeout(() => setIsLoaded(true), 1000);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, []);
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Content overlay */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Museum plaque - title */}
        <div 
          className={`
            metal-plate inline-block px-12 py-8 mb-8
            transition-all duration-1000 ease-out
            ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          <p className="museum-label mb-4 text-amber">Est. 1969 — Protocol Archives</p>
          
          <h1 className="font-display text-6xl md:text-8xl font-bold tracking-tight text-text-bright mb-4">
            <span className="text-glow-gold">EXPLAIN</span>
            <span className="block text-gold">RFC</span>
          </h1>
          
          <div className="incised w-48 mx-auto my-6" />
          
          <p className="font-display text-xl md:text-2xl text-text-secondary italic">
            A protocol visualization museum
          </p>
        </div>
        
        {/* Protocol selector */}
        <div 
          className={`
            flex justify-center gap-4 mb-12
            transition-all duration-1000 delay-300
            ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          {protocols.map((protocol, i) => (
            <button
              key={protocol.id}
              onClick={() => setActiveProtocol(i)}
              className={`
                relative px-6 py-3 font-mono text-sm tracking-wider uppercase
                transition-all duration-300
                ${activeProtocol === i 
                  ? "text-gold text-glow-ember" 
                  : "text-text-muted hover:text-text-secondary"
                }
              `}
            >
              <span className="relative z-10">{protocol.name}</span>
              {activeProtocol === i && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber to-transparent" />
              )}
            </button>
          ))}
        </div>
        
        {/* Enter exhibit CTA */}
        <button
          onClick={() => onEnterExhibit(protocols[activeProtocol].id)}
          className={`
            group relative inline-flex items-center gap-4 px-10 py-5
            metal-plate hover:glow-molten
            transition-all duration-500
            ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
          style={{ transitionDelay: "600ms" }}
        >
          {/* Decorative brackets */}
          <span className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-brass opacity-50" />
          <span className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-brass opacity-50" />
          <span className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-brass opacity-50" />
          <span className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-brass opacity-50" />
          
          <span className="font-display text-xl text-text-bright group-hover:text-gold transition-colors">
            Enter the {protocols[activeProtocol].name} Exhibit
          </span>
          
          <svg 
            className="w-6 h-6 text-amber group-hover:text-gold group-hover:translate-x-1 transition-all" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
      
      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-patina to-transparent" />
    </section>
  );
}
