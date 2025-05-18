// src/app/api/profile/[id]/initial-reading/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/db";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const profileId = parseInt(id);
  const { initialReading } = await request.json();

  if (initialReading === undefined || isNaN(initialReading) || initialReading < 0) {
    return NextResponse.json({ error: "Invalid initial reading" }, { status: 400 });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });
    if (!profile || profile.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: "Profile not found or unauthorized" }, { status: 404 });
    }

    const updatedProfile = await prisma.profile.update({
      where: { id: profileId },
      data: { initialReading },
      include: {
        readings: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      id: updatedProfile.id,
      userId: updatedProfile.userId,
      tenantName: updatedProfile.tenantName,
      meterNumber: updatedProfile.meterNumber,
      lastConsumption: updatedProfile.readings[0]?.consumption || null,
      lastReadingDate: updatedProfile.readings[0]?.date.toISOString() || null,
      initialReading: updatedProfile.initialReading,
    });
  } catch (error) {
    console.error("Error updating initial reading:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}