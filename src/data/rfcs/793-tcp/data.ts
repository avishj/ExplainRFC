import type { RFC, StoryboardStep } from "@/types/rfc";

export const rfcData: RFC = {
  id: 793,
  title: "Transmission Control Protocol",
  shortTitle: "TCP",
  year: 1981,
  status: "Internet Standard",
  difficulty: "beginner",
  estimatedMinutes: 12,
  concepts: ["handshake", "reliable-delivery", "flow-control", "connection-oriented"],
  prereqs: [791],
  accentColors: ["#ffaa00", "#ff6b00"],
  description: "TCP is the backbone of reliable internet communication. It ensures your data arrives complete, in order, and error-free.",
};

export const storyboard: StoryboardStep[] = [
  {
    id: "intro",
    title: "Meet the Players",
    narration: "Every TCP connection involves two endpoints: a Client who initiates the connection, and a Server who accepts it. Before any data can flow, they must first establish trust through a carefully choreographed dance called the three-way handshake.",
    scene: {
      focus: ["client", "server"],
      camera: { x: 0, y: 5, z: 14 },
      highlight: ["client", "server"],
    },
    instruments: {
      stateMachine: { state: "CLOSED" },
      glossary: { terms: ["handshake", "connection-oriented"] },
    },
  },
  {
    id: "syn",
    title: "Step 1: SYN",
    narration: "The client makes the first move by sending a SYN (synchronize) packet. This is like knocking on a door — it says 'Hello, I want to talk to you.' The packet contains an initial sequence number that will be used to track data order.",
    scene: {
      action: "emitPacket",
      from: "client",
      to: "server",
      packet: { flags: ["SYN"], seq: 1000 },
      camera: { x: -2, y: 4, z: 12 },
      highlight: ["client"],
    },
    instruments: {
      packetInspector: { 
        show: true, 
        packet: { flags: ["SYN"], seq: 1000 } 
      },
      stateMachine: { state: "SYN-SENT" },
      glossary: { terms: ["SYN", "SEQ"] },
    },
  },
  {
    id: "syn-ack",
    title: "Step 2: SYN-ACK",
    narration: "The server responds with a SYN-ACK — two messages in one. The ACK acknowledges receiving the client's SYN (incrementing the sequence number), while the SYN indicates the server also wants to establish a connection. It's like answering the door and extending your hand for a handshake.",
    scene: {
      action: "emitPacket",
      from: "server",
      to: "client",
      packet: { flags: ["SYN", "ACK"], seq: 2000, ack: 1001 },
      camera: { x: 2, y: 4, z: 12 },
      highlight: ["server"],
    },
    instruments: {
      packetInspector: { 
        show: true, 
        packet: { flags: ["SYN", "ACK"], seq: 2000, ack: 1001 } 
      },
      stateMachine: { state: "SYN-RECEIVED" },
      glossary: { terms: ["ACK", "SYN-ACK"] },
    },
  },
  {
    id: "ack",
    title: "Step 3: ACK",
    narration: "The client completes the handshake by sending a final ACK. This acknowledges the server's SYN and confirms both parties are ready. The connection is now ESTABLISHED — data can flow freely in both directions.",
    scene: {
      action: "emitPacket",
      from: "client",
      to: "server",
      packet: { flags: ["ACK"], ack: 2001 },
      camera: { x: 0, y: 5, z: 12 },
      highlight: ["client", "server"],
    },
    instruments: {
      packetInspector: { 
        show: true, 
        packet: { flags: ["ACK"], ack: 2001 } 
      },
      stateMachine: { state: "ESTABLISHED" },
    },
  },
  {
    id: "established",
    title: "Connection Established",
    narration: "Success! Both client and server are now in the ESTABLISHED state. This three-step dance might seem like overhead, but it's essential — it ensures both parties are alive, reachable, and agree on initial sequence numbers. Without it, data could arrive at a dead endpoint or be misinterpreted.",
    scene: {
      focus: ["client", "server"],
      camera: { x: 0, y: 6, z: 10 },
      highlight: ["client", "server"],
    },
    instruments: {
      stateMachine: { state: "ESTABLISHED" },
      glossary: { terms: ["reliable delivery", "three-way handshake"] },
    },
  },
  {
    id: "why-three",
    title: "Why Three Steps?",
    narration: "Two steps wouldn't be enough. If the client only sent SYN and the server only sent ACK, how would the client know its message got through? The third step (client's ACK) confirms the round trip works in both directions. It's the minimum needed for mutual verification.",
    scene: {
      camera: { x: 0, y: 8, z: 14 },
      highlight: ["client", "server"],
    },
    instruments: {
      stateMachine: { state: "ESTABLISHED" },
    },
  },
  {
    id: "sequence-numbers",
    title: "Sequence Numbers",
    narration: "Notice those SEQ and ACK numbers? They're not arbitrary. Each byte of data gets a sequence number. When the receiver acknowledges data, it tells the sender 'I've received everything up to this number.' This is how TCP guarantees ordered, complete delivery even over an unreliable network.",
    scene: {
      camera: { x: 0, y: 5, z: 12 },
      focus: ["client", "server"],
    },
    instruments: {
      packetInspector: { 
        show: true, 
        packet: { 
          flags: ["ACK"], 
          seq: 1001, 
          ack: 2001,
          headers: { "Window": 65535, "Checksum": "0x8f3c" }
        } 
      },
      glossary: { terms: ["SEQ", "reliable delivery"] },
    },
  },
  {
    id: "summary",
    title: "The Foundation of Reliable Internet",
    narration: "That's the TCP three-way handshake — the foundation of almost every reliable connection on the internet. Every time you load a webpage, send an email, or stream a video, this exact dance happens first. Simple, elegant, and remarkably robust.",
    scene: {
      camera: { x: 0, y: 5, z: 14 },
      highlight: ["client", "server"],
    },
    instruments: {
      stateMachine: { state: "ESTABLISHED" },
      glossary: { terms: ["handshake", "connection-oriented", "reliable delivery"] },
    },
  },
];
