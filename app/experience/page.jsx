"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { CalendarIcon } from "@heroicons/react/24/outline";
import MainLayout from "../components/MainLayout";

export default function Experience() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const expSnap = await getDocs(collection(db, "experiences"));
        setExperiences(expSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching experience:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 flex items-center gap-3">
            <CalendarIcon className="h-12 w-12" />
            Experience
          </h1>
          <div className="h-1 w-20 bg-primary rounded-full"></div>
          <p className="text-lg opacity-75 mt-6">
            My professional journey and work history.
          </p>
        </div>

        {experiences.length === 0 ? (
          <div className="card border border-base-300">
            <div className="card-body text-center py-16">
              <p className="text-xl opacity-75">No experience added yet.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <div key={exp.id} className="card border border-base-300 hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="card-title text-2xl">{exp.jobTitle}</h3>
                      <p className="text-lg text-primary mt-1">{exp.company}</p>
                      <p className="text-sm opacity-60 mt-2">
                        📅 {exp.startDate} - {exp.endDate || "Present"}
                      </p>
                    </div>
                    <div className="badge badge-lg">{index + 1}</div>
                  </div>
                  <div className="divider my-4"></div>
                  <p className="leading-relaxed">{exp.description}</p>
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