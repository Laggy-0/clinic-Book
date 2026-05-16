import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function Preloader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".pre-progress-fill", {
        width: "100%",
        duration: 1.9,
        ease: "power2.inOut",
        delay: 0.3,
      });

      const obj = { v: 0 };
      gsap.to(obj, {
        v: 100,
        duration: 1.9,
        delay: 0.3,
        ease: "power2.out",
        onUpdate: () => setCount(Math.round(obj.v)),
      });

      gsap.to(".pre-tagline", {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.6,
      });

      const tl = gsap.timeline({ delay: 2.55, onComplete: () => setDone(true) });
      tl.to(".pre-logo-text, .pre-star-wrap, .pre-tagline, .pre-counter-wrap, .pre-divider", {
        opacity: 0,
        y: -20,
        duration: 0.4,
        stagger: 0.06,
        ease: "power2.in",
      })
        .to(
          ".pre-star-wrap",
          { opacity: 0, scale: 0.7, duration: 0.5, ease: "power3.in" },
          "<"
        )
        .to(
          ".curtain-panel",
          {
            yPercent: -102,
            duration: 1.2,
            ease: "power4.inOut",
            stagger: { each: 0.06, from: "center" },
          },
          "-=0.1"
        )
        .to("#preloader", { opacity: 0, duration: 0.2 }, "-=1.1");
    }, rootRef);

    return () => ctx.revert();
  }, []);

  if (done) return null;

  return (
    <div ref={rootRef}>
      <div
        id="preloader"
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-7"
        style={{ backgroundColor: "#0a1628" }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(37,99,235,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="pre-star-wrap relative" style={{ width: 200, height: 200 }}>
          <img
            src="/logo.png"
            alt="شفاء"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        <div
          className="pre-logo-text"
          style={{
            fontFamily: "'Cairo', 'Tajawal', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(28px, 4vw, 40px)",
            color: "#e8edf5",
            letterSpacing: "0.08em",
          }}
        >
          <span style={{ color: "#3b82f6" }}>شفاء</span>
        </div>

        <div
          className="pre-tagline"
          style={{
            fontFamily: "'Cairo', 'Tajawal', sans-serif",
            fontWeight: 400,
            fontSize: "clamp(14px, 2vw, 18px)",
            color: "#60a5fa",
            textAlign: "center",
            maxWidth: 380,
            lineHeight: 1.8,
            opacity: 0,
            transform: "translateY(10px)",
          }}
        >
          منصة حجز المواعيد الطبية
        </div>

        <div
          className="pre-divider"
          style={{ width: 28, height: 1, background: "rgba(59,130,246,0.4)" }}
        />

        <div className="pre-counter-wrap flex flex-col items-center gap-3">
          <div
            style={{
              fontFamily: "'Cairo', 'Tajawal', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(56px, 10vw, 80px)",
              lineHeight: 1,
              color: "#e8edf5",
              letterSpacing: "-0.02em",
            }}
          >
            {count}
            <sup style={{ fontSize: "0.33em", verticalAlign: "super", color: "#3b82f6" }}>
              %
            </sup>
          </div>

          <div
            style={{
              fontFamily: "'Cairo', 'Tajawal', sans-serif",
              fontWeight: 300,
              fontSize: 10,
              letterSpacing: "0.4em",
              color: "rgba(232,237,245,0.35)",
              textTransform: "uppercase",
            }}
          >
            جاري التحميل
          </div>

          <div
            className="relative overflow-hidden"
            style={{ width: 140, height: 1, background: "rgba(59,130,246,0.1)" }}
          >
            <div
              className="pre-progress-fill absolute left-0 top-0 h-full"
              style={{
                width: 0,
                background: "linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6)",
                backgroundSize: "200%",
                animation: "shimmer 1.5s linear infinite",
              }}
            />
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-0 z-[190] flex">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="curtain-panel flex-1"
            style={{ backgroundColor: "#0a1628" }}
          />
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
}
