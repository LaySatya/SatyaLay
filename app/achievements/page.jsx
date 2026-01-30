"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { TrophyIcon } from "@heroicons/react/24/outline";
import MainLayout from "../components/MainLayout";
import Image from "next/image";

function Pill({ children }) {
  return (
    <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-semibold">
      {children}
    </span>
  );
}

export default function Achievements() {
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
        <Suspense>

        <div className="min-h-screen flex items-center justify-center">
          <span className="loading loading-bars loading-lg"></span>
        </div>
        </Suspense>
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
              Achievements
            </h1>
            <hr className="border-t-2 border-cyan-500 w-10" />
            <p className="text-lg opacity-70 mt-4">
              A collection of my milestones, awards, and recognitions.
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
                  <div className="flex items-start gap-4">
                    {a.imageUrl ? (
                      <img
                        src={a.imageUrl}
                        alt={a.title}
                        width={56}
                        height={56}
                        className="rounded-lg shadow object-cover"
                      />
                    ) 
                    : (
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
              <div className="modal-box max-w-3xl p-6 rounded-xl">
                <form method="dialog">
                  <button
                    className="btn btn-sm btn-circle absolute right-4 top-4"
                    onClick={() => setSelected(null)}
                  >
                    ✕
                  </button>
                </form>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    {selected.imageUrl ? (
                      <div className="relative h-48 w-full">
                        <img
                          src={selected.imageUrl}
                          alt={selected.title}
                          fill
                          className="object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="h-48 w-full bg-base-200 rounded-lg flex items-center justify-center">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-3xl font-bold">{selected.title}</h2>
                    <p className="text-sm opacity-70 mt-1">
                      {selected.date} • {selected.issuer}
                    </p>

                    <p className="mt-4 leading-relaxed text-base">
                      {selected.description}
                    </p>

                    {selected.downloadUrl && (
                      <a
                        href={selected.downloadUrl}
                        className="btn btn-primary mt-6"
                        download
                      >
                        Download Certificate
                      </a>
                    )}
                  </div>
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
