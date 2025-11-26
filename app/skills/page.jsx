"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { SparklesIcon } from "@heroicons/react/24/outline";
import MainLayout from "../components/MainLayout";

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skillsSnap = await getDocs(collection(db, "skills"));
        setSkills(skillsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching skills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <MainLayout>
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 flex items-center gap-3">
            <SparklesIcon className="h-12 w-12" />
            My Skills
          </h1>
          <div className="h-1 w-20 bg-primary rounded-full"></div>
          <p className="text-lg opacity-75 mt-6">
            Technical expertise and professional capabilities.
          </p>
        </div>

        {skills.length === 0 ? (
          <div className="card border border-base-300">
            <div className="card-body text-center py-16">
              <p className="text-xl opacity-75">No skills added yet.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => (
              <div key={skill.id} className="card border border-base-300 hover:shadow-lg transition-shadow hover:scale-105">
                <div className="card-body">
                  <h3 className="card-title text-xl mb-2">{skill.name}</h3>
                  <div className="divider my-2"></div>
                  <p className="text-sm opacity-75">Level: <span className="font-bold text-primary">{skill.proficiency || "Expert"}</span></p>
                  {skill.description && (
                    <p className="text-sm mt-3">{skill.description}</p>
                  )}
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