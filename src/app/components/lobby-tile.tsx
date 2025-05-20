"use client";

import { useRouter } from "next/navigation";
import { Lobby } from "../models/lobby";
import styles from "./lobby-tile.module.css";

export type LobbyProps = {
  lobby: Lobby;
};

export default function LobbyTile(props: LobbyProps) {
  const router = useRouter();

  const handlelobbyClick = (lobbyId: string) => {
    router.push(`/quiz-lobby?lobbyId=${lobbyId}`);
  };

  const { lobby } = props;

  return (
    <div
      key={lobby.lobby_id}
      className={styles.lobbyCard}
      onClick={() => handlelobbyClick(lobby.lobby_id)}
    >
      <h3 className={styles.lobbyName}>{lobby.collection_name}</h3>
      <div className={styles.lobbyCapacity}>
        <span className={styles.capacityText}>
          {25 - lobby.player_count} slots available
        </span>
        <div className={styles.capacityBar}>
          <div
            className={styles.capacityFill}
            style={{
              width: `${(lobby.player_count / 25) * 100}%`,
              backgroundColor: "--neon-pink",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
