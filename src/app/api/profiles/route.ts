import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/route";
import { Profile } from "../../../../prisma/generated/client"; // Import Profile type

// Create new profile
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantName, meterNumber } = await request.json();
  if (!tenantName || !meterNumber) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const profile = await prisma.profile.create({
      data: {
        userId: Number(session.user.id), // Convert string to number
        tenantName,
        meterNumber,
        initialReading: null,
      },
    });

    return NextResponse.json({
      id: profile.id,
      userId: profile.userId,
      tenantName: profile.tenantName,
      meterNumber: profile.meterNumber,
      lastConsumption: null,
      lastReadingDate: null,
      initialReading: null,
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Fetch all profiles
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profiles = await prisma.profile.findMany({
      where: { userId: Number(session.user.id) }, // Convert string to number
      include: {
        readings: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    });

    const profileResponses = profiles.map((p: Profile & { readings: { consumption: number; date: Date }[] }) => ({
      id: p.id,
      userId: p.userId,
      tenantName: p.tenantName,
      meterNumber: p.meterNumber,
      lastConsumption: p.readings[0]?.consumption || null,
      lastReadingDate: p.readings[0]?.date.toISOString() || null,
      initialReading: p.initialReading,
    }));

    return NextResponse.json(profileResponses);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Delete profile
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const profileId = parseInt(searchParams.get("id") || "0");

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });
    if (!profile || profile.userId !== Number(session.user.id)) { // Already fixed
      return NextResponse.json({ error: "Profile not found or unauthorized" }, { status: 404 });
    }

    await prisma.profile.delete({
      where: { id: profileId },
    });

    return NextResponse.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}