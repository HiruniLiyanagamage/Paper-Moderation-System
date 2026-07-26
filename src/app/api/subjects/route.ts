import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        lecturer: true,
        moderator: true,
      },
      orderBy: { code: "asc" },
    });
    return NextResponse.json(subjects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, academicYear, semester, lecturerId, moderatorId } = body;

    if (!code || !name || !academicYear || !semester) {
      return NextResponse.json(
        { error: "Subject code, name, academic year, and semester are required" },
        { status: 400 }
      );
    }

    const existingSubject = await prisma.subject.findUnique({
      where: { code },
    });

    if (existingSubject) {
      return NextResponse.json(
        { error: "Subject with this code already exists" },
        { status: 400 }
      );
    }

    const newSubject = await prisma.subject.create({
      data: {
        code,
        name,
        academicYear,
        semester: Number(semester),
        lecturerId: lecturerId || null,
        moderatorId: moderatorId || null,
      },
    });

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
