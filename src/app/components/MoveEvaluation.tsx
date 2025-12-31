"use client";

import { useEffect, useState } from "react";

export type MoveQuality = "brilliant" | "best" | "good" | "inaccuracy" | "mistake" | "blunder" | null;

interface MoveEvaluationProps {
  quality: MoveQuality;
  move: string;
  onAnimationEnd?: () => void;
}

const MoveEvaluation = ({ quality, move, onAnimationEnd }: MoveEvaluationProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (quality) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onAnimationEnd?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [quality, onAnimationEnd]);

  if (!quality || !show) return null;

  const config = {
    brilliant: {
      icon: "✨",
      text: "Nước đi thiên tài!",
      color: "from-yellow-400 to-orange-500",
      bgColor: "bg-yellow-500/20",
      borderColor: "border-yellow-400",
    },
    best: {
      icon: "⭐",
      text: "Nước đi tốt nhất!",
      color: "from-green-400 to-emerald-500",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-400",
    },
    good: {
      icon: "👍",
      text: "Nước đi tốt!",
      color: "from-blue-400 to-cyan-500",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-400",
    },
    inaccuracy: {
      icon: "⚠️",
      text: "Nước đi không chính xác",
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-500/20",
      borderColor: "border-yellow-500",
    },
    mistake: {
      icon: "❌",
      text: "Nước đi sai lầm",
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-500/20",
      borderColor: "border-orange-500",
    },
    blunder: {
      icon: "💥",
      text: "Nước đi sai nghiêm trọng!",
      color: "from-red-500 to-pink-600",
      bgColor: "bg-red-500/20",
      borderColor: "border-red-500",
    },
  };

  const style = config[quality];

  return (
    <div
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 ${
        show ? "animate-fade-in-scale" : "animate-fade-out"
      }`}
    >
      <div
        className={`${style.bgColor} ${style.borderColor} border-4 rounded-2xl px-8 py-6 shadow-2xl backdrop-blur-md`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className={`text-6xl animate-bounce`}>{style.icon}</div>
          <div className={`text-2xl font-bold bg-gradient-to-r ${style.color} bg-clip-text text-transparent`}>
            {style.text}
          </div>
          <div className="text-white/80 text-lg font-mono">{move}</div>
        </div>
      </div>
    </div>
  );
};

export default MoveEvaluation;

