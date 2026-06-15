"use client";

import { topicsApi, generationApi } from "@/lib/api/admin";
import { createClient } from "@/lib/supabase/client";
import {
  AlertTriangle,
  Bot,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Send,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./AgentChat.module.css";

// ─── Types ──────────────────────────────────────────────────────────────────

type AgentMessage = {
  type: "system" | "thought" | "chat" | "result" | "slot_updated" | "qa_report" | "saved" | "error";
  content: string;
  role?: string;
  data?: Record<string, unknown>;
  tool_call?: string;
  tool_result?: Record<string, unknown>;
  session_id?: string;
};

type SlotData = {
  canonical_text: string;
  bot_bob_clue: string;
  is_rare: boolean;
  aliases: string[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getWsUrl(): Promise<string> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const httpUrl =
    import.meta.env.VITE_CONTENT_SERVICE_URL || "http://localhost:8003";
  const wsProtocol = httpUrl.startsWith("https") ? "wss" : "ws";
  const host = httpUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "");

  if (token) {
    return `${wsProtocol}://${host}/agent/ws?token=${encodeURIComponent(token)}`;
  }
  return `${wsProtocol}://${host}/agent/ws`;
}

function buildSlotFromResult(toolResult?: Record<string, unknown>): SlotData[] {
  if (!toolResult?.slots) return [];
  return (toolResult.slots as SlotData[]).map((s) => ({
    canonical_text: s.canonical_text || "",
    bot_bob_clue: s.bot_bob_clue || "",
    is_rare: !!s.is_rare,
    aliases: Array.isArray(s.aliases) ? s.aliases : [],
  }));
}

// ─── Draft Review Banner ─────────────────────────────────────────────────────

function DraftReviewBanner({
  draftReview,
  qaReport,
  membershipReport,
}: {
  draftReview?: {
    status: string;
    suggestions: string[];
    requested_slots: number;
    generated_slots: number;
  } | null;
  qaReport?: { issues: string[]; warnings: string[] } | null;
  membershipReport?: {
    possible_missing: string[];
    possible_invalid: string[];
    confidence: string;
    basis: string;
  } | null;
}) {
  const [showQa, setShowQa] = useState(false);
  const [showMembership, setShowMembership] = useState(false);

  if (!draftReview) return null;

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
    ready: {
      icon: <CheckCircle size={18} />,
      color: "#00ff00",
      bg: "rgba(0,255,0,0.1)",
      label: "Ready to Save",
    },
    needs_review: {
      icon: <ShieldAlert size={18} />,
      color: "#ffa500",
      bg: "rgba(255,165,0,0.1)",
      label: "Needs Review",
    },
    blocked: {
      icon: <AlertTriangle size={18} />,
      color: "#ff6b6b",
      bg: "rgba(255,107,107,0.1)",
      label: "Blocked",
    },
  };

  const cfg = statusConfig[draftReview.status] || statusConfig.needs_review;

  return (
    <div style={{ padding: "0.75rem 1rem", background: cfg.bg, border: `1px solid ${cfg.color}`, borderRadius: "8px", marginBottom: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: cfg.color, fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>
        {cfg.icon}
        {cfg.label}
        <span style={{ fontWeight: 400, opacity: 0.7 }}>
          ({draftReview.requested_slots} requested, {draftReview.generated_slots} generated)
        </span>
      </div>

      {draftReview.suggestions.length > 0 && (
        <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.5rem", fontSize: "0.85rem", color: cfg.color }}>
          {draftReview.suggestions.map((s, i) => (
            <li key={i} style={{ marginBottom: "0.25rem" }}>{s}</li>
          ))}
        </ul>
      )}

      {qaReport && (
        <div style={{ marginTop: "0.75rem" }}>
          <button onClick={() => setShowQa(!showQa)}
            style={{ background: "none", border: "none", color: "#a0a0ff", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0" }}>
            {showQa ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            QA: {qaReport.issues?.length || 0} issues, {qaReport.warnings?.length || 0} warnings
          </button>
          {showQa && (
            <div style={{ fontSize: "0.8rem", color: "#ccc", paddingLeft: "1.25rem" }}>
              {qaReport.issues?.length > 0 && (
                <div style={{ marginBottom: "0.5rem" }}>
                  <p style={{ color: "#ff6b6b", fontWeight: 600, margin: "0.25rem 0" }}>Issues:</p>
                  <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                    {qaReport.issues.map((issue, i) => (
                      <li key={i} style={{ marginBottom: "0.15rem" }}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {qaReport.warnings?.length > 0 && (
                <div>
                  <p style={{ color: "#ffa500", fontWeight: 600, margin: "0.25rem 0" }}>Warnings:</p>
                  <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                    {qaReport.warnings.map((w, i) => (
                      <li key={i} style={{ marginBottom: "0.15rem" }}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(!qaReport.issues?.length && !qaReport.warnings?.length) && (
                <p style={{ color: "#00ff00" }}>All QA checks passed ✓</p>
              )}
            </div>
          )}
        </div>
      )}

      {membershipReport && (
        <div style={{ marginTop: "0.5rem" }}>
          <button onClick={() => setShowMembership(!showMembership)}
            style={{ background: "none", border: "none", color: "#a0a0ff", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0" }}>
            {showMembership ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Membership: {membershipReport.possible_missing?.length || 0} possible missing
          </button>
          {showMembership && membershipReport.possible_missing?.length > 0 && (
            <div style={{ fontSize: "0.8rem", color: "#ccc", paddingLeft: "1.25rem" }}>
              <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                {membershipReport.possible_missing.map((m, i) => (
                  <li key={i} style={{ marginBottom: "0.15rem" }}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main AgentChat Component ────────────────────────────────────────────────

interface AgentChatProps {
  topicName?: string;
  onComplete?: () => void;
  onClose?: () => void;
}

export default function AgentChat({
  topicName = "",
  onComplete,
  onClose,
}: AgentChatProps) {
  // Connection state
  const wsRef = useRef<WebSocket | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Slot state (from generation result)
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [draftReview, setDraftReview] = useState<Record<string, unknown> | null>(null);
  const [qaReport, setQaReport] = useState<Record<string, unknown> | null>(null);
  const [membershipReport, setMembershipReport] = useState<Record<string, unknown> | null>(null);
  const [slotComments, setSlotComments] = useState<Record<number, string>>({});

  // Saving state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Connect WebSocket (ref-based to handle StrictMode double-mount safely)
  useEffect(() => {
    const abortController = new AbortController();
    let ws: WebSocket | null = null;

    getWsUrl().then((url) => {
      if (abortController.signal.aborted) return;

      ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (abortController.signal.aborted) {
          ws?.close();
          return;
        }
        setConnected(true);

        // Send initial greeting
        const initialMessage = topicName
          ? `I want to create a topic about "${topicName}". Can you help me brainstorm and generate it?`
          : "Hi! I want to create a new trivia topic for Cackle. Can you help?";
        ws!.send(JSON.stringify({ type: "message", content: initialMessage }));
        setMessages((prev) => [
          ...prev,
          { type: "chat", content: initialMessage, role: "user" },
        ]);
      };

      ws.onmessage = (event) => {
        if (abortController.signal.aborted) return;
        try {
          const msg: AgentMessage = JSON.parse(event.data);
          handleMessage(msg);
        } catch (e) {
          console.error("Failed to parse WS message:", e);
        }
      };

      ws.onclose = () => {
        if (!abortController.signal.aborted) {
          setConnected(false);
        }
      };

      ws.onerror = (e) => {
        if (!abortController.signal.aborted) {
          console.error("Agent WS error:", e);
          setConnected(false);
        }
      };
    });

    return () => {
      abortController.abort();
      if (ws) ws.close();
      wsRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMessage = useCallback((msg: AgentMessage) => {
    switch (msg.type) {
      case "system":
        if (msg.data?.session_id) {
          setSessionId(msg.data.session_id as string);
        }
        break;

      case "thought":
        // Tool execution indicator — don't add to visible messages
        // but do set thinking based on the tool name
        // Show briefly as an ephemeral indicator
        setMessages((prev) => {
          // Replace last thought if it exists, otherwise append
          const last = prev[prev.length - 1];
          if (last?.type === "thought") {
            return [...prev.slice(0, -1), msg];
          }
          return [...prev, msg];
        });
        break;

      case "chat":
        setMessages((prev) => [...prev, msg]);
        setThinking(false);
        break;

      case "result": {
        setMessages((prev) => [...prev, msg]);
        setThinking(false);

        const result = msg.tool_result || {};
        const newSlots = buildSlotFromResult(result);
        if (newSlots.length > 0) {
          setSlots(newSlots);
        }

        if (result.draft_review) {
          setDraftReview(result.draft_review as Record<string, unknown>);
        }
        if (result.qa_report) {
          setQaReport(result.qa_report as Record<string, unknown>);
        }
        if (result.membership_report) {
          setMembershipReport(result.membership_report as Record<string, unknown>);
        }
        break;
      }

      case "slot_updated":
        setMessages((prev) => [...prev, msg]);
        if (msg.tool_result?.canonical_text) {
          const result = msg.tool_result as Record<string, unknown>;
          const idx = result.index as number;
          setSlots((prev) => {
            const updated = [...prev];
            if (idx >= 0 && idx < updated.length) {
              updated[idx] = {
                ...updated[idx],
                canonical_text: (result.canonical_text as string) || updated[idx].canonical_text,
                bot_bob_clue: (result.bot_bob_clue as string) || updated[idx].bot_bob_clue,
                is_rare: (result.is_rare as boolean) ?? updated[idx].is_rare,
                aliases: (result.aliases as string[]) || updated[idx].aliases,
              };
            }
            return updated;
          });
        }
        break;

      case "qa_report":
        setMessages((prev) => [...prev, msg]);
        if (msg.tool_result) {
          setQaReport(msg.tool_result as Record<string, unknown>);
        }
        break;

      case "saved":
        setMessages((prev) => [...prev, msg]);
        setThinking(false);
        break;

      case "error":
        setMessages((prev) => [...prev, msg]);
        setThinking(false);
        break;

      default:
        setMessages((prev) => [...prev, msg]);
        break;
    }
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      setThinking(true);
      wsRef.current.send(JSON.stringify({ type: "message", content: text }));
      setMessages((prev) => [
        ...prev,
        { type: "chat", content: text, role: "user" },
      ]);
      setInput("");
    },
    []
  );

  const handleSlotEdit = useCallback(
    (index: number, field: string, value: string | boolean | string[]) => {
      setSlots((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    []
  );

  const handleSlotComment = useCallback(
    (index: number, comment: string) => {
      setSlotComments((prev) => ({ ...prev, [index]: comment }));
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "slot_comment", index, comment })
        );
      }
    },
    []
  );

  const handleSubmitComment = useCallback(
    (index: number) => {
      const comment = slotComments[index] || "";
      if (!comment.trim()) return;
      handleSlotComment(index, comment);
    },
    [slotComments, handleSlotComment]
  );

  const handleSave = useCallback(async () => {
    if (slots.length === 0) return;
    setSaving(true);
    setSaveError(null);

    try {
      // Create the topic
      const topic = await topicsApi.create({
        name: topicName || "Generated Topic",
        prompt: "Generated via Topic Creator AI",
        example_text: slots[0]?.canonical_text || undefined,
        collection_ids: [],
        category: undefined,
        mode: undefined,
        topic_type: undefined,
      });

      // Create all slots
      await generationApi.createSlotsBulk(
        topic.id,
        slots.map((s) => ({
          canonical_text: s.canonical_text,
          prompt: "",
          bot_bob_clue: s.bot_bob_clue || undefined,
          is_rare: s.is_rare,
          aliases: s.aliases || [],
        }))
      );

      setMessages((prev) => [
        ...prev,
        {
          type: "saved",
          content: `Topic "${topic.name}" saved with ${slots.length} slots!`,
        },
      ]);
      onComplete?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      setSaveError(msg);
      setMessages((prev) => [
        ...prev,
        { type: "error", content: msg },
      ]);
    } finally {
      setSaving(false);
    }
  }, [slots, topicName, onComplete]);

  const chatPanel = (
    <div className={styles.chatPanel}>
      <div className={styles.chatHeader}>
        <Bot size={18} className={styles.chatHeaderIcon} />
        <span className={styles.chatHeaderTitle}>Conversation</span>
        <span
          className={styles.connectionIndicator}
          style={{ color: connected ? "#00ff00" : "#ff6b6b" }}
        >
          {connected ? "● Connected" : "○ Disconnected"}
        </span>
      </div>

      <div className={styles.chatMessages}>
        {messages.length === 0 ? (
          <div className={styles.emptyChat}>
            <Bot size={48} />
            <p>Connecting to Topic Creator AI...</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            if (msg.type === "thought") {
              return (
                <div key={i} className={styles.thought}>
                  <span className={styles.thoughtIcon}>⚡</span>
                  <span>
                    {msg.tool_call
                      ? `Running: ${msg.tool_call}...`
                      : msg.content || "Thinking..."}
                  </span>
                </div>
              );
            }

            if (msg.type === "chat" && msg.role === "user") {
              return (
                <div key={i} className={styles.userBubble}>
                  {msg.content}
                </div>
              );
            }

            if (msg.type === "chat" || msg.type === "saved") {
              return (
                <div key={i} className={styles.agentBubble}>
                  <Bot size={16} className={styles.agentIcon} />
                  <div>
                    <p style={{ margin: 0 }}>{msg.content}</p>
                  </div>
                </div>
              );
            }

            if (msg.type === "result" && msg.tool_result) {
              const slotsCount = (msg.tool_result.slots_count as number) || 0;
              return (
                <div key={i} className={styles.resultBanner}>
                  <div className={styles.resultHeader}>
                    <CheckCircle size={16} />
                    <strong>Generated {slotsCount} slots</strong>
                  </div>
                  {msg.content && (
                    <p style={{ margin: "0.25rem 0", fontSize: "0.85rem", color: "#ccc" }}>
                      {msg.content}
                    </p>
                  )}
                </div>
              );
            }

            if (msg.type === "error") {
              return (
                <div key={i} className={styles.errorBubble}>
                  <AlertTriangle size={14} />
                  {msg.content}
                </div>
              );
            }

            return null;
          })
        )}

        {thinking && (
          <div className={styles.thinking}>
            <div className={styles.typingDot} />
            <div className={styles.typingDot} />
            <div className={styles.typingDot} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.chatInputArea}>
        <input
          type="text"
          className={styles.chatInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          placeholder={
            slots.length > 0
              ? "Ask the agent to refine slots..."
              : "Describe the topic you want to create..."
          }
          disabled={!connected || thinking}
        />
        <button
          className={styles.sendButton}
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || !connected || thinking}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );

  const slotsPanel = (
    <div className={styles.slotsPanel}>
      <div className={styles.slotsPanelHeader}>
        <Sparkles size={18} />
        <span>Working Slots</span>
        {slots.length > 0 && (
          <span className={styles.slotsCount}>{slots.length}</span>
        )}
      </div>

      <div className={styles.slotsPanelContent}>
        {slots.length === 0 ? (
          <div className={styles.emptySlots}>
            <p>Chat with the agent to generate slots.</p>
            <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.25rem" }}>
              Results will appear here once generated.
            </p>
          </div>
        ) : (
          <>
            <DraftReviewBanner
              draftReview={draftReview as any}
              qaReport={qaReport as any}
              membershipReport={membershipReport as any}
            />

            <div className={styles.slotsList}>
              {slots.map((slot, index) => (
                <div key={index} className={styles.slotCard}>
                  <div className={styles.slotNumber}>{index + 1}</div>
                  <div className={styles.slotBody}>
                    <input
                      type="text"
                      className={styles.slotInput}
                      value={slot.canonical_text}
                      onChange={(e) =>
                        handleSlotEdit(index, "canonical_text", e.target.value)
                      }
                      placeholder="Answer"
                    />
                    <input
                      type="text"
                      className={styles.slotClue}
                      value={slot.bot_bob_clue}
                      onChange={(e) =>
                        handleSlotEdit(index, "bot_bob_clue", e.target.value)
                      }
                      placeholder="Bot Bob clue"
                    />
                    <input
                      type="text"
                      className={styles.slotAliases}
                      value={slot.aliases?.join(", ") || ""}
                      onChange={(e) => {
                        const vals = e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);
                        handleSlotEdit(index, "aliases", vals);
                      }}
                      placeholder="Aliases (comma separated)"
                    />
                    <div className={styles.slotFooter}>
                      <label className={styles.rareCheckbox}>
                        <input
                          type="checkbox"
                          checked={slot.is_rare}
                          onChange={(e) =>
                            handleSlotEdit(index, "is_rare", e.target.checked)
                          }
                        />
                        Rare
                      </label>
                      <div className={styles.commentArea}>
                        <input
                          type="text"
                          className={styles.commentInput}
                          value={slotComments[index] || ""}
                          onChange={(e) =>
                            setSlotComments((prev) => ({
                              ...prev,
                              [index]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSubmitComment(index);
                          }}
                          placeholder="Comment for agent..."
                        />
                        <button
                          className={styles.commentButton}
                          onClick={() => handleSubmitComment(index)}
                        >
                          <MessageCircle size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.slotsPanelFooter}>
              {saveError && (
                <span className={styles.saveError}>{saveError}</span>
              )}
              <button
                className={styles.saveButton}
                onClick={handleSave}
                disabled={saving || slots.length === 0}
              >
                {saving ? "Saving..." : `SAVE ${slots.length} SLOTS`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.twoColumn}>
      {chatPanel}
      {slotsPanel}
    </div>
  );
}