import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  BadgeCheck,
  Crosshair,
  Donut,
  Flame,
  Magnet,
  Search,
  Shield,
  Skull,
  Sword,
  Swords,
  Target,
  Timer,
  Trash2,
  TrendingUp,
  Trophy,
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
    key: "sprinter",
    title: "Sprinter",
    description: "Two snaps within ten seconds.",
    rule: "Earned when you snap two slots with less than 10 seconds between them. Quick double-tap on the board.",
    icon: Zap,
    color: "#ff6b00",
  },
  {
    key: "snapping_spree",
    title: "Snapping Spree",
    description: "Snapped the most slots this round.",
    rule: "Given to the player who snagged the highest number of correct answers in the round. Board domination.",
    icon: Flame,
    color: "#ff1493",
  },
  {
    key: "sniper",
    title: "Sniper",
    description: "Stole someone else's near-miss.",
    rule: "Awarded when you claim a slot that another player almost had right — their fuzzy match was a near-miss, but you snapped it first. Ruthless.",
    icon: Swords,
    color: "#9932cc",
  },
  {
    key: "detective",
    title: "Detective",
    description: "Cracked a slot after Bot Bob's clue.",
    rule: "Bot Bob dropped a hint, and you snapped the slot before anyone else. Clues are for players who listen.",
    icon: Search,
    color: "#2e4053",
  },
  {
    key: "save",
    title: "Save",
    description: "Recovered your own near-miss.",
    rule: "You nearly had it — then you actually got it. Snapping a slot after you yourself had a near-miss on it.",
    icon: Shield,
    color: "#00bfff",
  },
  {
    key: "hot_streak",
    title: "Hot Streak",
    description: "Three or more correct in a row.",
    rule: "String together 3+ consecutive correct answers without a miss in between. Pure momentum.",
    icon: TrendingUp,
    color: "#ff00aa",
  },
  {
    key: "close_call",
    title: "Close Call",
    description: "High near-miss rate this round.",
    rule: "Awarded to the player with the highest rate of near-miss submissions. Almost isn't good enough — but Bot Bob noticed the effort.",
    icon: AlertCircle,
    color: "#ffa500",
  },
  {
    key: "clean_up",
    title: "Clean Up",
    description: "Snapped the last remaining slot.",
    rule: "You mopped up the final unsnapped slot of the round. The board was almost clear, and you took out the trash.",
    icon: Trash2,
    color: "#9b59b6",
  },
  {
    key: "clutch_player",
    title: "Clutch Player",
    description: "Snagged a rare slot in the final seconds.",
    rule: "Claimed a high-value rare slot with 30 seconds or less left in the round. Pressure player.",
    icon: Timer,
    color: "#1e90ff",
  },
];

const ROAST_ACCOLADES: AccoladeEntry[] = [
  {
    key: "donut",
    title: "Donut",
    description: "Zero points this round.",
    rule: "Finished a round with no points. A full lap around the scoreboard. Bot Bob will make sure everyone notices.",
    icon: Donut,
    color: "#ff8fb1",
  },
  {
    key: "clue_leech",
    title: "Clue Leech",
    description: "Most hint-dependent snaps in the round.",
    rule: "Awarded to the player who relied on Bot Bob's clues more than anyone else. Without the hints, you'd be quiet.",
    icon: Skull,
    color: "#556b2f",
  },
];

const POSTGAME_ACCOLADES: AccoladeEntry[] = [
  {
    key: "top_scorer",
    title: "Top Scorer",
    description: "Highest score in the game.",
    rule: "Awarded to the overall winner. Highest total points across all rounds. The rest of the lobby is just playing for second.",
    icon: Trophy,
    color: "#f1c40f",
  },
  {
    key: "precision",
    title: "Precision",
    description: "Best accuracy across the whole game.",
    rule: "Highest correct-to-submission ratio among all players across all rounds. Quality over quantity.",
    icon: Target,
    color: "#00ff66",
  },
  {
    key: "perfectionist",
    title: "Perfectionist",
    description: "Zero wrong submissions all game.",
    rule: "Every submission was a success. Minimum 5 attempts across the game. Flawless run — one miss disqualifies you.",
    icon: BadgeCheck,
    color: "#00ffff",
  },
  {
    key: "magnet",
    title: "Magnet",
    description: "Most rare slots claimed.",
    rule: "Hoovered up more rare (250pt) slots than anyone else across the whole game. Drawn to the high-value targets.",
    icon: Magnet,
    color: "#8e44ad",
  },
  {
    key: "sherlock",
    title: "Sherlock",
    description: "Most clue-cracked snaps in the game.",
    rule: "Followed Bot Bob's hints to more correct answers than anyone else across all rounds. Elementary.",
    icon: Search,
    color: "#5d4037",
  },
  {
    key: "heat_seeker",
    title: "Heat Seeker",
    description: "Sniped the most players.",
    rule: "Awarded to the player who stole the most near-misses across the whole game. You were hunting.",
    icon: Crosshair,
    color: "#c0392b",
  },
  {
    key: "bullied",
    title: "Bullied",
    description: "Got sniped more than anyone else.",
    rule: "Your near-misses were stolen more often than any other player's across the game. The board had a target on your back.",
    icon: Skull,
    color: "#2c3e50",
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
            <span className={`${styles.sectionLabel} ${styles.sectionLabelRoast}`}>
              THE ROAST ROOM
            </span>
            <p className={styles.sectionDescription}>
              Bot Bob's spicier takes. Also awarded between rounds — if you earned it, you earned it.
            </p>
          </div>
          <div className={styles.grid}>
            {ROAST_ACCOLADES.map((accolade) => (
              <AccoladeCard key={accolade.key} accolade={accolade} />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={`${styles.sectionLabel} ${styles.sectionLabelPostgame}`}>
              POSTGAME SHOWCASE
            </span>
            <p className={styles.sectionDescription}>
              Tallied across the whole game and revealed at the end. These are the ones that stick.
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