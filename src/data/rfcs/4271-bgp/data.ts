import type { RFC, StoryboardStep } from "@/types";

export const rfcData: RFC = {
  id: 4271,
  title: "A Border Gateway Protocol 4",
  shortTitle: "BGP",
  year: 2006,
  status: "Draft Standard",
  difficulty: "intermediate",
  estimatedMinutes: 15,
  concepts: ["autonomous-systems", "path-vector", "route-propagation", "best-path-selection", "policy-routing"],
  prereqs: [791],
  accentColors: ["#00d4aa", "#7c3aed"],
  description: "BGP is the postal service of the Internet — it decides how data finds its way across the globe by exchanging routing information between autonomous systems.",
};

export const storyboard: StoryboardStep[] = [
  {
    id: "intro",
    title: "The Internet's Nervous System",
    narration: "The Internet isn't one network — it's thousands of independent networks called Autonomous Systems (ASes), each operated by ISPs, corporations, and governments. BGP is how they communicate, sharing route information so traffic can flow globally.",
    scene: {
      focus: ["topology"],
      camera: { x: 0, y: 15, z: 25 },
      highlight: [],
    },
    instruments: {
      stateMachine: { state: "IDLE" },
      glossary: { terms: ["AS", "BGP", "path-vector"] },
    },
  },
  {
    id: "as-intro",
    title: "Autonomous Systems",
    narration: "Each AS is identified by a unique number (ASN). Large networks like Google (AS15169), Cloudflare (AS13335), and major ISPs each have their own ASN. Think of each AS as an island nation in a vast archipelago.",
    scene: {
      focus: ["AS-100", "AS-200", "AS-300"],
      camera: { x: 0, y: 12, z: 20 },
      highlight: ["AS-100", "AS-200", "AS-300"],
    },
    instruments: {
      stateMachine: { state: "IDLE" },
      glossary: { terms: ["ASN", "autonomous-system"] },
    },
  },
  {
    id: "peering",
    title: "Peering Connections",
    narration: "ASes connect to each other through peering agreements. Some peer directly, others connect through transit providers. These links form the physical topology over which BGP messages flow. Each connection is a trust relationship.",
    scene: {
      action: "showPeering",
      camera: { x: 5, y: 10, z: 18 },
      highlight: ["peering-links"],
    },
    instruments: {
      stateMachine: { state: "CONNECT" },
      glossary: { terms: ["peering", "transit", "IXP"] },
    },
  },
  {
    id: "establish",
    title: "Establishing BGP Sessions",
    narration: "Before exchanging routes, two BGP routers establish a TCP connection and become 'neighbors.' They send OPEN messages to negotiate capabilities, then KEEPALIVE messages to maintain the session. Trust is established.",
    scene: {
      action: "establishSession",
      from: "AS-100",
      to: "AS-200",
      camera: { x: -3, y: 8, z: 15 },
      highlight: ["AS-100", "AS-200"],
    },
    instruments: {
      stateMachine: { state: "OPEN_SENT" },
      glossary: { terms: ["OPEN", "KEEPALIVE", "neighbor"] },
    },
  },
  {
    id: "announce",
    title: "Route Announcement",
    narration: "When AS-100 wants the world to know about its IP prefix (say, 203.0.113.0/24), it sends an UPDATE message to its neighbors. This message says 'I can reach this prefix, and here's the path through me.'",
    scene: {
      action: "announceRoute",
      from: "AS-100",
      prefix: "203.0.113.0/24",
      camera: { x: -5, y: 10, z: 16 },
      highlight: ["AS-100"],
    },
    instruments: {
      packetInspector: {
        show: true,
        packet: {
          flags: ["UPDATE"],
          headers: {
            "Prefix": "203.0.113.0/24",
            "AS_PATH": "100",
            "NEXT_HOP": "192.0.2.1",
            "ORIGIN": "IGP"
          }
        }
      },
      stateMachine: { state: "ESTABLISHED" },
    },
  },
  {
    id: "propagate",
    title: "Route Propagation",
    narration: "Neighbors receive the UPDATE, add their own AS number to the path, and propagate it further. Watch as the route spreads across the topology like a wave. Each AS prepends its number, building the AS_PATH.",
    scene: {
      action: "propagateRoute",
      camera: { x: 0, y: 18, z: 22 },
      highlight: ["propagation-wave"],
    },
    instruments: {
      packetInspector: {
        show: true,
        packet: {
          flags: ["UPDATE"],
          headers: {
            "Prefix": "203.0.113.0/24",
            "AS_PATH": "200 100",
            "NEXT_HOP": "192.0.2.2"
          }
        }
      },
      stateMachine: { state: "ESTABLISHED" },
      glossary: { terms: ["AS_PATH", "prepending"] },
    },
  },
  {
    id: "multiple-paths",
    title: "Multiple Paths Arrive",
    narration: "In a well-connected Internet, an AS often learns multiple paths to the same prefix. AS-500 might receive the route through AS-200 and AS-300. These alternatives provide resilience and enable traffic engineering.",
    scene: {
      action: "showMultiplePaths",
      to: "AS-500",
      camera: { x: 4, y: 12, z: 18 },
      highlight: ["AS-500", "path-options"],
    },
    instruments: {
      stateMachine: { state: "ESTABLISHED" },
      glossary: { terms: ["multipath", "route-diversity"] },
    },
  },
  {
    id: "best-path",
    title: "Best Path Selection",
    narration: "When multiple paths exist, BGP must choose the best one. It evaluates a hierarchy of attributes: LOCAL_PREF (policy), AS_PATH length (shorter is better), ORIGIN, MED, and more. The winning path lights up!",
    scene: {
      action: "selectBestPath",
      at: "AS-500",
      camera: { x: 5, y: 10, z: 15 },
      highlight: ["AS-500", "best-path"],
    },
    instruments: {
      packetInspector: {
        show: true,
        packet: {
          flags: ["BEST"],
          headers: {
            "Prefix": "203.0.113.0/24",
            "AS_PATH": "200 100",
            "LOCAL_PREF": "100",
            "Decision": "Shortest Path"
          }
        }
      },
      stateMachine: { state: "ESTABLISHED" },
      glossary: { terms: ["LOCAL_PREF", "best-path", "MED"] },
    },
  },
  {
    id: "convergence",
    title: "Global Convergence",
    narration: "As all ASes process updates and select best paths, the Internet converges to a stable routing state. Every AS now knows how to reach 203.0.113.0/24 via their chosen best path. This usually happens in seconds.",
    scene: {
      action: "showConvergence",
      camera: { x: 0, y: 20, z: 28 },
      highlight: ["all-stable"],
    },
    instruments: {
      stateMachine: { state: "ESTABLISHED" },
      glossary: { terms: ["convergence", "routing-table"] },
    },
  },
  {
    id: "hijack",
    title: "Route Hijacking!",
    narration: "But what if a rogue AS falsely announces the same prefix? Watch as AS-666 announces 203.0.113.0/24 with a shorter path. Traffic starts flowing to the wrong place! This is a BGP hijack — a real vulnerability.",
    scene: {
      action: "hijackRoute",
      from: "AS-666",
      prefix: "203.0.113.0/24",
      camera: { x: 3, y: 15, z: 20 },
      highlight: ["AS-666", "hijack-propagation"],
    },
    instruments: {
      packetInspector: {
        show: true,
        packet: {
          flags: ["HIJACK"],
          headers: {
            "Prefix": "203.0.113.0/24",
            "AS_PATH": "666",
            "ORIGIN": "IGP",
            "⚠️ Status": "MALICIOUS"
          }
        }
      },
      stateMachine: { state: "ESTABLISHED" },
      glossary: { terms: ["hijack", "prefix-origin"] },
    },
  },
  {
    id: "withdrawal",
    title: "Route Withdrawal",
    narration: "When a route becomes unavailable (link failure, policy change, or fixing a hijack), an AS sends a WITHDRAW message. Watch the affected routes fade away as the Internet reconverges to an alternative path.",
    scene: {
      action: "withdrawRoute",
      from: "AS-666",
      prefix: "203.0.113.0/24",
      camera: { x: 0, y: 16, z: 22 },
      highlight: ["withdrawal-wave"],
    },
    instruments: {
      packetInspector: {
        show: true,
        packet: {
          flags: ["WITHDRAW"],
          headers: {
            "Prefix": "203.0.113.0/24",
            "Status": "Unreachable"
          }
        }
      },
      stateMachine: { state: "ESTABLISHED" },
      glossary: { terms: ["WITHDRAW", "reconvergence"] },
    },
  },
  {
    id: "summary",
    title: "The Glue of the Internet",
    narration: "BGP is remarkable in its simplicity and trust. Thousands of networks cooperate using this protocol, routing quintillions of packets daily. Its design from 1989 still powers today's Internet — a testament to elegant engineering.",
    scene: {
      camera: { x: 0, y: 20, z: 30 },
      highlight: ["all"],
    },
    instruments: {
      stateMachine: { state: "ESTABLISHED" },
      glossary: { terms: ["BGP", "path-vector", "autonomous-system"] },
    },
  },
];
