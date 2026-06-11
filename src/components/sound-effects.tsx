import { useCallback, useEffect, useMemo } from "react";

type SoundEffectProps = {
  onLoad?: () => void;
};

export type SoundType =
  | "correct"
  | "bonus1"
  | "bonus2"
  | "bonus3"
  | "bonus4"
  | "bonus5"
  | "success1"
  | "success2"
  | "success3"
  | "success4"
  | "success5"
  | "timeUp"
  | "newRound"
  | "playerSnap1"
  | "playerSnap2"
  | "playerSnap3"
  | "playerSnap4"
  | "playerSnap5";

// Audio context singleton to prevent multiple instances
let globalAudioContext: AudioContext | null = null;
// Shared master bus — every voice routes through here so the whole
// soundscape gets the same warmth, glue and space instead of dry,
// slightly-clipping raw oscillators hitting the destination directly.
let masterBus: GainNode | null = null;

/** Generate a short, smooth impulse response for a plate-style reverb. */
const makeImpulse = (
  ctx: BaseAudioContext,
  seconds: number,
  decay: number,
): AudioBuffer => {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * seconds);
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      // exponential decay tail with a tiny early-fade to avoid a click
      const env = Math.pow(1 - i / length, decay);
      const fadeIn = Math.min(1, i / (rate * 0.002));
      data[i] = (Math.random() * 2 - 1) * env * fadeIn;
    }
  }
  return impulse;
};

/**
 * Build the master signal chain:
 *   voices → [input] → warmth high-shelf → bus compressor →┬→ dry ─┐
 *                                                          └→ reverb → wet ─┤→ out → destination
 * The high-shelf tames harsh square/saw upper harmonics, the
 * compressor glues stacked voices and stops the crackle from many
 * oscillators summing past 0 dBFS, and the short reverb adds space.
 */
export const buildMasterChain = (ctx: BaseAudioContext): GainNode => {
  const input = ctx.createGain();
  input.gain.value = 0.9;

  const warmth = ctx.createBiquadFilter();
  warmth.type = "highshelf";
  warmth.frequency.value = 3400;
  warmth.gain.value = -5.5;

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 22;
  comp.ratio.value = 3;
  comp.attack.value = 0.003;
  comp.release.value = 0.25;

  const reverb = ctx.createConvolver();
  reverb.buffer = makeImpulse(ctx, 1.1, 2.6);
  const wet = ctx.createGain();
  wet.gain.value = 0.16;
  const dry = ctx.createGain();
  dry.gain.value = 1.0;

  const out = ctx.createGain();
  out.gain.value = 0.82;

  input.connect(warmth);
  warmth.connect(comp);
  comp.connect(dry);
  comp.connect(reverb);
  reverb.connect(wet);
  dry.connect(out);
  wet.connect(out);
  out.connect(ctx.destination);

  return input;
};

/**
 * Where a sound's voices get their context + output bus from. Making this
 * swappable lets the *exact same* generators render through an
 * OfflineAudioContext (for exporting .wav samples) instead of the live
 * realtime context, so previewed and exported audio are identical.
 */
export type AudioBus = { context: BaseAudioContext; bus: AudioNode };
export type AudioProvider = () => Promise<AudioBus | null>;

const realtimeProvider: AudioProvider = async () => {
  const context = await getOrCreateAudioContext();
  if (!context) return null;
  return { context, bus: masterBus ?? context.destination };
};

const getOrCreateAudioContext = async (): Promise<AudioContext | null> => {
  if (typeof window === "undefined") return null;

  try {
    if (!globalAudioContext || globalAudioContext.state === "closed") {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        globalAudioContext = new AudioContext();
        masterBus = buildMasterChain(globalAudioContext);
      } else {
        console.error("Web Audio API not supported in this browser");
        return null;
      }
    }

    if (globalAudioContext.state === "suspended") {
      try {
        await globalAudioContext.resume();
      } catch (e) {
        console.warn("Could not resume audio context:", e);
      }
    }

    return globalAudioContext;
  } catch (e) {
    console.error("Error creating audio context:", e);
    return null;
  }
};

const scheduleCleanup = (
  _context: BaseAudioContext,
  nodes: AudioNode[],
  duration: number,
) => {
  setTimeout(
    () => {
      nodes.forEach((node) => {
        try {
          node.disconnect();
        } catch (e) {
          // Node may already be disconnected
        }
      });
    },
    duration * 1000 + 100,
  );
};

// Sound generation functions
export const createSoundGenerators = (
  provider: AudioProvider = realtimeProvider,
) => {
  const playCelebratoryCorrectSound = async () => {
    try {
      const audio = await provider();
      if (!audio) return;
      const { context, bus } = audio;

      const now = context.currentTime;
      const duration = 0.2;

      const blip1 = context.createOscillator();
      blip1.type = "square";
      blip1.frequency.value = 783.99;

      const blip1Gain = context.createGain();
      blip1Gain.gain.setValueAtTime(0.4, now);
      blip1Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      blip1.connect(blip1Gain);
      blip1Gain.connect(bus);
      blip1.start(now);
      blip1.stop(now + 0.08);

      const blip2 = context.createOscillator();
      blip2.type = "square";
      blip2.frequency.value = 1046.5;

      const blip2Gain = context.createGain();
      blip2Gain.gain.setValueAtTime(0.45, now + 0.06);
      blip2Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

      blip2.connect(blip2Gain);
      blip2Gain.connect(bus);
      blip2.start(now + 0.06);
      blip2.stop(now + 0.16);

      const tri = context.createOscillator();
      tri.type = "triangle";
      tri.frequency.setValueAtTime(783.99, now);
      tri.frequency.exponentialRampToValueAtTime(1046.5, now + 0.08);

      const triGain = context.createGain();
      triGain.gain.setValueAtTime(0.25, now);
      triGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      tri.connect(triGain);
      triGain.connect(bus);
      tri.start(now);
      tri.stop(now + 0.18);

      const sub = context.createOscillator();
      sub.type = "sine";
      sub.frequency.value = 196.0;

      const subGain = context.createGain();
      subGain.gain.setValueAtTime(0.3, now);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      sub.connect(subGain);
      subGain.connect(bus);
      sub.start(now);
      sub.stop(now + 0.12);

      scheduleCleanup(
        context,
        [blip1Gain, blip2Gain, triGain, subGain],
        duration,
      );
    } catch (e) {
      console.error("Error playing sound effect:", e);
    }
  };

  // Bonus Sound 1: Epic ascending scale
  const playEpicBonusSound = async () => {
    try {
      const audio = await provider();
      if (!audio) return;
      const { context, bus } = audio;

      const now = context.currentTime;
      const duration = 0.7;

      const noiseBuffer = context.createBuffer(
        1,
        context.sampleRate * 0.04,
        context.sampleRate,
      );
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        noiseData[i] =
          (Math.random() * 2 - 1) * Math.exp(-i / (noiseBuffer.length / 2));
      }

      const noise = context.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseGain = context.createGain();
      noiseGain.gain.value = 0.4;
      noise.connect(noiseGain);
      noiseGain.connect(bus);
      noise.start(now);

      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
      const intervals = [0, 0.07, 0.13, 0.19, 0.25, 0.31, 0.37];

      const allNodes: AudioNode[] = [noiseGain];

      notes.forEach((freq, i) => {
        const blip = context.createOscillator();
        blip.type = "square";
        blip.frequency.value = freq;

        const blipGain = context.createGain();
        blipGain.gain.setValueAtTime(0.35, now + intervals[i]);
        blipGain.gain.exponentialRampToValueAtTime(
          0.01,
          now + intervals[i] + 0.12,
        );

        blip.connect(blipGain);
        blipGain.connect(bus);
        blip.start(now + intervals[i]);
        blip.stop(now + intervals[i] + 0.12);
        allNodes.push(blipGain);

        const tri = context.createOscillator();
        tri.type = "triangle";
        tri.frequency.value = freq * 0.5;

        const triGain = context.createGain();
        triGain.gain.setValueAtTime(0.2, now + intervals[i]);
        triGain.gain.exponentialRampToValueAtTime(
          0.01,
          now + intervals[i] + 0.12,
        );

        tri.connect(triGain);
        triGain.connect(bus);
        tri.start(now + intervals[i]);
        tri.stop(now + intervals[i] + 0.12);
        allNodes.push(triGain);
      });

      const chord1 = context.createOscillator();
      chord1.type = "square";
      chord1.frequency.value = 261.63;

      const chord2 = context.createOscillator();
      chord2.type = "square";
      chord2.frequency.value = 329.63;

      const chord3 = context.createOscillator();
      chord3.type = "square";
      chord3.frequency.value = 392.0;

      const chordGain = context.createGain();
      chordGain.gain.setValueAtTime(0.25, now + 0.05);
      chordGain.gain.setValueAtTime(0.15, now + 0.12);
      chordGain.gain.setValueAtTime(0.25, now + 0.19);
      chordGain.gain.setValueAtTime(0.15, now + 0.26);
      chordGain.gain.setValueAtTime(0.25, now + 0.33);
      chordGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      chord1.connect(chordGain);
      chord2.connect(chordGain);
      chord3.connect(chordGain);
      chordGain.connect(bus);

      chord1.start(now + 0.05);
      chord2.start(now + 0.05);
      chord3.start(now + 0.05);
      chord1.stop(now + 0.6);
      chord2.stop(now + 0.6);
      chord3.stop(now + 0.6);

      const kick = context.createOscillator();
      kick.type = "sine";
      kick.frequency.setValueAtTime(150, now);
      kick.frequency.exponentialRampToValueAtTime(40, now + 0.15);

      const kickGain = context.createGain();
      kickGain.gain.setValueAtTime(0.6, now);
      kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      kick.connect(kickGain);
      kickGain.connect(bus);
      kick.start(now);
      kick.stop(now + 0.25);

      const kick2 = context.createOscillator();
      kick2.type = "sine";
      kick2.frequency.setValueAtTime(150, now + 0.37);
      kick2.frequency.exponentialRampToValueAtTime(40, now + 0.52);

      const kick2Gain = context.createGain();
      kick2Gain.gain.setValueAtTime(0.55, now + 0.37);
      kick2Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      kick2.connect(kick2Gain);
      kick2Gain.connect(bus);
      kick2.start(now + 0.37);
      kick2.stop(now + 0.6);

      allNodes.push(chordGain, kickGain, kick2Gain);
      scheduleCleanup(context, allNodes, duration);
    } catch (e) {
      console.error("Error playing bonus sound effect:", e);
    }
  };

  // Bonus Sound 2: Cheeky Wobble Bass Drop
  const playBonus2Sound = async () => {
    try {
      const audio = await provider();
      if (!audio) return;
      const { context, bus } = audio;

      const now = context.currentTime;
      const duration = 0.8;

      const horn = context.createOscillator();
      horn.type = "sawtooth";
      horn.frequency.setValueAtTime(220, now);
      horn.frequency.linearRampToValueAtTime(440, now + 0.15);

      const hornGain = context.createGain();
      hornGain.gain.setValueAtTime(0.4, now);
      hornGain.gain.setValueAtTime(0.45, now + 0.15);
      hornGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      horn.connect(hornGain);
      hornGain.connect(bus);
      horn.start(now);
      horn.stop(now + 0.2);

      const wobble = context.createOscillator();
      wobble.type = "sawtooth";
      wobble.frequency.value = 55;

      const wobbleFilter = context.createBiquadFilter();
      wobbleFilter.type = "lowpass";
      wobbleFilter.Q.value = 15;

      const lfo = context.createOscillator();
      lfo.frequency.value = 8;

      const lfoGain = context.createGain();
      lfoGain.gain.value = 1500;

      lfo.connect(lfoGain);
      lfoGain.connect(wobbleFilter.frequency);

      const wobbleGain = context.createGain();
      wobbleGain.gain.setValueAtTime(0.5, now + 0.2);
      wobbleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

      wobble.connect(wobbleFilter);
      wobbleFilter.connect(wobbleGain);
      wobbleGain.connect(bus);

      wobble.start(now + 0.2);
      lfo.start(now + 0.2);
      wobble.stop(now + 0.7);
      lfo.stop(now + 0.7);

      scheduleCleanup(context, [hornGain, wobbleGain, wobbleFilter], duration);
    } catch (e) {
      console.error("Error playing bonus2 sound effect:", e);
    }
  };

  // Bonus Sound 3: Sarcastic "Ta-Da!"
  const playBonus3Sound = async () => {
    try {
      const audio = await provider();
      if (!audio) return;
      const { context, bus } = audio;

      const now = context.currentTime;
      const duration = 0.6;

      const flourish1 = context.createOscillator();
      flourish1.type = "square";
      flourish1.frequency.value = 1046.5;

      const flourish1Gain = context.createGain();
      flourish1Gain.gain.setValueAtTime(0.3, now);
      flourish1Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      flourish1.connect(flourish1Gain);
      flourish1Gain.connect(bus);
      flourish1.start(now);
      flourish1.stop(now + 0.08);

      const flourish2 = context.createOscillator();
      flourish2.type = "square";
      flourish2.frequency.value = 783.99;

      const flourish2Gain = context.createGain();
      flourish2Gain.gain.setValueAtTime(0.3, now + 0.08);
      flourish2Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

      flourish2.connect(flourish2Gain);
      flourish2Gain.connect(bus);
      flourish2.start(now + 0.08);
      flourish2.stop(now + 0.16);

      const stab1 = context.createOscillator();
      stab1.type = "sawtooth";
      stab1.frequency.value = 261.63;

      const stab2 = context.createOscillator();
      stab2.type = "sawtooth";
      stab2.frequency.value = 329.63;

      const stab3 = context.createOscillator();
      stab3.type = "sawtooth";
      stab3.frequency.value = 392.0;

      const stabGain = context.createGain();
      stabGain.gain.setValueAtTime(0.35, now + 0.16);
      stabGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      stab1.connect(stabGain);
      stab2.connect(stabGain);
      stab3.connect(stabGain);
      stabGain.connect(bus);

      stab1.start(now + 0.16);
      stab2.start(now + 0.16);
      stab3.start(now + 0.16);
      stab1.stop(now + 0.5);
      stab2.stop(now + 0.5);
      stab3.stop(now + 0.5);

      scheduleCleanup(
        context,
        [flourish1Gain, flourish2Gain, stabGain],
        duration,
      );
    } catch (e) {
      console.error("Error playing bonus3 sound effect:", e);
    }
  };

  // Bonus Sound 4: Goofy Slide Whistle Up
  const playBonus4Sound = async () => {
    try {
      const audio = await provider();
      if (!audio) return;
      const { context, bus } = audio;

      const now = context.currentTime;
      const duration = 0.5;

      const whistle = context.createOscillator();
      whistle.type = "sine";
      whistle.frequency.setValueAtTime(400, now);
      whistle.frequency.exponentialRampToValueAtTime(2000, now + 0.4);

      const whistleGain = context.createGain();
      whistleGain.gain.setValueAtTime(0.4, now);
      whistleGain.gain.setValueAtTime(0.4, now + 0.35);
      whistleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

      whistle.connect(whistleGain);
      whistleGain.connect(bus);
      whistle.start(now);
      whistle.stop(now + 0.45);

      const pop = context.createOscillator();
      pop.type = "square";
      pop.frequency.value = 880;

      const popGain = context.createGain();
      popGain.gain.setValueAtTime(0.35, now + 0.4);
      popGain.gain.exponentialRampToValueAtTime(0.01, now + 0.48);

      pop.connect(popGain);
      popGain.connect(bus);
      pop.start(now + 0.4);
      pop.stop(now + 0.48);

      scheduleCleanup(context, [whistleGain, popGain], duration);
    } catch (e) {
      console.error("Error playing bonus4 sound effect:", e);
    }
  };

  // Bonus Sound 5: Rapid Fire Blips
  const playBonus5Sound = async () => {
    try {
      const audio = await provider();
      if (!audio) return;
      const { context, bus } = audio;

      const now = context.currentTime;
      const duration = 0.5;

      const allNodes: AudioNode[] = [];

      const frequencies = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77];
      const timing = 0.05;

      frequencies.forEach((freq, i) => {
        const blip = context.createOscillator();
        blip.type = "square";
        blip.frequency.value = freq;

        const blipGain = context.createGain();
        blipGain.gain.setValueAtTime(0.25, now + i * timing);
        blipGain.gain.exponentialRampToValueAtTime(
          0.01,
          now + i * timing + 0.08,
        );

        blip.connect(blipGain);
        blipGain.connect(bus);
        blip.start(now + i * timing);
        blip.stop(now + i * timing + 0.08);

        allNodes.push(blipGain);
      });

      const ding = context.createOscillator();
      ding.type = "sine";
      ding.frequency.value = 1567.98;

      const dingGain = context.createGain();
      dingGain.gain.setValueAtTime(0.4, now + 0.35);
      dingGain.gain.exponentialRampToValueAtTime(0.01, now + 0.48);

      ding.connect(dingGain);
      dingGain.connect(bus);
      ding.start(now + 0.35);
      ding.stop(now + 0.48);

      allNodes.push(dingGain);

      scheduleCleanup(context, allNodes, duration);
    } catch (e) {
      console.error("Error playing bonus5 sound effect:", e);
    }
  };

  // Success Sound 1: Victory Fanfare
  const playCelebratorySuccess1Sound = async () => {
    try {
      const audio = await provider();
      if (!audio) return;
      const { context, bus } = audio;

      const now = context.currentTime;
      const duration = 0.5;

      const explosion = context.createOscillator();
      explosion.type = "square";
      explosion.frequency.setValueAtTime(587.33, now);

      const explosionGain = context.createGain();
      explosionGain.gain.setValueAtTime(0.55, now);
      explosionGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      explosion.connect(explosionGain);
      explosionGain.connect(bus);
      explosion.start(now);
      explosion.stop(now + 0.06);

      const note1 = context.createOscillator();
      note1.type = "square";
      note1.frequency.value = 587.33;

      const note1Gain = context.createGain();
      note1Gain.gain.setValueAtTime(0.35, now + 0.05);
      note1Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      note1.connect(note1Gain);
      note1Gain.connect(bus);
      note1.start(now + 0.05);
      note1.stop(now + 0.15);

      const note2 = context.createOscillator();
      note2.type = "square";
      note2.frequency.value = 698.46;

      const note2Gain = context.createGain();
      note2Gain.gain.setValueAtTime(0.35, now + 0.1);
      note2Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      note2.connect(note2Gain);
      note2Gain.connect(bus);
      note2.start(now + 0.1);
      note2.stop(now + 0.2);

      const note3 = context.createOscillator();
      note3.type = "square";
      note3.frequency.value = 880;

      const note3Gain = context.createGain();
      note3Gain.gain.setValueAtTime(0.35, now + 0.15);
      note3Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      note3.connect(note3Gain);
      note3Gain.connect(bus);
      note3.start(now + 0.15);
      note3.stop(now + 0.25);

      const note4 = context.createOscillator();
      note4.type = "square";
      note4.frequency.value = 1174.66;

      const note4Gain = context.createGain();
      note4Gain.gain.setValueAtTime(0.4, now + 0.2);
      note4Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      note4.connect(note4Gain);
      note4Gain.connect(bus);
      note4.start(now + 0.2);
      note4.stop(now + 0.35);

      const sub = context.createOscillator();
      sub.type = "sine";
      sub.frequency.value = 146.83;

      const subGain = context.createGain();
      subGain.gain.setValueAtTime(0.45, now);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      sub.connect(subGain);
      subGain.connect(bus);
      sub.start(now);
      sub.stop(now + 0.4);

      const allNodes: AudioNode[] = [
        explosionGain,
        note1Gain,
        note2Gain,
        note3Gain,
        note4Gain,
        subGain,
      ];

      scheduleCleanup(context, allNodes, duration);
    } catch (e) {
      console.error("Error playing success1 sound effect:", e);
    }
  };

  // Success Sound 2: Sparkly Arpeggio
  const playCelebratorySuccess2Sound = async () => {
    try {
      const audio = await provider();
      if (!audio) return;
      const { context, bus } = audio;

      const now = context.currentTime;
      const duration = 0.6;

      const pulse = context.createOscillator();
      pulse.type = "square";
      pulse.frequency.value = 523.25;

      const pulseGain = context.createGain();
      pulseGain.gain.setValueAtTime(0.45, now);
      pulseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

      pulse.connect(pulseGain);
      pulseGain.connect(bus);
      pulse.start(now);
      pulse.stop(now + 0.04);

      const arp1 = context.createOscillator();
      arp1.type = "sawtooth";
      arp1.frequency.setValueAtTime(523.25, now + 0.03);
      arp1.frequency.setValueAtTime(659.25, now + 0.12);
      arp1.frequency.setValueAtTime(783.99, now + 0.21);
      arp1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.38);

      const arp2 = context.createOscillator();
      arp2.type = "sawtooth";
      arp2.frequency.setValueAtTime(527.18, now + 0.03);
      arp2.frequency.setValueAtTime(664.18, now + 0.12);
      arp2.frequency.setValueAtTime(789.66, now + 0.21);
      arp2.frequency.exponentialRampToValueAtTime(1053.98, now + 0.38);

      const arp3 = context.createOscillator();
      arp3.type = "sawtooth";
      arp3.frequency.setValueAtTime(519.37, now + 0.03);
      arp3.frequency.setValueAtTime(654.39, now + 0.12);
      arp3.frequency.setValueAtTime(778.39, now + 0.21);
      arp3.frequency.exponentialRampToValueAtTime(1039.14, now + 0.38);

      const sub = context.createOscillator();
      sub.type = "sine";
      sub.frequency.setValueAtTime(130.81, now + 0.03);
      sub.frequency.setValueAtTime(164.81, now + 0.12);
      sub.frequency.setValueAtTime(196.0, now + 0.21);
      sub.frequency.exponentialRampToValueAtTime(261.63, now + 0.38);

      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.value = 10;
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.exponentialRampToValueAtTime(8000, now + 0.35);

      const blip1 = context.createOscillator();
      blip1.type = "square";
      blip1.frequency.value = 1046.5;

      const blipGain1 = context.createGain();
      blipGain1.gain.setValueAtTime(0.2, now + 0.03);
      blipGain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      blip1.connect(blipGain1);
      blipGain1.connect(bus);
      blip1.start(now + 0.03);
      blip1.stop(now + 0.1);

      const blip2 = context.createOscillator();
      blip2.type = "square";
      blip2.frequency.value = 1318.51;

      const blipGain2 = context.createGain();
      blipGain2.gain.setValueAtTime(0.2, now + 0.12);
      blipGain2.gain.exponentialRampToValueAtTime(0.01, now + 0.19);

      blip2.connect(blipGain2);
      blipGain2.connect(bus);
      blip2.start(now + 0.12);
      blip2.stop(now + 0.19);

      const blip3 = context.createOscillator();
      blip3.type = "square";
      blip3.frequency.value = 1567.98;

      const blipGain3 = context.createGain();
      blipGain3.gain.setValueAtTime(0.2, now + 0.21);
      blipGain3.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      blip3.connect(blipGain3);
      blipGain3.connect(bus);
      blip3.start(now + 0.21);
      blip3.stop(now + 0.28);

      const arpGain1 = context.createGain();
      arpGain1.gain.setValueAtTime(0.32, now + 0.03);
      arpGain1.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      const arpGain2 = context.createGain();
      arpGain2.gain.setValueAtTime(0.28, now + 0.03);
      arpGain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      const arpGain3 = context.createGain();
      arpGain3.gain.setValueAtTime(0.28, now + 0.03);
      arpGain3.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      const subGain = context.createGain();
      subGain.gain.setValueAtTime(0.38, now + 0.03);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      arp1.connect(arpGain1);
      arp2.connect(arpGain2);
      arp3.connect(arpGain3);
      sub.connect(subGain);

      arpGain1.connect(filter);
      arpGain2.connect(filter);
      arpGain3.connect(filter);
      filter.connect(bus);
      subGain.connect(bus);

      arp1.start(now + 0.03);
      arp2.start(now + 0.03);
      arp3.start(now + 0.03);
      sub.start(now + 0.03);
      arp1.stop(now + 0.5);
      arp2.stop(now + 0.5);
      arp3.stop(now + 0.5);
      sub.stop(now + 0.5);

      const allNodes: AudioNode[] = [
        pulseGain,
        arpGain1,
        arpGain2,
        arpGain3,
        subGain,
        blipGain1,
        blipGain2,
        blipGain3,
        filter,
      ];

      scheduleCleanup(context, allNodes, duration);
    } catch (e) {
      console.error("Error playing success2 sound effect:", e);
    }
  };

  // Success Sound 3: Power Chord Explosion
  const playCelebratorySuccess3Sound = async () => {
    try {
      const audio = await provider();
      if (!audio) return;
      const { context, bus } = audio;

      const now = context.currentTime;
      const duration = 0.55;

      // Initial explosion burst
      const explosion = context.createOscillator();
      explosion.type = "square";
      explosion.frequency.setValueAtTime(440, now);

      const explosionGain = context.createGain();
      explosionGain.gain.setValueAtTime(0.5, now);
      explosionGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      explosion.connect(explosionGain);
      explosionGain.connect(bus);
      explosion.start(now);
      explosion.stop(now + 0.08);

      // Power chord (E5 power chord)
      const root = context.createOscillator();
      root.type = "sawtooth";
      root.frequency.value = 329.63; // E4

      const fifth = context.createOscillator();
      fifth.type = "sawtooth";
      fifth.frequency.value = 493.88; // B4

      const octave = context.createOscillator();
      octave.type = "sawtooth";
      octave.frequency.value = 659.25; // E5

      const chordGain = context.createGain();
      chordGain.gain.setValueAtTime(0.4, now + 0.08);
      chordGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      root.connect(chordGain);
      fifth.connect(chordGain);
      octave.connect(chordGain);
      chordGain.connect(bus);

      root.start(now + 0.08);
      fifth.start(now + 0.08);
      octave.start(now + 0.08);
      root.stop(now + 0.5);
      fifth.stop(now + 0.5);
      octave.stop(now + 0.5);

      // High sparkle on top
      const sparkle = context.createOscillator();
      sparkle.type = "sine";
      sparkle.frequency.value = 1318.51;

      const sparkleGain = context.createGain();
      sparkleGain.gain.setValueAtTime(0.25, now + 0.08);
      sparkleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      sparkle.connect(sparkleGain);
      sparkleGain.connect(bus);
      sparkle.start(now + 0.08);
      sparkle.stop(now + 0.4);

      const allNodes: AudioNode[] = [explosionGain, chordGain, sparkleGain];

      scheduleCleanup(context, allNodes, duration);
    } catch (e) {
      console.error("Error playing success3 sound effect:", e);
    }
  };

  // Success Sound 4: Triumphant Horn Section
  const playCelebratorySuccess4Sound = async () => {
    try {
      const audio = await provider();
      if (!audio) return;
      const { context, bus } = audio;

      const now = context.currentTime;
      const duration = 0.65;

      // Opening stab
      const stab = context.createOscillator();
      stab.type = "sawtooth";
      stab.frequency.value = 523.25;

      const stabGain = context.createGain();
      stabGain.gain.setValueAtTime(0.4, now);
      stabGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      stab.connect(stabGain);
      stabGain.connect(bus);
      stab.start(now);
      stab.stop(now + 0.06);

      // Horn melody: C - E - G - C (major triad upward)
      const horn1 = context.createOscillator();
      horn1.type = "sawtooth";
      horn1.frequency.value = 523.25; // C5

      const horn1Gain = context.createGain();
      horn1Gain.gain.setValueAtTime(0.3, now + 0.1);
      horn1Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      horn1.connect(horn1Gain);
      horn1Gain.connect(bus);
      horn1.start(now + 0.1);
      horn1.stop(now + 0.25);

      const horn2 = context.createOscillator();
      horn2.type = "sawtooth";
      horn2.frequency.value = 659.25; // E5

      const horn2Gain = context.createGain();
      horn2Gain.gain.setValueAtTime(0.3, now + 0.22);
      horn2Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.37);

      horn2.connect(horn2Gain);
      horn2Gain.connect(bus);
      horn2.start(now + 0.22);
      horn2.stop(now + 0.37);

      const horn3 = context.createOscillator();
      horn3.type = "sawtooth";
      horn3.frequency.value = 783.99; // G5

      const horn3Gain = context.createGain();
      horn3Gain.gain.setValueAtTime(0.32, now + 0.34);
      horn3Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.49);

      horn3.connect(horn3Gain);
      horn3Gain.connect(bus);
      horn3.start(now + 0.34);
      horn3.stop(now + 0.49);

      const horn4 = context.createOscillator();
      horn4.type = "sawtooth";
      horn4.frequency.value = 1046.5; // C6

      const horn4Gain = context.createGain();
      horn4Gain.gain.setValueAtTime(0.35, now + 0.46);
      horn4Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.62);

      horn4.connect(horn4Gain);
      horn4Gain.connect(bus);
      horn4.start(now + 0.46);
      horn4.stop(now + 0.62);

      // Bass foundation
      const bass = context.createOscillator();
      bass.type = "sine";
      bass.frequency.value = 130.81; // C3

      const bassGain = context.createGain();
      bassGain.gain.setValueAtTime(0.35, now + 0.1);
      bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      bass.connect(bassGain);
      bassGain.connect(bus);
      bass.start(now + 0.1);
      bass.stop(now + 0.6);

      const allNodes: AudioNode[] = [
        stabGain,
        horn1Gain,
        horn2Gain,
        horn3Gain,
        horn4Gain,
        bassGain,
      ];

      scheduleCleanup(context, allNodes, duration);
    } catch (e) {
      console.error("Error playing success4 sound effect:", e);
    }
  };

  // Success Sound 5: Epic Game Show Win
  const playCelebratorySuccess5Sound = async () => {
    try {
      const audio = await provider();
      if (!audio) return;
      const { context, bus } = audio;

      const now = context.currentTime;
      const duration = 0.7;

      // Initial cymbal crash simulation
      const crashBuffer = context.createBuffer(
        1,
        context.sampleRate * 0.08,
        context.sampleRate,
      );
      const crashData = crashBuffer.getChannelData(0);
      for (let i = 0; i < crashBuffer.length; i++) {
        crashData[i] =
          (Math.random() * 2 - 1) *
          0.8 *
          Math.exp(-i / (crashBuffer.length / 2.5));
      }

      const crash = context.createBufferSource();
      crash.buffer = crashBuffer;

      const crashFilter = context.createBiquadFilter();
      crashFilter.type = "highpass";
      crashFilter.frequency.value = 2000;

      const crashGain = context.createGain();
      crashGain.gain.value = 0.35;

      crash.connect(crashFilter);
      crashFilter.connect(crashGain);
      crashGain.connect(bus);
      crash.start(now);

      // Triumphant ascending chord progression
      const chord1_1 = context.createOscillator();
      chord1_1.type = "square";
      chord1_1.frequency.value = 392.0; // G4

      const chord1_2 = context.createOscillator();
      chord1_2.type = "square";
      chord1_2.frequency.value = 493.88; // B4

      const chord1_3 = context.createOscillator();
      chord1_3.type = "square";
      chord1_3.frequency.value = 587.33; // D5

      const chord1Gain = context.createGain();
      chord1Gain.gain.setValueAtTime(0.25, now + 0.08);
      chord1Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      chord1_1.connect(chord1Gain);
      chord1_2.connect(chord1Gain);
      chord1_3.connect(chord1Gain);
      chord1Gain.connect(bus);

      chord1_1.start(now + 0.08);
      chord1_2.start(now + 0.08);
      chord1_3.start(now + 0.08);
      chord1_1.stop(now + 0.28);
      chord1_2.stop(now + 0.28);
      chord1_3.stop(now + 0.28);

      // Second chord
      const chord2_1 = context.createOscillator();
      chord2_1.type = "square";
      chord2_1.frequency.value = 523.25; // C5

      const chord2_2 = context.createOscillator();
      chord2_2.type = "square";
      chord2_2.frequency.value = 659.25; // E5

      const chord2_3 = context.createOscillator();
      chord2_3.type = "square";
      chord2_3.frequency.value = 783.99; // G5

      const chord2Gain = context.createGain();
      chord2Gain.gain.setValueAtTime(0.3, now + 0.25);
      chord2Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

      chord2_1.connect(chord2Gain);
      chord2_2.connect(chord2Gain);
      chord2_3.connect(chord2Gain);
      chord2Gain.connect(bus);

      chord2_1.start(now + 0.25);
      chord2_2.start(now + 0.25);
      chord2_3.start(now + 0.25);
      chord2_1.stop(now + 0.55);
      chord2_2.stop(now + 0.55);
      chord2_3.stop(now + 0.55);

      // High twinkle
      const twinkle1 = context.createOscillator();
      twinkle1.type = "sine";
      twinkle1.frequency.value = 1567.98;

      const twinkle1Gain = context.createGain();
      twinkle1Gain.gain.setValueAtTime(0.2, now + 0.15);
      twinkle1Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      twinkle1.connect(twinkle1Gain);
      twinkle1Gain.connect(bus);
      twinkle1.start(now + 0.15);
      twinkle1.stop(now + 0.28);

      const twinkle2 = context.createOscillator();
      twinkle2.type = "sine";
      twinkle2.frequency.value = 2093.0;

      const twinkle2Gain = context.createGain();
      twinkle2Gain.gain.setValueAtTime(0.22, now + 0.3);
      twinkle2Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.48);

      twinkle2.connect(twinkle2Gain);
      twinkle2Gain.connect(bus);
      twinkle2.start(now + 0.3);
      twinkle2.stop(now + 0.48);

      // Sub bass for power
      const sub = context.createOscillator();
      sub.type = "sine";
      sub.frequency.value = 65.41; // C2

      const subGain = context.createGain();
      subGain.gain.setValueAtTime(0.4, now + 0.08);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      sub.connect(subGain);
      subGain.connect(bus);
      sub.start(now + 0.08);
      sub.stop(now + 0.6);

      const allNodes: AudioNode[] = [
        crashGain,
        crashFilter,
        chord1Gain,
        chord2Gain,
        twinkle1Gain,
        twinkle2Gain,
        subGain,
      ];

      scheduleCleanup(context, allNodes, duration);
    } catch (e) {
      console.error("Error playing success5 sound effect:", e);
    }
  };

  const playTimeUpSound = async () => {
    try {
      const audio = await provider();
      if (!audio) return;
      const { context, bus } = audio;

      const now = context.currentTime;
      const duration = 0.5;

      const oscillator = context.createOscillator();
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(880, now);
      oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.5);

      const gain = context.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      oscillator.connect(gain);
      gain.connect(bus);
      oscillator.start(now);
      oscillator.stop(now + 0.5);

      scheduleCleanup(context, [gain], duration);
    } catch (e) {
      console.error("Error playing time up sound effect:", e);
    }
  };

  const playNewRoundSound = async () => {
    try {
      const audio = await provider();
      if (!audio) return;
      const { context, bus } = audio;

      const now = context.currentTime;
      const duration = 0.6;

      const blip1 = context.createOscillator();
      blip1.type = "square";
      blip1.frequency.value = 523.25;

      const blip1Gain = context.createGain();
      blip1Gain.gain.setValueAtTime(0.35, now);
      blip1Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      blip1.connect(blip1Gain);
      blip1Gain.connect(bus);
      blip1.start(now);
      blip1.stop(now + 0.1);

      const blip2 = context.createOscillator();
      blip2.type = "square";
      blip2.frequency.value = 659.25;

      const blip2Gain = context.createGain();
      blip2Gain.gain.setValueAtTime(0.35, now + 0.15);
      blip2Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      blip2.connect(blip2Gain);
      blip2Gain.connect(bus);
      blip2.start(now + 0.15);
      blip2.stop(now + 0.25);

      const blip3 = context.createOscillator();
      blip3.type = "square";
      blip3.frequency.value = 783.99;

      const blip3Gain = context.createGain();
      blip3Gain.gain.setValueAtTime(0.4, now + 0.3);
      blip3Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      blip3.connect(blip3Gain);
      blip3Gain.connect(bus);
      blip3.start(now + 0.3);
      blip3.stop(now + 0.5);

      scheduleCleanup(context, [blip1Gain, blip2Gain, blip3Gain], duration);
    } catch (e) {
      console.error("Error playing new round sound effect:", e);
    }
  };

  // Player Snap Sound 1: Quick Upward Sweep
  const playPlayerSnap1Sound = async () => {
    try {
      const audio = await provider();
      if (!audio) return;
      const { context, bus } = audio;

      const now = context.currentTime;
      const duration = 0.15;

      const osc = context.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.05);

      const gain = context.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.1);

      scheduleCleanup(context, [gain], duration);
    } catch (e) {
      console.error("Error playing playerSnap1 sound effect:", e);
    }
  };

  // Player Snap Sound 2: Punchy Square Wave
  const playPlayerSnap2Sound = async () => {
    try {
      const audio = await provider();
      if (!audio) return;
      const { context, bus } = audio;

      const now = context.currentTime;
      const duration = 0.15;

      const osc = context.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(1500, now + 0.04);

      const gain = context.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.08);

      scheduleCleanup(context, [gain], duration);
    } catch (e) {
      console.error("Error playing playerSnap2 sound effect:", e);
    }
  };

  // Player Snap Sound 3: Double-Tap Snap
  const playPlayerSnap3Sound = async () => {
    try {
      const audio = await provider();
      if (!audio) return;
      const { context, bus } = audio;

      const now = context.currentTime;
      const duration = 0.15;

      const osc1 = context.createOscillator();
      osc1.type = "triangle";
      osc1.frequency.value = 990;

      const gain1 = context.createGain();
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

      osc1.connect(gain1);
      gain1.connect(bus);
      osc1.start(now);
      osc1.stop(now + 0.04);

      const osc2 = context.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.value = 1320;

      const gain2 = context.createGain();
      gain2.gain.setValueAtTime(0.28, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc2.connect(gain2);
      gain2.connect(bus);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.1);

      scheduleCleanup(context, [gain1, gain2], duration);
    } catch (e) {
      console.error("Error playing playerSnap3 sound effect:", e);
    }
  };

  // Player Snap Sound 4: Sharp Descending Click
  const playPlayerSnap4Sound = async () => {
    try {
      const audio = await provider();
      if (!audio) return;
      const { context, bus } = audio;

      const now = context.currentTime;
      const duration = 0.15;

      const osc = context.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1760, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

      const gain = context.createGain();
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.09);

      scheduleCleanup(context, [gain], duration);
    } catch (e) {
      console.error("Error playing playerSnap4 sound effect:", e);
    }
  };

  // Player Snap Sound 5: Bouncy Triple-Note
  const playPlayerSnap5Sound = async () => {
    try {
      const audio = await provider();
      if (!audio) return;
      const { context, bus } = audio;

      const now = context.currentTime;
      const duration = 0.15;

      const osc = context.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.setValueAtTime(1400, now + 0.03);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.06);

      const gain = context.createGain();
      gain.gain.setValueAtTime(0.26, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.11);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.11);

      scheduleCleanup(context, [gain], duration);
    } catch (e) {
      console.error("Error playing playerSnap5 sound effect:", e);
    }
  };

  return {
    playCelebratoryCorrectSound,
    playEpicBonusSound,
    playBonus2Sound,
    playBonus3Sound,
    playBonus4Sound,
    playBonus5Sound,
    playCelebratorySuccess1Sound,
    playCelebratorySuccess2Sound,
    playCelebratorySuccess3Sound,
    playCelebratorySuccess4Sound,
    playCelebratorySuccess5Sound,
    playTimeUpSound,
    playNewRoundSound,
    playPlayerSnap1Sound,
    playPlayerSnap2Sound,
    playPlayerSnap3Sound,
    playPlayerSnap4Sound,
    playPlayerSnap5Sound,
  };
};

export type SoundGenerators = ReturnType<typeof createSoundGenerators>;

/** Maps each SoundType to the generator method that produces it. */
const SOUND_METHOD: Record<SoundType, keyof SoundGenerators> = {
  correct: "playCelebratoryCorrectSound",
  bonus1: "playEpicBonusSound",
  bonus2: "playBonus2Sound",
  bonus3: "playBonus3Sound",
  bonus4: "playBonus4Sound",
  bonus5: "playBonus5Sound",
  success1: "playCelebratorySuccess1Sound",
  success2: "playCelebratorySuccess2Sound",
  success3: "playCelebratorySuccess3Sound",
  success4: "playCelebratorySuccess4Sound",
  success5: "playCelebratorySuccess5Sound",
  timeUp: "playTimeUpSound",
  newRound: "playNewRoundSound",
  playerSnap1: "playPlayerSnap1Sound",
  playerSnap2: "playPlayerSnap2Sound",
  playerSnap3: "playPlayerSnap3Sound",
  playerSnap4: "playPlayerSnap4Sound",
  playerSnap5: "playPlayerSnap5Sound",
};

/** Play one sound by type against a given generator set. */
export const invokeSound = (
  generators: SoundGenerators,
  type: SoundType,
): Promise<void> => {
  const method = SOUND_METHOD[type];
  if (!method) {
    console.error("Unknown sound type:", type);
    return Promise.resolve();
  }
  return generators[method]();
};

/** UI-facing catalog: ordered groups of sounds with friendly labels,
    used by the Sound Lab page to render an audition board. */
export const SOUND_CATALOG: {
  group: string;
  blurb: string;
  sounds: { type: SoundType; label: string }[];
}[] = [
  {
    group: "Core",
    blurb: "Fire constantly during play — kept short and dry.",
    sounds: [
      { type: "correct", label: "Correct" },
      { type: "newRound", label: "New Round" },
      { type: "timeUp", label: "Time Up" },
    ],
  },
  {
    group: "Player Snap",
    blurb: "Tiny confirmation blips when a slot is snapped.",
    sounds: [
      { type: "playerSnap1", label: "Snap 1 · Sweep" },
      { type: "playerSnap2", label: "Snap 2 · Punch" },
      { type: "playerSnap3", label: "Snap 3 · Double-tap" },
      { type: "playerSnap4", label: "Snap 4 · Click" },
      { type: "playerSnap5", label: "Snap 5 · Bounce" },
    ],
  },
  {
    group: "Success",
    blurb: "Mid-tier celebratory stings.",
    sounds: [
      { type: "success1", label: "Success 1 · Fanfare" },
      { type: "success2", label: "Success 2 · Arpeggio" },
      { type: "success3", label: "Success 3 · Power Chord" },
      { type: "success4", label: "Success 4 · Horns" },
      { type: "success5", label: "Success 5 · Game Show" },
    ],
  },
  {
    group: "Bonus",
    blurb: "Big moments — the loudest, longest sounds.",
    sounds: [
      { type: "bonus1", label: "Bonus 1 · Epic Scale" },
      { type: "bonus2", label: "Bonus 2 · Wobble Drop" },
      { type: "bonus3", label: "Bonus 3 · Ta-Da" },
      { type: "bonus4", label: "Bonus 4 · Slide Whistle" },
      { type: "bonus5", label: "Bonus 5 · Rapid Blips" },
    ],
  },
];

const SoundEffects = ({ onLoad }: SoundEffectProps) => {
  const soundGenerators = useMemo(() => createSoundGenerators(), []);

  const playSound = useCallback(
    async (soundType: SoundType) => {
      await invokeSound(soundGenerators, soundType);
    },
    [soundGenerators],
  );

  useEffect(() => {
    (window as any).playSoundEffect = playSound;

    return () => {
      delete (window as any).playSoundEffect;
    };
  }, [playSound]);

  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  return null;
};

export default SoundEffects;
