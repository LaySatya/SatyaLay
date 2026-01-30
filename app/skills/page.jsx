"use client";

import { Suspense, useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import MainLayout from "../components/MainLayout";
import ClientLoading from "../components/ClientLoading";
import Image from "next/image";
import { CodeBracketIcon } from "@heroicons/react/24/outline";
import { useTranslations } from 'next-intl';

function SkillBar({ name, percent, imageUrl }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      {imageUrl && (
        <div className="h-8 w-8 relative">
          <Image src={imageUrl} alt={name} fill className="object-contain rounded" />
        </div>
      )}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-base font-medium">{name}</span>
          <span className="text-base font-medium">{percent}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
          <div
            className="bg-cyan-500 h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default function SkillsPage() {
  const t = useTranslations("skills");
  const tCommon = useTranslations("common");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const snap = await getDocs(collection(db, "skills"));
        setSkills(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching skills:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  // Group skills by category
  const grouped = skills.reduce((acc, skill) => {
    const cat = skill.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  if (loading) {
    return (
      <MainLayout>
       <Suspense>
       
               <ClientLoading />
               </Suspense>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-4 md:px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex gap-4">
            <CodeBracketIcon className="w-10 h-10 text-cyan-500" />
            {t('title')}
          </h1>
          <hr className="border-t border-2  border-cyan-500 grow w-10" />
          <p className="text-lg opacity-75 mt-4">
            {t('subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.keys(grouped).map((cat) => (
            <div key={cat} className="rounded-xl border border-base-300 md:p-8 p-4">
              <h2 className="text-2xl font-bold mb-6">{cat}</h2>
              {grouped[cat].length === 0 ? (
                <p className="text-base opacity-60">No skills found.</p>
              ) : (
                grouped[cat].map((skill) => (
                  <SkillBar key={skill.id} name={skill.name} percent={skill.level} imageUrl={skill.imageUrl} />
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}