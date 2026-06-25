import { useAtomValue } from "jotai";
import React, { useState } from "react";
import { slotsAtom } from "../store/gameAtoms";
import HintGrid from "./HintGrid";
import QuestionGrid from "./QuestionGrid";
import styles from "./SlotGrid.module.css";

type GridMode = "hints" | "questions";

function SlotGrid() {
  const slots = useAtomValue(slotsAtom);
  const [gridMode, setGridMode] = useState<GridMode>("hints");

  return (
    <div className={styles.slotGridWrapper}>
      {/* <div className={styles.gridModeToggle}>
        <button
          className={`${styles.gridModeBtn} ${gridMode === "hints" ? styles.gridModeBtnActive : ""}`}
          onClick={() => setGridMode("hints")}
          aria-pressed={gridMode === "hints"}
        >
          Hints
        </button>
        <button
          className={`${styles.gridModeBtn} ${gridMode === "questions" ? styles.gridModeBtnActive : ""}`}
          onClick={() => setGridMode("questions")}
          aria-pressed={gridMode === "questions"}
        >
          Questions
        </button>
      </div> */}

      {gridMode === "hints" ? (
        <HintGrid slots={slots} />
      ) : (
        <QuestionGrid slots={slots} />
      )}
    </div>
  );
}

const MemoSlotGrid = React.memo(SlotGrid);

export default MemoSlotGrid;
