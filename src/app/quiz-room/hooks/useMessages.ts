"use client";

import type React from "react";

import { useCallback, useState } from "react";
import type { Message } from "../types";
import { getCurrentTime } from "../utils";

// Initial messages with fixed times to avoid hydration issues
const initialMessages: Message[] = [
  {
    user: "SynthWave84",
    text: "Hey everyone! Ready for this round?",
    time: "19:42",
  },
  {
    user: "RetroGamer",
    text: "Let's go! I'm aiming for the top spot this time",
    time: "19:43",
  },
  { user: "NeonRider", text: "Good luck everyone!", time: "19:44" },
  {
    user: "System",
    text: "Quiz room: 80s Music - Starting in 2:30 minutes",
    time: "19:45",
  },
];

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [chatInput, setChatInput] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<string>(
    "Welcome! Enter your answer when the quiz begins."
  );

  // Add a message
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // Add a system message
  const addSystemMessage = useCallback(
    (text: string) => {
      addMessage({
        user: "System",
        text,
        time: getCurrentTime(),
      });
    },
    [addMessage]
  );

  // Handle sending a chat message
  const handleSendMessage = useCallback(
    (e: React.FormEvent, playerName: string) => {
      e.preventDefault();
      if (!chatInput.trim()) return;

      // Add user message
      addMessage({
        user: playerName,
        text: chatInput,
        time: getCurrentTime(),
      });

      // Clear input
      setChatInput("");

      // Simulate other players responding (30% chance)
      if (Math.random() < 0.3) {
        setTimeout(() => {
          const botResponses = [
            { user: "SynthWave84", text: "Nice one!" },
            { user: "RetroGamer", text: "I'm still ahead of you!" },
            { user: "NeonRider", text: "Good luck everyone!" },
            { user: "Arcade_Master", text: "This quiz is tough!" },
            { user: "VHS_Collector", text: "I know this one!" },
          ];

          const randomResponse =
            botResponses[Math.floor(Math.random() * botResponses.length)];

          addMessage({
            user: randomResponse.user,
            text: randomResponse.text,
            time: getCurrentTime(),
          });
        }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
      }
    },
    [chatInput, addMessage]
  );

  return {
    messages,
    chatInput,
    answer,
    feedback,
    setChatInput,
    setAnswer,
    setFeedback,
    addMessage,
    addSystemMessage,
    handleSendMessage,
  };
};
