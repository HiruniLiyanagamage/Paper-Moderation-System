import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paperId = searchParams.get("paperId");

    if (!paperId) {
      return NextResponse.json(
        { error: "Paper ID query parameter is required" },
        { status: 400 }
      );
    }

    const report = await prisma.moderationReport.findUnique({
      where: { paperId },
      include: {
        moderator: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: report.id,
      paperId: report.paperId,
      moderatorId: report.moderatorId,
      moderatorName: report.moderator.name,
      remarks: report.remarks,
      additionalComments: report.additionalComments,
      followUpActions: report.followUpActions || [],
      moderatorSignatureUrl: report.moderatorSignatureUrl,
      lecturerSignatureUrl: report.lecturerSignatureUrl,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      paperId, 
      moderatorId, 
      remarks, 
      additionalComments, 
      followUpActions, 
      moderatorSignatureUrl, 
      lecturerSignatureUrl 
    } = body;

    if (!paperId || !moderatorId || !remarks) {
      return NextResponse.json(
        { error: "Paper ID, Moderator ID, and Remarks are required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      moderatorId,
      remarks,
      additionalComments: additionalComments || "",
      followUpActions: followUpActions || null,
    };
    if (moderatorSignatureUrl !== undefined) {
      updateData.moderatorSignatureUrl = moderatorSignatureUrl;
    }
    if (lecturerSignatureUrl !== undefined) {
      updateData.lecturerSignatureUrl = lecturerSignatureUrl;
    }

    // Upsert moderation report (update if exists, otherwise create)
    const report = await prisma.moderationReport.upsert({
      where: { paperId },
      update: updateData,
      create: {
        paperId,
        moderatorId,
        remarks,
        additionalComments: additionalComments || "",
        followUpActions: followUpActions || null,
        moderatorSignatureUrl: moderatorSignatureUrl || null,
        lecturerSignatureUrl: lecturerSignatureUrl || null,
      },
    });

    // Update corresponding paper status to REVISION_REQUIRED
    await prisma.paper.update({
      where: { id: paperId },
      data: {
        status: "REVISION_REQUIRED",
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
