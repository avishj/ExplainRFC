import { useState } from "react";
import { cn } from "@/lib/utils";
import type { StoryboardStep } from "@/types";

interface InstrumentsPanelProps {
  step: StoryboardStep;
  accentColors: [string, string];
}

type TabId = "state" | "packet" | "glossary";

export function InstrumentsPanel({ step }: InstrumentsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("state");
  
  const tabs: { id: TabId; label: string }[] = [
    { id: "state", label: "State Machine" },
    { id: "packet", label: "Packet" },
    { id: "glossary", label: "Glossary" },
  ];
  
  return (
    <aside className="w-72 lg:w-80 border-l border-carbon bg-void/80 backdrop-blur-sm flex flex-col">
      {/* Tab navigation */}
      <div className="flex border-b border-carbon">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-3 text-xs font-mono uppercase tracking-wider transition-all",
              activeTab === tab.id
                ? "text-gold border-b-2 border-amber bg-carbon/30"
                : "text-text-muted hover:text-text-secondary hover:bg-carbon/20"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === "state" && (
          <StateMachineView currentState={step.instruments?.stateMachine?.state} />
        )}
        
        {activeTab === "packet" && (
          <PacketInspector 
            packet={step.instruments?.packetInspector?.packet || step.scene?.packet}
            show={step.instruments?.packetInspector?.show}
          />
        )}
        
        {activeTab === "glossary" && (
          <GlossaryView terms={step.instruments?.glossary?.terms} />
        )}
      </div>
    </aside>
  );
}

function StateMachineView({ currentState }: { currentState?: string }) {
  const tcpStates = [
    { id: "CLOSED", x: 50, y: 10 },
    { id: "LISTEN", x: 80, y: 25 },
    { id: "SYN-SENT", x: 20, y: 25 },
    { id: "SYN-RECEIVED", x: 50, y: 40 },
    { id: "ESTABLISHED", x: 50, y: 58 },
    { id: "FIN-WAIT-1", x: 20, y: 72 },
    { id: "FIN-WAIT-2", x: 20, y: 85 },
    { id: "CLOSE-WAIT", x: 80, y: 72 },
    { id: "LAST-ACK", x: 80, y: 85 },
    { id: "TIME-WAIT", x: 50, y: 92 },
  ];
  
  return (
    <div className="space-y-4">
      <h3 className="museum-label text-brass">TCP State Machine</h3>
      
      <div className="relative aspect-[4/5] engraved rounded-lg p-4">
        {/* Connection lines (simplified) */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b7355" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#d4a44c" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8b7355" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* Vertical spine */}
          <line x1="50%" y1="15%" x2="50%" y2="90%" stroke="url(#lineGradient)" strokeWidth="1" />
          {/* Horizontal branches */}
          <line x1="20%" y1="25%" x2="80%" y2="25%" stroke="url(#lineGradient)" strokeWidth="1" />
          <line x1="20%" y1="72%" x2="80%" y2="72%" stroke="url(#lineGradient)" strokeWidth="1" />
        </svg>
        
        {tcpStates.map(state => (
          <div
            key={state.id}
            className={cn(
              "absolute px-2 py-1 rounded text-xs font-mono transition-all duration-500",
              "-translate-x-1/2 -translate-y-1/2 z-10",
              state.id === currentState
                ? "bg-gradient-to-r from-amber to-ember text-obsidian font-bold scale-110 glow-ember"
                : "bg-carbon text-text-muted border border-stone"
            )}
            style={{ left: `${state.x}%`, top: `${state.y}%` }}
          >
            {state.id}
          </div>
        ))}
      </div>
      
      {currentState && (
        <div className="p-4 rounded-lg engraved">
          <span className="museum-label text-text-muted block mb-1">Current State</span>
          <span className="font-mono font-bold text-lg text-gold">{currentState}</span>
        </div>
      )}
    </div>
  );
}

function PacketInspector({ 
  packet, 
  show 
}: { 
  packet?: { flags?: string[]; seq?: number; ack?: number; headers?: Record<string, string | number> };
  show?: boolean;
}) {
  if (!show && !packet) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-text-muted">
        <svg className="w-10 h-10 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-sm">No packet data for this step</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="museum-label text-brass">Packet Structure</h3>
      
      {packet && (
        <div className="space-y-4">
          {/* Flags */}
          {packet.flags && packet.flags.length > 0 && (
            <div className="p-4 rounded-lg engraved">
              <span className="museum-label text-text-muted block mb-3">Flags</span>
              <div className="flex flex-wrap gap-2">
                {packet.flags.map(flag => (
                  <span 
                    key={flag}
                    className="px-3 py-1.5 rounded bg-amber/20 text-amber text-sm font-mono font-medium border border-amber/30"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Sequence/Ack numbers */}
          {(packet.seq !== undefined || packet.ack !== undefined) && (
            <div className="grid grid-cols-2 gap-3">
              {packet.seq !== undefined && (
                <div className="p-4 rounded-lg engraved">
                  <span className="museum-label text-text-muted block mb-1">SEQ</span>
                  <span className="font-mono text-lg text-gold">{packet.seq}</span>
                </div>
              )}
              {packet.ack !== undefined && (
                <div className="p-4 rounded-lg engraved">
                  <span className="museum-label text-text-muted block mb-1">ACK</span>
                  <span className="font-mono text-lg text-gold">{packet.ack}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Headers */}
          {packet.headers && Object.keys(packet.headers).length > 0 && (
            <div className="p-4 rounded-lg engraved">
              <span className="museum-label text-text-muted block mb-3">Headers</span>
              <div className="space-y-2 font-mono text-sm">
                {Object.entries(packet.headers).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-text-secondary">{key}</span>
                    <span className="text-brass">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GlossaryView({ terms }: { terms?: string[] }) {
  const glossary: Record<string, string> = {
    "SYN": "Synchronize — Initiates a connection by requesting synchronization of sequence numbers",
    "ACK": "Acknowledge — Confirms receipt of data or connection request",
    "FIN": "Finish — Signals the sender has no more data to send",
    "SEQ": "Sequence Number — Identifies the order of bytes in the stream",
    "handshake": "A protocol for establishing a verified connection between two parties",
    "three-way handshake": "TCP's method of establishing a connection using SYN, SYN-ACK, and ACK",
    "reliable delivery": "Guarantee that data arrives complete, in order, and without errors",
    "flow control": "Mechanism to prevent sender from overwhelming receiver with data",
    "connection-oriented": "A protocol that establishes a dedicated connection before data transfer",
  };
  
  const displayTerms = terms || Object.keys(glossary).slice(0, 4);
  
  return (
    <div className="space-y-4">
      <h3 className="museum-label text-brass">Key Terms</h3>
      
      <div className="space-y-3">
        {displayTerms.map(term => (
          <div key={term} className="p-4 rounded-lg engraved">
            <span className="font-mono text-amber text-sm block mb-2">{term}</span>
            <p className="text-sm text-text-secondary leading-relaxed">
              {glossary[term] || "Definition coming soon..."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
