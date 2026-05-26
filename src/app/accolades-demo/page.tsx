import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  BadgeCheck,
  Donut,
  Flame,
  Skull,
  Snail,
  Sprout,
  Sword,
  Swords,
  Target,
  Timer,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import styles from "./page.module.css";

interface AccoladeEntry {
  key: string;
  title: string;
  description: string;
  rule: string;
  icon: LucideIcon;
  color: string;
}

const ROUND_ACCOLADES: AccoladeEntry[] = [
  {
    key: "first_blood",
    title: "First Blood",
    description: "First to snap an answer in the round.",
    rule: "Granted to whoever lands the very first correct answer of the round. One per round — fastest fingers win it.",
    icon: Sword,
    color: "#8b0000",
  },
  {
    key: "machine_gun",
    title: "Machine Gun",
    description: "Submitted the highest volume of answers.",
    rule: "Given to the player who fired off the most total submissions (correct or wrong) in the round. Pure typing throughput — quality not required.",
    icon: Zap,
    color: "#ff4500",
  },
  {
    key: "snapping_spree",
    title: "Snapping Spree",
    description: "On an unstoppable snapping streak.",
    rule: "Earned when you snap multiple slots in rapid succession in a round without another player breaking your streak. Back-to-back claims dominate the board.",
    icon: Flame,
    color: "#ff1493",
  },
  {
    key: "close_call",
    title: "Close Call",
    description: "Barely made it — but still got the snap.",
    rule: "Awarded when one of your successful answers in the round was a near-miss — a fuzzy match that just barely passed the similarity threshold. You scraped through.",
    icon: AlertCircle,
    color: "#ffa500",
  },
  {
    key: "donut",
    title: "Donut",
    description: "Zero on the board this round.",
    rule: "Handed to a player who finishes a round with 0 points. A full lap around the scoreboard. Bot Bob is going to make sure everyone notices.",
    icon: Donut,
    color: "#ff8fb1",
  },
  {
    key: "late_bloomers",
    title: "Late Bloomers",
    description: "Last to land a correct answer this round.",
    rule: "Awarded to the player whose only (or final) correct answer of the round came last among all scorers. Better late than never — but barely.",
    icon: Sprout,
    color: "#9fff5a",
  },
  {
    key: "fossil_fingers",
    title: "Fossil Fingers",
    description: "Slowest typist in the room.",
    rule: "Given to the player with the longest average gap between submissions in the round. Either deep in thought or just… slow. Bot Bob isn't picky.",
    icon: Snail,
    color: "#c7b56e",
  },
];

const POSTGAME_ACCOLADES: AccoladeEntry[] = [
  {
    key: "speed_demon",
    title: "Speed Demon",
    description: "Answered with blazing speed across multiple rounds.",
    rule: "Awarded to the player with the fastest average snap time across the whole game. Bot Bob averages your reaction time across every round — lowest number wins.",
    icon: Zap,
    color: "#ff6b00",
  },
  {
    key: "precision",
    title: "Precision",
    description: "Consistently snapped correct answers without misses.",
    rule: "Earned when your correct-to-total submission ratio across the game is the highest among players (typically ~80%+ accuracy). Think before you type.",
    icon: Target,
    color: "#00ff66",
  },
  {
    key: "perfectionist",
    title: "Perfectionist",
    description: "Flawless performance — no wrong answers submitted.",
    rule: "Awarded when you finish the entire game with zero failed submissions. Every word you typed counted. Stricter than Precision — one miss disqualifies you.",
    icon: BadgeCheck,
    color: "#00ffff",
  },
  {
    key: "hot_streak",
    title: "Hot Streak",
    description: "Kept momentum going round after round.",
    rule: "Awarded when you score in several consecutive rounds without going scoreless. Consistency across the whole game, not just one big round.",
    icon: TrendingUp,
    color: "#ff00aa",
  },
  {
    key: "clutch_player",
    title: "Clutch Player",
    description: "Delivered when the pressure was highest.",
    rule: "Given to the player who lands the most snaps in the final seconds of rounds across the whole game. Clock running out and you're still claiming.",
    icon: Timer,
    color: "#1e90ff",
  },
  {
    key: "sniper",
    title: "Sniper",
    description: "Locked on and never missed the target.",
    rule: "Earned when most of your snaps across the game are on rare (purple) or high-point slots, claimed on the first try. Patience over volume.",
    icon: Swords,
    color: "#9932cc",
  },
  {
    key: "hunting_season",
    title: "Hunting Season",
    description: "Got sniped more than anyone else.",
    rule: "Awarded postgame to the player whose answers were sniped (claimed first by someone else) most often across the whole game. The board had a target on your back.",
    icon: Skull,
    color: "#c4413a",
  },
];

function AccoladeCard({ accolade }: { accolade: AccoladeEntry }) {
  const Icon = accolade.icon;
  return (
    <div
      className={styles.card}
      style={
        {
          "--accent": accolade.color,
        } as React.CSSProperties
      }
    >
      <div className={styles.cardHeader}>
        <div className={styles.iconWrapper}>
          <Icon size={22} aria-hidden="true" />
        </div>
        <div className={styles.cardTitleWrap}>
          <p className={styles.cardTitle}>{accolade.title}</p>
          <code className={styles.cardKey}>{accolade.key}</code>
        </div>
      </div>

      <p className={styles.cardDescription}>{accolade.description}</p>

      <div className={styles.ruleBlock}>
        <span className={styles.ruleLabel}>How to earn</span>
        <p className={styles.ruleText}>{accolade.rule}</p>
      </div>
    </div>
  );
}

export default function AccoladesDemoPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.headerLabel}>ACCOLADES</span>
          <Link to="/" className={styles.backBtn}>
            BACK TO HOME
          </Link>
        </div>

        <div className={styles.intro}>
          <h1 className={styles.title}>Accolades & Awards</h1>
          <p className={styles.subtitle}>
            Bot Bob hands these out between rounds and after the game.
            Each one is earned by a different playstyle — find the one that fits you.
          </p>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={`${styles.sectionLabel} ${styles.sectionLabelRound}`}>
              ROUND AWARDS
            </span>
            <p className={styles.sectionDescription}>
              Granted between rounds during gameplay. Reset every round.
            </p>
          </div>
          <div className={styles.grid}>
            {ROUND_ACCOLADES.map((accolade) => (
              <AccoladeCard key={accolade.key} accolade={accolade} />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={`${styles.sectionLabel} ${styles.sectionLabelPostgame}`}>
              POSTGAME AWARDS
            </span>
            <p className={styles.sectionDescription}>
              Tallied across the whole game and revealed in the postgame showcase.
            </p>
          </div>
          <div className={styles.grid}>
            {POSTGAME_ACCOLADES.map((accolade) => (
              <AccoladeCard key={accolade.key} accolade={accolade} />
            ))}
          </div>
        </section>

        <p className={styles.footnote}>
          Trigger thresholds (exact times, ratios, and streak counts) are tuned
          server-side and may shift as the game evolves.
        </p>
      </div>
    </div>
  );
}
