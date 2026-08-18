import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, role, department, contact } = body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (role !== undefined) data.role = role;
    if (department !== undefined) data.department = department;
    if (contact !== undefined) data.contact = contact;

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.password !== currentPassword) {
      return NextResponse.json(
        { error: "Incorrect current password" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        password: newPassword,
      },
    });

    return NextResponse.json({ success: true });
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

    // Delete related records to prevent foreign key constraint violations
    await prisma.moderationReport.deleteMany({
      where: { moderatorId: id },
    });

    await prisma.paper.deleteMany({
      where: { lecturerId: id },
    });

    // Nullify subject assignments before deleting the user
    await prisma.subject.updateMany({
      where: { lecturerId: id },
      data: { lecturerId: null },
    });

    await prisma.subject.updateMany({
      where: { moderatorId: id },
      data: { moderatorId: null },
    });

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
