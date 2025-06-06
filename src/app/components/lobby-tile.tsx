"use client";

import { useSetAtom } from "jotai";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { joinGameroom } from "../actions/joinLobby";
import { LobbyTile as Lobby } from "../models/lobby";
import { gameRoomAtom } from "../store/gameRoom";
import ErrorModal from "./error-modal";
import styles from "./lobby-tile.module.css";

export type LobbyProps = {
  lobby: Lobby;
};

export default function LobbyTile(props: LobbyProps) {
  const { lobby } = props;
  const { data } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const setGameroom = useSetAtom(gameRoomAtom);

  const handleClick = async () => {
    const gameRoom = await joinGameroom(data?.user.id);
    if (gameRoom.isError) {
      setShowModal(true);
      return;
    }
    setGameroom(gameRoom);
    router.push(`/gameroom?name=${lobby.collection_name}`);
  };

  return (
    <div className={styles.lobbyCard} onClick={handleClick}>
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
      <ErrorModal
        onOpenChange={(change) => setShowModal(change)}
        open={showModal}
        title="Unable to join lobby"
      />
    </div>
  );
}
