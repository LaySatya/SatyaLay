"use client";
import React, { useRef, useEffect } from "react";
import Link from "next/link";


import {
  SparklesIcon,
  UsersIcon,
  CalendarIcon,
  AcademicCapIcon,
  TrophyIcon,
  NewspaperIcon,
  PhotoIcon,
  CakeIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { de } from "date-fns/locale";
import { HandThumbUpIcon } from "@heroicons/react/20/solid";
import { HomeIcon } from "@heroicons/react/24/solid";

function MainLayout({ children }) {
  const pathname = usePathname();
  const [theme, setTheme] = React.useState("light");
  const [mounted, setMounted] = React.useState(false);
  const menuRefs = useRef({});
  const menuListRef = useRef(null);

  useEffect(() => {
    // Scroll the active menu item into view when pathname changes
    if (menuRefs.current[pathname]) {
      menuRefs.current[pathname].scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
  }, [pathname]);

  React.useEffect(() => {
    setMounted(true);
    const storedTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.setAttribute("data-theme", storedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, []);

  React.useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted]);

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const navLinks = [
    { href: "/welcome", label: "Welcome", icon: HomeIcon },
    { href: "/aboutme", label: "About", icon: UsersIcon },
    { href: "/skills", label: "Skills", icon: SparklesIcon },
    { href: "/experience", label: "Experience", icon: CalendarIcon },
    { href: "/education", label: "Education", icon: AcademicCapIcon },
    { href: "/achievements", label: "Achievements", icon: TrophyIcon },
    { href: "/blog", label: "Blog", icon: NewspaperIcon },
    { href: "/gallery", label: "Gallery", icon: PhotoIcon },
    { href: "/birthday", label: "Birthday", icon: CakeIcon },
    { href: "/contact", label: "Contact", icon: EnvelopeIcon },
  ];

  return (
    // 1. Outer wrapper: Full screen height, hidden overflow to prevent body scroll
    <div className="p-4 md:p-8 h-screen w-full overflow-hidden">
      
      {/* 2. Mockup Window: set to h-full to fill the screen (minus padding) */}
      <div className="mockup-window  border border-base-300 h-full flex flex-col bg-base-100">
        {/* The macOS Traffic Lights */}
        <div className="absolute top-5 left-5.5 flex items-center space-x-2 z-50">
            {/* Red Dot (Close) */}
            <div className="h-3.5 w-3.5 rounded-full bg-[#ff5f56] shadow-[0_0_0_1px_#e0443e]"></div>
            {/* Yellow Dot (Minimize) */}
            <div className="h-3.5 w-3.5 rounded-full bg-[#ffbd2e] shadow-[0_0_0_1px_#e0b115]"></div>
            {/* Green Dot (Maximize) */}
            <div className="h-3.5 w-3.5 rounded-full bg-[#27c93f] shadow-[0_0_0_1px_#18a927]"></div>
        </div>
        {/* 3. Inner Layout: fills the mockup, handles the scroll logic */}
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* --- FIXED HEADER SECTION (Navbar + Menu) --- */}
          {/* flex-none ensures this section never shrinks or scrolls away */}
          <div className="flex-none z-40 bg-base-100">
            {/* Navbar */}
            <div className="navbar shadow-sm">
              <div className="navbar-start">
                <div className="dropdown">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-circle"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-base-100 rounded-box z-50 w-64 p-2 shadow"
                  >
                    {navLinks.map(({ href, label, icon: Icon }) => (
                      <li key={href}>
                        <Link
                          href={href}
                          className={`flex items-center gap-2 ${
                            pathname === href
                              ? "text-cyan-500 font-bold"
                              : "text-base-content"
                          } transition-colors duration-150`}
                        >
                          <Icon className="h-5 w-5" />
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="navbar-center">
                <Link href="/" className="btn btn-ghost text-xl font-bold">
                  My Portfolio
                </Link>
              </div>
              <div className="navbar-end">
                {mounted && (
                  <button
                    className="btn btn-ghost btn-circle"
                    onClick={handleThemeToggle}
                    aria-label="Toggle theme"
                  >
                    {theme === "light" ? (
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Horizontal Menu */}
            <div className="flex justify-center bg-base-200 dark:bg-base-300 border-b border-base-300 overflow-x-auto">
              <ul className="menu menu-horizontal gap-2 p-4 flex-nowrap" ref={menuListRef}>
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <li key={href} ref={el => { menuRefs.current[href] = el; }}>
                    <Link
                      href={href}
                      className={`flex items-center gap-2 whitespace-nowrap ${
                        pathname === href
                          ? "text-cyan-500 font-bold"
                          : "text-base-content dark:text-base-content"
                      } transition-colors duration-150`}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* --- SCROLLABLE CONTENT SECTION --- */}
          {/* flex-1 makes it fill remaining height, overflow-y-auto enables scroll here only */}
          <div className="flex-1 overflow-y-auto p-4 bg-base-100 relative">
             {children}
          </div>

        </div>
      </div>
    </div>
  );
}
export default MainLayout;