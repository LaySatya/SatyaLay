"use client";

import ProtectedRoute from "@/app/admin/components/ProtectedRoute";
import AdminLayout from "../components/AdminLayout";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import {
  CubeIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  SparklesIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

function StatCard({ title, count, icon: Icon, className, loading }) {
  return (
    <div className={`border border-cyan-500  rounded-xl p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-300">{title}</div>
          <div className="mt-1 text-2xl font-bold">{loading ? <span className="inline-block w-20 h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /> : count}</div>
        </div>
        <div className="p-3 bg-cyan-50 dark:bg-cyan-900/10 rounded-lg">
          <Icon className="w-7 h-7 text-cyan-600" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [counts, setCounts] = useState({
    projects: 0,
    blogs: 0,
    skills: 0,
    experience: 0,
    education: 0,
    about: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchCounts() {
      setLoading(true);
      try {
        // Collections to count
        const collections = [
          { key: "projects", name: "projects" },
          { key: "blogs", name: "blogPosts" },
          { key: "skills", name: "skills" },
          { key: "experience", name: "experiences" },
          { key: "education", name: "educations" },
        ];

        const nextCounts = {};

        // Fetch counts for collections
        await Promise.all(
          collections.map(async (c) => {
            try {
              const snap = await getDocs(collection(db, c.name));
              nextCounts[c.key] = snap.size || 0;
            } catch (err) {
              console.warn("Failed to fetch", c.name, err);
              nextCounts[c.key] = 0;
            }
          })
        );

        // about — single doc "aboutMe/main"
        try {
          const aboutDoc = await getDoc(doc(db, "aboutMe", "main"));
          nextCounts.about = aboutDoc.exists() ? 1 : 0;
        } catch {
          nextCounts.about = 0;
        }

        if (mounted) {
          setCounts((prev) => ({ ...prev, ...nextCounts }));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchCounts();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of your content and quick actions.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Projects" count={counts.projects} icon={CubeIcon} loading={loading} />
          <StatCard title="Blog posts" count={counts.blogs} icon={DocumentTextIcon} loading={loading} />
          <StatCard title="About entries" count={counts.about} icon={PencilSquareIcon} loading={loading} />
          <StatCard title="Skills" count={counts.skills} icon={SparklesIcon} loading={loading} />
          <StatCard title="Experience" count={counts.experience} icon={Cog6ToothIcon} loading={loading} />
          <StatCard title="Education" count={counts.education} icon={AcademicCapIcon} loading={loading} />
        </div>

        {/* <section className="mt-6">
          <div className="bg-white dark:bg-base-100 border border-gray-100 dark:border-base-300 rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <p className="text-sm text-gray-500 mt-2">Quick links and recent changes will show here. You can attach charts or more widgets as needed.</p>
          </div>
        </section> */}
      </AdminLayout>
    </ProtectedRoute>
  );
}
