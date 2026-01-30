"use client";

import { useEffect, useRef } from "react";

export default function RotatingStars() {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Generate stars
    const generateStars = () => {
      const stars = [];
      const starCount = 300;
      for (let i = 0; i < starCount; i++) {
        // Random position across the entire screen
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const angle = Math.atan2(y - canvas.height / 2, x - canvas.width / 2);
        const distance = Math.sqrt(Math.pow(x - canvas.width / 2, 2) + Math.pow(y - canvas.height / 2, 2));
        stars.push({
          x: x,
          y: y,
          angle: angle,
          distance: distance,
          size: Math.random() * 2 + 0.5,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
        });
      }
      starsRef.current = stars;
    };
    generateStars();

    let rotation = 0;

    // Draw function
    const draw = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update rotation
      rotation = time * 0.0002;

      // Draw stars rotating around center
      starsRef.current.forEach((star) => {
        const rotatedX = canvas.width / 2 + Math.cos(star.angle + rotation) * star.distance;
        const rotatedY = canvas.height / 2 + Math.sin(star.angle + rotation) * star.distance;

        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkle) * 0.5 + 0.5;
        const alpha = 0.4 + twinkle * 0.6;

        ctx.beginPath();
        ctx.arc(rotatedX, rotatedY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <>
      {/* Background rotating stars */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-50"
      />
      {/* Floating stars within content area */}
      <div className="fixed top-20 left-4 pointer-events-none z-0 opacity-30">
        <div className="animate-pulse text-yellow-300 text-xl">⭐</div>
      </div>
      <div className="fixed top-40 right-8 pointer-events-none z-0 opacity-30">
        <div className="animate-pulse text-yellow-300 text-lg" style={{ animationDelay: "0.5s" }}>✨</div>
      </div>
      <div className="fixed top-60 left-1/4 pointer-events-none z-0 opacity-25">
        <div className="animate-pulse text-white text-lg" style={{ animationDelay: "1s" }}>★</div>
      </div>
      <div className="fixed top-80 right-1/3 pointer-events-none z-0 opacity-30">
        <div className="animate-pulse text-yellow-300 text-xl" style={{ animationDelay: "0.3s" }}>⭐</div>
      </div>
      <div className="fixed bottom-40 left-8 pointer-events-none z-0 opacity-25">
        <div className="animate-pulse text-white text-lg" style={{ animationDelay: "0.7s" }}>✨</div>
      </div>
      <div className="fixed bottom-20 right-10 pointer-events-none z-0 opacity-30">
        <div className="animate-pulse text-yellow-300 text-xl" style={{ animationDelay: "1.2s" }}>★</div>
      </div>
    </>
  );
}

