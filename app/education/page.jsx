"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import MainLayout from "../components/MainLayout";

export default function Education() {
  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const eduSnap = await getDocs(collection(db, "educations"));
        setEducations(eduSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching education:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEducation();
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
            <AcademicCapIcon className="h-12 w-12" />
            Education
          </h1>
          <div className="h-1 w-20 bg-primary rounded-full"></div>
          <p className="text-lg opacity-75 mt-6">
            My academic background and qualifications.
          </p>
        </div>

        {educations.length === 0 ? (
          <div className="card border border-base-300">
            <div className="card-body text-center py-16">
              <p className="text-xl opacity-75">No education added yet.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {educations.map((edu) => (
              <div key={edu.id} className="card border border-base-300 bg-gradient-to-r from-base-100 to-base-200 hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <h3 className="card-title text-2xl">{edu.degree}</h3>
                  <p className="text-lg text-primary mt-1">{edu.school}</p>
                  <div className="divider my-2"></div>
                  <p className="text-sm opacity-70">📅 Graduated: <span className="font-bold">{edu.graduationYear}</span></p>
                  {edu.details && (
                    <p className="mt-4">{edu.details}</p>
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