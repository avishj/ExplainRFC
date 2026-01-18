import type { CatalogRFC } from "@/types/rfc";

export const rfcCatalog: CatalogRFC[] = [
  // Transport Layer
  { id: 793, name: "TCP", title: "Transmission Control Protocol", year: 1981, layer: "Transport", description: "The foundation of reliable data delivery on the internet, ensuring packets arrive complete and in order.", available: true },
  { id: 768, name: "UDP", title: "User Datagram Protocol", year: 1980, layer: "Transport", description: "Fast, connectionless messaging for real-time applications like gaming and video.", available: false },
  { id: 9000, name: "QUIC", title: "QUIC: A UDP-Based Multiplexed Transport", year: 2021, layer: "Transport", description: "Next-gen transport combining the best of TCP and UDP with built-in encryption.", available: false },
  { id: 4960, name: "SCTP", title: "Stream Control Transmission Protocol", year: 2007, layer: "Transport", description: "Message-oriented transport with multi-streaming and multi-homing support.", available: false },
  { id: 6298, name: "TCP Congestion", title: "Computing TCP's Retransmission Timer", year: 2011, layer: "Transport", description: "Algorithms for computing TCP's retransmission timeout.", available: false },
  { id: 5681, name: "TCP Congestion Control", title: "TCP Congestion Control", year: 2009, layer: "Transport", description: "Defines the four congestion control algorithms for TCP.", available: false },
  { id: 7323, name: "TCP Extensions", title: "TCP Extensions for High Performance", year: 2014, layer: "Transport", description: "Window scaling, timestamps, and PAWS for high-bandwidth networks.", available: false },
  { id: 6824, name: "MPTCP", title: "TCP Extensions for Multipath Operation", year: 2013, layer: "Transport", description: "Allows TCP to use multiple paths simultaneously for a single connection.", available: false },

  // Network Layer
  { id: 791, name: "IP", title: "Internet Protocol", year: 1981, layer: "Network", description: "The addressing system that routes packets across networks to their destination.", available: false },
  { id: 792, name: "ICMP", title: "Internet Control Message Protocol", year: 1981, layer: "Network", description: "Error reporting and diagnostics for IP networks; powers ping and traceroute.", available: false },
  { id: 8200, name: "IPv6", title: "Internet Protocol, Version 6", year: 2017, layer: "Network", description: "The next generation Internet Protocol with 128-bit addresses.", available: false },
  { id: 4443, name: "ICMPv6", title: "ICMPv6 for IPv6 Specification", year: 2006, layer: "Network", description: "ICMP for IPv6 networks with neighbor discovery.", available: false },
  { id: 826, name: "ARP", title: "Address Resolution Protocol", year: 1982, layer: "Network", description: "Maps IP addresses to hardware MAC addresses on local networks.", available: false },
  { id: 4861, name: "NDP", title: "Neighbor Discovery for IPv6", year: 2007, layer: "Network", description: "IPv6 equivalent of ARP with router discovery and address autoconfiguration.", available: false },
  { id: 1918, name: "Private IPs", title: "Address Allocation for Private Internets", year: 1996, layer: "Network", description: "Defines the 10.x.x.x, 172.16.x.x, and 192.168.x.x private address ranges.", available: false },
  { id: 6890, name: "Special IPs", title: "Special-Purpose IP Address Registries", year: 2013, layer: "Network", description: "Comprehensive registry of special-purpose IP address blocks.", available: false },

  // Application Layer - DNS
  { id: 1035, name: "DNS", title: "Domain Names - Implementation and Specification", year: 1987, layer: "Application", description: "Translates human-readable domain names into IP addresses.", available: false },
  { id: 1034, name: "DNS Concepts", title: "Domain Names - Concepts and Facilities", year: 1987, layer: "Application", description: "Introduces the Domain Name System architecture and concepts.", available: false },
  { id: 8484, name: "DoH", title: "DNS Queries over HTTPS", year: 2018, layer: "Application", description: "Encrypts DNS queries using HTTPS for privacy.", available: false },
  { id: 7858, name: "DoT", title: "DNS over TLS", year: 2016, layer: "Application", description: "Encrypts DNS queries using TLS for privacy.", available: false },
  { id: 4033, name: "DNSSEC Intro", title: "DNS Security Introduction and Requirements", year: 2005, layer: "Security", description: "Introduction to DNS Security Extensions for data integrity.", available: false },
  { id: 6891, name: "EDNS", title: "Extension Mechanisms for DNS", year: 2013, layer: "Application", description: "Extends DNS with larger packet sizes and additional flags.", available: false },

  // Application Layer - Web
  { id: 9110, name: "HTTP", title: "HTTP Semantics", year: 2022, layer: "Application", description: "The core semantics of HTTP applicable to all versions.", available: false },
  { id: 9112, name: "HTTP/1.1 v2", title: "HTTP/1.1", year: 2022, layer: "Application", description: "The HTTP/1.1 message syntax and connection management.", available: false },
  { id: 9113, name: "HTTP/2 v2", title: "HTTP/2", year: 2022, layer: "Application", description: "Binary framing, multiplexing, and header compression for faster web.", available: false },
  { id: 9114, name: "HTTP/3", title: "HTTP/3", year: 2022, layer: "Application", description: "HTTP over QUIC for reduced latency and improved reliability.", available: false },
  { id: 2616, name: "HTTP/1.1 v2", title: "Hypertext Transfer Protocol -- HTTP/1.1", year: 1999, layer: "Application", description: "The original HTTP/1.1 specification that powered the early web.", available: false },
  { id: 7540, name: "HTTP/2 v1", title: "Hypertext Transfer Protocol Version 2", year: 2015, layer: "Application", description: "Faster web loading through multiplexing and header compression.", available: false },
  { id: 6455, name: "WebSocket", title: "The WebSocket Protocol", year: 2011, layer: "Application", description: "Full-duplex communication over a single TCP connection.", available: false },
  { id: 3986, name: "URI", title: "Uniform Resource Identifier", year: 2005, layer: "Application", description: "Syntax for identifying resources on the web.", available: false },
  { id: 6570, name: "URI Template", title: "URI Template", year: 2012, layer: "Application", description: "Syntax for URI templates with variable expansion.", available: false },

  // Security - TLS/SSL
  { id: 8446, name: "TLS 1.3", title: "The Transport Layer Security Protocol Version 1.3", year: 2018, layer: "Security", description: "Encrypts communications to keep your data private and authenticated.", available: false },
  { id: 5246, name: "TLS 1.2", title: "The Transport Layer Security Protocol Version 1.2", year: 2008, layer: "Security", description: "Widely deployed TLS version with modern cipher suites.", available: false },
  { id: 8996, name: "TLS Deprecation", title: "Deprecating TLS 1.0 and TLS 1.1", year: 2021, layer: "Security", description: "Formally deprecates insecure TLS versions.", available: false },
  { id: 2818, name: "HTTPS", title: "HTTP Over TLS", year: 2000, layer: "Security", description: "Secures HTTP with TLS encryption for the modern web.", available: false },
  { id: 6066, name: "TLS Extensions", title: "TLS Extensions: Extension Definitions", year: 2011, layer: "Security", description: "Defines key TLS extensions including SNI.", available: false },

  // Security - Authentication & Authorization
  { id: 6749, name: "OAuth 2.0", title: "The OAuth 2.0 Authorization Framework", year: 2012, layer: "Security", description: "Industry-standard protocol for authorization.", available: false },
  { id: 6750, name: "OAuth Bearer", title: "OAuth 2.0 Bearer Token Usage", year: 2012, layer: "Security", description: "How to use bearer tokens in OAuth 2.0.", available: false },
  { id: 7519, name: "JWT", title: "JSON Web Token", year: 2015, layer: "Security", description: "Compact, URL-safe tokens for claims between parties.", available: false },
  { id: 7515, name: "JWS", title: "JSON Web Signature", year: 2015, layer: "Security", description: "Digital signatures for JSON-based data structures.", available: false },
  { id: 7516, name: "JWE", title: "JSON Web Encryption", year: 2015, layer: "Security", description: "Encryption for JSON-based data structures.", available: false },
  { id: 7517, name: "JWK", title: "JSON Web Key", year: 2015, layer: "Security", description: "JSON data structure representing cryptographic keys.", available: false },
  { id: 8725, name: "JWT Best Practices", title: "JSON Web Token Best Practices", year: 2020, layer: "Security", description: "Security considerations and best practices for JWTs.", available: false },
  { id: 7235, name: "HTTP Auth", title: "HTTP Authentication", year: 2014, layer: "Security", description: "Framework for HTTP authentication including Basic and Digest.", available: false },
  { id: 7617, name: "HTTP Basic Auth", title: "The 'Basic' HTTP Authentication Scheme", year: 2015, layer: "Security", description: "Username and password authentication for HTTP.", available: false },

  // Email
  { id: 5321, name: "SMTP", title: "Simple Mail Transfer Protocol", year: 2008, layer: "Mail", description: "How email gets delivered across the internet.", available: false },
  { id: 5322, name: "IMF", title: "Internet Message Format", year: 2008, layer: "Mail", description: "Format of email messages with headers and body.", available: false },
  { id: 3501, name: "IMAP", title: "Internet Message Access Protocol", year: 2003, layer: "Mail", description: "Protocol for accessing email on remote servers.", available: false },
  { id: 1939, name: "POP3", title: "Post Office Protocol - Version 3", year: 1996, layer: "Mail", description: "Simple protocol for downloading email from servers.", available: false },
  { id: 6376, name: "DKIM", title: "DomainKeys Identified Mail Signatures", year: 2011, layer: "Mail", description: "Email authentication using cryptographic signatures.", available: false },
  { id: 7208, name: "SPF", title: "Sender Policy Framework", year: 2014, layer: "Mail", description: "Email authentication to prevent spoofing.", available: false },
  { id: 7489, name: "DMARC", title: "Domain-based Message Authentication", year: 2015, layer: "Mail", description: "Policy framework for email authentication.", available: false },
  { id: 2045, name: "MIME", title: "MIME Part One: Format of Internet Message Bodies", year: 1996, layer: "Mail", description: "Extends email to support attachments and non-ASCII text.", available: false },

  // Routing
  { id: 4271, name: "BGP", title: "A Border Gateway Protocol 4", year: 2006, layer: "Routing", description: "The protocol that makes internet routing decisions between autonomous systems.", available: true },
  { id: 2328, name: "OSPF", title: "OSPF Version 2", year: 1998, layer: "Routing", description: "Link-state routing protocol for IP networks.", available: false },
  { id: 5340, name: "OSPFv3", title: "OSPF for IPv6", year: 2008, layer: "Routing", description: "OSPF adapted for IPv6 networks.", available: false },
  { id: 2453, name: "RIP", title: "RIP Version 2", year: 1998, layer: "Routing", description: "Simple distance-vector routing protocol.", available: false },
  { id: 4364, name: "MPLS VPN", title: "BGP/MPLS IP Virtual Private Networks", year: 2006, layer: "Routing", description: "VPN implementation using BGP and MPLS.", available: false },
  { id: 3031, name: "MPLS", title: "Multiprotocol Label Switching Architecture", year: 2001, layer: "Routing", description: "High-performance packet forwarding using labels.", available: false },

  // Data Formats
  { id: 8259, name: "JSON", title: "The JavaScript Object Notation Data Interchange Format", year: 2017, layer: "Application", description: "Lightweight data-interchange format used everywhere.", available: false },
  { id: 7049, name: "CBOR", title: "Concise Binary Object Representation", year: 2013, layer: "Application", description: "Binary data format based on the JSON data model.", available: false },
  { id: 4648, name: "Base Encodings", title: "The Base16, Base32, and Base64 Data Encodings", year: 2006, layer: "Application", description: "Standard encodings for binary data in text formats.", available: false },
  { id: 3629, name: "UTF-8", title: "UTF-8 Transformation Format of ISO 10646", year: 2003, layer: "Application", description: "The dominant character encoding for the web.", available: false },
  { id: 6901, name: "JSON Pointer", title: "JavaScript Object Notation Pointer", year: 2013, layer: "Application", description: "Syntax for identifying specific values in JSON.", available: false },
  { id: 6902, name: "JSON Patch", title: "JavaScript Object Notation Patch", year: 2013, layer: "Application", description: "Format for describing changes to JSON documents.", available: false },

  // Time & Synchronization
  { id: 5905, name: "NTP", title: "Network Time Protocol Version 4", year: 2010, layer: "Infrastructure", description: "Synchronizes clocks across computer networks.", available: false },
  { id: 868, name: "Time Protocol", title: "Time Protocol", year: 1983, layer: "Infrastructure", description: "Simple protocol for obtaining machine-readable time.", available: false },
  { id: 3339, name: "Timestamps", title: "Date and Time on the Internet: Timestamps", year: 2002, layer: "Application", description: "Standard format for date and time in internet protocols.", available: false },

  // Network Management
  { id: 3411, name: "SNMP", title: "SNMP Management Framework", year: 2002, layer: "Management", description: "Protocol for monitoring and managing network devices.", available: false },
  { id: 5424, name: "Syslog", title: "The Syslog Protocol", year: 2009, layer: "Management", description: "Standard for message logging across networks.", available: false },
  { id: 7252, name: "CoAP", title: "Constrained Application Protocol", year: 2014, layer: "Application", description: "REST for constrained IoT devices.", available: false },

  // VoIP & Real-time
  { id: 3261, name: "SIP", title: "SIP: Session Initiation Protocol", year: 2002, layer: "Telephony", description: "Signaling protocol for voice and video calls.", available: false },
  { id: 3550, name: "RTP", title: "RTP: Real-Time Transport Protocol", year: 2003, layer: "Telephony", description: "Delivers audio and video over IP networks.", available: false },
  { id: 3551, name: "RTP Profiles", title: "RTP Profile for Audio and Video Conferences", year: 2003, layer: "Telephony", description: "Payload formats for common audio and video codecs.", available: false },
  { id: 8825, name: "WebRTC", title: "WebRTC Overview", year: 2021, layer: "Telephony", description: "Real-time communication between web browsers.", available: false },
  { id: 5245, name: "ICE", title: "Interactive Connectivity Establishment", year: 2010, layer: "Telephony", description: "NAT traversal for real-time communication.", available: false },
  { id: 8445, name: "ICE Updated", title: "ICE: A Protocol for NAT Traversal", year: 2018, layer: "Telephony", description: "Updated ICE specification for NAT traversal.", available: false },
  { id: 5389, name: "STUN", title: "STUN Protocol", year: 2008, layer: "Telephony", description: "NAT discovery and traversal utility.", available: false },
  { id: 8656, name: "TURN", title: "TURN: Relay Extensions to STUN", year: 2020, layer: "Telephony", description: "Relay for NAT traversal when direct connection fails.", available: false },

  // Infrastructure
  { id: 2131, name: "DHCP", title: "Dynamic Host Configuration Protocol", year: 1997, layer: "Infrastructure", description: "Automatically assigns IP addresses to devices.", available: false },
  { id: 8415, name: "DHCPv6", title: "DHCPv6", year: 2018, layer: "Infrastructure", description: "Dynamic configuration for IPv6 networks.", available: false },
  { id: 4862, name: "SLAAC", title: "IPv6 Stateless Address Autoconfiguration", year: 2007, layer: "Infrastructure", description: "Automatic IPv6 address configuration without DHCP.", available: false },
  { id: 5952, name: "IPv6 Text", title: "A Recommendation for IPv6 Address Text Representation", year: 2010, layer: "Infrastructure", description: "Canonical text format for IPv6 addresses.", available: false },

  // File Transfer
  { id: 959, name: "FTP", title: "File Transfer Protocol", year: 1985, layer: "Application", description: "Classic protocol for transferring files between hosts.", available: false },
  { id: 4251, name: "SSH", title: "SSH Protocol Architecture", year: 2006, layer: "Security", description: "Secure remote login and command execution.", available: false },
  { id: 4252, name: "SSH Auth", title: "SSH Authentication Protocol", year: 2006, layer: "Security", description: "Authentication methods for SSH.", available: false },
  { id: 4253, name: "SSH Transport", title: "SSH Transport Layer Protocol", year: 2006, layer: "Security", description: "Encryption and integrity for SSH connections.", available: false },

  // Link Layer
  { id: 894, name: "IP over Ethernet", title: "Standard for IP over Ethernet", year: 1984, layer: "Link", description: "How IP packets are encapsulated in Ethernet frames.", available: false },
  { id: 2516, name: "PPPoE", title: "PPP over Ethernet", year: 1999, layer: "Link", description: "Point-to-Point Protocol over Ethernet for DSL connections.", available: false },
  { id: 5765, name: "Ethernet IPv6", title: "Security Issues in IPv6 and IPv4", year: 2010, layer: "Link", description: "Security considerations for IP on Ethernet.", available: false },

  // Miscellaneous Important RFCs
  { id: 2119, name: "Keywords", title: "Key words for use in RFCs", year: 1997, layer: "Infrastructure", description: "Defines MUST, SHOULD, MAY and other requirement keywords.", available: false },
  { id: 8174, name: "Keywords Update", title: "Ambiguity of Uppercase vs Lowercase in RFC 2119", year: 2017, layer: "Infrastructure", description: "Clarifies RFC 2119 keyword usage.", available: false },
  { id: 5234, name: "ABNF", title: "Augmented BNF for Syntax Specifications", year: 2008, layer: "Infrastructure", description: "Grammar notation used in protocol specifications.", available: false },
  { id: 4122, name: "UUID", title: "A Universally Unique IDentifier", year: 2005, layer: "Application", description: "128-bit identifiers for distributed systems.", available: false },
  { id: 5765, name: "IPv4/IPv6 Security", title: "Security Issues in IPv6 and IPv4", year: 2010, layer: "Security", description: "Security implications of the IP protocols.", available: false },
];

export function getRFCById(id: number): CatalogRFC | undefined {
  return rfcCatalog.find(rfc => rfc.id === id);
}

export function getAvailableRFCs(): CatalogRFC[] {
  return rfcCatalog.filter(rfc => rfc.available);
}

export function getRFCsByLayer(layer: CatalogRFC["layer"]): CatalogRFC[] {
  return rfcCatalog.filter(rfc => rfc.layer === layer);
}

export function searchRFCs(query: string): CatalogRFC[] {
  const lowerQuery = query.toLowerCase();
  return rfcCatalog.filter(rfc =>
    rfc.id.toString().includes(lowerQuery) ||
    rfc.name.toLowerCase().includes(lowerQuery) ||
    rfc.title.toLowerCase().includes(lowerQuery) ||
    rfc.layer.toLowerCase().includes(lowerQuery)
  );
}
