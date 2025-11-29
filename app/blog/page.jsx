"use client";

//import { useEffect, useState } from "react";
//import MainLayout from "../../components/MainLayout";
//import { HeartIcon as HeartOutline, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
//import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
//import MainLayout from "../components/MainLayout";




import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import MainLayout from "../components/MainLayout";
import Image from "next/image";


function Pill({ children }) {
  return (
    <span className="px-3 py-1 rounded-full bg-base-200 text-sm font-semibold">{children}</span>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchPosts = async () => {
      try {
        const snap = await getDocs(collection(db, "blogPosts"));
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        if (mounted) setPosts(data);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPosts();
    return () => (mounted = false);
  }, []);

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
            <h1 className="text-2xl md:text-5xl font-extrabold mb-4 flex items-center gap-3">
              Blog
            </h1>
            <p className="text-lg opacity-75 mt-2">Latest posts, tips, and stories from Satya Lay.</p>
          </div>

          {posts.length === 0 ? (
            <div className="card border border-base-300">
              <div className="card-body text-center py-16">
                <p className="text-xl opacity-75">No blog posts yet.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="card card-xl border border-base-300 p-4 flex flex-col gap-4 transition"
                >
                  <div className="flex items-center gap-4">
                    {post.imageUrl && /^https?:\/\//.test(post.imageUrl) ? (
                      <div className="h-12 w-12 flex items-center justify-center">
                        <Image src={post.imageUrl} alt={post.title} width={48} height={48} className="object-contain rounded" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded bg-base-200 flex items-center justify-center">📝</div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{post.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Pill>{post.category || "General"}</Pill>
                        <span className="text-sm opacity-70">{post.date}</span>
                      </div>
                      <p className="mt-2 text-sm opacity-80 line-clamp-3">{post.excerpt || post.content}</p>
                      <div className="mt-3 flex items-center gap-3">
                        {post.author && <span className="text-xs opacity-60">By <strong>{post.author}</strong></span>}
                        <div className="ml-auto flex items-center gap-2">
                          <button onClick={() => setSelected(post)} className="btn btn-ghost btn-sm">Read</button>
                          {post.imageUrl && (
                            <button onClick={() => setSelected(post)} className="btn btn-sm">Preview</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Modal for selected blog detail */}
          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-base-100 rounded-xl p-8 max-w-5xl w-full shadow-xl relative lg:p-12">
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
                    <h2 className="text-2xl font-bold mb-2">{selected.title}</h2>
                    <p className="text-sm opacity-70 mb-2">{selected.date} • {selected.author}</p>
                    <div className="mb-4">
                      {selected.tags && Array.isArray(selected.tags) && (
                        <div className="flex gap-2 flex-wrap mb-2">
                          {selected.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded bg-base-200 text-xs font-semibold">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="prose max-w-none">
                      {selected.content || selected.excerpt}
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