"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import MainLayout from "../components/MainLayout";
import ClientLoading from "../components/ClientLoading";
import { BuildingOfficeIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoModal, setLogoModal] = useState({ open: false, url: "", company: "" });

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const snap = await getDocs(collection(db, "experiences"));
        setExperiences(
          snap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        );
      } catch (error) {
        console.error("Error fetching experiences:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExperiences();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <ClientLoading />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-12 md:px-4">
        <h1 className="text-4xl font-bold mb-8 flex gap-4">
          <BuildingOfficeIcon className="w-10 h-10" /> Experience
        </h1>
        <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
          {experiences.map((exp, idx) => (
            <li key={exp.id || idx}>
              {idx !== 0 && <hr />}
              <div className="timeline-middle">
                {/* Timeline icon only, logo shown in modal */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className={idx % 2 === 0 ? "timeline-start mb-10 md:text-end" : "timeline-end md:mb-10"}>
                <div className="flex flex-col md:items-end gap-2 px-4">
                  <time className="font-mono italic text-sm">
                    {exp.startDate} - {exp.endDate || "Present"}
                  </time>
                  <div className="flex items-center gap-2 mt-2">
                    {/* Removed position */}
                    <span className="text-base text-cyan-500 font-semibold">{exp.role}</span>
                  </div>
                  {/* Company name in white, logo popup trigger as separate text */}
                  <span className="font-normal hover:underline cursor-pointer duration-75" onClick={() => setLogoModal({ open: true, url: exp.logoUrl, company: exp.company })}>{exp.company}</span>
                  {/* <button
                    className="text-base font-semibold underline text-cyan-600 hover:text-cyan-800 transition-all ml-2"
                    onClick={() => setLogoModal({ open: true, url: exp.logoUrl, company: exp.company })}
                  >
                    Company Logo
                  </button> */}
                  {exp.description && <div className="mt-2 text-sm opacity-80">{exp.description}</div>}
                  {exp.technologies && Array.isArray(exp.technologies) && exp.technologies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {exp.technologies.map((tech, i) => (
                        <span key={i} className="badge badge-outline badge-sm bg-base-200 text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <hr />
            </li>
          ))}
        </ul>
        {/* Logo Modal */}
        {logoModal.open && logoModal.url && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-xl p-8 shadow-xl relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                onClick={() => setLogoModal({ open: false, url: "", company: "" })}
              >
                ✕
              </button>
              <h2 className="text-xl font-bold mb-4 text-center">{logoModal.company} Logo</h2>
              <div className="flex items-center justify-center">
                <div className="h-32 w-32 relative">
                  <Image src={logoModal.url} alt={logoModal.company} fill className="object-contain rounded" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}