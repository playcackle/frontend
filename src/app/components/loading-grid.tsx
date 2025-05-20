"use client";

import { gsap, Power2, Power3 } from "gsap";
import { useEffect, useRef } from "react";
import styles from "./loading-grid.module.css";

const LoadingGrid = () => {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current) {
      gsap.set(gridRef.current, {
        transformPerspective: 400,
        transformOrigin: "50% 50%",
      });

      const anim2Props = {
        rotationX: 75,
        y: "0%",
        ease: Power2.easeIn,
        transformPerspective: 300,
        onComplete: () => gridRef.current?.classList!.add(styles.isAnimating),
      };

      const tl = gsap.timeline();
      tl.to(gridRef.current, {
        duration: 1,
        scaleY: 1.5,
        ease: Power3.easeIn,
      }).to(gridRef.current, { duration: 1, ...anim2Props }, "+=0.3");
    }

    // Cleanup function
    return () => {
      if (gridRef.current) {
        gsap.killTweensOf(gridRef.current);
      }
    };
  }, []);

  return <div ref={gridRef} className={styles.mGrid} />;
};

export default LoadingGrid;
