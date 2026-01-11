"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type WaitlistModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

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

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const confettiRef = useRef<HTMLCanvasElement | null>(null);
  const confettiPiecesRef = useRef<ConfettiPiece[]>([]);
  const confettiRunningRef = useRef(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setIsSuccess(false);

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);

    return () => {
      window.removeEventListener("keydown", handleKey);
      window.clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const canvas = confettiRef.current;
    if (!canvas) {
      return;
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [isOpen]);

  const spawnConfetti = (x: number, y: number) => {
    const count = 32;
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      confettiPiecesRef.current.push({
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

    if (!confettiRunningRef.current) {
      confettiRunningRef.current = true;
      frameRef.current = requestAnimationFrame(tickConfetti);
    }
  };

  const tickConfetti = () => {
    const canvas = confettiRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      return;
    }

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    confettiPiecesRef.current = confettiPiecesRef.current.filter(
      (piece) => piece.life > 0
    );

    for (const piece of confettiPiecesRef.current) {
      piece.life -= 1;
      piece.vy += piece.g;
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.rot += piece.vr;

      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rot);
      ctx.fillStyle = piece.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, piece.life / 60));
      ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
      ctx.restore();
    }

    if (confettiPiecesRef.current.length > 0) {
      frameRef.current = requestAnimationFrame(tickConfetti);
    } else {
      confettiRunningRef.current = false;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === overlayRef.current) {
      onClose();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Please enter an email.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const { error } = await supabase.from("waitlist").insert({ email });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setIsSuccess(true);
    const rect = overlayRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 3;
    spawnConfetti(x, y);

    setEmail("");
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6 py-10 backdrop-blur-[2px]"
      onClick={handleOverlayClick}
    >
      <canvas
        ref={confettiRef}
        className="pointer-events-none fixed inset-0"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-[420px] rounded-[20px] border border-black/10 bg-white/95 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.18)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[14px] font-semibold text-black/60 transition hover:text-black"
          aria-label="Close"
        >
          X
        </button>
        {isSuccess ? (
          <div className="grid gap-2 py-6 text-center">
            <div className="text-[22px] font-extrabold tracking-[-0.02em]">
              You&rsquo;re in!
            </div>
            <p className="text-[14px] text-black/65">
              Thanks for joining the waitlist.
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-[22px] font-extrabold tracking-[-0.02em]">
              Join the waitlist
            </h3>
            <p className="mt-2 text-[14px] text-black/65">
              Get early access updates.
            </p>
            <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
              <input
                ref={inputRef}
                type="email"
                name="email"
                placeholder="you@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 rounded-full border border-black/20 px-4 text-[14px] outline-none transition focus:border-black/60"
                required
              />
              {errorMessage ? (
                <p className="text-[12px] text-red-600">{errorMessage}</p>
              ) : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-11 rounded-full bg-black text-[14px] font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-[0_18px_36px_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Join Waitlist"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
