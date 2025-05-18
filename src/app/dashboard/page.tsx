"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Navigation } from "../../components/ui/Navigation";
import ProfileList from "../../components/ProfileList";

interface Profile {
  id: number;
  userId: number;
  tenantName: string;
  meterNumber: string;
  initialReading: number | null;
  lastConsumption: number | null;
  lastReadingDate: string | null;
}

const AddProfileCard: React.FC = () => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="mb-12"
  >
    <Card className="bg-white dark:bg-gray-800 max-w-3xl mx-auto rounded-lg shadow-md">
      <CardContent className="text-center pt-6">
        <h2 className="text-2xl font-semibold text-[#1a1a2e] dark:text-gray-100 mb-4">
          Calculate and Track Meter Readings
        </h2>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          whileHover={{ scale: 1.1 }}
          className="w-[150px] h-[150px] bg-gray-200/80 dark:bg-gray-700/80 border-2 border-indigo-600 dark:border-indigo-400 rounded-xl flex items-center justify-center mx-auto mb-4"
        >
          <Button asChild variant="ghost" size="icon" className="h-full w-full">
            <Link href="/add-profile">
              <Plus className="h-18 w-18 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </Link>
          </Button>
        </motion.div>
        <p className="text-lg text-gray-600 dark:text-gray-300">Click to add a new meter</p>
      </CardContent>
    </Card>
  </motion.section>
);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (status === "loading") return;
      if (!session) {
        setError("Please sign in to view your dashboard");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/profile", {
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(response.status === 401 ? "Session expired, please sign in again" : "Failed to fetch profiles");
        }

        const data = await response.json();
        setProfiles(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, [session, status]);

  const handleDeleteProfile = async (profileId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/profile/${profileId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete profile: ${response.status}`);
      }

      setProfiles((prevProfiles) => prevProfiles.filter((profile) => profile.id !== profileId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900 p-4">
        <Navigation />
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900 p-4">
        <Navigation />
        <p className="text-center text-gray-600 dark:text-gray-300">
          Please{" "}
          <button
            onClick={() => signIn("google")}
            className="text-indigo-600 dark:text-indigo-400 underline"
          >
            sign in
          </button>{" "}
          to view your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900 flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        <AddProfileCard />

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading meters...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6 max-w-3xl mx-auto border-indigo-600 dark:border-indigo-400">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              {error.includes("Session") && (
                <button
                  onClick={() => signIn("google")}
                  className="underline ml-2 text-indigo-600 dark:text-indigo-400"
                >
                  Sign in again
                </button>
              )}
 DEVELOPMENT BRANCH
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && <ProfileList profiles={profiles} onDelete={handleDeleteProfile} />}
      </main>
      <footer className="bg-[#1a1a2e] text-white text-center py-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          © 2025 Meter Readings Tracker. All rights reserved.
        </motion.div>
      </footer>
    </div>
  );
}