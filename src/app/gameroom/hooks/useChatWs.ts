"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSetAtom } from "jotai";
import { io, Socket } from "socket.io-client";
import { captureException } from "@/lib/sentry";
import {
  SOCKET_MAX_RECONNECT_ATTEMPTS,
  SOCKET_RECONNECT_DELAY_BASE,
  SOCKET_RECONNECT_DELAY_MAX,
} from "../constants";
import { UnifiedMessage, addUnifiedMessageAtom } from "../store/gameAtoms";

let lastChatConnectErrorCapture = 0;

type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected" | "error";

interface ChatState {
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  error: string | null;
}

function toHttpUrl(wsUrl: string): string {
  if (wsUrl.startsWith("ws://")) return "http://" + wsUrl.slice(5);
  if (wsUrl.startsWith("wss://")) return "https://" + wsUrl.slice(6);
  return wsUrl;
}

export const useChatSocket = (baseUrl: string, token: string) => {
  const socketRef = useRef<Socket | null>(null);
  const addUnifiedMessage = useSetAtom(addUnifiedMessageAtom);
  const [chatState, setChatState] = useState<ChatState>({
    connectionStatus: "connecting",
    isConnected: false,
    error: null,
  });

  useEffect(() => {
    if (!baseUrl) return;

    const url = toHttpUrl(baseUrl) + "/chat";
    const socket = io(url, {
      transports: ["websocket"],
      auth: { token },
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: SOCKET_MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: SOCKET_RECONNECT_DELAY_BASE,
      reconnectionDelayMax: SOCKET_RECONNECT_DELAY_MAX,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setChatState({ connectionStatus: "connected", isConnected: true, error: null });
    });

    socket.on("disconnect", (reason) => {
      setChatState((prev) => ({
        ...prev,
        isConnected: false,
        connectionStatus: "disconnected",
        error: `Disconnected: ${reason}`,
      }));
    });

    socket.on("connect_error", (err) => {
      const now = Date.now();
      if (now - lastChatConnectErrorCapture > 30_000) {
        lastChatConnectErrorCapture = now;
        captureException(err, { tags: { source: "chat_socket_connect_error" } });
      }
      setChatState((prev) => ({
        ...prev,
        isConnected: false,
        connectionStatus: "error",
        error: `Connection error: ${err.message}`,
      }));
    });

    socket.io.on("reconnect_attempt", () => {
      setChatState((prev) => ({ ...prev, connectionStatus: "reconnecting" }));
    });

    socket.io.on("reconnect", () => {
      setChatState({ connectionStatus: "connected", isConnected: true, error: null });
    });

    socket.io.on("reconnect_failed", () => {
      setChatState((prev) => ({
        ...prev,
        connectionStatus: "error",
        error: "Max reconnection attempts reached",
      }));
    });

    socket.on("unified_message", (data: UnifiedMessage) => {
      addUnifiedMessage(data);
    });

    socket.on("message_error", (data) => {
      setChatState((prev) => ({ ...prev, error: data.error }));
    });

    return () => {
      socket.removeAllListeners();
      socket.io.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [baseUrl, token, addUnifiedMessage]);

  const sendMessage = useCallback((text: string) => {
    const socket = socketRef.current;
    if (!socket?.connected) return false;

    try {
      socket.emit("send_message", text);
      return true;
    } catch {
      return false;
    }
  }, []);

  const reconnect = useCallback(() => {
    const socket = socketRef.current;
    if (socket && !socket.connected) {
      socket.io.reconnectionAttempts(SOCKET_MAX_RECONNECT_ATTEMPTS);
      setChatState((prev) => ({ ...prev, connectionStatus: "reconnecting", error: null }));
      socket.connect();
    }
  }, []);

  return {
    ...chatState,
    sendMessage,
    reconnect,
  };
};
