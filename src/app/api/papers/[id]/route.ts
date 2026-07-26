import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function dbStatusToClient(status: string): string {
  switch (status) {
    case "DRAFT": return "draft";
    case "UNDER_MODERATION": return "under_moderation";
    case "REVISION_REQUIRED": return "revision_required";
    case "FINALIZED": return "finalized";
    default: return "draft";
  }
}

function clientStatusToDb(status: string): string {
  switch (status.toLowerCase()) {
    case "draft": return "DRAFT";
    case "submitted":
    case "under_moderation": return "UNDER_MODERATION";
    case "revision_required": return "REVISION_REQUIRED";
    case "finalized": return "FINALIZED";
    default: return "DRAFT";
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (id.startsWith("virtual-")) {
      const subjectId = id.replace("virtual-", "");
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
        include: { lecturer: true, moderator: true },
      });

      if (!subject) {
        return NextResponse.json({ error: "Subject not found" }, { status: 404 });
      }

      return NextResponse.json({
        id: `virtual-${subject.id}`,
        subjectId: subject.id,
        subjectCode: subject.code,
        subjectName: subject.name,
        lecturerId: subject.lecturerId || "",
        lecturerName: subject.lecturer?.name || "",
        moderatorId: subject.moderatorId || "",
        moderatorName: subject.moderator?.name || "",
        academicYear: subject.academicYear,
        semester: subject.semester,
        status: "draft",
        createdAt: subject.createdAt.toISOString(),
        updatedAt: subject.updatedAt.toISOString(),
      });
    }

    const paper = await prisma.paper.findUnique({
      where: { id },
      include: {
        subject: {
          include: {
            lecturer: true,
            moderator: true,
          },
        },
        lecturer: true,
      },
    });

    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: paper.id,
      subjectId: paper.subjectId,
      subjectCode: paper.subject.code,
      subjectName: paper.subject.name,
      lecturerId: paper.lecturerId,
      lecturerName: paper.lecturer.name,
      moderatorId: paper.subject.moderatorId || "",
      moderatorName: paper.subject.moderator?.name || "",
      academicYear: paper.academicYear,
      semester: paper.semester,
      status: dbStatusToClient(paper.status),
      paperUrl: paper.paperUrl || undefined,
      markingSchemeUrl: paper.markingSchemeUrl || undefined,
      createdAt: paper.createdAt.toISOString(),
      updatedAt: paper.updatedAt.toISOString(),
    });
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
    const { status, paperUrl, markingSchemeUrl } = body;

    const data: any = {};
    if (status !== undefined) data.status = clientStatusToDb(status) as any;
    if (paperUrl !== undefined) data.paperUrl = paperUrl;
    if (markingSchemeUrl !== undefined) data.markingSchemeUrl = markingSchemeUrl;

    const updatedPaper = await prisma.paper.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedPaper);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
