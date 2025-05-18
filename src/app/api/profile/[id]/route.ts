import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/db";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params; // Await params
  const profileId = parseInt(id);

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        readings: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    });

    if (!profile || profile.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: "Profile not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({
      id: profile.id,
      userId: profile.userId,
      tenantName: profile.tenantName,
      meterNumber: profile.meterNumber,
      lastConsumption: profile.readings[0]?.consumption || null,
      lastReadingDate: profile.readings[0]?.date.toISOString() || null,
      initialReading: profile.initialReading,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params; // Await params
  const profileId = parseInt(id);
  const { tenantName, meterNumber, initialReading } = await request.json();
  console.log("Updating profile:", { profileId, tenantName, meterNumber, initialReading });

  if (!tenantName || !meterNumber) {
    return NextResponse.json({ error: "Tenant name and meter number are required" }, { status: 400 });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { id: true, userId: true },
    });
    if (!profile || profile.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: "Profile not found or unauthorized" }, { status: 404 });
    }

    const updatedProfile = await prisma.profile.update({
      where: { id: profileId },
      data: {
        tenantName,
        meterNumber,
        initialReading: initialReading ? Number(initialReading) : null,
      },
    });
    console.log("Updated profile:", updatedProfile);

    return NextResponse.json({
      id: updatedProfile.id,
      userId: updatedProfile.userId,
      tenantName: updatedProfile.tenantName,
      meterNumber: updatedProfile.meterNumber,
      initialReading: updatedProfile.initialReading,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // Await params
    const profileId = Number(id);
    if (isNaN(profileId)) {
      return NextResponse.json({ error: "Invalid profile ID" }, { status: 400 });
    }

    const profile = await prisma.profile.findFirst({
      where: {
        id: profileId,
        userId: Number(session.user.id),
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found or not authorized" }, { status: 404 });
    }

    await prisma.profile.delete({
      where: { id: profileId },
    });

    return NextResponse.json({ message: "Profile deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}