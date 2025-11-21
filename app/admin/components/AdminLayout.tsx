/* eslint-disable @next/next/no-img-element */
"use client";

import { ReactNode, useState, useEffect, JSX } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  BookOpenIcon,
  BriefcaseIcon,
  FolderIcon,
  NewspaperIcon,
  CodeBracketIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  ArrowDownCircleIcon,
} from "@heroicons/react/24/outline";

interface SidebarItem {
  name: string;
  href: string;
  icon: JSX.Element;
}

const sidebarItems: SidebarItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: <HomeIcon className="h-6 w-6" />,
  },
  {
    name: "About Me",
    href: "/admin/aboutme",
    icon: <UserIcon className="h-6 w-6" />,
  },
  {
    name: "Education",
    href: "/admin/education",
    icon: <BookOpenIcon className="h-6 w-6" />,
  },
  {
    name: "Experience",
    href: "/admin/experience",
    icon: <BriefcaseIcon className="h-6 w-6" />,
  },
  {
    name: "Projects",
    href: "/admin/projects",
    icon: <FolderIcon className="h-6 w-6" />,
  },
  {
    name: "Blog Posts",
    href: "/admin/blog",
    icon: <NewspaperIcon className="h-6 w-6" />,
  },

  {
    name: "Skills",
    href: "/admin/skills",
    icon: <CodeBracketIcon className="h-6 w-6" />,
  },
  {
    name: "Testimonials",
    href: "/admin/testimonials",
    icon: <ChatBubbleLeftRightIcon className="h-6 w-6" />,
  },
  {
    name: "Contact Info",
    href: "/admin/contact",
    icon: <PhoneIcon className="h-6 w-6" />,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: <Cog6ToothIcon className="h-6 w-6" />,
  },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const pathname = usePathname();

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="admin-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main Content */}
      <div className="drawer-content flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className="navbar w-full bg-base-100 border-b border-base-300 px-4">
          <div className="flex-1 flex items-center gap-4">
            {/* Sidebar toggle icon */}
            <label
              htmlFor="admin-drawer"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2"
                fill="none"
                stroke="currentColor"
                className="my-1.5 inline-block w-6 h-6"
              >
                <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
                <path d="M9 4v16" />
                <path d="M14 10l2 2l-2 2" />
              </svg>
            </label>
            {/* <span className="text-xl font-bold">SatyaLay Panel</span> */}
          </div>

          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle"
              title="Toggle theme"
            >
              {theme === "light" ? (
                <MoonIcon className="h-6 w-6" />
              ) : (
                <SunIcon className="h-6 w-6" />
              )}
            </button>

            {/* Profile + Modern Logout */}
            <div className="flex items-center gap-2">
              <div className="dropdown dropdown-end">
                <label
                  tabIndex={0}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="hidden sm:inline font-medium">
                    {user?.email}
                  </span>
                  <div className="avatar avatar-online">
                    <div className="w-10 rounded-full">
                      <img
                        src="https://img.daisyui.com/images/profile/demo/spiderperson@192.webp"
                        alt="User Avatar"
                      />
                    </div>
                  </div>
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-2"
                >
                  <li>
                    <a className="">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Profile
                      {/* <span className="badge">New</span> */}
                    </a>
                  </li>
                  <li>
                    <button onClick={handleLogout}>
                     <ArrowDownCircleIcon className="h-4 w-4 mr-2" />   Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="p-6 flex-1 bg-base-200">{children}</main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side is-drawer-close:overflow-visible">
        <label htmlFor="admin-drawer" className="drawer-overlay"></label>
        <div className="flex min-h-full flex-col items-start bg-base-100 is-drawer-close:w-20 is-drawer-open:w-64 ">
          <ul className="menu w-full grow p-4">
            <span className="text-xl font-bold pb-4">Satya</span>
            {sidebarItems.map((item) => (
              <li key={item.href} className="py-2">
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-base-300  ${
                    pathname === item.href ? "text-cyan-500" : ""
                  }`}
                >
                  {item.icon}
                  <span className="is-drawer-close:hidden">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
