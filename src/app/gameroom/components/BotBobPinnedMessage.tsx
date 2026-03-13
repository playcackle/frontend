"use client";

import React from "react";
import { Flex } from "@radix-ui/themes";
import PlayerAvatar from "./PlayerAvatar";
import styles from "./BotBobPinnedMessage.module.css";
import { UnifiedMessage } from "../store/gameAtoms";

interface BotBobPinnedMessageProps {
  message: UnifiedMessage | null;
}

export default function BotBobPinnedMessage({
  message,
}: BotBobPinnedMessageProps) {
  if (!message) {
    return (
      <div className={styles.botBobPinned}>
        <Flex direction="row" gap="3" align="center">
          <PlayerAvatar
            playerId="botbob"
            displayName="BotBob"
            size="large"
          />
          <div className={styles.botBobPinnedContent}>
            <div className={styles.botBobName}>BOT BOB</div>
            <div className={styles.botBobText}>Waiting for the game to begin...</div>
          </div>
        </Flex>
      </div>
    );
  }

  return (
    <div className={styles.botBobPinned}>
      <Flex direction="row" gap="3" align="center">
        <PlayerAvatar
          playerId={message.player_id}
          displayName={message.display_name}
          size="large"
        />
        <div className={styles.botBobPinnedContent}>
          <div className={styles.botBobName}>BOT BOB</div>
          <div className={styles.botBobText}>{message.text}</div>
        </div>
      </Flex>
    </div>
  );
}
