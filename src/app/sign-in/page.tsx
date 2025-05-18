// src/app/sign-in/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "../../components/ui/Navigation";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
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
          <Card className="bg-white dark:bg-gray-800 max-w-md mx-auto rounded-lg shadow-md">
            <CardContent className="text-center pt-6">
              <h2 className="text-2xl font-semibold text-[#1a1a2e] dark:text-gray-100 mb-4">Sign In</h2>
              <Button
                onClick={handleSignIn}
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign in with Google"
                )}
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