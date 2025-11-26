"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  limit,
} from "firebase/firestore";
import Link from "next/link";
import MainLayout from "../components/MainLayout";
import {
  ArrowTopRightOnSquareIcon,
  EnvelopeIcon,
  CodeBracketIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import ClientLoading from "../components/ClientLoading";

export default function AboutMe() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsSnap = await getDocs(collection(db, "projects"));
        setProjects(projectsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        // delay for 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setLoading(false);
      }
    };

    fetchProjects();
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
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 flex items-center gap-3">
            <CodeBracketIcon className="h-12 w-12" />
            My Projects
          </h1>
          <p className="text-lg opacity-75 mb-12">
            Explore my latest projects and work.
          </p>

          {projects.length === 0 ? (
            <div className="card border border-base-300">
              <div className="card-body text-center">
                <p className="opacity-75">No projects yet. Check back soon!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="card border border-base-300 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {project.imageUrl && (
                    <figure className="h-48 overflow-hidden bg-base-200">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </figure>
                  )}
                  <div className="card-body">
                    <h3 className="card-title">{project.title}</h3>
                    <p className="opacity-75">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {project.technologies && (
                        Array.isArray(project.technologies)
                          ? project.technologies.map((tech, idx) => (
                              <span key={idx} className="badge badge-outline">
                                {tech}
                              </span>
                            ))
                          : project.technologies.split(",").map((tech, idx) => (
                              <span key={idx} className="badge badge-outline">
                                {tech.trim()}
                              </span>
                            ))
                      )}
                    </div>
                    <div className="card-actions justify-end mt-4">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-primary"
                        >
                          Live Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-primary"
                        >
                          GitHub
                        </a>
                      )}
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