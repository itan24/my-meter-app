import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tenantName, meterNumber, initialReading } = await request.json();

    if (!tenantName || !meterNumber) {
      return NextResponse.json({ error: "Tenant name and meter number are required" }, { status: 400 });
    }

    const profile = await prisma.profile.create({
      data: {
        userId: Number(session.user.id),
        tenantName,
        meterNumber,
        initialReading: initialReading ? Number(initialReading) : null,
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profiles = await prisma.profile.findMany({
      where: {
        userId: Number(session.user.id),
      },
      include: {
        readings: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    });

    const profileResponses = profiles.map((p) => ({
      id: p.id,
      userId: p.userId,
      tenantName: p.tenantName,
      meterNumber: p.meterNumber,
      lastConsumption: p.readings[0]?.consumption || null,
      lastReadingDate: p.readings[0]?.date.toISOString() || null,
      initialReading: p.initialReading,
    }));

    return NextResponse.json(profileResponses, { status: 200 });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}