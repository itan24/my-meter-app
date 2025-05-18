// src/app/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/ui/Navigation";
import Link from "next/link";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return null;
  }

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
          <Card className="bg-white dark:bg-gray-800 max-w-3xl mx-auto rounded-lg shadow-md">
            <CardContent className="text-center pt-6">
              <h2 className="text-2xl font-semibold text-[#1a1a2e] dark:text-gray-100 mb-4">
                Track Your Meter Readings
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Sign in to manage your meters and track consumption
              </p>
              <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Link href="/sign-in">Get Started</Link>
              </Button>
            </CardContent>
          </Card>
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