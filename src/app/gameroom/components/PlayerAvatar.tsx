import React from "react";
import { getPlayerAvatar } from "../utils";
import styles from "../gameroom.module.css";

interface PlayerAvatarProps {
  playerId: string;
  displayName: string;
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function PlayerAvatar({
  playerId,
  displayName,
  size = "medium",
  className = "",
}: PlayerAvatarProps) {
  const avatar = getPlayerAvatar(playerId, displayName);

  const sizeClasses = {
    small: styles.avatarSmall,
    medium: styles.avatarMedium,
    large: styles.avatarLarge,
  };

  if (avatar.type === "image") {
    return (
      <img
        src={avatar.value}
        alt={displayName}
        className={`${styles.playerAvatarImage} ${sizeClasses[size]} ${className}`}
      />
    );
  }

  // Generated avatar with initials
  return (
    <div
      className={`${styles.playerAvatarGenerated} ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: avatar.color }}
    >
      {avatar.initials}
    </div>
  );
}
