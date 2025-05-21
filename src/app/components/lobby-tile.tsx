"use client";

import { useSession } from "next-auth/react";
import { joinLobby } from "../actions/joinLobby";
import { Lobby } from "../models/lobby";
import styles from "./lobby-tile.module.css";

export type LobbyProps = {
  lobby: Lobby;
};

export default function LobbyTile(props: LobbyProps) {
  const { lobby } = props;
  const { data } = useSession();

  const handleClick = async () => {
    console.log("click on tile");
    await joinLobby(data?.user.id);
  };

  return (
    <div className={styles.lobbyCard} onClick={async () => await handleClick()}>
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
