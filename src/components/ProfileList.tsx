"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { calculateBill } from "@/lib/billCalculation";

interface Profile {
  id: number;
  userId: number;
  tenantName: string;
  meterNumber: string;
  initialReading: number | null;
  lastConsumption: number | null;
  lastReadingDate: string | null;
}

interface ProfileListProps {
  profiles: Profile[];
  onDelete: (profileId: number) => void;
}

export default function ProfileList({ profiles, onDelete }: ProfileListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Profiles</h2>
      {profiles.length === 0 ? (
        <p>No profiles found. Create one now!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {profiles.map((profile) => {
            // Color for last consumption
            let consumptionColor = "text-gray-700";
            if (profile.lastConsumption !== undefined && profile.lastConsumption !== null) {
              if (profile.lastConsumption >= 200) consumptionColor = "text-red-600";
              else if (profile.lastConsumption >= 150) consumptionColor = "text-orange-500";
              else if (profile.lastConsumption >= 100) consumptionColor = "text-green-600";
              else consumptionColor = "text-green-600";
            }
            // Calculate expected bill
            const expectedBill = profile.lastConsumption ? calculateBill(profile.lastConsumption) : null;
            return (
              <Card key={profile.id} className="rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 flex flex-col justify-between min-h-[200px]">
                <CardHeader className="pb-1">
                  <CardTitle className="text-lg font-bold text-[#1a1a2e] dark:text-gray-100 mb-1">
                    {profile.tenantName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-1 flex-grow justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Meter Number: <span className="font-semibold text-gray-700 dark:text-gray-200">{profile.meterNumber}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Last Consumption: {profile.lastConsumption !== undefined && profile.lastConsumption !== null ? (
                      <span className={`font-bold ${consumptionColor} text-base`}>
                        {profile.lastConsumption} <span className="text-xs font-normal text-gray-400">(units)</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Last Update: {profile.lastReadingDate ? (
                      <span className="font-medium text-gray-700 dark:text-gray-200">{new Date(profile.lastReadingDate).toLocaleDateString()}</span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Expected Bill: {expectedBill !== null ? (
                      <span className="font-bold text-gray-700 dark:text-gray-200">PKR {expectedBill.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2 items-center">
                    <Button asChild size="sm">
                      <Link href={`/dashboard/${profile.id}`}>View Details</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(profile.id)}
                      className="hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <Button asChild>
        <Link href="/add-profile">Add New Profile</Link>
      </Button>
    </div>
  );
}