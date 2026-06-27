import type { CSSProperties } from "react";

const petals = [
  { left: "4%", delay: "-1s", duration: "14s", size: "12px", drift: "22vw" },
  { left: "11%", delay: "-8s", duration: "18s", size: "9px", drift: "16vw" },
  { left: "18%", delay: "-4s", duration: "16s", size: "14px", drift: "20vw" },
  { left: "25%", delay: "-11s", duration: "21s", size: "10px", drift: "13vw" },
  { left: "32%", delay: "-3s", duration: "15s", size: "13px", drift: "18vw" },
  { left: "39%", delay: "-13s", duration: "24s", size: "8px", drift: "24vw" },
  { left: "47%", delay: "-6s", duration: "17s", size: "12px", drift: "15vw" },
  { left: "54%", delay: "-16s", duration: "22s", size: "11px", drift: "21vw" },
  { left: "61%", delay: "-2s", duration: "14s", size: "15px", drift: "14vw" },
  { left: "68%", delay: "-9s", duration: "19s", size: "9px", drift: "19vw" },
  { left: "74%", delay: "-5s", duration: "16s", size: "12px", drift: "12vw" },
  { left: "81%", delay: "-12s", duration: "23s", size: "10px", drift: "18vw" },
  { left: "88%", delay: "-7s", duration: "18s", size: "13px", drift: "15vw" },
  { left: "95%", delay: "-15s", duration: "25s", size: "8px", drift: "10vw" },
];

export function SakuraFall() {
  return (
    <div className="sakura-fall" aria-hidden="true">
      {petals.map((petal, index) => (
        <span
          key={index}
          className="sakura-petal"
          style={
            {
              "--petal-left": petal.left,
              "--petal-delay": petal.delay,
              "--petal-duration": petal.duration,
              "--petal-size": petal.size,
              "--petal-drift": petal.drift,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
