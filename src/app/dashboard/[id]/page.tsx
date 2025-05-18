"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/ui/Navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { calculateBill } from "@/lib/billCalculation";
import { use } from "react";

interface Reading {
  id: number;
  date: string;
  previous: number;
  current: number;
  consumption: number;
}

interface ProfileResponse {
  id: number;
  userId: number;
  tenantName: string;
  meterNumber: string;
  initialReading: number | null;
  readings: Reading[];
}

export default function ProfileDetailsPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [tenantName, setTenantName] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [initialReading, setInitialReading] = useState("");
  const [current, setCurrent] = useState("");
  const [previous, setPrevious] = useState("");
  const [consumption, setConsumption] = useState<number | null>(null);
  const [expectedBill, setExpectedBill] = useState<number | null>(null);

  // Fetch profile and readings
  useEffect(() => {
    const fetchProfile = async () => {
      if (status === "loading") return;
      if (!session) {
        setError("Please sign in to view profile details");
        setIsLoading(false);
        return;
      }

      try {
        const [profileResponse, readingsResponse] = await Promise.all([
          fetch(`/api/profile/${params.id}`, {
            headers: { "Content-Type": "application/json" },
          }),
          fetch(`/api/readings?profileId=${params.id}`, {
            headers: { "Content-Type": "application/json" },
          }),
        ]);

        if (!profileResponse.ok || !readingsResponse.ok) {
          throw new Error(
            profileResponse.status === 401
              ? "Unauthorized"
              : "Failed to fetch data"
          );
        }

        const profileData = await profileResponse.json();
        const readingsData = await readingsResponse.json();

        setProfile({ ...profileData, readings: readingsData });
        setTenantName(profileData.tenantName);
        setMeterNumber(profileData.meterNumber);
        setInitialReading(profileData.initialReading?.toString() || "");
        setPrevious(
          readingsData[0]?.current?.toString() ||
            profileData.initialReading?.toString() ||
            ""
        );
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [session, status, params.id]);

  // Update profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`/api/profile/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantName, meterNumber, initialReading }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedProfile = await response.json();
      setProfile({ ...profile, ...updatedProfile });
      setEditMode(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  };

  // Calculate consumption and bill
  const handleCalculateReading = () => {
    if (!current || !previous) {
      setError("Please enter both current and previous readings");
      return;
    }
    const consumptionValue = Number(current) - Number(previous);
    if (consumptionValue < 0) {
      setError("Current reading must be greater than previous");
      return;
    }
    setConsumption(consumptionValue);
    setExpectedBill(calculateBill(consumptionValue));
  };

  // Add new reading
  const handleAddReading = async (e: React.FormEvent) => {
    e.preventDefault();
    if (consumption === null) {
      setError("Please calculate consumption first");
      return;
    }

    try {
      const response = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: Number(params.id),
          date: new Date().toISOString(),
          previous,
          current,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add reading");
      }

      const newReading = await response.json();
      setProfile({
        ...profile!,
        readings: [newReading, ...profile!.readings].slice(0, 10),
      });
      setCurrent("");
      setPrevious(newReading.current.toString());
      setConsumption(null);
      setExpectedBill(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  };

  // Delete reading
  const handleDeleteReading = async (readingId: number) => {
    try {
      const response = await fetch(`/api/readings?id=${readingId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to delete reading");
      }

      setProfile({
        ...profile!,
        readings: profile!.readings.filter((r) => r.id !== readingId),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900 p-4">
        <Navigation />
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Loading profile...
          </p>
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
            onClick={() => router.push("/sign-in")}
            className="text-indigo-600 dark:text-indigo-400 underline"
          >
            sign in
          </button>{" "}
          to view profile details.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900 flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {error && (
            <Alert variant="destructive" className="mb-6 max-w-3xl mx-auto">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {profile ? (
            <>
              <Card className="bg-white dark:bg-gray-800 max-w-3xl mx-auto rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-5 mb-6">
                <CardHeader className="pb-1">
                  <CardTitle className="text-base sm:text-lg font-bold text-[#1a1a2e] dark:text-gray-100 mb-1">
                    {editMode ? "Edit Profile" : profile.tenantName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-1 flex-grow justify-between">
                  {editMode ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <Label htmlFor="tenantName">Tenant Name</Label>
                        <Input
                          id="tenantName"
                          value={tenantName}
                          onChange={(e) => setTenantName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="meterNumber">Meter Number</Label>
                        <Input
                          id="meterNumber"
                          value={meterNumber}
                          onChange={(e) => setMeterNumber(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="initialReading">Initial Reading</Label>
                        <Input
                          id="initialReading"
                          type="number"
                          value={initialReading}
                          onChange={(e) => setInitialReading(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditMode(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Meter Number: <span className="font-semibold text-gray-700 dark:text-gray-200">{profile.meterNumber}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Initial Reading: <span className="font-semibold text-gray-700 dark:text-gray-200">{profile.initialReading ?? "Not set"}</span>
                      </div>
                      <div className="mt-4 flex gap-2 items-center">
                        <Button
                          onClick={() => setEditMode(true)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Edit Profile
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 max-w-3xl mx-auto rounded-lg shadow-md mb-6">
                <CardHeader>
                  <CardTitle>Add Reading</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddReading} className="space-y-4">
                    <div>
                      <Label htmlFor="previous">Previous Reading</Label>
                      <Input
                        id="previous"
                        type="number"
                        value={previous}
                        onChange={(e) => setPrevious(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="current">Current Reading</Label>
                      <Input
                        id="current"
                        type="number"
                        value={current}
                        onChange={(e) => setCurrent(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Button
                        type="button"
                        onClick={handleCalculateReading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Calculate
                      </Button>
                      {consumption !== null && (
                        <div className="mt-2">
                          <p className="text-gray-600 dark:text-gray-300">
                            Consumption: {consumption} units
                          </p>
                          <p className="text-gray-600 dark:text-gray-300">
                            Expected Bill: PKR {expectedBill?.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Add Reading
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 max-w-3xl mx-auto rounded-lg shadow-md">
                <CardHeader>
                  <CardTitle>Recent Readings</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.readings.length > 0 ? (
                    <ul className="space-y-2">
                      {profile.readings.map((reading) => {
                        let consumptionColor = "text-gray-700";
                        if (reading.consumption !== undefined && reading.consumption !== null) {
                          if (reading.consumption >= 200) consumptionColor = "text-red-600";
                          else if (reading.consumption >= 150) consumptionColor = "text-orange-500";
                          else if (reading.consumption >= 100) consumptionColor = "text-green-600";
                          else consumptionColor = "text-green-600";
                        }
                        const readingBill = calculateBill(reading.consumption);
                        return (
                          <li
                            key={reading.id}
                            className="flex justify-between items-center p-3 bg-card dark:bg-card rounded-lg shadow-sm hover:bg-muted/50 transition-colors duration-200"
                          >
                            <div className="flex flex-wrap items-center space-x-4">
                              <span className="text-foreground text-sm">
                                Date: {new Date(reading.date).toLocaleDateString()}
                              </span>
                              <span className="text-foreground text-sm">
                                Current: <span className="font-bold">{reading.current}</span>
                              </span>
                              <span className="text-foreground text-sm">
                                Previous: <span className="font-bold">{reading.previous}</span>
                              </span>
                              <span className="text-foreground text-sm">
                                Consumption: <span className={`font-bold ${consumptionColor}`}>{reading.consumption} <span className="text-xs font-normal text-gray-400">(units)</span></span>
                              </span>
                              <span className="text-foreground text-sm">
                                Bill: <span className="font-bold">PKR {readingBill.toLocaleString()}</span>
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteReading(reading.id)}
                              className="hover:bg-gray-100 dark:hover:bg-gray-800"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300">
                      No readings yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-300">
              Profile not found.
            </p>
          )}
          <div className="mt-4 max-w-3xl mx-auto">
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </motion.section>
      </main>
      <footer className="bg-[#1a1a2e] text-white text-center py-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          © 2025 Meter Readings Tracker. All rights reserved.
        </motion.div>
      </footer>
    </div>
  );
}