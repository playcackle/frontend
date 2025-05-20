"use client"

import { useEffect, useRef } from "react"

type SoundEffectProps = {
  onLoad?: () => void
}

// Sound types
export type SoundType = "correct" | "bonus" | "success1" | "success2" | "success3" | "timeUp"

export default function SoundEffects({ onLoad }: SoundEffectProps) {
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    // Initialize Web Audio API
    try {
      if (typeof window !== "undefined") {
        // Create audio context
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        if (AudioContext) {
          audioContextRef.current = new AudioContext()
          console.log("Audio context created successfully")
          if (onLoad) onLoad()
        } else {
          console.error("Web Audio API not supported in this browser")
        }

        // Expose the sound effect function
        // @ts-ignore
        window.playSoundEffect = (type: SoundType) => {
          switch (type) {
            case "correct":
              playCelebratoryCorrectSound()
              break
            case "bonus":
              playEpicBonusSound()
              break
            case "success1":
              playCelebratorySuccess1Sound()
              break
            case "success2":
              playCelebratorySuccess2Sound()
              break
            case "success3":
              playCelebratorySuccess3Sound()
              break
            case "timeUp":
              playTimeUpSound()
              break
            default:
              playCelebratoryCorrectSound() // Default fallback
          }
        }
      }
    } catch (e) {
      console.error("Error initializing Web Audio API:", e)
    }

    return () => {
      // Clean up
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close()
        } catch (e) {
          console.error("Error closing audio context:", e)
        }
      }

      if (typeof window !== "undefined") {
        // @ts-ignore
        delete window.playSoundEffect
      }
    }
  }, [onLoad])

  // Initialize or get audio context
  const getAudioContext = (): AudioContext | null => {
    try {
      if (!audioContextRef.current) {
        // Try to create a new audio context if it doesn't exist
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        if (AudioContext) {
          audioContextRef.current = new AudioContext()
        } else {
          console.error("Web Audio API not supported in this browser")
          return null
        }
      }
      return audioContextRef.current
    } catch (e) {
      console.error("Error getting audio context:", e)
      return null
    }
  }

  // Play a celebratory correct answer sound (more exciting ascending tone with harmonics)
  const playCelebratoryCorrectSound = () => {
    try {
      const context = getAudioContext()
      if (!context) return

      // Create oscillator for the main tone
      const oscillator1 = context.createOscillator()
      oscillator1.type = "sine"
      oscillator1.frequency.setValueAtTime(440, context.currentTime) // A4 note
      oscillator1.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.15) // A5 note
      oscillator1.frequency.exponentialRampToValueAtTime(1320, context.currentTime + 0.3) // E6 note

      // Create a second oscillator for harmony
      const oscillator2 = context.createOscillator()
      oscillator2.type = "triangle"
      oscillator2.frequency.setValueAtTime(554.37, context.currentTime) // C#5 note
      oscillator2.frequency.exponentialRampToValueAtTime(1108.73, context.currentTime + 0.3) // C#6 note

      // Create gain nodes for volume control
      const gainNode1 = context.createGain()
      gainNode1.gain.setValueAtTime(0.3, context.currentTime)
      gainNode1.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4)

      const gainNode2 = context.createGain()
      gainNode2.gain.setValueAtTime(0.2, context.currentTime)
      gainNode2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4)

      // Add a bit of reverb-like effect with delay
      const delay = context.createDelay(0.5)
      delay.delayTime.value = 0.1

      const delayGain = context.createGain()
      delayGain.gain.value = 0.2

      // Connect nodes
      oscillator1.connect(gainNode1)
      oscillator2.connect(gainNode2)

      gainNode1.connect(context.destination)
      gainNode2.connect(context.destination)

      // Add delay effect
      gainNode1.connect(delay)
      delay.connect(delayGain)
      delayGain.connect(context.destination)

      // Start and stop
      oscillator1.start()
      oscillator2.start()
      oscillator1.stop(context.currentTime + 0.5)
      oscillator2.stop(context.currentTime + 0.5)

      console.log("Played celebratory correct sound effect")
    } catch (e) {
      console.error("Error playing sound effect:", e)
    }
  }

  // Play an epic bonus answer sound (more complex, exciting tone with multiple layers)
  const playEpicBonusSound = () => {
    try {
      const context = getAudioContext()
      if (!context) return

      // Create multiple oscillators for a rich sound
      const oscillator1 = context.createOscillator() // Main melody
      oscillator1.type = "sawtooth"
      oscillator1.frequency.setValueAtTime(440, context.currentTime) // A4 note
      oscillator1.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.1) // A5 note
      oscillator1.frequency.exponentialRampToValueAtTime(1320, context.currentTime + 0.2) // E6 note
      oscillator1.frequency.exponentialRampToValueAtTime(1760, context.currentTime + 0.3) // A6 note

      // Create a second oscillator for harmony
      const oscillator2 = context.createOscillator()
      oscillator2.type = "square"
      oscillator2.frequency.setValueAtTime(554.37, context.currentTime) // C#5 note
      oscillator2.frequency.exponentialRampToValueAtTime(1108.73, context.currentTime + 0.3) // C#6 note

      // Create a third oscillator for bass
      const oscillator3 = context.createOscillator()
      oscillator3.type = "sine"
      oscillator3.frequency.setValueAtTime(220, context.currentTime) // A3 note
      oscillator3.frequency.exponentialRampToValueAtTime(440, context.currentTime + 0.4) // A4 note

      // Create a fourth oscillator for sparkle effect
      const oscillator4 = context.createOscillator()
      oscillator4.type = "sine"
      oscillator4.frequency.setValueAtTime(1760, context.currentTime) // A6 note
      oscillator4.frequency.exponentialRampToValueAtTime(2200, context.currentTime + 0.2) // C#7 note
      oscillator4.frequency.exponentialRampToValueAtTime(2640, context.currentTime + 0.4) // E7 note

      // Create gain nodes for volume control
      const gainNode1 = context.createGain()
      gainNode1.gain.setValueAtTime(0.25, context.currentTime)
      gainNode1.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.7)

      const gainNode2 = context.createGain()
      gainNode2.gain.setValueAtTime(0.15, context.currentTime)
      gainNode2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.7)

      const gainNode3 = context.createGain()
      gainNode3.gain.setValueAtTime(0.2, context.currentTime)
      gainNode3.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.6)

      const gainNode4 = context.createGain()
      gainNode4.gain.setValueAtTime(0.1, context.currentTime)
      gainNode4.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.1)
      gainNode4.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5)

      // Create a delay for echo effect
      const delay = context.createDelay(1.0)
      delay.delayTime.value = 0.2

      const delayGain = context.createGain()
      delayGain.gain.value = 0.3

      // Create a biquad filter for a sweeping effect
      const filter = context.createBiquadFilter()
      filter.type = "lowpass"
      filter.frequency.setValueAtTime(800, context.currentTime)
      filter.frequency.exponentialRampToValueAtTime(5000, context.currentTime + 0.3)
      filter.Q.value = 5

      // Connect nodes
      oscillator1.connect(gainNode1)
      oscillator2.connect(gainNode2)
      oscillator3.connect(gainNode3)
      oscillator4.connect(gainNode4)

      gainNode1.connect(filter)
      gainNode2.connect(filter)
      gainNode3.connect(context.destination)
      gainNode4.connect(context.destination)

      filter.connect(context.destination)
      filter.connect(delay)
      delay.connect(delayGain)
      delayGain.connect(context.destination)

      // Start and stop
      oscillator1.start()
      oscillator2.start()
      oscillator3.start()
      oscillator4.start(context.currentTime + 0.1) // Slight delay for sparkle

      oscillator1.stop(context.currentTime + 0.8)
      oscillator2.stop(context.currentTime + 0.8)
      oscillator3.stop(context.currentTime + 0.7)
      oscillator4.stop(context.currentTime + 0.6)

      console.log("Played epic bonus sound effect")
    } catch (e) {
      console.error("Error playing bonus sound effect:", e)
    }
  }

  // Play celebratory success sound 1 (arcade-style victory fanfare)
  const playCelebratorySuccess1Sound = () => {
    try {
      const context = getAudioContext()
      if (!context) return

      // Create oscillator for the main melody
      const oscillator = context.createOscillator()
      oscillator.type = "square"

      // Create a more celebratory sequence of notes (victory fanfare)
      const now = context.currentTime
      oscillator.frequency.setValueAtTime(523.25, now) // C5
      oscillator.frequency.setValueAtTime(659.25, now + 0.1) // E5
      oscillator.frequency.setValueAtTime(783.99, now + 0.2) // G5
      oscillator.frequency.setValueAtTime(1046.5, now + 0.3) // C6
      oscillator.frequency.setValueAtTime(1046.5, now + 0.45) // C6 (hold)
      oscillator.frequency.setValueAtTime(1174.66, now + 0.6) // D6 (flourish)

      // Create a second oscillator for harmony
      const oscillator2 = context.createOscillator()
      oscillator2.type = "triangle"
      oscillator2.frequency.setValueAtTime(261.63, now) // C4
      oscillator2.frequency.setValueAtTime(329.63, now + 0.1) // E4
      oscillator2.frequency.setValueAtTime(392.0, now + 0.2) // G4
      oscillator2.frequency.setValueAtTime(523.25, now + 0.3) // C5
      oscillator2.frequency.setValueAtTime(523.25, now + 0.45) // C5 (hold)
      oscillator2.frequency.setValueAtTime(587.33, now + 0.6) // D5 (flourish)

      // Create gain nodes for volume control
      const gainNode = context.createGain()
      gainNode.gain.setValueAtTime(0.3, context.currentTime)
      gainNode.gain.setValueAtTime(0.3, context.currentTime + 0.1)
      gainNode.gain.setValueAtTime(0.3, context.currentTime + 0.2)
      gainNode.gain.setValueAtTime(0.3, context.currentTime + 0.3)
      gainNode.gain.setValueAtTime(0.3, context.currentTime + 0.45)
      gainNode.gain.setValueAtTime(0.3, context.currentTime + 0.6)
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.8)

      const gainNode2 = context.createGain()
      gainNode2.gain.setValueAtTime(0.2, context.currentTime)
      gainNode2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.8)

      // Connect nodes
      oscillator.connect(gainNode)
      oscillator2.connect(gainNode2)
      gainNode.connect(context.destination)
      gainNode2.connect(context.destination)

      // Start and stop
      oscillator.start()
      oscillator2.start()
      oscillator.stop(context.currentTime + 0.8)
      oscillator2.stop(context.currentTime + 0.8)

      console.log("Played celebratory success1 sound effect")
    } catch (e) {
      console.error("Error playing success1 sound effect:", e)
    }
  }

  // Play celebratory success sound 2 (8-bit style victory with arpeggios)
  const playCelebratorySuccess2Sound = () => {
    try {
      const context = getAudioContext()
      if (!context) return

      // Create oscillator for the main melody (ascending arpeggio)
      const oscillator = context.createOscillator()
      oscillator.type = "square"

      // Create a sequence of notes (ascending arpeggio)
      const now = context.currentTime
      oscillator.frequency.setValueAtTime(523.25, now) // C5
      oscillator.frequency.setValueAtTime(659.25, now + 0.08) // E5
      oscillator.frequency.setValueAtTime(783.99, now + 0.16) // G5
      oscillator.frequency.setValueAtTime(1046.5, now + 0.24) // C6
      oscillator.frequency.setValueAtTime(783.99, now + 0.32) // G5
      oscillator.frequency.setValueAtTime(1046.5, now + 0.4) // C6
      oscillator.frequency.setValueAtTime(1318.51, now + 0.48) // E6

      // Create a second oscillator for bass support
      const oscillator2 = context.createOscillator()
      oscillator2.type = "triangle"
      oscillator2.frequency.setValueAtTime(261.63, now) // C4
      oscillator2.frequency.setValueAtTime(261.63, now + 0.24) // C4
      oscillator2.frequency.setValueAtTime(261.63, now + 0.48) // C4

      // Create gain nodes for volume control with staccato effect
      const gainNode = context.createGain()
      gainNode.gain.setValueAtTime(0.3, now)
      gainNode.gain.setValueAtTime(0.25, now + 0.07)
      gainNode.gain.setValueAtTime(0.3, now + 0.08)
      gainNode.gain.setValueAtTime(0.25, now + 0.15)
      gainNode.gain.setValueAtTime(0.3, now + 0.16)
      gainNode.gain.setValueAtTime(0.25, now + 0.23)
      gainNode.gain.setValueAtTime(0.3, now + 0.24)
      gainNode.gain.setValueAtTime(0.25, now + 0.31)
      gainNode.gain.setValueAtTime(0.3, now + 0.32)
      gainNode.gain.setValueAtTime(0.25, now + 0.39)
      gainNode.gain.setValueAtTime(0.3, now + 0.4)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.65)

      const gainNode2 = context.createGain()
      gainNode2.gain.setValueAtTime(0.2, now)
      gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.65)

      // Connect nodes
      oscillator.connect(gainNode)
      oscillator2.connect(gainNode2)
      gainNode.connect(context.destination)
      gainNode2.connect(context.destination)

      // Start and stop
      oscillator.start()
      oscillator2.start()
      oscillator.stop(context.currentTime + 0.7)
      oscillator2.stop(context.currentTime + 0.7)

      console.log("Played celebratory success2 sound effect")
    } catch (e) {
      console.error("Error playing success2 sound effect:", e)
    }
  }

  // Play celebratory success sound 3 (retro game powerup with vibrato and sweep)
  const playCelebratorySuccess3Sound = () => {
    try {
      const context = getAudioContext()
      if (!context) return

      // Create oscillator for the main tone with a more exciting pattern
      const oscillator = context.createOscillator()
      oscillator.type = "sine"

      // Create a more exciting frequency pattern
      oscillator.frequency.setValueAtTime(440, context.currentTime) // A4
      oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.1) // A5
      oscillator.frequency.exponentialRampToValueAtTime(659.25, context.currentTime + 0.2) // E5
      oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.3) // A5
      oscillator.frequency.exponentialRampToValueAtTime(1108.73, context.currentTime + 0.4) // C#6

      // Add a second oscillator for harmony
      const oscillator2 = context.createOscillator()
      oscillator2.type = "triangle"
      oscillator2.frequency.setValueAtTime(220, context.currentTime) // A3
      oscillator2.frequency.exponentialRampToValueAtTime(440, context.currentTime + 0.2) // A4
      oscillator2.frequency.exponentialRampToValueAtTime(554.37, context.currentTime + 0.4) // C#5

      // Add vibrato with an enhanced LFO
      const lfo = context.createOscillator()
      lfo.type = "sine"
      lfo.frequency.value = 12 // Faster vibrato for more excitement

      const lfoGain = context.createGain()
      lfoGain.gain.value = 15 // More pronounced vibrato

      lfo.connect(lfoGain)
      lfoGain.connect(oscillator.frequency)

      // Create gain nodes for volume control
      const gainNode = context.createGain()
      gainNode.gain.setValueAtTime(0.25, context.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.6)

      const gainNode2 = context.createGain()
      gainNode2.gain.setValueAtTime(0.15, context.currentTime)
      gainNode2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.6)

      // Add a bit of reverb-like effect with delay
      const delay = context.createDelay(0.5)
      delay.delayTime.value = 0.1

      const delayGain = context.createGain()
      delayGain.gain.value = 0.15

      // Connect nodes
      oscillator.connect(gainNode)
      oscillator2.connect(gainNode2)

      gainNode.connect(context.destination)
      gainNode2.connect(context.destination)

      // Add delay effect
      gainNode.connect(delay)
      delay.connect(delayGain)
      delayGain.connect(context.destination)

      // Start and stop
      oscillator.start()
      oscillator2.start()
      lfo.start()

      oscillator.stop(context.currentTime + 0.6)
      oscillator2.stop(context.currentTime + 0.6)
      lfo.stop(context.currentTime + 0.6)

      console.log("Played celebratory success3 sound effect")
    } catch (e) {
      console.error("Error playing success3 sound effect:", e)
    }
  }

  // Play time up sound (alarm-like sound)
  const playTimeUpSound = () => {
    try {
      const context = getAudioContext()
      if (!context) return

      // Create oscillator for the main tone
      const oscillator = context.createOscillator()
      oscillator.type = "square"

      // Create a sequence of notes
      const now = context.currentTime
      oscillator.frequency.setValueAtTime(880, now) // A5
      oscillator.frequency.setValueAtTime(440, now + 0.2) // A4
      oscillator.frequency.setValueAtTime(880, now + 0.4) // A5
      oscillator.frequency.setValueAtTime(440, now + 0.6) // A4

      // Create gain node for volume control
      const gainNode = context.createGain()
      gainNode.gain.setValueAtTime(0.2, context.currentTime)
      gainNode.gain.setValueAtTime(0.2, context.currentTime + 0.2)
      gainNode.gain.setValueAtTime(0.2, context.currentTime + 0.4)
      gainNode.gain.setValueAtTime(0.2, context.currentTime + 0.6)
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.8)

      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(context.destination)

      // Start and stop
      oscillator.start()
      oscillator.stop(context.currentTime + 0.8)

      console.log("Played time up sound effect")
    } catch (e) {
      console.error("Error playing time up sound effect:", e)
    }
  }

  return null
}
