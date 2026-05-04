"use client";

import { Flex } from "@radix-ui/themes";
import { useAtomValue } from "jotai";
import {
  AlertCircle,
  BadgeCheck,
  BotIcon,
  Clock,
  Crosshair,
  Flame,
  Sparkles,
  Sword,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  type LucideIcon,
  Zap,
} from "lucide-react";
import { useEffect, useRef } from "react";
import {
  currentUserIdAtom,
  isRoundBreakAtom,
  unifiedMessagesAtom,
  type UnifiedMessage,
} from "../store/gameAtoms";
import styles from "./UnifiedMessages.module.css";

const HOST_ICONS: Record<string, LucideIcon> = {
  welcome: Sparkles,
  round_start: BotIcon,
  round_end: Trophy,
  near_miss: Crosshair,
  snipe: Swords,
  save: Sparkles,
  // Intermission accolades
  accolade_announcement: Trophy,
  accolade_speed: Zap,
  accolade_first: Sword,
  accolade_precision: Target,
  accolade_perfection: BadgeCheck,
  accolade_volume: Flame,
  accolade_streak: TrendingUp,
  accolade_clutch: Clock,
  accolade_sniper: Crosshair,
  accolade_close_call: AlertCircle,
  // Game-end
  game_end_announcement: Trophy,
  game_end_speed: Zap,
  game_end_first: Sword,
  game_end_precision: Target,
  game_end_perfection: BadgeCheck,
  game_end_volume: Flame,
  game_end_streak: TrendingUp,
  game_end_clutch: Clock,
  game_end_sniper: Crosshair,
  game_end_close_call: AlertCircle,
  game_end: BotIcon,
};

const HOST_ICON_COLORS: Record<string, string> = {
  welcome: "var(--neon-blue)",
  round_start: "var(--neon-blue)",
  round_end: "var(--neon-pink)",
  near_miss: "#ff6b00",
  snipe: "rgba(183, 0, 255, 0.5)",
  save: "var(--neon-blue)",
  // Intermission accolades
  accolade_announcement: "#ffd700",
  accolade_speed: "#ff6b00",
  accolade_first: "#8b0000",
  accolade_precision: "#00ff00",
  accolade_perfection: "#00ffff",
  accolade_volume: "#ff4500",
  accolade_streak: "#ff1493",
  accolade_clutch: "#1e90ff",
  accolade_sniper: "#9932cc",
  accolade_close_call: "#ffa500",
  // Game-end
  game_end_announcement: "#ffd700",
  game_end_speed: "#ff6b00",
  game_end_first: "#8b0000",
  game_end_accuracy: "#00ff00",
  game_end_perfection: "#00ffff",
  game_end_volume: "#ff4500",
  game_end_streak: "#ff1493",
  game_end_clutch: "#1e90ff",
  game_end_sniper: "#9932cc",
  game_end_close_call: "#ffa500",
  game_end: "var(--neon-pink)",
};

export default function UnifiedMessages() {
  const currentUserId = useAtomValue(currentUserIdAtom);
  const isRoundBreak = useAtomValue(isRoundBreakAtom);
  const messages = useAtomValue(unifiedMessagesAtom);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return timestamp;
    }
  };

  const getMessageTypeClass = (msg: UnifiedMessage): string => {
    if (msg.message_type === "host") {
      return styles.hostMessage;
    }
    if (
      msg.player_id === "botbob" ||
      msg.display_name.toLowerCase() === "botbob"
    ) {
      return styles.botBobMessage;
    }
    switch (msg.message_type) {
      case "successful_answer":
        return styles.successfulAnswerMessage;
      case "failed_answer":
        if (
          msg.submission_result === "already_snapped" ||
          msg.submission_result === "too_slow"
        )
          return styles.takenMessage;
        return styles.chatMessage;
      default:
        return styles.chatMessage;
    }
  };

  const getHostSubtypeClass = (subtype: string | undefined): string => {
    if (!subtype) return "";
    const camelCase = subtype.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase(),
    );
    const className = `host${camelCase.charAt(0).toUpperCase() + camelCase.slice(1)}Message`;
    return styles[className] || "";
  };

  const getHostIcon = (subtype: string | undefined): LucideIcon | null => {
    if (!subtype) return null;
    return HOST_ICONS[subtype] || null;
  };

  return (
    <div className={styles.unifiedMessagesContainer}>
      <div className={styles.messagesScrollArea}>
        {messages.length === 0 ? (
          <div className={styles.messagesEmpty}>
            {isRoundBreak
              ? "Chaos is pausing, for now..."
              : "Chaos will commence here..."}
          </div>
        ) : (
          messages.map((msg, index) => {
            const isHostMessage = msg.message_type === "host";
            const HostIconComponent = isHostMessage
              ? getHostIcon(msg.host_subtype)
              : null;
            const hostIconColor = isHostMessage
              ? HOST_ICON_COLORS[msg.host_subtype || ""]
              : undefined;

            return (
              <div
                key={index}
                className={`${styles.unifiedMessage} ${getMessageTypeClass(msg)} ${getHostSubtypeClass(
                  msg.host_subtype,
                )} ${
                  msg.player_id === currentUserId
                    ? msg.message_type === "successful_answer"
                      ? styles.ownSuccessfulAnswerMessage
                      : msg.message_type === "chat"
                        ? styles.ownMessage
                        : ""
                    : ""
                }`}
              >
                <Flex direction="row" gap="2" align="center">
                  {isHostMessage && HostIconComponent && (
                    <HostIconComponent
                      size={18}
                      style={{
                        color: hostIconColor,
                        flexShrink: 0,
                        marginLeft: "0.5rem",
                      }}
                    />
                  )}
                  <div className={styles.messageContentWrapper}>
                    <Flex direction="row" gap="2" align="center">
                      <span className={styles.messageUser}>
                        {msg.display_name}
                      </span>
                      <span className={styles.messageTime}>
                        {formatTimestamp(msg.timestamp)}
                      </span>
                    </Flex>
                    <div className={styles.messageContent}>
                      {msg.text}
                      {msg.canonical_text &&
                        msg.canonical_text.toLowerCase() !==
                          msg.text.toLowerCase() && (
                          <span className={styles.canonicalAnswer}>
                            {" "}
                            → "{msg.canonical_text}"
                          </span>
                        )}
                    </div>
                  </div>
                </Flex>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
