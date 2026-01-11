"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import NeuralGraphic from "@/components/NeuralGraphic";
import ThreeDemo from "@/components/ThreeDemo";
import WaitlistModal from "@/components/WaitlistModal";

const PracticeQuestionSection = dynamic(
  () => import("@/components/PracticeQuestionSection"),
  { ssr: false }
);

export default function HomePage() {
  const mainRef = useRef<HTMLElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const whoRef = useRef<HTMLElement | null>(null);
  const whatIntroRef = useRef<HTMLElement | null>(null);
  const whatDemoRef = useRef<HTMLElement | null>(null);
  const whereRef = useRef<HTMLElement | null>(null);
  const [showNavTitle, setShowNavTitle] = useState(false);
  const [showNotAnymore, setShowNotAnymore] = useState(true);
  const awaitingExtraScrollRef = useRef(false);
  const [showHeaderCta, setShowHeaderCta] = useState(true);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "who" | "what" | "where" | null
  >(null);

  useEffect(() => {
    if (!mainRef.current || !heroRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowNavTitle(!entry.isIntersecting);
      },
      {
        root: mainRef.current,
        threshold: 0.6,
      }
    );

    observer.observe(heroRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!mainRef.current || !whoRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !showNotAnymore) {
          awaitingExtraScrollRef.current = true;
        }
      },
      {
        root: mainRef.current,
        threshold: 0.6,
      }
    );

    observer.observe(whoRef.current);

    return () => {
      observer.disconnect();
    };
  }, [showNotAnymore]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) {
      return;
    }

    const handleScroll = () => {
      if (awaitingExtraScrollRef.current && !showNotAnymore) {
        setShowNotAnymore(true);
        awaitingExtraScrollRef.current = false;
      }
    };

    main.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      main.removeEventListener("scroll", handleScroll);
    };
  }, [showNotAnymore]);

  useEffect(() => {
    if (
      !mainRef.current ||
      !heroRef.current ||
      !whoRef.current ||
      !whatIntroRef.current ||
      !whatDemoRef.current ||
      !whereRef.current
    ) {
      return;
    }

    const sectionMap = new Map<Element, "who" | "what" | "where" | null>([
      [heroRef.current, null],
      [whoRef.current, "who"],
      [whatIntroRef.current, "what"],
      [whatDemoRef.current, "what"],
      [whereRef.current, "where"],
    ]);

    const observer = new IntersectionObserver(
      (entries) => {
        const heroEntry = entries.find(
          (entry) => entry.target === heroRef.current
        );
        if (heroEntry?.isIntersecting && heroEntry.intersectionRatio >= 0.5) {
          setActiveSection(null);
          return;
        }

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          const key = sectionMap.get(visible[0].target) ?? null;
          setActiveSection(key);
        }
      },
      {
        root: mainRef.current,
        threshold: [0.3, 0.5, 0.7],
      }
    );

    sectionMap.forEach((_, element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!mainRef.current || !whereRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowHeaderCta(!entry.isIntersecting);
      },
      {
        root: mainRef.current,
        threshold: 0.6,
      }
    );

    observer.observe(whereRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <main
      ref={mainRef}
      className={[
        "h-screen w-full overflow-y-auto",
        "snap-y snap-mandatory scroll-smooth",
        // Paper/grid background (very subtle)
        "bg-[#f7f7f7]",
        "[background-image:linear-gradient(to_right,rgba(0,0,0,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.045)_1px,transparent_1px)]",
        "[background-size:64px_64px]",
        "text-black"
      ].join(" ")}
    >
      <header className="sticky top-0 z-20 w-full backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1320px] flex-col items-center gap-4 px-6 py-4 md:flex-row md:justify-between md:px-10">
          <div className="flex w-full justify-start md:w-[240px]">
            <button
              type="button"
              onClick={() =>
                mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })
              }
              className={[
                "text-left text-[13px] font-extrabold leading-[1.0] tracking-[-0.02em] text-black transition-opacity duration-300",
                "hover:text-black/80",
                showNavTitle ? "opacity-100" : "opacity-0 pointer-events-none",
                "md:text-[15px]",
              ].join(" ")}
            >
              The High <br /> Schooler&rsquo;s <br /> Guide to AI
            </button>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm leading-none text-black/90 md:gap-12 md:text-[15px]">
            <Link
              href="#who"
              onClick={(event) => {
                event.preventDefault();
                whoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={[
                "relative pb-1 text-black/90 transition",
                "after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-200",
                "hover:text-black after:hover:scale-x-100",
                activeSection === "who" ? "text-black after:scale-x-100" : "",
              ].join(" ")}
            >
              Who is this for?
            </Link>
            <Link
              href="#what"
              onClick={(event) => {
                event.preventDefault();
                whatIntroRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className={[
                "relative pb-1 text-black/90 transition",
                "after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-200",
                "hover:text-black after:hover:scale-x-100",
                activeSection === "what" ? "text-black after:scale-x-100" : "",
              ].join(" ")}
            >
              What is this for?
            </Link>
            <Link
              href="#where"
              onClick={(event) => {
                event.preventDefault();
                whereRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={[
                "relative pb-1 text-black/90 transition",
                "after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-200",
                "hover:text-black after:hover:scale-x-100",
                activeSection === "where" ? "text-black after:scale-x-100" : "",
              ].join(" ")}
            >
              Where do I start?
            </Link>
          </nav>

          <button
            type="button"
            className={[
              "inline-flex items-center justify-center",
              "h-7 px-6 md:h-8 md:px-8",
              "rounded-full bg-black text-white",
              "text-sm font-semibold md:text-base",
              "transition-opacity duration-300",
              showHeaderCta ? "opacity-100" : "opacity-0 pointer-events-none",
            ].join(" ")}
            onClick={() => setIsWaitlistOpen(true)}
          >
            Join Waitlist
          </button>
        </div>
      </header>

      <section ref={heroRef} className="min-h-screen snap-start">
        {/* Hero */}
        <div className="mx-auto w-full max-w-[1320px] px-6 pt-10 md:px-10 md:pt-16 lg:pt-[23vh]">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-6">
            {/* Left text */}
            <div className="col-span-1 text-center lg:col-span-6 lg:text-left lg:pl-10">
              <h1 className="font-extrabold tracking-[-0.04em] text-[48px] leading-[0.98] md:text-[68px] lg:text-[84px] lg:leading-[0.94]">
                The High
                <br />
                Schooler&rsquo;s
                <br />
                Guide to AI
              </h1>

              <div className="mt-5 text-[16px] leading-[1.35] text-black/90 md:mt-6 md:text-[22px] lg:text-[24px]">
                <span>(Un)official training resource endorsed by</span>
                <div className="flex justify-center lg:justify-start">
                  <Link
                    target="_blank"
                    href="https://ioaiph.org"
                    className="group inline-flex items-center gap-3 font-extrabold text-black"
                  >
                    <span className="border-b-[3px] border-black">
                      NOAI-PH
                    </span>
                    {/* tiny external arrow */}
                    <span className="relative top-[1px] inline-block">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M7 17L17 7"
                          stroke="black"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M10 7H17V14"
                          stroke="black"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right graphic */}
            <div className="col-span-1 flex justify-center lg:col-span-6 lg:justify-end lg:pr-2 lg:pt-6">
              <div className="w-full max-w-[520px] opacity-[0.98]">
                <NeuralGraphic />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={whoRef}
        id="who"
        className="min-h-screen snap-start px-6 py-20 md:px-10 md:py-24 flex items-center"
      >
        <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center text-center">
          <h2 className="text-[48px] font-extrabold leading-[0.95] tracking-[-0.03em] md:text-[72px] lg:text-[92px]">
            Who is this for?
          </h2>

          <p className="mt-8 text-[18px] italic text-black/90 md:text-[24px] lg:text-[28px]">
            &ldquo;For{" "}
            <span className="border-b-2 border-black pb-[2px]">
              high schoolers
            </span>
            , made by{" "}
            <span className="border-b-2 border-black pb-[2px]">
              high schoolers
            </span>
            &rdquo;
          </p>

          <p className="mt-10 max-w-[700px] text-[18px] leading-[1.6] text-black/85 md:text-[22px]">
            There are already{" "}
            <span className="border-b-2 border-black pb-[2px]">
              thousands of AI blogs
            </span>{" "}
            and tutorials online, but most are either inaccessible or{" "}
            <span className="border-b-2 border-black pb-[2px]">
              lack the rigor
            </span>{" "}
            needed for{" "}
            <span className="border-b-2 border-black pb-[2px]">
              high school students
            </span>
            .
          </p>

          <p
            className={[
              "mt-10 text-[24px] font-semibold transition-all duration-300 md:text-[32px]",
              showNotAnymore
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2",
            ].join(" ")}
          >
            Not anymore.
          </p>
        </div>
      </section>

      <section
        ref={whatIntroRef}
        id="what"
        className="min-h-screen snap-start px-6 py-20 md:px-10 md:py-24 flex items-center"
      >
        <div className="mx-auto w-full max-w-[1100px]">
          <div className="text-center">
            <h2 className="text-[44px] font-extrabold leading-[1.02] tracking-[-0.04em] md:text-[92px]">
              What is this for?
            </h2>

            <p className="mx-auto mt-4 max-w-[750px] text-[18px] italic leading-[1.35] text-black/80 md:text-[20px]">
              This resource is meant to serve as a{" "}
              <span className="rounded-[6px] bg-[#ffe85a] px-[6px] py-[2px] text-black shadow-[0_8px_18px_rgba(255,232,90,0.25)]">
                free reference
              </span>{" "}
              for any highschooler to navigate the{" "}
              <span className="rounded-[6px] bg-[#ffe85a] px-[6px] py-[2px] text-black shadow-[0_8px_18px_rgba(255,232,90,0.25)]">
                complex space of Artificial Intelligence
              </span>
              .
            </p>
          </div>
        </div>
      </section>

      <section
        ref={whatDemoRef}
        className="min-h-screen snap-start px-6 pb-20 pt-20 md:px-10 md:pt-24"
      >
        <div className="mx-auto w-full max-w-[1100px]">
          <div className="text-center">
            <h2 className="text-[44px] font-extrabold leading-[1.02] tracking-[-0.04em] md:text-[92px]">
              What is this for?
            </h2>

            <p className="mx-auto mt-4 max-w-[900px] text-[18px] italic leading-[1.45] text-black/70 md:text-[20px]">
              <span className="rounded-[6px] bg-[#ffe85a] px-[6px] py-[2px] text-black shadow-[0_8px_18px_rgba(255,232,90,0.25)]">
                Interactive demos
              </span>{" "}
              across{" "}
              <span className="rounded-[6px] bg-[#ffe85a] px-[6px] py-[2px] text-black shadow-[0_8px_18px_rgba(255,232,90,0.25)]">
                various AI topics
              </span>{" "}
              based on the{" "}
              <Link
                href="https://ioai-official.org/syllabus"
                target="_blank"
                className="border-b border-black/40 pb-[2px] text-black/80 transition hover:border-black/70 font-semibold"
              >
                IOAI curriculum
              </Link>
              <span className="ml-1 text-black/70">↗</span>
            </p>
          </div>

          <div className="mt-8 grid gap-4">
            <div className="relative rounded-[24px] border border-black/10 bg-gradient-to-b from-white/80 to-white/60 p-4 md:p-6 shadow-[0_22px_60px_rgba(0,0,0,0.10)] backdrop-blur-sm">
              <div className="absolute inset-x-[10%] -bottom-4 h-9 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.22),rgba(0,0,0,0)_70%)] opacity-35 blur-md" />

              <div className="h-[112vh] mx-auto grid min-h-[560px] w-full max-w-[980px] grid-rows-[1.05fr_0.95fr] overflow-hidden rounded-[18px] border border-black/10 bg-white/90 shadow-[0_10px_28px_rgba(0,0,0,0.10)]">
                <div className="relative min-h-[320px] border-b border-black/10 bg-gradient-to-b from-white/95 to-white/85">
                  <div className="absolute left-3 top-3 z-10 flex items-center gap-2 text-[12px] text-black/65">
                    <div
                      id="chipLoss"
                      className="rounded-full border border-black/15 bg-white/70 px-3 py-[4px] shadow-[0_10px_22px_rgba(0,0,0,0.08)] backdrop-blur-sm"
                    >
                      loss: --
                    </div>
                  </div>
                  <canvas id="threeCanvas" className="h-full w-full" />
                </div>

                <div className="grid gap-0 bg-white/95 px-4 text-left h-[50vh]">
                  <div className="grid grid-cols-[1fr_76px] items-center gap-3 h-[15vh]">
                    <label className="flex flex-col gap-0 text-[13px] font-black text-black/80">
                      Learning rate
                      <input
                        id="lr"
                        type="range"
                        min="0.001"
                        max="0.080"
                        step="0.001"
                        defaultValue="0.020"
                        className="h-3 w-full cursor-pointer appearance-none rounded-full border border-black/20 bg-white shadow-inner [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/40 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:shadow-[0_10px_18px_rgba(0,0,0,0.15)] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-black/40 [&::-moz-range-thumb]:bg-black"
                      />
                    </label>
                    <div
                      id="lrVal"
                      className="text-right text-[13px] font-black text-black/70"
                    >
                      0.020
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_76px] items-center gap-3 h-[15vh]">
                    <label className="flex flex-col gap-0 text-[13px] font-black text-black/80">
                      Momentum
                      <input
                        id="mom"
                        type="range"
                        min="0.00"
                        max="0.98"
                        step="0.01"
                        defaultValue="0.75"
                        className="h-3 w-full cursor-pointer appearance-none rounded-full border border-black/20 bg-white shadow-inner [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/40 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:shadow-[0_10px_18px_rgba(0,0,0,0.15)] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-black/40 [&::-moz-range-thumb]:bg-black"
                      />
                    </label>
                    <div
                      id="momVal"
                      className="text-right text-[13px] font-black text-black/70"
                    >
                      0.75
                    </div>
                  </div>

                  <div className="grid grid-cols-[auto_auto_auto_1fr] items-center gap-3 h-[15vh]">
                    <button
                      id="stepBackBtn"
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-full border border-black/20 bg-black/5 text-black transition hover:-translate-y-[1px] hover:bg-black/10 hover:shadow-[0_14px_26px_rgba(0,0,0,0.10)]"
                      aria-label="Step backward"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path d="M11 12l9 7V5l-9 7z" fill="currentColor" />
                        <path
                          d="M4 5v14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                    <button
                      id="playBtn"
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-full border border-black/20 bg-black/5 text-black transition hover:-translate-y-[1px] hover:bg-black/10 hover:shadow-[0_14px_26px_rgba(0,0,0,0.10)]"
                      aria-label="Play/Pause"
                    >
                      <svg
                        id="playIcon"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path d="M8 5v14l11-7-11-7z" fill="currentColor" />
                      </svg>
                    </button>
                    <button
                      id="stepFwdBtn"
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-full border border-black/20 bg-black/5 text-black transition hover:-translate-y-[1px] hover:bg-black/10 hover:shadow-[0_14px_26px_rgba(0,0,0,0.10)]"
                      aria-label="Step forward"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path d="M13 12L4 5v14l9-7z" fill="currentColor" />
                        <path
                          d="M20 5v14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>

                    <div className="grid gap-2">
                      <div className="flex items-center justify-between text-[12px] text-black/60">
                        <span id="tNow">00:00</span>
                        <span id="tEnd">00:20</span>
                      </div>
                      <input
                        id="progress"
                        type="range"
                        min="0"
                        max="1"
                        step="0.001"
                        defaultValue="0"
                        className="h-3 w-full cursor-pointer appearance-none rounded-full border border-black/20 bg-white shadow-inner [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/40 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:shadow-[0_10px_18px_rgba(0,0,0,0.15)] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-black/40 [&::-moz-range-thumb]:bg-black"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PracticeQuestionSection />

      <section
        ref={whereRef}
        id="where"
        className="min-h-screen snap-start px-6 py-20 md:px-10 md:py-24 flex items-center"
      >
        <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center text-center">
          <h2 className="text-[48px] font-extrabold leading-[0.98] tracking-[-0.04em] md:text-[72px] lg:text-[88px]">
            Where do I start?
          </h2>
          <button
            type="button"
            className="mt-6 rounded-full bg-black px-6 py-2.5 text-[14px] font-semibold text-white shadow-[0_14px_28px_rgba(0,0,0,0.18)] transition hover:-translate-y-[1px] hover:shadow-[0_18px_34px_rgba(0,0,0,0.2)]"
            onClick={() => setIsWaitlistOpen(true)}
          >
            Join Waitlist
          </button>
        </div>
      </section>

      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
      />

      <ThreeDemo />
    </main>
  );
}
