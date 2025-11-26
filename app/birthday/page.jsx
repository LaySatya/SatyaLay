"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { CalendarIcon, CakeIcon } from "@heroicons/react/24/outline";
import MainLayout from "../components/MainLayout";

export default function Birthday() {
  const [birthday, setBirthday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [daysUntil, setDaysUntil] = useState(0);

  useEffect(() => {
    const fetchBirthday = async () => {
      try {
        const bdayDoc = await getDoc(doc(db, "personal", "birthday"));
        if (bdayDoc.exists()) {
          setBirthday(bdayDoc.data());
          calculateDaysUntil(bdayDoc.data().date);
        }
      } catch (error) {
        console.error("Error fetching birthday:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBirthday();
  }, []);

  const calculateDaysUntil = (dateString) => {
    const today = new Date();
    const [month, day] = dateString.split("/").map(Number);
    const nextBirthday = new Date(today.getFullYear(), month - 1, day);

    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    const timeDiff = nextBirthday - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    setDaysUntil(daysDiff);
  };

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
            <CakeIcon className="h-12 w-12" />
            Birthday
          </h1>
          <div className="h-1 w-20 bg-primary rounded-full"></div>
        </div>

        {birthday ? (
          <div className="space-y-8">
            {/* Main Countdown Card */}
            <div className="card border border-base-300 bg-gradient-to-br from-primary to-secondary text-primary-content">
              <div className="card-body text-center py-16">
                <p className="text-2xl opacity-90">My Birthday is on</p>
                <p className="text-6xl font-bold my-4">{birthday.date}</p>
                <div className="divider"></div>
                <p className="text-3xl font-bold mt-6">
                  {daysUntil === 0 ? "🎉 Today! 🎉" : `${daysUntil} days to go!`}
                </p>
                <p className="text-lg opacity-90 mt-6">{birthday.message || "Celebrating life's special day!"}</p>
              </div>
            </div>

            {/* Birthday Traditions */}
            {birthday.traditions && (
              <div className="card border border-base-300">
                <div className="card-body">
                  <h3 className="card-title text-2xl mb-4">🎂 Birthday Traditions</h3>
                  <p className="leading-relaxed text-lg">{birthday.traditions}</p>
                </div>
              </div>
            )}

            {/* Birthday Stats */}
            <div className="stats stats-vertical lg:stats-horizontal shadow-lg border border-base-300 w-full">
              <div className="stat">
                <div className="stat-title">Next Birthday Date</div>
                <div className="stat-value text-primary">{birthday.date}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Days Remaining</div>
                <div className="stat-value text-primary">{daysUntil}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Celebration Status</div>
                <div className="stat-value text-primary">{daysUntil === 0 ? "Today!" : "Coming Soon"}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card border border-base-300">
            <div className="card-body text-center py-16">
              <p className="text-xl opacity-75">Birthday information not available yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>  
    </MainLayout>
        
  );
}