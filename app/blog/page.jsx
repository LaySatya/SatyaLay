"use client";

import { Suspense, useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import MainLayout from "../components/MainLayout";
import { NewspaperIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import ClientLoading from "../components/ClientLoading";
// Small pill component
function Pill({ children }) {
  return (
    <span className="px-3 py-1 rounded-full bg-base-200 text-sm font-semibold">
      {children}
    </span>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  // Fetch blog posts
  useEffect(() => {
    let mounted = true;

    const fetchPosts = async () => {
      try {
        const snap = await getDocs(collection(db, "blogPosts"));
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (mounted) setPosts(data);
      } catch (err) {
        console.error("Error fetching blog posts:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPosts();
    return () => (mounted = false);
  }, []);

  // Loading indicator
  if (loading) {
    return (
      <MainLayout>
        <Suspense>

        <ClientLoading/>
        </Suspense>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen py-10 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-4">
              <NewspaperIcon className="w-10 h-10 text-cyan-500" />
              Blog
            </h1>
            <hr className="border-t-2 border-cyan-500 w-20" />
            <p className="text-lg opacity-75 mt-4">
              Insights, stories, and updates from my journey.
            </p>
          </div>

          {/* No posts */}
          {posts.length === 0 ? (
            <div className="card border border-base-300">
              <div className="card-body text-center py-16">
                <p className="text-xl opacity-75">No blog posts yet.</p>
              </div>
            </div>
          ) : (
            // Modern Cards Grid
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => setSelected(post)}
                  className="group cursor-pointer rounded-xl bg-base-100/70 backdrop-blur border border-base-200 shadow-sm hover:shadow-xl transition duration-300 overflow-hidden"
                >
                  {/* Image section */}
                  <div className="relative h-48 w-full overflow-hidden">
                    {post.imageUrl ? (
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-500"
                      />
                    ) : (
                      <div className="h-full w-full bg-base-200 flex items-center justify-center text-4xl">
                        📝
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300">
                        {post.category || "General"}
                      </span>
                      <span className="text-xs opacity-70">{post.date}</span>
                    </div>

                    <h3 className="text-lg font-semibold group-hover:text-cyan-500 transition duration-300">
                      {post.title}
                    </h3>

                    <p className="mt-2 text-sm opacity-80 line-clamp-3">
                      {post.excerpt || post.content}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      {post.author && (
                        <span className="text-xs opacity-70">
                          By <strong>{post.author}</strong>
                        </span>
                      )}
                      <button className="btn btn-sm btn-outline">
                        Read More
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* ---- MODAL ---- */}
          {selected && (
            <dialog open className="modal">
              <div className="modal-box max-w-4xl p-0 overflow-hidden">

                {/* IMAGE HEADER */}
                <div className="relative h-64 w-full bg-base-200">
                  {selected.imageUrl ? (
                    <Image
                      src={selected.imageUrl}
                      alt={selected.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      No Image
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-8 relative">
                  <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
                    onClick={() => setSelected(null)}
                  >
                    ✕
                  </button>

                  <h2 className="text-3xl font-bold mb-2">{selected.title}</h2>
                  <p className="opacity-70 text-sm mb-4">
                    {selected.date} • {selected.author}
                  </p>

                  {/* Tags */}
                  {selected.tags?.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-4">
                      {selected.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-base-200 text-xs font-semibold"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Full content */}
                  <article className="prose prose-neutral max-w-none">
                    {selected.content}
                  </article>
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
