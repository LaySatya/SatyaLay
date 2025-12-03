"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { BriefcaseIcon, ChevronDoubleRightIcon, WalletIcon } from "@heroicons/react/24/outline";
import MainLayout from "../components/MainLayout";
import PageHeader from "../components/PageHeader";
import Image from "next/image";
import { ServerStackIcon } from "@heroicons/react/24/outline";

function Pill({ children }) {
  return (
    <span className="px-3 py-1 rounded-full bg-base-200 text-sm font-semibold">{children}</span>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchProjects = async () => {
      try {
        const snap = await getDocs(collection(db, "projects"));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (mounted) setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProjects();
    return () => (mounted = false);
  }, []);

  const categories = useMemo(() => {
    const cats = { All: projects.length };
    projects.forEach((p) => {
      const c = p.category || "Other";
      cats[c] = (cats[c] || 0) + 1;
    });
    return cats;
  }, [projects]);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return projects;
    return projects.filter((p) => (p.category || "Other") === activeCategory);
  }, [projects, activeCategory]);

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
      <div className="min-h-screen py-6">
        <div className="max-w-6xl mx-auto">
         <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex gap-4">
            <ServerStackIcon className="w-10 h-10 text-cyan-500" />
            Project
          </h1>
          <hr className="border-t border-2  border-cyan-500 grow w-10" />
            <p className="text-lg opacity-75 mt-4">
              This page showcases my personal and professional projects that I have worked on over the years.
            </p>
        </div>

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
                <p className="text-xl opacity-75">No projects found.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <article key={p.id} className="card border border-base-300 p-4 flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    {p.imageUrl && /^https?:\/\//.test(p.imageUrl) ? (
                      <div className="h-32 w-32 relative rounded overflow-hidden bg-base-200">
                        <Image src={p.imageUrl} alt={p.title} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-32 w-32 rounded bg-base-200 flex items-center justify-center">📦</div>
                    )}

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{p.title}</h3>
                      <p className="mt-2 text-sm opacity-80 line-clamp-3">{p.description}</p>
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        {(p.tech || []).slice(0, 5).map((t, i) => (
                          <Pill key={i}>{t}</Pill>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        {p.liveUrl && (
                          <a href={p.liveUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                            Live
                          </a>
                        )}
                        {p.repoUrl && (
                          <a href={p.repoUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                            Repo
                          </a>
                        )}
                        <button onClick={() => setSelected(p)} className="btn btn-sm ml-auto">
                          Preview
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-base-100 rounded-xl p-6 max-w-4xl w-full shadow-xl relative">
                <button className="absolute top-4 right-4 text-xl" onClick={() => setSelected(null)}>✕</button>
                <div className="flex gap-6 items-start flex-col md:flex-row">
                  <div className="w-full md:w-1/3">
                    {selected.imageUrl ? (
                      <div className="relative h-56 w-full">
                        <Image src={selected.imageUrl} alt={selected.title} fill className="object-contain rounded" />
                      </div>
                    ) : (
                      <div className="h-56 w-full bg-base-200 rounded flex items-center justify-center">No image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{selected.title}</h2>
                    <p className="text-sm opacity-70 mt-1">{selected.category} • {selected.year || selected.date}</p>
                    <p className="mt-4">{selected.description}</p>
                    <div className="mt-4 flex items-center gap-3">
                      {selected.liveUrl && (
                        <a href={selected.liveUrl} target="_blank" rel="noreferrer" className="btn btn-primary">Open Live</a>
                      )}
                      {selected.repoUrl && (
                        <a href={selected.repoUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">View Repo</a>
                      )}
                    </div>
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
