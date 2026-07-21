"use client";

import { useEffect, useRef } from "react";

// Replaces the default cursor with a small trailing star on desktop only.
// Disabled on touch devices via the pointer:fine check, since a cursor
// follower is meaningless without a mouse. Uses a lerp toward the target
// position each frame rather than snapping instantly, which is what gives
// it the soft "following" feel instead of a rigid 1:1 stick to the cursor.
export function CursorStar() {
  const starRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!supportsHover) return;

    const handleMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMove);

    let frame: number;
    const animate = () => {
      current.current.x += (target.current.x - current.current.x) * 0.2;
      current.current.y += (target.current.y - current.current.y) * 0.2;
      if (starRef.current) {
        starRef.current.style.transform = `translate(${current.current.x}px, ${current.current.y}px)`;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={starRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        style={{ position: "absolute", bottom: -24, right: -40 }}
      >
        <path
          d="M7 0 L8.4 5.6 L14 7 L8.4 8.4 L7 14 L5.6 8.4 L0 7 L5.6 5.6 Z"
          fill="#2FDD79"
        />
      </svg>
    </div>
  );
}