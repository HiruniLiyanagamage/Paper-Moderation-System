import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password, department } = await request.json();

    if (!email || !password || !department) {
      return NextResponse.json(
        { error: "Email, password and department are required" },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!dbUser || dbUser.password !== password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify department selection matches (normalizing spaces and ampersand variants)
    const normalizeDept = (d: string) => d.toLowerCase().replace(/and/g, "&").replace(/\s+/g, " ").trim();
    if (normalizeDept(dbUser.department || "") !== normalizeDept(department)) {
      return NextResponse.json(
        { error: "Incorrect department selected for this user" },
        { status: 401 }
      );
    }

    const mappedUser = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      isDepartmentHead: dbUser.role === "DEPARTMENT_HEAD",
      isLecturer: true,
      isModerator: true,
      department: dbUser.department || "Department of Computing & Information Systems",
      contact: dbUser.contact || "",
    };

    return NextResponse.json(mappedUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
