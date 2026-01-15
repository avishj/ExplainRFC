import { useState } from "react";
import { cn } from "@/lib/utils";
import type { StoryboardStep } from "@/types/rfc";
import { Icon } from "@/components/ui/Icon";

interface InstrumentsPanelProps {
  step: StoryboardStep;
  accentColors: [string, string];
}

type TabId = "packet" | "state" | "glossary";

export function InstrumentsPanel({ step, accentColors }: InstrumentsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("state");
  
  const tabs: { id: TabId; label: string }[] = [
    { id: "state", label: "State" },
    { id: "packet", label: "Packet" },
    { id: "glossary", label: "Glossary" },
  ];
  
  return (
    <aside className="w-72 lg:w-80 border-l border-border bg-deep/50 flex flex-col">
      {/* Tab navigation */}
      <div className="flex border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "text-cyan border-b-2 border-cyan"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === "state" && (
          <StateMachineView 
            currentState={step.instruments?.stateMachine?.state} 
            accentColors={accentColors}
          />
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

// State Machine visualization
function StateMachineView({ 
  currentState, 
  accentColors 
}: { 
  currentState?: string;
  accentColors: [string, string];
}) {
  const tcpStates = [
    { id: "CLOSED", x: 50, y: 20 },
    { id: "LISTEN", x: 80, y: 35 },
    { id: "SYN-SENT", x: 20, y: 35 },
    { id: "SYN-RECEIVED", x: 50, y: 50 },
    { id: "ESTABLISHED", x: 50, y: 70 },
    { id: "FIN-WAIT-1", x: 20, y: 85 },
    { id: "FIN-WAIT-2", x: 20, y: 95 },
    { id: "CLOSE-WAIT", x: 80, y: 85 },
    { id: "LAST-ACK", x: 80, y: 95 },
    { id: "TIME-WAIT", x: 50, y: 95 },
  ];
  
  return (
    <div className="space-y-4">
      <h3 className="font-mono text-xs text-text-muted uppercase tracking-wider">
        TCP State Machine
      </h3>
      
      <div className="relative aspect-square bg-surface/50 rounded-lg p-4">
        {tcpStates.map(state => (
          <div
            key={state.id}
            className={cn(
              "absolute px-2 py-1 rounded text-xs font-mono transition-all duration-300",
              "-translate-x-1/2 -translate-y-1/2",
              state.id === currentState
                ? "text-void font-bold scale-110"
                : "bg-surface text-text-secondary"
            )}
            style={{ 
              left: `${state.x}%`, 
              top: `${state.y}%`,
              background: state.id === currentState 
                ? `linear-gradient(135deg, ${accentColors[0]}, ${accentColors[1]})`
                : undefined,
              boxShadow: state.id === currentState
                ? `0 0 20px ${accentColors[0]}40`
                : undefined,
            }}
          >
            {state.id}
          </div>
        ))}
      </div>
      
      {currentState && (
        <div className="p-3 rounded-lg bg-surface/50 border border-border">
          <span className="text-xs text-text-muted block mb-1">Current State</span>
          <span 
            className="font-mono font-bold"
            style={{ color: accentColors[0] }}
          >
            {currentState}
          </span>
        </div>
      )}
    </div>
  );
}

// Packet Inspector
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
        <Icon name="layers" size={32} className="mb-2 opacity-50" />
        <p className="text-sm">No packet data for this step</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="font-mono text-xs text-text-muted uppercase tracking-wider">
        Packet Structure
      </h3>
      
      {packet && (
        <div className="space-y-3">
          {/* Flags */}
          {packet.flags && packet.flags.length > 0 && (
            <div className="p-3 rounded-lg bg-surface/50 border border-border">
              <span className="text-xs text-text-muted block mb-2">Flags</span>
              <div className="flex flex-wrap gap-2">
                {packet.flags.map(flag => (
                  <span 
                    key={flag}
                    className="px-2 py-1 rounded bg-cyan/20 text-cyan text-xs font-mono"
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
                <div className="p-3 rounded-lg bg-surface/50 border border-border">
                  <span className="text-xs text-text-muted block mb-1">SEQ</span>
                  <span className="font-mono text-text-primary">{packet.seq}</span>
                </div>
              )}
              {packet.ack !== undefined && (
                <div className="p-3 rounded-lg bg-surface/50 border border-border">
                  <span className="text-xs text-text-muted block mb-1">ACK</span>
                  <span className="font-mono text-text-primary">{packet.ack}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Headers */}
          {packet.headers && Object.keys(packet.headers).length > 0 && (
            <div className="p-3 rounded-lg bg-surface/50 border border-border">
              <span className="text-xs text-text-muted block mb-2">Headers</span>
              <div className="space-y-1 font-mono text-sm">
                {Object.entries(packet.headers).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-text-secondary">{key}:</span>
                    <span className="text-text-primary">{value}</span>
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

// Glossary
function GlossaryView({ terms }: { terms?: string[] }) {
  const glossary: Record<string, string> = {
    "SYN": "Synchronize - Used to initiate a connection",
    "ACK": "Acknowledge - Confirms receipt of data",
    "FIN": "Finish - Used to close a connection",
    "SEQ": "Sequence Number - Identifies the order of bytes",
    "handshake": "A protocol for establishing a connection between two parties",
    "three-way handshake": "TCP's method of establishing a reliable connection using SYN, SYN-ACK, and ACK",
    "reliable delivery": "Guarantee that data arrives complete and in order",
    "flow control": "Mechanism to prevent sender from overwhelming receiver",
  };
  
  const displayTerms = terms || Object.keys(glossary).slice(0, 4);
  
  return (
    <div className="space-y-4">
      <h3 className="font-mono text-xs text-text-muted uppercase tracking-wider">
        Key Terms
      </h3>
      
      <div className="space-y-3">
        {displayTerms.map(term => (
          <div 
            key={term}
            className="p-3 rounded-lg bg-surface/50 border border-border"
          >
            <span className="font-mono text-cyan text-sm block mb-1">{term}</span>
            <p className="text-sm text-text-secondary">
              {glossary[term] || "Definition coming soon..."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
