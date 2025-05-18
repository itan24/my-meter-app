import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");

  if (!profileId) {
    return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
  }

  try {
    const readings = await prisma.reading.findMany({
      where: {
        profileId: Number(profileId), // Ensures profileId is integer
        profile: { userId: Number(session.user.id) },
      },
      orderBy: { date: "desc" },
      take: 10,
    });
    return NextResponse.json(readings);
  } catch (error) {
    console.error("Error fetching readings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { profileId, date, previous, current } = await request.json();
    console.log("Received data:", { profileId, date, previous, current });

    // Validate required fields
    if (!profileId || !date || previous === undefined || current === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Convert inputs to numbers to avoid Prisma type errors
    const profileIdNum = Number(profileId); // Convert profileId to number
    const previousNum = Number(previous);   // Convert previous to number to fix string error
    const currentNum = Number(current);     // Convert current to number to fix string error

    // Validate numeric inputs
    if (isNaN(profileIdNum) || isNaN(previousNum) || isNaN(currentNum)) {
      return NextResponse.json({ error: "Invalid numeric values" }, { status: 400 });
    }

    // Check profile exists and belongs to user
    const profile = await prisma.profile.findUnique({
      where: { id: profileIdNum },
      select: { id: true, userId: true },
    });

    if (!profile || profile.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: "Profile not found or unauthorized" }, { status: 404 });
    }

    // Calculate consumption
    const consumption = currentNum - previousNum;
    if (consumption < 0) {
      return NextResponse.json({ error: "Current reading must be greater than previous" }, { status: 400 });
    }

    // Create reading with converted values
    const reading = await prisma.reading.create({
      data: {
        profileId: profileIdNum,
        date: new Date(date),
        previous: previousNum,    // Use converted number
        current: currentNum,      // Use converted number
        consumption,
      },
    });
    console.log("Created reading:", reading);

    return NextResponse.json(reading);
  } catch (error) {
    console.error("Error creating reading:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // Get user session to ensure authorized access
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Extract reading ID from query parameters
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  // Validate reading ID
  if (!id) {
    return NextResponse.json({ error: "Reading ID is required" }, { status: 400 });
  }

  try {
    // Convert ID to number
    const readingId = Number(id);
    if (isNaN(readingId)) {
      return NextResponse.json({ error: "Invalid reading ID" }, { status: 400 });
    }

    // Check if reading exists and belongs to user's profile
    const reading = await prisma.reading.findUnique({
      where: { id: readingId },
      select: {
        id: true,
        profile: {
          select: { userId: true },
        },
      },
    });

    if (!reading || reading.profile.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: "Reading not found or unauthorized" }, { status: 404 });
    }

    // Delete the reading
    await prisma.reading.delete({
      where: { id: readingId },
    });
    console.log(`Deleted reading with id: ${readingId}`);

    return NextResponse.json({ message: "Reading deleted successfully" });
  } catch (error) {
    console.error("Error deleting reading:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}