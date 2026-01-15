import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

const PROTOCOL_TAGS: { name: string; rfc: number }[] = [
  { name: "TCP", rfc: 793 },
  { name: "IP", rfc: 791 },
  { name: "DNS", rfc: 1035 },
  { name: "TLS 1.3", rfc: 8446 },
  { name: "UDP", rfc: 768 },
  { name: "HTTP/1.1", rfc: 2616 },
  { name: "HTTP/2", rfc: 7540 },
  { name: "QUIC", rfc: 9000 },
];

export function FoundryHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5);
    
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
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
    
    // Floating protocol tags with text sprites
    const tagGroups: THREE.Group[] = [];
    
    const createTextSprite = (text: string, opacity: number) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = 256;
      canvas.height = 64;
      
      ctx.fillStyle = `rgba(212, 164, 76, ${opacity})`;
      ctx.font = "bold 28px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 128, 32);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      });
      
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(1.2, 0.3, 1);
      return sprite;
    };
    
    PROTOCOL_TAGS.forEach((tag, i) => {
      const group = new THREE.Group();
      
      // Background plate
      const plateGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.02);
      const plateMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.4,
        metalness: 0.9,
        transparent: true,
        opacity: 0.6 + Math.random() * 0.2,
      });
      const plate = new THREE.Mesh(plateGeometry, plateMaterial);
      group.add(plate);
      
      // Border frame
      const borderGeometry = new THREE.EdgesGeometry(plateGeometry);
      const borderMaterial = new THREE.LineBasicMaterial({
        color: 0xd4a44c,
        transparent: true,
        opacity: 0.4 + Math.random() * 0.2,
      });
      const border = new THREE.LineSegments(borderGeometry, borderMaterial);
      group.add(border);
      
      // Text sprite
      const opacity = 0.5 + Math.random() * 0.3;
      const textSprite = createTextSprite(tag.name, opacity);
      textSprite.position.z = 0.02;
      group.add(textSprite);
      
      // Position in orbit
      const angle = (i / PROTOCOL_TAGS.length) * Math.PI * 2;
      const radius = 2.2 + Math.random() * 0.8;
      group.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 2.5,
        Math.sin(angle) * radius * 0.5 - 1.5
      );
      group.userData = { 
        angle, 
        radius, 
        speed: 0.08 + Math.random() * 0.06, 
        yOffset: group.position.y,
        floatPhase: Math.random() * Math.PI * 2
      };
      
      scene.add(group);
      tagGroups.push(group);
    });
    
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
      
      // Frame and ring rotation (more noticeable)
      frame.rotation.z = elapsed * 0.3;
      innerRing.rotation.z = -elapsed * 0.5;
      
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
      
      // Animate floating protocol tags
      tagGroups.forEach((group) => {
        const { angle, radius, speed, yOffset, floatPhase } = group.userData;
        const newAngle = angle + elapsed * speed * 0.1;
        group.position.x = Math.cos(newAngle) * radius;
        group.position.z = Math.sin(newAngle) * radius * 0.5 - 1.5;
        group.position.y = yOffset + Math.sin(elapsed * speed * 2 + floatPhase) * 0.2;
        // Face the camera
        group.lookAt(camera.position);
      });
      
      // Light flickering (like fire)
      mainLight.intensity = 2 + Math.sin(elapsed * 3) * 0.2;
      accentLight.intensity = 1.5 + Math.sin(elapsed * 4 + 1) * 0.3;
      
      renderer.render(scene, camera);
    };
    
    // Handle resize
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
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
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Top section with title */}
      <div className="relative z-10 pt-16 md:pt-24 px-6 text-center">
        <div 
          className={`
            metal-plate inline-block px-8 md:px-12 py-6 md:py-8
            transition-all duration-1000 ease-out
            ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          <p className="museum-label mb-4 text-amber">2026 · Learn the Internet's Foundations</p>
          
          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight text-text-bright mb-4">
            <span className="text-glow-gold">EXPLAIN</span>
            <span className="block text-gold">RFC</span>
          </h1>
          
          <div className="incised w-32 md:w-48 mx-auto my-4 md:my-6" />
          
          <p className="font-display text-lg md:text-2xl text-text-secondary">
            Understand IETF RFCs through interactive visualizations
          </p>
        </div>
      </div>
      
      {/* 3D Canvas - centered in remaining space */}
      <div 
        ref={containerRef}
        className="relative flex-1 min-h-[400px] md:min-h-[500px]"
      >
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full"
        />
      </div>
      
      {/* Scroll prompt - at the bottom */}
      <div className="relative z-10 pb-12 text-center">
        <a
          href="#vault"
          className={`
            group inline-flex flex-col items-center gap-3
            transition-all duration-1000 delay-300
            ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          <span className="font-mono text-sm text-text-muted group-hover:text-gold transition-colors">
            Explore Popular RFCs
          </span>
          <div className="w-8 h-12 rounded-full border-2 border-patina group-hover:border-gold transition-colors flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-amber rounded-full animate-bounce" />
          </div>
        </a>
      </div>
      
      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-patina to-transparent" />
    </section>
  );
}
