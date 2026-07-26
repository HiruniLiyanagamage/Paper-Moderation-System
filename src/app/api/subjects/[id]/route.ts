import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        lecturer: true,
        moderator: true,
        papers: true,
      },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json(subject);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { code, name, academicYear, semester, lecturerId, moderatorId } = body;

    const data: any = {};
    if (code !== undefined) data.code = code;
    if (name !== undefined) data.name = name;
    if (academicYear !== undefined) data.academicYear = academicYear;
    if (semester !== undefined) data.semester = Number(semester);
    
    if (lecturerId !== undefined) data.lecturerId = lecturerId || null;
    if (moderatorId !== undefined) data.moderatorId = moderatorId || null;

    const updatedSubject = await prisma.subject.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedSubject);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const papers = await prisma.paper.findMany({
      where: { subjectId: id },
    });
    
    for (const paper of papers) {
      await prisma.moderationReport.deleteMany({
        where: { paperId: paper.id },
      });
    }
    
    await prisma.paper.deleteMany({
      where: { subjectId: id },
    });

    await prisma.subject.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
