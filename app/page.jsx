"use client";

import MainLayout from "./components/MainLayout";
import { ArrowTopRightOnSquareIcon, SparklesIcon, UserIcon } from "@heroicons/react/24/outline";
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations("home");
  const tNav = useTranslations("nav");
  
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
                <span className="block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">{t('welcome')}</span>
                <span className="block">{t('welcomeSubtitle')}</span>
              </h1>

              {/* Rotating Text */}
              <div className="mt-6">
                <span className="text-rotate text-4xl md:text-6xl leading-[2] font-bold text-cyan-500">
                  <span className="justify-items-center">
                    <span>📐 {t('tagline').split(',')[0]}</span>
                    <span>⌨️ {t('tagline').split(',')[1]}</span>
                    <span>🌎 {t('tagline').split(',')[2]}</span>
                    <span>🌱 {t('tagline').split(',')[3]}</span>
                    <span>🔧 {t('tagline').split(',')[4]}</span>
                    <span>♻️ {t('tagline').split(',')[5]}</span> 
                  </span>
                </span>
              </div>

              {/* Subtitle */}
              <p className="mt-6 text-base opacity-70 max-w-xl mx-auto">
                {t('description')}
              </p>

              {/* Buttons */}
              <div className="flex justify-center gap-3 mt-8">
                <a href="/aboutme" className="btn btn-outline btn-info"> 
                <UserIcon className="inline-block w-5 h-5" />
                  {t('aboutMe')}
                </a>
                <a href="/projects" className="btn btn-outline">
                  <ArrowTopRightOnSquareIcon className="inline-block w-5 h-5" />
                  {t('viewProjects')}
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
