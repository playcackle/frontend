"use client"

import React from "react"
import styles from "../quiz-room.module.css"
import type { Question } from "../types"
import QuestionTile from "./QuestionTile"

interface QuestionsGridProps {
  questions: Question[]
  bonusQuestions: Question[]
  animatingTile: number | null
  timeExpired: boolean
  isIntermission: boolean
  onQuestionClick: (question: Question, event: React.MouseEvent) => void
}

const QuestionsGrid: React.FC<QuestionsGridProps> = ({
  questions,
  bonusQuestions,
  animatingTile,
  timeExpired,
  isIntermission,
  onQuestionClick,
}) => {
  return (
    <div className={styles.questionsContainer} style={{ "--room-color": "var(--neon-pink)" } as React.CSSProperties}>
      <div className={styles.questionsGrid}>
        {questions.map((question) => (
          <QuestionTile
            key={question.id}
            question={question}
            isAnimating={animatingTile === question.id}
            timeExpired={timeExpired}
            isIntermission={isIntermission}
            onClick={onQuestionClick}
          />
        ))}
        {bonusQuestions.map((bonus) => (
          <QuestionTile
            key={bonus.id}
            question={bonus}
            isAnimating={animatingTile === bonus.id}
            timeExpired={timeExpired}
            isIntermission={isIntermission}
            onClick={onQuestionClick}
            isBonus={true}
          />
        ))}
      </div>
    </div>
  )
}

export default React.memo(QuestionsGrid)
