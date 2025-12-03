"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { TrophyIcon } from "@heroicons/react/24/outline";
import MainLayout from "../components/MainLayout";
import Image from "next/image";

function Pill({ children }) {
  return (
    <span className="px-3 py-1 rounded-full bg-base-200 text-sm font-semibold">{children}</span>
  );
}

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState(null); // for modal

  useEffect(() => {
    let mounted = true;
    const fetchAchievements = async () => {
      try {
        const achSnap = await getDocs(collection(db, "achievements"));
        const data = achSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        if (mounted) setAchievements(data);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAchievements();
    return () => (mounted = false);
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
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen py-4">
        <div className="max-w-6xl mx-auto">
 <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex gap-4">
            <TrophyIcon className="w-10 h-10 text-cyan-500" />
            Achievements
          </h1>
          <hr className="border-t border-2  border-cyan-500 grow w-10" />
           <p className="text-lg opacity-75 mt-4">
            A showcase of my accomplishments and recognitions.
            </p>
        </div>

          {/* filters */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            {Object.keys(categories).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full transition-colors font-semibold ${
                  activeCategory === cat ? "bg-cyan-500 text-white" : "bg-base-200 text-base-content"
                }`}
              >
                {cat} <span className="ml-2 text-sm opacity-70">{categories[cat]}</span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="card border border-base-300">
              <div className="card-body text-center py-16">
                <p className="text-xl opacity-75">No achievements in this category.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((a) => (
                <article
                  key={a.id}
                  className="card card-xl border border-base-300 p-4 flex flex-col gap-4  transition"
                >
                  <div className="flex items-center gap-4">
                    {a.imageUrl && /^https?:\/\//.test(a.imageUrl) ? (
                      <div className="h-12 w-12 flex items-center justify-center">
                        <Image src={a.imageUrl} alt={a.title} width={48} height={48} className="object-contain rounded" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded bg-base-200 flex items-center justify-center">🏆</div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{a.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Pill>{a.category || "Other"}</Pill>
                        <span className="text-sm opacity-70">{a.date}</span>
                      </div>
                      <p className="mt-2 text-sm opacity-80 line-clamp-3">{a.description}</p>
                      <div className="mt-3 flex items-center gap-3">
                        {a.issuer && <span className="text-xs opacity-60">By <strong>{a.issuer}</strong></span>}
                        <div className="ml-auto flex items-center gap-2">
                          {a.link && (
                            <a href={a.link} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                              View
                            </a>
                          )}
                          {a.imageUrl && (
                            <button onClick={() => setSelected(a)} className="btn btn-sm">
                              Preview
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Modal for selected achievement */}
          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-base-100 rounded-xl p-6 max-w-3xl w-full shadow-xl relative">
                <button className="absolute top-4 right-4 text-xl" onClick={() => setSelected(null)}>✕</button>
                <div className="flex gap-6 items-start">
                  <div className="w-1/3">
                    {selected.imageUrl ? (
                      <div className="relative h-48 w-full">
                        <Image src={selected.imageUrl} alt={selected.title} fill className="object-contain rounded" />
                      </div>
                    ) : (
                      <div className="h-48 w-full bg-base-200 rounded flex items-center justify-center">No image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{selected.title}</h2>
                    <p className="text-sm opacity-70 mt-1">{selected.date} • {selected.issuer}</p>
                    <p className="mt-4">{selected.description}</p>
                    {selected.downloadUrl && (
                      <a href={selected.downloadUrl} className="btn btn-primary mt-4" download>Download Certificate</a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}