import React from "react"
import styles from "../quiz-room.module.css"
import type { QuizRoomData } from "../types"

interface RoomHeaderProps {
  room: QuizRoomData
  roundNumber: number
}

const RoomHeader: React.FC<RoomHeaderProps> = ({ room, roundNumber }) => {
  const roomStyle = {
    "--room-color": room.color,
  } as React.CSSProperties

  return (
    <div className={styles.roomTitle} style={roomStyle}>
      <h1>
        <span className={styles.gameTitle}>SNAP SCORE</span>
        <span className={styles.roomName}>{room.name}</span>
      </h1>
      <div className={styles.roomDifficulty}>
        {room.difficulty} • Round {roundNumber}
      </div>
    </div>
  )
}

export default React.memo(RoomHeader)
