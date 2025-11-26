"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { TrophyIcon } from "@heroicons/react/24/outline";
import MainLayout from "../components/MainLayout";
export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const achSnap = await getDocs(collection(db, "achievements"));
        setAchievements(achSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
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
              <TrophyIcon className="h-12 w-12" />
              Achievements
            </h1>
            <div className="h-1 w-20 bg-primary rounded-full"></div>
            <p className="text-lg opacity-75 mt-6">
              Awards, certifications, and accomplishments.
            </p>
          </div>

          {achievements.length === 0 ? (
            <div className="card border border-base-300">
              <div className="card-body text-center py-16">
                <p className="text-xl opacity-75">No achievements added yet.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="card border border-base-300 hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-amber-50 to-base-100 dark:from-base-200 dark:to-base-300">
                  <div className="card-body">
                    <div className="text-4xl mb-3">🏆</div>
                    <h3 className="card-title text-lg">{achievement.title}</h3>
                    <p className="text-sm opacity-60 mt-2">📅 {achievement.date}</p>
                    <p className="opacity-75 text-sm mt-3">{achievement.description}</p>
                    {achievement.issuer && (
                      <p className="text-xs opacity-50 mt-4">By: <span className="font-bold">{achievement.issuer}</span></p>
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