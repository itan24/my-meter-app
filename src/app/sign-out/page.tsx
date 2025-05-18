// src/app/sign-out/page.tsx
"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Navigation } from "../../components/ui/Navigation";
import Link from "next/link";

export default function SignOutPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900 flex flex-col">
      <header className="bg-[#1a1a2e] text-white text-3xl font-bold text-center py-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          Meter Readings Tracker
        </motion.div>
      </header>
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-[#1a1a2e] dark:text-gray-100">Sign Out</h1>
            <Button
              onClick={handleSignOut}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                  Signing out...
                </div>
              ) : (
                "Sign Out"
              )}
            </Button>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Back to{" "}
              <Link href="/" className="text-indigo-600 dark:text-indigo-400 underline">
                Home
              </Link>
            </p>
          </div>
        </motion.section>
      </main>
      <footer className="bg-[#1a1a2e] text-white text-center py-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          © 2025 Meter Readings Tracker. All rights reserved.
        </motion.div>
      </footer>
    </div>
  );
}