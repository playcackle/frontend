"use client";

import { ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import AgentChat from "../../components/AgentChat";

export default function AgentTopicCreatorPage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", height: "100%" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={() => navigate({ to: "/admin/topics" })}
            style={{
              background: "none",
              border: "none",
              color: "#a0a0ff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.85rem",
              padding: "0.25rem 0.5rem",
              borderRadius: "4px",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "none")}
          >
            <ArrowLeft size={16} /> Topics
          </button>
          <h1
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            <span style={{ color: "#00ffff", textShadow: "0 0 10px #00ffff" }}>TOPIC</span>{" "}
            <span style={{ color: "#ff00ff", textShadow: "0 0 10px #ff00ff" }}>CREATOR AI</span>
          </h1>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.8rem",
            color: "#888",
          }}
        >
          <Sparkles size={14} />
          <span>Brainstorm · Generate · Refine</span>
        </div>
      </div>

      {/* Agent Chat Interface */}
      <AgentChat
        onComplete={() => navigate({ to: "/admin/topics" })}
      />
    </div>
  );
}