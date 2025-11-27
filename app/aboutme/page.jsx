"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import Link from "next/link";
import MainLayout from "../components/MainLayout";
import {
  ArrowTopRightOnSquareIcon,
  EnvelopeIcon,
  CodeBracketIcon,
  SparklesIcon,
  GithubIcon,
  UserIcon,
  ArrowDownIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";


import ClientLoading from "../components/ClientLoading";

export default function AboutMe() {
  const [aboutMe, setAboutMe] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch about me data
        const aboutMeDocRef = doc(db, "aboutMe", "main");
        const aboutMeSnap = await getDoc(aboutMeDocRef);
        if (aboutMeSnap.exists()) {
          setAboutMe(aboutMeSnap.data());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        // delay for 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
          <div className="mt-5">
             <ClientLoading />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* About Me Section */}
          {aboutMe && (
            <div className="mb-12">
                     <h1 className="text-4xl font-bold mb-8 flex gap-4"><UsersIcon className="w-10 h-10"/>About</h1>
              <div className="card p-8 mb-12">
                <div className="flex flex-col md:flex-row gap-8">
                  {aboutMe.imageUrl && (
                    <div className="md:w-1/3 shrink-0">
                      <img 
                        src={aboutMe.imageUrl} 
                        alt={`${aboutMe.firstName} ${aboutMe.lastName}`}
                        className="w-full h-auto rounded-lg object-cover shadow-lg"
                      />
                    </div>
                  )}
                  <div className="md:flex-1">
                    <h3 className="text-3xl font-bold mb-1">
                      {aboutMe.firstName} {aboutMe.lastName}
                    </h3>
                    <p className="text-xl font-semibold text-cyan-500 mb-3">{aboutMe.position}</p>
                    <p className="text-md text-base-content opacity-90 mb-4 leading-relaxed">{aboutMe.description}</p>
                    
                    {/* Social Links with Icons Only */}
                    <div className="flex gap-3 mb-4 flex-wrap">
                      {aboutMe.socialLinks?.github && (
                        <a 
                          href={aboutMe.socialLinks.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-500 transition-all"
                          aria-label="GitHub"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </a>
                      )}
                      {aboutMe.socialLinks?.linkedin && (
                        <a 
                          href={aboutMe.socialLinks.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-500 transition-all"
                          aria-label="LinkedIn"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.731-2.004 1.436-.103.249-.129.597-.129.946v5.423h-3.554s.047-8.789 0-9.708h3.554v1.375c.427-.659 1.191-1.594 2.897-1.594 2.117 0 3.704 1.388 3.704 4.37v5.557zM5.337 8.855c-1.144 0-1.915-.759-1.915-1.71 0-.954.767-1.71 1.958-1.71 1.191 0 1.915.756 1.938 1.71 0 .951-.747 1.71-1.981 1.71zm1.581 11.597H3.715V9.644h3.203v10.808zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                          </svg>
                        </a>
                      )}
                      {aboutMe.socialLinks?.facebook && (
                        <a 
                          href={aboutMe.socialLinks.facebook} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-500 transition-all"
                          aria-label="Facebook"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </a>
                      )}
                      {aboutMe.socialLinks?.telegram && (
                        <a 
                          href={aboutMe.socialLinks.telegram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-500 transition-all"
                          aria-label="Telegram"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.365-1.337.366-.434 0-1.269-.195-1.895-.364-.577-.17-1.032-.533-1.10-1.126-.025-.137-.024-.266-.024-.266s.027-.203.105-.313c.077-.108.256-.278.543-.417 2.324-1.132 4.647-2.263 6.97-3.395.528-.256 1.044-.514 1.57-.77.528-.257 1.578-.518 2.002-.518zm0 0"/>
                          </svg>
                        </a>
                      )}
                    </div>
                      <div className="flex gap-4 mt-4">
                      {/* Modern Resume Button with Glassmorphism */}
                      {aboutMe.resumeUrl && (
                        <a
                          href={aboutMe.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn shadow-lg border border-cyan-400 text-cyan-500 font-semibold hover:bg-cyan-500/80 hover:text-white transition-all duration-100"
                        >
                          <ArrowDownIcon className="h-6 w-6" />
                          <span className="tracking-wide">Download CV</span>
                        </a>
                      )}
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