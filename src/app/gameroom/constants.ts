// SOUND_EFFECTS
export const SOUND_SUCCESS = ["success1", "success2", "success3"] as const;
export const SOUND_BONUS = "bonus" as const;
export const SOUND_ERROR = "error" as const;
export const SOUND_COUNTDOWN = "countdown" as const;

export const ATTENTION_ANIMATIONS = [
  "pulse",
  "bounce",
  "shake",
  "wobble",
  "swing",
  "flash",
  "rubberBand",
  "tada",
] as const;

// AVATAR_PATTERNS
export const AVATAR_PATTERNS = [
  "linear-gradient(45deg, #ff00aa, #00ddff)",
  "linear-gradient(135deg, #00ddff, #b700ff)",
  "linear-gradient(225deg, #b700ff, #00ff66)",
  "linear-gradient(315deg, #00ff66, #ff00aa)",
  "radial-gradient(circle, #ff00aa, #00ddff)",
  "repeating-linear-gradient(45deg, #ff00aa, #ff00aa 5px, #00ddff 5px, #00ddff 10px)",
  "repeating-linear-gradient(90deg, #b700ff, #b700ff 5px, #00ff66 5px, #00ff66 10px)",
  "conic-gradient(from 0deg, #ff00aa, #00ddff, #b700ff, #00ff66, #ff00aa)",
] as const;
