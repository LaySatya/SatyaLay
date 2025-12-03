"use client";

import MainLayout from "./components/MainLayout";
import { ArrowTopRightOnSquareIcon, SparklesIcon, UserIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <MainLayout>
      <div className="mx-auto">
        <div className="hero rounded-xl p-8 w-full">
          <div className="hero-content text-center">
            <div className="max-w-3xl">
              {/* Animated Icon */}
              <SparklesIcon className="w-14 h-14 mx-auto text-cyan-500 animate-pulse mb-6" />

              {/* Welcome Title */}
              <h1 className="text-5xl font-bold mb-4">
                Welcome to{" "}
                <span className="text-cyan-500">SATYA Portfolio</span>
              </h1>

              {/* Rotating Text */}
              <div className="mt-6">
                <span className="text-rotate text-4xl md:text-6xl leading-[2] font-bold text-cyan-500">
                  <span className="justify-items-center">
                    <span>📐 DESIGN</span>
                    <span>⌨️ DEVELOP</span>
                    <span>🌎 DEPLOY</span>
                    <span>🌱 SCALE</span>
                    <span>🔧 MAINTAIN</span>
                    <span>♻️ REPEAT</span>
                  </span>
                </span>
              </div>

              {/* Subtitle */}
              <p className="mt-6 text-base opacity-70 max-w-xl mx-auto">
                Explore my journey, projects, experience, and everything I love building.
              </p>

              {/* Buttons */}
              <div className="flex justify-center gap-3 mt-8">
                <a href="/aboutme" className="btn btn-outline btn-info"> 
                <UserIcon className="inline-block w-5 h-5" />
                  Get to know me
                </a>
                <a href="/projects" className="btn btn-outline">
                  <ArrowTopRightOnSquareIcon className="inline-block w-5 h-5" />
                  View Projects
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
