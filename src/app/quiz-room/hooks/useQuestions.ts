"use client"

import { useState, useCallback } from "react"
import type { Question, Player } from "../types"
import { SAMPLE_ANSWERS } from "../constants"
import { initializeQuestions, initializeBonusQuestions, getRandomPlayer, getRandomAttentionAnimation } from "../utils"

export const useQuestions = (roundNumber: number) => {
  // Initialize questions with random entrance animations and staggered delays
  const [questions, setQuestions] = useState<Question[]>(() => initializeQuestions(8, SAMPLE_ANSWERS, roundNumber))

  // Initialize bonus questions with random entrance animations and staggered delays
  const [bonusQuestions, setBonusQuestions] = useState<Question[]>(() =>
    initializeBonusQuestions(9, 2, SAMPLE_ANSWERS, roundNumber),
  )

  // Reset questions for a new round
  const resetQuestionsForNewRound = useCallback((newRoundNumber: number) => {
    setQuestions(initializeQuestions(8, SAMPLE_ANSWERS, newRoundNumber))
    setBonusQuestions(initializeBonusQuestions(9, 2, SAMPLE_ANSWERS, newRoundNumber))
  }, [])

  // Mark question as answered
  const markQuestionAsAnswered = useCallback(
    (questionId: number, playerName: string, playerAvatar: string, playerColor: string, animation?: string) => {
      const finalAnimation = animation || `animate__animated ${getRandomAttentionAnimation()}`

      if (questionId <= 8) {
        setQuestions((prev) => {
          const updatedQuestions = [...prev]
          const index = updatedQuestions.findIndex((q) => q.id === questionId)
          if (index !== -1) {
            updatedQuestions[index] = {
              ...updatedQuestions[index],
              answered: true,
              answeredBy: playerName,
              playerAvatar: playerAvatar,
              playerColor: playerColor,
              animation: finalAnimation,
            }
          }
          return updatedQuestions
        })
      } else {
        setBonusQuestions((prev) => {
          const updatedBonusQuestions = [...prev]
          const index = updatedBonusQuestions.findIndex((q) => q.id === questionId)
          if (index !== -1) {
            updatedBonusQuestions[index] = {
              ...updatedBonusQuestions[index],
              answered: true,
              answeredBy: playerName,
              playerAvatar: playerAvatar,
              playerColor: playerColor,
              animation: finalAnimation,
            }
          }
          return updatedBonusQuestions
        })
      }
    },
    [],
  )

  // Reveal all unanswered questions (for time expiration)
  const revealAllUnansweredQuestions = useCallback((players: Player[]) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (!q.answered) {
          const randomPlayer = getRandomPlayer(players)
          return {
            ...q,
            answered: true,
            answeredBy: randomPlayer.name,
            playerAvatar: randomPlayer.avatar,
            playerColor: randomPlayer.color,
          }
        }
        return q
      }),
    )

    setBonusQuestions((prev) =>
      prev.map((q) => {
        if (!q.answered) {
          const randomPlayer = getRandomPlayer(players)
          return {
            ...q,
            answered: true,
            answeredBy: randomPlayer.name,
            playerAvatar: randomPlayer.avatar,
            playerColor: randomPlayer.color,
          }
        }
        return q
      }),
    )
  }, [])

  // Check if all questions are answered
  const areAllQuestionsAnswered = useCallback(() => {
    return [...questions, ...bonusQuestions].every((q) => q.answered)
  }, [questions, bonusQuestions])

  // Get unanswered questions
  const getUnansweredQuestions = useCallback(() => {
    return [...questions, ...bonusQuestions].filter((q) => !q.answered)
  }, [questions, bonusQuestions])

  // Get question by ID
  const getQuestionById = useCallback(
    (id: number) => {
      if (id <= 8) {
        return questions.find((q) => q.id === id)
      } else {
        return bonusQuestions.find((q) => q.id === id)
      }
    },
    [questions, bonusQuestions],
  )

  return {
    questions,
    bonusQuestions,
    resetQuestionsForNewRound,
    markQuestionAsAnswered,
    revealAllUnansweredQuestions,
    areAllQuestionsAnswered,
    getUnansweredQuestions,
    getQuestionById,
  }
}
