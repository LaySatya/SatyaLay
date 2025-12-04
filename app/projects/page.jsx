"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import MainLayout from "../components/MainLayout";
import Image from "next/image";
import { ServerStackIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

// Format Firestore Timestamp safely
function formatDate(date) {
  if (!date) return "";
  if (date.toDate) return date.toDate().toLocaleDateString(); // Timestamp object
  return date; // Already a string
}

function Pill({ children }) {
  return (
    <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-semibold">
      {children}
    </span>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  // Fetch projects
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

  // Build categories
  const categories = useMemo(() => {
    const cats = { All: projects.length };
    projects.forEach((p) => {
      const c = p.category || "Other";
      cats[c] = (cats[c] || 0) + 1;
    });
    return cats;
  }, [projects]);

  // Filter by category
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex gap-4 items-center">
              <ServerStackIcon className="w-10 h-10 text-cyan-500" />
              Projects
            </h1>
            <hr className="border-t border-2 border-cyan-500 w-16" />
            <p className="text-lg opacity-75 mt-4">
              A collection of my professional and personal projects.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            {Object.keys(categories).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full transition-colors font-semibold ${
                  activeCategory === cat
                    ? "bg-cyan-500 text-white"
                    : "bg-base-200 text-base-content"
                }`}
              >
                {cat} <span className="ml-2 text-sm opacity-70">{categories[cat]}</span>
              </button>
            ))}
          </div>

          {/* Project Grid */}
          {filtered.length === 0 ? (
            <div className="card border border-base-300">
              <div className="card-body text-center py-16">
                <p className="text-xl opacity-75">No projects found.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((p) => (
                <article
                  key={p.id}
                  className="relative card border border-base-300 p-4 shadow-sm rounded-xl
                             hover:shadow-lg transition-all bg-base-100"
                >
                  {/* Image */}
                  {p.imageUrl ? (
                    <div className="w-full h-40 relative rounded-lg overflow-hidden bg-base-200">
                      <Image src={p.imageUrl} alt={p.title} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-40 rounded-lg bg-base-200 flex items-center justify-center">📦</div>
                  )}

                  {/* Content */}
                  <div className="mt-4">
                    <h3 className="text-xl font-bold">{p.title}</h3>

                    <p className="text-sm opacity-60 mt-1">
                      Duration: N/A
                    </p>

                    <p className="mt-3 text-sm opacity-80 line-clamp-3">
                      {p.description}
                    </p>

                    {/* Tech */}
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {(p.technologies || []).map((t, i) => (
                        <Pill key={i}>{t}</Pill>
                      ))}
                    </div>
                  </div>

                  {/* Preview Button - fixed position */}
                  <button
                    onClick={() => setSelected(p)}
                    className="btn btn-sm bg-cyan-500 text-white absolute bottom-4 right-4 rounded-lg shadow
                               hover:bg-cyan-600 transition"
                  >
                    Preview
                  </button>
                </article>
              ))}
            </div>
          )}

          {/* Preview Modal */}
          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="bg-base-100 rounded-xl p-8 max-w-4xl w-full shadow-xl relative">
                <button
                  className="absolute top-4 right-4 text-xl"
                  onClick={() => setSelected(null)}
                >
                  ✕
                </button>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Modal Image */}
                  <div className="w-full md:w-1/3">
                    {selected.imageUrl ? (
                      <div className="relative h-56 w-full rounded-lg overflow-hidden">
                        <Image
                          src={selected.imageUrl}
                          alt={selected.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-56 w-full bg-base-200 rounded-lg flex items-center justify-center">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Modal Content */}
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold">{selected.title}</h2>

                    <p className="opacity-70 text-sm mt-1">
                      {formatDate(selected.createdAt)}
                    </p>

                    <p className="mt-4">{selected.description}</p>

                    {/* Tech */}
                    <div className="mt-4 flex gap-2 flex-wrap">
                      {(selected.technologies || []).map((t, i) => (
                        <Pill key={i}>{t}</Pill>
                      ))}
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex gap-3">
                      {selected.url && (
                        <a
                          href={selected.url}
                          target="_blank"
                          className="btn bg-cyan-500 text-white"
                        >
                          Live Demo <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
                        </a>
                      )}
                      {selected.githubUrl && (
                        <a
                          href={selected.githubUrl}
                          target="_blank"
                          className="btn btn-ghost"
                        >
                          GitHub Repo
                        </a>
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
