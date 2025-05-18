// src/components/ui/Navigation.tsx
"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export function Navigation() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const navLinks = [
    { href: "/", label: "Home" },
  ];

  if (!mounted) {
    return (
      <nav className="bg-gray-800 py-5 shadow-sm">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <motion.li
                  key={link.href}
                  whileHover={{ scale: 1.05, opacity: 0.8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="list-none"
                >
                  <Button
                    variant="ghost"
                    className="text-gray-100 hover:text-indigo-600 hover:bg-gray-700/50 transition-colors duration-300 text-lg"
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                </motion.li>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-gray-100" disabled>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <circle cx="12" cy="12" r="0" />
                </svg>
              </Button>
            </div>
          </ul>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-800 dark:bg-gray-950 py-5 shadow-sm">
      <div className="container mx-auto px-4">
        <ul className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <motion.li
                key={link.href}
                whileHover={{ scale: 1.05, opacity: 0.8 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="list-none"
              >
                <Button
                  variant="ghost"
                  className="text-gray-100 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-lg hover:bg-gray-700/50 dark:hover:bg-gray-900/50 transition-colors duration-300"
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              </motion.li>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {status === "authenticated" ? (
              <motion.li
                whileHover={{ scale: 1.05, opacity: 0.8 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="list-none"
              >
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-gray-100 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400"
                >
                  {session?.user?.name || 'Sign Out'}
                </Button>
              </motion.li>
            ) : (
              <motion.li
                whileHover={{ scale: 1.05, opacity: 0.8 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="list-none"
              >
                <Button
                  variant="ghost"
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  className="text-gray-100 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Sign In
                </Button>
              </motion.li>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-gray-100 dark:text-gray-200"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </ul>
      </div>
    </nav>
  );
}