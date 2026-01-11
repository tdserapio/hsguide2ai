"use client";

import katex from "katex";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Choice = {
  key: string;
  latex: string;
  explanation: string;
  comment: string;
};

const choices: Choice[] = [
  {
    key: "A",
    latex:
      "-\\sum_{i=1}^{n}\\Big[y_i\\log(\\hat{y}_i) + (1-y_i)\\log(1-\\hat{y}_i)\\Big]",
    explanation:
      "This resembles cross-entropy, but it uses \\(\\hat{y}_i\\) ambiguously instead of the model probability \\(p_i=\\sigma(x_i^\\top w)\\). The question expects the standard logistic regression NLL form.",
    comment: "Close. "
  },
  {
    key: "B",
    latex:
      "-\\sum_{i=1}^{n}\\left[y_i(x_i^{\\top}w) - \\log\\left(1+e^{x_i^{\\top}w}\\right)\\right]",
    explanation:
      "This is the negative log-likelihood written using the logit \\(x_i^\\top w\\), equivalent to the cross-entropy form with \\(p_i=\\sigma(x_i^\\top w)\\).",
      comment: "Correct. "
  },
  {
    key: "C",
    latex:
      "\\sum_{i=1}^{n}\\log\\left(1+e^{-(2y_i-1)\\,x_i^{\\top}w}\\right)",
    explanation:
      "This is logistic loss under labels in \\(\\{-1,+1\\}\\). The question typically assumes \\(y_i\\in\\{0,1\\}\\), so it won’t match the expected form.",
      comment: "Not quite. "
  },
  {
    key: "D",
    latex:
      "-\\sum_{i=1}^{n}\\log(\\hat{y}_i) + \\lambda\\lVert w\\rVert_2^2",
    explanation:
      "This likelihood term is incomplete: it ignores the \\((1-y_i)\\log(1-p_i)\\) part. Regularization is plausible, but the base loss is wrong.",
      comment: "Incorrect. "
  },
];

const CORRECT_KEY = "B";

type ConfettiPiece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  life: number;
  color: string;
};

const CONFETTI_COLORS = [
  "#111111",
  "#ffffff",
  "#22c55e",
  "#60a5fa",
  "#f59e0b",
  "#ef4444",
  "#a78bfa",
];

export default function PracticeQuestionSection() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const piecesRef = useRef<ConfettiPiece[]>([]);
  const runningRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const inlineW = useMemo(
    () => katex.renderToString("w", { throwOnError: false }),
    []
  );
  const renderedChoices = useMemo(
    () =>
      choices.map((choice) => ({
        ...choice,
        html: katex.renderToString(choice.latex, {
          displayMode: true,
          throwOnError: false,
        }),
      })),
    []
  );

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    const { innerWidth, innerHeight } = window;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }, []);

  const tickConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      return;
    }
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    piecesRef.current = piecesRef.current.filter((p) => p.life > 0);

    for (const p of piecesRef.current) {
      p.life -= 1;
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 60));
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (piecesRef.current.length > 0) {
      frameRef.current = requestAnimationFrame(tickConfetti);
    } else {
      runningRef.current = false;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }, []);

  const spawnConfetti = useCallback(
    (x: number, y: number) => {
      const count = 30;
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 9;
        piecesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (4 + Math.random() * 3),
          g: 0.18 + Math.random() * 0.08,
          w: 6 + Math.random() * 8,
          h: 3 + Math.random() * 6,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.35,
          life: 80 + Math.floor(Math.random() * 40),
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        });
      }
      if (!runningRef.current) {
        runningRef.current = true;
        frameRef.current = requestAnimationFrame(tickConfetti);
      }
    },
    [tickConfetti]
  );

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [resizeCanvas]);


  const handleToggle = (key: string, rect: DOMRect) => {
    if (openKey === key) {
      setOpenKey(null);
      return;
    }
    setOpenKey(key);
    if (key === CORRECT_KEY) {
      spawnConfetti(rect.left + rect.width / 2, rect.top + 18);
    }
  };

  const choiceStates = useMemo(
    () =>
      renderedChoices.map((choice) => ({
        ...choice,
        isOpen: openKey === choice.key,
        isCorrect: openKey === choice.key && choice.key === CORRECT_KEY,
        isWrong: openKey === choice.key && choice.key !== CORRECT_KEY,
      })),
    [openKey, renderedChoices]
  );

  const renderExplanation = useCallback((text: string) => {
    const parts = text.split(/(\\\(.+?\\\))/g);
    return parts.map((part, index) => {
      const match = part.match(/^\\\((.+)\\\)$/);
      if (match) {
        const html = katex.renderToString(match[1], {
          throwOnError: false,
          displayMode: false,
        });
        return (
          <span
            key={`math-${index}`}
            className="mx-[2px] inline-flex"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }
      return <span key={`text-${index}`}>{part}</span>;
    });
  }, []);

  return (
    <section className="min-h-screen snap-start px-6 pb-20 pt-20 md:px-10 md:pt-24">
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-50"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-[1100px]">
        <div className="text-center">
          <h2 className="text-[44px] font-extrabold leading-[1.02] tracking-[-0.04em] md:text-[92px]">
            What is this for?
          </h2>
          <p className="mx-auto mt-4 max-w-[780px] text-[18px] italic text-black/70 md:text-[20px]">
            Huge library of{" "}
            <span className="rounded-[6px] bg-[#ffe85a] px-[6px] py-[2px] text-black shadow-[0_8px_18px_rgba(255,232,90,0.25)]">
              manually-curated practice questions
            </span>{" "}
            to boost your learning
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          <div className="mx-auto w-full max-w-[760px] rounded-[12px] border border-black/10 bg-white/90 p-4 text-left shadow-[0_10px_28px_rgba(0,0,0,0.10)]">
            <div className="mb-3 flex items-baseline gap-2">
              <div className="text-[15px] font-black tracking-[-0.01em]">
                Question
              </div>
              <div className="text-[16px] leading-[1.32] text-black/80">
                Which of the following expressions represents the objective
                function that logistic regression minimizes (over parameters
                <span
                  className="mx-1 inline-flex"
                  dangerouslySetInnerHTML={{ __html: inlineW }}
                />
                )?
              </div>
            </div>

            <div className="grid gap-2 text-[16px] leading-[1.25]">
              {choiceStates.map((choice) => (
                <div
                  key={choice.key}
                  role="button"
                  tabIndex={0}
                  aria-expanded={choice.isOpen}
                  onClick={(event) =>
                    handleToggle(choice.key, event.currentTarget.getBoundingClientRect())
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleToggle(
                        choice.key,
                        event.currentTarget.getBoundingClientRect()
                      );
                    }
                  }}
                  className={[
                    "cursor-pointer overflow-hidden rounded-[12px] border border-black/10 bg-white/75 transition",
                    "hover:-translate-y-[1px] hover:border-black/30 hover:shadow-[0_12px_22px_rgba(0,0,0,0.10)]",
                    choice.isOpen ? "shadow-[0_10px_18px_rgba(0,0,0,0.08)]" : "",
                    choice.isOpen && choice.isCorrect
                      ? "border-emerald-500 bg-emerald-200/70"
                      : "",
                    choice.isOpen && choice.isWrong
                      ? "border-red-500 bg-red-200/70"
                      : "",
                  ].join(" ")}
                >
                  <div className="grid grid-cols-[42px_1fr_18px] items-start gap-2 px-3 py-3">
                    <div className="mt-[2px] flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-black/5 text-[14px] font-black text-black/70">
                      {choice.key}
                    </div>
                    <div
                      className="overflow-x-auto pb-1"
                      dangerouslySetInnerHTML={{ __html: choice.html }}
                    />
                    <div
                      className={[
                        "mt-[6px] h-4 w-4 opacity-55 transition",
                        choice.isOpen ? "rotate-180 opacity-85" : "",
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      {/* <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M6 9l6 6 6-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg> */}
                    </div>
                  </div>
                  <div
                    className={[
                      "max-h-0 overflow-hidden border-t border-black/10 bg-white/65 transition-[max-height] duration-200",
                      choice.isOpen ? "max-h-[170px]" : "",
                    ].join(" ")}
                  >
                    <div className="px-3 pb-3 pt-2 text-[13.5px] leading-[1.5] text-black/70">
                      <strong className="font-black text-black/85">
                        {choice.isCorrect ? "Correct." : "Not quite."}
                      </strong>{" "}
                      {renderExplanation(choice.explanation)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
