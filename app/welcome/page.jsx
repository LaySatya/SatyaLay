"use client";
import MainLayout from "../components/MainLayout";

export default function Welcome() {
  return (
    <MainLayout>
      <div className="relative flex flex-col items-center justify-center min-h-[80vh] py-12 px-4 bg-gradient-to-br from-cyan-400 via-blue-200 to-purple-300 overflow-hidden">
        {/* Animated headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-fade-in drop-shadow-xl">
          Welcome to <span className="underline decoration-wavy decoration-cyan-400">SatyaLay</span>
        </h1>
        {/* Rotating text block */}
        <div className="rounded-3xl shadow-2xl p-10 bg-white/40 backdrop-blur-lg border border-cyan-300 flex flex-col items-center animate-fade-in-up">
          <span className="text-7xl font-black text-center text-cyan-700 tracking-tight space-y-2">
            <span className="grid gap-2 justify-items-center">
              <span className="transition-transform duration-500 hover:scale-110">📐 DESIGN</span>
              <span className="transition-transform duration-500 hover:scale-110">⌨️ DEVELOP</span>
              <span className="transition-transform duration-500 hover:scale-110">🌎 DEPLOY</span>
              <span className="transition-transform duration-500 hover:scale-110">🌱 SCALE</span>
              <span className="transition-transform duration-500 hover:scale-110">🔧 MAINTAIN</span>
              <span className="transition-transform duration-500 hover:scale-110">♻️ REPEAT</span>
            </span>
          </span>
        </div>
        {/* Call to action button */}
        <a href="/aboutme" className="mt-12 px-8 py-4 rounded-full bg-cyan-500 text-white text-xl font-bold shadow-lg hover:bg-cyan-600 transition-all animate-bounce">
          Discover My Work
        </a>
        {/* Simple fade-in keyframes */}
        <style jsx>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 1s ease-out; }
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 1.2s 0.2s ease-out both; }
        `}</style>
      </div>
    </MainLayout>
  );
}
