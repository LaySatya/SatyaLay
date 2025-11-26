"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NewspaperIcon } from "@heroicons/react/24/outline";
import MainLayout from "../components/MainLayout";

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogsSnap = await getDocs(collection(db, "blogPosts"));
        setBlogs(blogsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
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
      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 flex items-center gap-3">
            <NewspaperIcon className="h-12 w-12" />
            Blog Posts
          </h1>
          <div className="h-1 w-20 bg-primary rounded-full"></div>
          <p className="text-lg opacity-75 mt-6">
            Thoughts, insights, and stories worth sharing.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="card border border-base-300">
            <div className="card-body text-center py-16">
              <p className="text-xl opacity-75">No blog posts yet. Check back soon!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div key={blog.id} className="card border border-base-300 hover:shadow-lg transition-all hover:scale-105">
                <div className="card-body">
                  <h3 className="card-title text-lg line-clamp-2">{blog.title}</h3>
                  <p className="text-sm opacity-60 mt-2">📅 {blog.date}</p>
                  <div className="divider my-2"></div>
                  <p className="opacity-75 line-clamp-3 text-sm">{blog.content}</p>
                  <div className="card-actions justify-end mt-4">
                    <a href={`/blog/${blog.id}`} className="btn btn-sm btn-primary">
                      Read More →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </MainLayout>
  );
}