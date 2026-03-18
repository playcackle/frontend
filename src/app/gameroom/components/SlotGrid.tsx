"use client";

import { useAtomValue } from "jotai";
import React from "react";
import { slotsAtom } from "../store/gameAtoms";
import AnswerGrid from "./AnswerGrid";

function SlotGrid() {
  const slots = useAtomValue(slotsAtom);

  return (
    <div>
      <AnswerGrid slots={slots} />
    </div>
  );
}

const MemoSlotGrid = React.memo(SlotGrid);

// @ts-expect-error — WDYR dev instrumentation
if (process.env.NODE_ENV === 'development') MemoSlotGrid.whyDidYouRender = true;

export default MemoSlotGrid;
