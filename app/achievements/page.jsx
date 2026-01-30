"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { TrophyIcon } from "@heroicons/react/24/outline";
import MainLayout from "../components/MainLayout";
import Image from "next/image";
import { useTranslations } from "next-intl";

function Pill({ children }) {
  return (
    <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-semibold">
      {children}
    </span>
  );
}

export default function Achievements() {
  const t = useTranslations("achievements");
  const tCommon = useTranslations("common");
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const achSnap = await getDocs(collection(db, "achievements"));
        const data = achSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAchievements(data);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const categories = useMemo(() => {
    const cats = { All: achievements.length };
    achievements.forEach((a) => {
      const cat = a.category || "Other";
      cats[cat] = (cats[cat] || 0) + 1;
    });
    return cats;
  }, [achievements]);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return achievements;
    return achievements.filter((a) => (a.category || "Other") === activeCategory);
  }, [achievements, activeCategory]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <span className="loading loading-bars loading-lg"></span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <TrophyIcon className="w-10 h-10 text-cyan-500" />
              {t('title')}
            </h1>
            <hr className="border-t-2 border-cyan-500 w-10" />
            <p className="text-lg opacity-70 mt-4">
              {t('subtitle')}
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {Object.keys(categories).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm border
                  ${
                    activeCategory === cat
                      ? "bg-cyan-500 text-white border-cyan-500 shadow-md"
                      : "bg-base-100 border-base-300 hover:bg-base-200"
                  }
                `}
              >
                {cat}{" "}
                <span className="ml-2 opacity-70">({categories[cat]})</span>
              </button>
            ))}
          </div>

          {/* Achievement Cards */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 opacity-70 text-xl">No achievements found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((a) => (
                <article
                  key={a.id}
                  className="card border border-base-300 bg-base-100 shadow-sm hover:shadow-xl transition-all rounded-xl p-8 cursor-pointer"
                  onClick={() => setSelected(a)}
                >
                  <div className="flex flex-col gap-4">
                    {a.imageUrl ? (
                      <div className="relative h-40 w-full rounded-xl overflow-hidden shadow-md">
                        <Image
                          src={a.imageUrl}
                          alt={a.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      null
                    )}

                    <div>
                      <h3 className="text-lg font-semibold leading-tight">
                        {a.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Pill>{a.category || "Other"}</Pill>
                        <span className="text-xs opacity-70">{a.date}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm opacity-70 mt-4 line-clamp-3">{a.description}</p>

                  <div className="mt-4 flex justify-end">
                    <button className="btn btn-sm btn-outline">View Details</button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Modal */}
          {selected && (
            <dialog open className="modal modal-open">
              <div className="modal-box max-w-5xl w-full p-0 rounded-xl overflow-hidden">
                <form method="dialog">
                  <button
                    className="btn btn-sm btn-circle absolute right-4 top-4 z-10 bg-base-100/80"
                    onClick={() => setSelected(null)}
                  >
                    ✕
                  </button>
                </form>

                {/* Full width image header */}
                {selected.imageUrl ? (
                  <div className="relative h-[400px] w-full">
                    <Image
                      src={selected.imageUrl}
                      alt={selected.title}
                      fill
                      className="object-contain bg-base-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>
                ) : (
                  <div className="h-[200px] w-full bg-base-200 flex items-center justify-center">
                    <span className="text-6xl">🏆</span>
                  </div>
                )}

                {/* Content below image */}
                <div className="p-8">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <Pill>{selected.category || "Other"}</Pill>
                    <span className="text-sm opacity-70">{selected.date}</span>
                    {selected.issuer && (
                      <span className="text-sm opacity-70">• {selected.issuer}</span>
                    )}
                  </div>

                  <h2 className="text-4xl font-bold mb-4">{selected.title}</h2>

                  <p className="mt-4 leading-relaxed text-lg">
                    {selected.description}
                  </p>

                  {selected.downloadUrl && (
                    <a
                      href={selected.downloadUrl}
                      className="btn btn-primary mt-8"
                      download
                    >
                      Download Certificate
                    </a>
                  )}
                </div>
              </div>

              <form method="dialog" className="modal-backdrop">
                <button onClick={() => setSelected(null)}>close</button>
              </form>
            </dialog>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
